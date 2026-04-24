import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

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
            // (Optional: You could save this message to a 'chat_history' table here)
          } else {
            // 2. FILTER: Check for "Lead Intent" Keywords
            // If they just say "ok" or send spam, we ignore it.
            const leadKeywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
            
            // If it contains a keyword OR if it's a media attachment (images/voice notes often mean serious inquiry)
            const isLeadIntent = leadKeywords.some(keyword => messageText.includes(keyword)) || messageText === '';

            if (isLeadIntent) {
              const newLead = {
                contactName: contact?.profile?.name || phone,
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
                console.log(`[WhatsApp Lead Captured] Added ${newLead.contactName} to CRM.`);
              }
            } else {
              console.log(`[WhatsApp Filter] Ignored casual/spam message from ${phone}: "${messageText}"`);
            }
          }
        }
      }
      
      // Handle Facebook Page / Instagram Lead Generation Ads
      if (body.object === 'page' || body.object === 'instagram') {
        const changes = body.entry?.[0]?.changes?.[0];
        if (changes && changes.field === 'leadgen') {
          const leadId = changes.value.leadgen_id;
          
          // Note: You must make a Graph API call using this leadId to get the actual user data
          // Example: fetch(`https://graph.facebook.com/v17.0/${leadId}?access_token=${PAGE_ACCESS_TOKEN}`)
          
          console.log(`[FB/IG Lead Gen Triggered] Lead ID to process: ${leadId}`);
          
          // Example Formulated Lead after fetching data:
          // const newLead = { source: 'Facebook Ads', contactName: '...', email: '...' }
          // await supabase.from('leads').insert([newLead]);
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('[Meta Webhook Process Error]:', err);
      // Meta requires 200 OK so it doesn't retry indefinitely
      res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
    }
  } else {
    res.sendStatus(404);
  }
});

/**
 * ==========================================
 * LINKEDIN WEBHOOKS
 * ==========================================
 */

// Payload Receiver for LinkedIn Lead Gen Forms
router.post('/linkedin', async (req, res) => {
  try {
    const payload = req.body;
    
    // Process LinkedIn Lead Data
    // LinkedIn sends data differently, usually requires authenticating and parsing the submitted form elements
    
    console.log('[LinkedIn Webhook Received]', payload);

    // Save to Database
    // await supabase.from('leads').insert([{ source: 'LinkedIn', ... }]);

    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('[LinkedIn Webhook Error]:', err);
    res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
  }
});

export default router;
