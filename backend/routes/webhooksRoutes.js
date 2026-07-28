import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Lead, Enquiry, Contact, FollowUp } from '../config/mongodb.js';
import { sendFollowUpLead, sendDirectWhatsAppText } from '../whatsappService.js';
import { flushServerCache } from '../middleware/cacheMiddleware.js';

// Direct local db.json writer for guaranteed fallback on DB errors
function writeLeadToLocalDb(newLead) {
  try {
    flushServerCache();
    const dbPath = path.resolve('db.json');
    const raw = fs.existsSync(dbPath) ? fs.readFileSync(dbPath, 'utf8') : '{}';
    const db = JSON.parse(raw);
    if (!db.leads) db.leads = [];
    const exists = db.leads.find(l => l.phone === newLead.phone);
    if (exists) {
      Object.assign(exists, newLead, { updated_at: new Date().toISOString() });
    } else {
      db.leads.unshift({
        id: `lead-${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newLead
      });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (e) {
    console.error('[Local DB Write Error]:', e.message);
    return false;
  }
}

const router = express.Router();

/**
 * Helper to fetch Facebook/Instagram user profile name using Page/IG access token
 */
async function getMetaUserProfile(senderId, platform) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.warn('⚠️ Missing Meta Access Token for profile lookup');
    return null;
  }
  
  try {
    if (platform === 'facebook') {
      const res = await axios.get(`https://graph.facebook.com/v18.0/${senderId}`, {
        params: {
          fields: 'first_name,last_name',
          access_token: token
        }
      });
      if (res.data && (res.data.first_name || res.data.last_name)) {
        return `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim();
      }
    } else if (platform === 'instagram') {
      const res = await axios.get(`https://graph.facebook.com/v18.0/${senderId}`, {
        params: {
          fields: 'username,name',
          access_token: token
        }
      });
      if (res.data) {
        return res.data.name || res.data.username || null;
      }
    }
  } catch (err) {
    console.warn(`[Meta Profile Fetch Failed] senderId: ${senderId}, platform: ${platform}, error: ${err.message}`);
  }
  return null;
}

/**
 * ==========================================
 * META WEBHOOKS (WhatsApp, Instagram, FB)
 * ==========================================
 */

// 1. Verification Endpoint for Meta (Required when setting up the Webhook in Meta App Dashboard)
router.get('/meta', (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN;
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('[Meta Webhook] Successfully Verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Bad Request');
  }
});

