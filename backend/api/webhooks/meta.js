import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// ✅ Initialize directly — no relative imports to avoid Vercel path errors
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Internal helper to send the 'follow_up_lead' template
 */
async function sendFollowUpLead(phone, customerName) {
  const TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!TOKEN || !PHONE_ID) {
    console.warn('⚠️ Missing WhatsApp credentials in environment');
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to:   phone,
        type: "template",
        template: {
          name:     "follow_up_lead",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [{
              type:           "text",
              parameter_name: "customer_name",
              text:           customerName
            }]
          }]
        }
      },
      {
        headers: {
          Authorization:  `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Follow-up sent to ${customerName} (${phone})`);
  } catch (err) {
    console.error('❌ WhatsApp Send Error:', err.response?.data || err.message);
  }
}

export default async function handler(req, res) {

  // ✅ GET — Webhook Verification for Meta
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      console.log('✅ Webhook Verified Successfully!');
      return res.status(200).send(challenge);
    }

    console.error('❌ Webhook Verification Failed: Token mismatch');
    return res.status(403).send('Forbidden');
  }

  // ✅ POST — Receive WhatsApp Messages
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        return res.status(404).send('Not Found');
      }

      const changes = body.entry?.[0]?.changes?.[0]?.value;

      if (changes?.messages) {
        const msg          = changes.messages[0];
        const contact      = changes.contacts?.[0];
        const phone        = msg.from;
        const messageText  = msg.text?.body?.toLowerCase() || '';
        const customerName = contact?.profile?.name || 'Customer';

        // 1. Check if number is already in CRM to avoid spamming existing clients
        const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phone);
        const { data: existingContacts } = await supabase.from('contacts').select('id').eq('phone', phone);

        const isExisting = (existingLeads?.length > 0) || (existingContacts?.length > 0);

        if (!isExisting) {
          // 2. Filter: Only capture if there is lead intent
          const keywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
          const isLeadIntent = keywords.some(kw => messageText.includes(kw)) || messageText === '';

          if (isLeadIntent) {
            // 3. Save directly to Supabase Leads table
            const { error } = await supabase.from('leads').insert([{
              contactName:  customerName,
              phone:        phone,
              source:       'WhatsApp',
              status:       'New',
              projectType:  'Unspecified',
              leadScore:    20,
              notes:        `WhatsApp Inquiry: ${msg.text?.body || 'Media/Attachment'}`
            }]);

            if (!error) {
              console.log(`✅ Lead captured and saved: ${customerName} (${phone})`);
              // 4. Send the Automated Follow-up Template
              await sendFollowUpLead(phone, customerName);
            } else {
              console.error('❌ Supabase DB Error:', error.message);
            }
          } else {
            console.log(`ℹ️ Casual message from ${phone} — ignoring lead capture.`);
          }
        } else {
          console.log(`ℹ️ Existing contact ${phone} — skipping lead creation.`);
        }
      }

      return res.status(200).send('EVENT_RECEIVED');

    } catch (err) {
      console.error('❌ Webhook Processing Error:', err.message);
      return res.status(200).send('EVENT_RECEIVED'); // Always 200 for Meta
    }
  }

  return res.status(405).send('Method Not Allowed');
}
