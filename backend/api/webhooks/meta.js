import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// ✅ Standalone Initialization
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
    console.warn('⚠️ Missing WhatsApp credentials');
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
  // ✅ Handle GET (Verification)
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // ✅ Handle POST (Messages)
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

        // Check Duplicates
        const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phone);
        const { data: existingContacts } = await supabase.from('contacts').select('id').eq('phone', phone);
        const isExisting = (existingLeads?.length > 0) || (existingContacts?.length > 0);

        if (!isExisting) {
          const keywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
          const isLeadIntent = keywords.some(kw => messageText.includes(kw)) || messageText === '';

          if (isLeadIntent) {
            const { error } = await supabase.from('leads').insert([{
              contactName:  customerName,
              phone:        phone,
              source:       'WhatsApp',
              status:       'New',
              notes:        `Inquiry: ${msg.text?.body || 'Media'}`
            }]);

            if (!error) {
              await sendFollowUpLead(phone, customerName);
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
  return res.status(405).send('Method Not Allowed');
}