// 2. Payload Receiver for Meta Events (New Messages, Lead Gen Forms, etc.)
router.post('/meta', async (req, res) => {
  const body = req.body;
  
  if (body.object) {
    try {
      if (body.object === 'whatsapp_business_account') {
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        if (changes && changes.messages) {
          const msg = changes.messages[0];
          const contact = changes.contacts?.[0];
          const phone = msg.from;
          const messageText = msg.text?.body?.toLowerCase() || '';
          
          // 1. FILTER: Check if this person is already in the CRM
          const existingLead = await Lead.findOne({ phone });
          const existingContact = await Contact.findOne({ phone });
          const isExisting = !!existingLead || !!existingContact;

          if (isExisting) {
            console.log(`[WhatsApp Filter] Message ignored - ${phone} is already an active Lead/Contact.`);
          } else {
            // 2. FILTER: Check for "Lead Intent" Keywords
            const leadKeywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
            
            const isLeadIntent = leadKeywords.some(keyword => messageText.includes(keyword)) || messageText === '';

            if (isLeadIntent) {
              const customerName = contact?.profile?.name || 'Customer';
              const newLead = {
                contactName: customerName,
                phone: phone,
                source: 'WhatsApp',
                status: 'New',
                projectType: 'Unspecified',
                leadScore: 20,
                notes: `Initial Inquiry: ${msg.text?.body || 'Media/Attachment sent'}`
              };
              
              await Lead.create(newLead);
              console.log(`[WhatsApp Lead Captured] Added ${customerName} to CRM.`);
              await sendFollowUpLead(phone, customerName);
            } else {
              console.log(`[WhatsApp Filter] Ignored casual/spam message from ${phone}: "${messageText}"`);
            }
          }
        }
      }
      
      // Handle Facebook Page / Instagram Lead Generation Ads OR Direct Messages
      if (body.object === 'page' || body.object === 'instagram') {
        const entry = body.entry?.[0];
        
        // 1. Handle Direct Messages (Messenger / Instagram DM)
        if (entry && entry.messaging) {
          const messaging = entry.messaging[0];
          if (messaging && messaging.message) {
            const senderId = messaging.sender?.id;
            const messageText = messaging.message.text || '';
            const messageTextLower = messageText.toLowerCase();
            const platform = body.object === 'page' ? 'facebook' : 'instagram';
            const phoneIdentifier = platform === 'facebook' ? `fb:${senderId}` : `ig:${senderId}`;

            // Check Duplicates
            const existingLead = await Lead.findOne({ phone: phoneIdentifier });
            const existingContact = await Contact.findOne({ phone: phoneIdentifier });
            const isExisting = !!existingLead || !!existingContact;

            if (isExisting) {
              console.log(`[${platform.toUpperCase()} Filter] Message ignored - ${phoneIdentifier} is already an active Lead/Contact.`);
            } else {
              const leadKeywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
              const isLeadIntent = leadKeywords.some(keyword => messageTextLower.includes(keyword)) || messageText === '';

              if (isLeadIntent) {
                const customerName = await getMetaUserProfile(senderId, platform) || (platform === 'facebook' ? 'Facebook Customer' : 'Instagram Customer');
                
                const newLead = {
                  contactName: customerName,
                  phone: phoneIdentifier,
                  source: platform === 'facebook' ? 'Facebook Messenger' : 'Instagram DM',
                  status: 'New',
                  projectType: 'Unspecified',
                  leadScore: 20,
                  notes: `Initial Inquiry: ${messageText || 'Media/Attachment sent'}`
                };
                
                await Lead.create(newLead);
                console.log(`[${platform.toUpperCase()} Lead Captured] Added ${customerName} to CRM.`);
              }
            }
          }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('[Meta Webhook Process Error]:', err);
      res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
    }
  } else {
    res.sendStatus(404);
  }
});

// LinkedIn Lead Gen
router.post('/linkedin', async (req, res) => {
  try {
    console.log('[LinkedIn Webhook Received]', req.body);
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('[LinkedIn Webhook Error]:', err);
    res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
  }
});

// 3. Webhook endpoint to receive leads from the WhatsApp Bot
router.all('/whatsapp-bot-lead', async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'whatsapp-bot-lead' });
  }
  try {
    const payload = req.body;
    const { CustomerName, WhatsAppNumber, ServiceSelected, AreaRequired, SiteLocation, Timeline, BudgetRange, SourceChannel, LeadStatus, isQuoteRequested } = payload;

    if (!WhatsAppNumber) {
      return res.status(400).json({ error: 'Missing WhatsApp number' });
    }

    let finalPhone = WhatsAppNumber;
    if (!WhatsAppNumber.startsWith('fb:') && !WhatsAppNumber.startsWith('ig:')) {
      const formattedPhone = WhatsAppNumber.replace(/\D/g, '');
      finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
    }

    let defaultName = 'WhatsApp Customer';
    let leadSource = 'WhatsApp Bot';
    if (WhatsAppNumber.startsWith('fb:')) {
      defaultName = 'Facebook Customer';
      leadSource = 'Facebook Messenger';
    } else if (WhatsAppNumber.startsWith('ig:')) {
      defaultName = 'Instagram Customer';
      leadSource = 'Instagram DM';
    }

    const hasQuoteDetails = Boolean(isQuoteRequested || LeadStatus === 'Quotation Requested' || (AreaRequired && AreaRequired.trim() !== ''));

    const leadPayload = {
      contactName: CustomerName || defaultName,
      phone: finalPhone,
      projectType: ServiceSelected || 'PEB Warehouse',
      location: SiteLocation || '',
      landArea: AreaRequired || '',
      timeline: Timeline || '',
      budgetRange: BudgetRange || '',
      source: SourceChannel || leadSource || 'WhatsApp Bot',
      status: LeadStatus || (hasQuoteDetails ? 'Quotation Requested' : 'New'),
      isQuoteRequested: hasQuoteDetails,
      notes: `Captured from ${SourceChannel || leadSource}.\n${BudgetRange ? `Budget: ${BudgetRange}` : ''}`
    };

    // Always create a new lead document in MongoDB so older leads are preserved and never overridden
    await Lead.create(leadPayload);

    writeLeadToLocalDb(leadPayload);

    // Send WhatsApp notification alert to sales team
    if (hasQuoteDetails) {
      const salesNumbers = (process.env.NOTIFICATION_WHATSAPP_NUMBERS || '919342400879,919600067611,919884487938')
        .split(',')
        .map(n => n.trim().replace(/\D/g, ''))
        .filter(Boolean);

      const now = new Date();
      const callBackTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      const timeReceived = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const alertMsg = `🔔 *NEW FREE QUOTATION REQUEST — Deepika Builtech CRM*\n━━━━━━━━━━━━━━━━━━━━━\n👤 *Client:* ${CustomerName || defaultName}\n📱 *Phone/Handle:* ${finalPhone}\n🔧 *Service:* ${ServiceSelected || 'PEB Warehouse'}\n📐 *Area Required:* ${AreaRequired || 'Not specified'}\n📍 *Site Location:* ${SiteLocation || 'Not specified'}\n📅 *Timeline:* ${Timeline || 'Not specified'}\n💰 *Budget Range:* ${BudgetRange || 'Not specified'}\n\n📊 *Lead Score:* ${payload.LeadScore || 85} (🔥 High Priority)\n🏷️ *Lead Status:* Quotation Requested\n⏰ *Received:* ${timeReceived}\n📞 *Call-Back Target:* Call by ${callBackTime} (within 2 hours)\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *ACTION REQUIRED: Review layout & call client back*\n🌐 *CRM Link:* https://crm.deepikabuiltech.com`;

      for (const num of salesNumbers) {
        sendDirectWhatsAppText(num, alertMsg).catch(e => console.warn(`[Sales Alert Error] Failed sending to ${num}:`, e.message));
      }
    }

    res.status(201).json({ success: true, message: 'Lead saved to MongoDB Atlas & Sales team alerted!' });

  } catch (err) {
    console.error('[WhatsApp Bot Webhook Error]:', err);
    res.status(200).json({ success: false, fallback: true, error: err.message });
  }
});

