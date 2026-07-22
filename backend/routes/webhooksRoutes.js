import express from 'express';
import axios from 'axios';
import { supabase } from '../config/supabase.js';
import { sendFollowUpLead } from '../whatsappService.js';

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
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', phone);
            
          const { data: existingContacts } = await supabase
            .from('contacts')
            .select('id')
            .eq('phone', phone);

          const isExisting = (existingLeads && existingLeads.length > 0) || 
                             (existingContacts && existingContacts.length > 0);

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
              
              // 3. Save directly to CRM database
              const { error } = await supabase.from('leads').insert([newLead]);
              
              if (error) {
                console.error('[WhatsApp Webhook DB Error]:', error.message);
              } else {
                console.log(`[WhatsApp Lead Captured] Added ${customerName} to CRM.`);
                
                // 4. AUTOMATED FOLLOW-UP (As requested by user)
                await sendFollowUpLead(phone, customerName);
              }
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
            const { data: existingLeads } = await supabase
              .from('leads')
              .select('id')
              .eq('phone', phoneIdentifier);
              
            const { data: existingContacts } = await supabase
              .from('contacts')
              .select('id')
              .eq('phone', phoneIdentifier);

            const isExisting = (existingLeads && existingLeads.length > 0) || 
                               (existingContacts && existingContacts.length > 0);

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
                
                const { error } = await supabase.from('leads').insert([newLead]);
                if (error) {
                  console.error(`[${platform.toUpperCase()} Webhook DB Error]:`, error.message);
                } else {
                  console.log(`[${platform.toUpperCase()} Lead Captured] Added ${customerName} to CRM.`);
                }
              }
            }
          }
        }
        
        // 2. Handle Leadgen webhook events (Lead Gen forms)
        const changes = entry?.changes?.[0];
        if (changes && changes.field === 'leadgen') {
          const leadId = changes.value.leadgen_id;
          console.log(`[FB/IG Lead Gen Triggered] Lead ID to process: ${leadId}`);
          
          // Future implementation: Fetch lead data from Graph API using leadId
          // then call sendFollowUpLead(leadPhone, leadName);
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

// ... LinkedIn logic ...
router.post('/linkedin', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[LinkedIn Webhook Received]', payload);
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('[LinkedIn Webhook Error]:', err);
    res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
  }
});

// 3. Webhook endpoint to receive leads from the WhatsApp Bot
router.post('/whatsapp-bot-lead', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[WhatsApp Bot Webhook Received]', payload);

    const {
      CustomerName,
      WhatsAppNumber,
      ServiceSelected,
      AreaRequired,
      SiteLocation,
      Timeline,
      BudgetRange,
      LeadScore,
      LeadStatus
    } = payload;

    if (!WhatsAppNumber) {
      return res.status(400).json({ error: 'Missing WhatsApp number' });
    }

    // Clean and format phone number
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

    // Check if this lead already exists in CRM
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', finalPhone);

    if (existingLeads && existingLeads.length > 0) {
      console.log(`[WhatsApp Bot Webhook] Lead with phone ${finalPhone} already exists. Updating details.`);
      
      const updateData = {
        contactName: CustomerName || defaultName,
        projectType: ServiceSelected || 'PEB / General Enquiry',
        location: SiteLocation || '',
        landArea: AreaRequired || '',
        timeline: Timeline || '',
        leadScore: LeadScore || 20,
        status: LeadStatus || 'New',
        notes: `Updated from Bot Flow.\nBudget: ${BudgetRange || 'Not confirmed'}`,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('phone', finalPhone);

      if (error) throw error;
      
      return res.status(200).json({ success: true, message: 'Lead updated successfully' });
    }

    const newLead = {
      contactName: CustomerName || defaultName,
      phone: finalPhone,
      projectType: ServiceSelected || 'PEB / General Enquiry',
      location: SiteLocation || '',
      landArea: AreaRequired || '',
      timeline: Timeline || '',
      source: leadSource,
      status: LeadStatus || 'New',
      leadScore: LeadScore || 20,
      notes: `Captured from Bot Flow.\nBudget: ${BudgetRange || 'Not confirmed'}`
    };

    const { error } = await supabase
      .from('leads')
      .insert([newLead]);

    if (error) throw error;

    console.log(`[WhatsApp Bot Webhook] Created new lead for ${newLead.contactName} (${newLead.phone})`);
    res.status(201).json({ success: true, message: 'Lead created successfully' });
  } catch (err) {
    console.error('[WhatsApp Bot Webhook Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error while inserting lead' });
  }
});

// 4. Webhook endpoint to receive general enquiries from the WhatsApp Bot
router.post('/whatsapp-bot-enquiry', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[WhatsApp Bot Enquiry Webhook Received]', payload);

    const { CustomerName, WhatsAppNumber, MessageText } = payload;

    if (!WhatsAppNumber) {
      return res.status(400).json({ error: 'Missing WhatsApp number' });
    }

    // Clean and format phone number
    let finalPhone = WhatsAppNumber;
    if (!WhatsAppNumber.startsWith('fb:') && !WhatsAppNumber.startsWith('ig:')) {
      const formattedPhone = WhatsAppNumber.replace(/\D/g, '');
      finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
    }

    let defaultName = 'WhatsApp Customer';
    if (WhatsAppNumber.startsWith('fb:')) {
      defaultName = 'Facebook Customer';
    } else if (WhatsAppNumber.startsWith('ig:')) {
      defaultName = 'Instagram Customer';
    }

    // Check if this enquiry already exists in CRM enquiries table to avoid duplication
    const { data: existingEnquiries } = await supabase
      .from('enquiries')
      .select('id')
      .eq('phone', finalPhone);

    if (existingEnquiries && existingEnquiries.length > 0) {
      console.log(`[WhatsApp Bot Enquiry] Enquiry with phone ${finalPhone} already exists. Updating last message.`);
      
      const updateData = {
        contactName: CustomerName || defaultName,
        lastMessage: MessageText || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('enquiries')
        .update(updateData)
        .eq('phone', finalPhone);

      if (error) throw error;
      
      return res.status(200).json({ success: true, message: 'Enquiry updated successfully' });
    }

    const newEnquiry = {
      contactName: CustomerName || 'WhatsApp Customer',
      phone: finalPhone,
      lastMessage: MessageText || '',
      status: 'New'
    };

    const { error } = await supabase
      .from('enquiries')
      .insert([newEnquiry]);

    if (error) throw error;

    console.log(`[WhatsApp Bot Enquiry] Created new enquiry for ${newEnquiry.contactName} (${newEnquiry.phone})`);
    res.status(201).json({ success: true, message: 'Enquiry created successfully' });
  } catch (err) {
    console.error('[WhatsApp Bot Enquiry Webhook Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error while inserting enquiry' });
  }
});

export default router;