// 4. Webhook endpoint to receive general enquiries from the WhatsApp Bot
router.all('/whatsapp-bot-enquiry', async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'whatsapp-bot-enquiry' });
  }
  try {
    const payload = req.body;
    const { CustomerName, WhatsAppNumber, MessageText } = payload;

    if (!WhatsAppNumber) {
      return res.status(400).json({ error: 'Missing WhatsApp number' });
    }

    let finalPhone = WhatsAppNumber;
    if (!WhatsAppNumber.startsWith('fb:') && !WhatsAppNumber.startsWith('ig:')) {
      const formattedPhone = WhatsAppNumber.replace(/\D/g, '');
      finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
    }

    let defaultName = 'WhatsApp Customer';
    if (WhatsAppNumber.startsWith('fb:')) defaultName = 'Facebook Customer';
    else if (WhatsAppNumber.startsWith('ig:')) defaultName = 'Instagram Customer';

    const existingEnq = await Enquiry.findOne({ phone: finalPhone });

    if (existingEnq) {
      await Enquiry.updateOne({ _id: existingEnq._id }, {
        contactName: CustomerName || defaultName,
        lastMessage: MessageText || '',
        updated_at: new Date()
      });
      return res.status(200).json({ success: true, message: 'Enquiry updated successfully' });
    }

    await Enquiry.create({
      contactName: CustomerName || defaultName,
      phone: finalPhone,
      lastMessage: MessageText || '',
      status: 'New'
    });

    res.status(201).json({ success: true, message: 'Enquiry created successfully' });
  } catch (err) {
    console.error('[WhatsApp Bot Enquiry Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error while inserting enquiry' });
  }
});

// 5. Webhook endpoint to receive automated follow-ups from the WhatsApp Bot and record on CRM Follow-Ups page
router.all('/whatsapp-bot-followup', async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'whatsapp-bot-followup' });
  }
  try {
    const payload = req.body;
    console.log('[WhatsApp Bot Follow-Up Webhook Received]', payload);

    const { CustomerName, WhatsAppNumber, FollowUpText, Channel } = payload;

    if (!WhatsAppNumber) {
      return res.status(400).json({ error: 'Missing WhatsApp number' });
    }

    const messageText = FollowUpText || `👋 *Hello ${CustomerName || 'Valued Client'} from Deepika Builtech Engineering!*\n\nWe are following up regarding your enquiry for PEB & warehouse construction services.\n\nOur engineering team is ready to assist you with a free site consultation and cost estimate. 🏗️\n\n📞 Call / WhatsApp: +91 96000 67611 / +91 98844 87938\n🌐 deepikabuiltech.com`;

    const isIG = WhatsAppNumber.startsWith('ig:');
    const isFB = WhatsAppNumber.startsWith('fb:');

    if (isIG || isFB) {
      const recipientId = WhatsAppNumber.replace(/^(ig:|fb:)/, '');
      const token = process.env.PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
      try {
        await axios.post(
          'https://graph.facebook.com/v20.0/me/messages',
          { recipient: { id: recipientId }, message: { text: messageText } },
          { params: { access_token: token } }
        );
        console.log(`✅ [CRM Outbound Meta DM Delivered] to ${WhatsAppNumber}`);
      } catch (errMeta) {
        console.warn(`⚠️ [CRM Meta Follow-Up Notice]:`, errMeta.response?.data || errMeta.message);
      }
    } else {
      await sendDirectWhatsAppText(WhatsAppNumber, messageText);
    }

    await FollowUp.create({
      title: `7-Day Follow-Up: ${CustomerName || WhatsAppNumber}`,
      type: Channel || (isIG ? 'Instagram DM' : isFB ? 'Facebook Messenger' : 'WhatsApp'),
      scheduled_date: new Date(),
      status: 'Completed',
      notes: messageText
    });

    await Lead.updateOne({ phone: WhatsAppNumber }, {
      last_contacted_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({ success: true, message: 'Follow-up message dispatched and logged to CRM!' });
  } catch (err) {
    console.error('[WhatsApp Bot Follow-Up Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error while processing follow-up' });
  }
});


/**
 * POST endpoint to send direct messages to Instagram DM or Facebook Messenger
 */
router.post('/send-meta', async (req, res) => {
  const { platform, recipientId, text } = req.body;
  const token = process.env.PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!recipientId || !text) {
    return res.status(400).json({ error: 'Missing recipientId or message text' });
  }

  const cleanRecipientId = recipientId.replace(/^(ig:|fb:)/, '');
  const targetPlatform = platform || (recipientId.startsWith('ig:') ? 'instagram' : 'facebook');

  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/me/messages`,
      params: { access_token: token },
      headers: { 'Content-Type': 'application/json' },
      data: {
        recipient: { id: cleanRecipientId },
        message: { text }
      }
    });

    console.log(`✅ [Outbound ${targetPlatform.toUpperCase()} Message Sent] to ${cleanRecipientId}`);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error(`❌ [Outbound ${targetPlatform.toUpperCase()} Send Error]:`, err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

/**
 * POST endpoint to manually trigger 7-day auto reminder scan across all platforms
 */
router.post('/trigger-7day-reminders', async (req, res) => {
  try {
    const { execute7DayReminderScan } = await import('../services/cronJobs.js');
    const result = await execute7DayReminderScan();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

