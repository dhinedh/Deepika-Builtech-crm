import { supabase } from '../../config/supabase.js';
import axios from 'axios';

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
 * Helper to send interactive auto-reply on Facebook Messenger or Instagram DM directly from CRM backend
 */
async function sendMetaAutoReply(senderId, platform, messageText) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn('⚠️ Missing Meta Access Token for auto-reply');
    return;
  }

  const msgLower = (messageText || '').toLowerCase().trim();

  let replyText = `🏗️ Welcome to Deepika Builtech Engineering!\n\nTamil Nadu's most trusted Pre-Engineered Building (PEB) specialists — based in Chennai.\n\n🏆 Excellence Award 2025\n✅ 10+ Years of Experience\n✅ 150+ Projects Delivered\n✅ 3 Manufacturing Units\n\nHow can we help you today?\n1️⃣ About Us\n2️⃣ Our Services\n3️⃣ Get a Free Quote\n4️⃣ Contact & Locations\n\n📞 Call/WhatsApp: +91 96000 67611\n🌐 deepikabuiltech.com`;

  const quickReplies = [
    { content_type: 'text', title: '1 - About Us', payload: 'btn_about' },
    { content_type: 'text', title: '2 - Services', payload: 'btn_services' },
    { content_type: 'text', title: '3 - Free Quote', payload: 'btn_quote' }
  ];

  if (msgLower === '1' || msgLower.includes('about') || msgLower === 'btn_about') {
    replyText = `🏢 About Deepika Builtech Engineering\n\nWe design, fabricate and erect high-quality PEB structures, warehouses, cold storages, mezzanine floors & industrial sheds across Tamil Nadu.\n\n📍 Locations: Chennai, Kanchipuram, Thiruvallur\n\n📞 Call/WhatsApp: +91 96000 67611`;
  } else if (msgLower === '2' || msgLower.includes('service') || msgLower === 'btn_services') {
    replyText = `🔧 Our Services:\n\n1. PEB Structures (Factories & Warehouses)\n2. Mezzanine Floors (Space Expansion)\n3. Cold Storage Facilities\n4. Industrial Shed Fabrication\n5. Godown Construction\n6. Civil Foundation Works\n\n📞 Call: +91 96000 67611`;
  } else if (msgLower === '3' || msgLower.includes('quote') || msgLower === 'btn_quote') {
    replyText = `📋 Get a Free Quote!\n\nPlease share:\n1. Required Area (sq ft)\n2. Site Location\n3. Start Timeline\n\nOur team will prepare a detailed quotation for you within 2 hours!\n\n📞 Or call us directly: +91 96000 67611`;
  }

  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/me/messages`,
      params: { access_token: token },
      headers: { 'Content-Type': 'application/json' },
      data: {
        recipient: { id: senderId },
        message: {
          text: replyText,
          quick_replies: quickReplies
        }
      }
    });
    console.log(`✅ [${platform.toUpperCase()} Auto-Reply Sent] to senderId ${senderId}`);
  } catch (err) {
    console.error(`❌ [${platform.toUpperCase()} Auto-Reply Error]:`, err.response?.data || err.message);
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
      if (body.object !== 'whatsapp_business_account' && body.object !== 'page' && body.object !== 'instagram') {
        return res.status(404).send('Not Found');
      }

      // 1. Handle WhatsApp Messages
      if (body.object === 'whatsapp_business_account') {
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
      }

      // 2. Handle Facebook Messenger & Instagram DM
      if (body.object === 'page' || body.object === 'instagram') {
        const entry = body.entry?.[0];
        if (entry && entry.messaging) {
          const messaging = entry.messaging[0];
          if (messaging && messaging.message) {
            const senderId = messaging.sender?.id;
            const messageText = messaging.message.text || messaging.message.quick_reply?.payload || '';
            const messageTextLower = messageText.toLowerCase();
            const platform = body.object === 'page' ? 'facebook' : 'instagram';
            const phoneIdentifier = platform === 'facebook' ? `fb:${senderId}` : `ig:${senderId}`;

            // Check Duplicates
            const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phoneIdentifier);
            const { data: existingContacts } = await supabase.from('contacts').select('id').eq('phone', phoneIdentifier);
            const isExisting = (existingLeads?.length > 0) || (existingContacts?.length > 0);

            if (!isExisting) {
              const keywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
              const isLeadIntent = keywords.some(kw => messageTextLower.includes(kw)) || messageText === '';

              if (isLeadIntent) {
                const customerName = await getMetaUserProfile(senderId, platform) || (platform === 'facebook' ? 'Facebook Customer' : 'Instagram Customer');
                
                const { error } = await supabase.from('leads').insert([{
                  contactName:  customerName,
                  phone:        phoneIdentifier,
                  source:       platform === 'facebook' ? 'Facebook Messenger' : 'Instagram DM',
                  status:       'New',
                  notes:        `Inquiry: ${messageText || 'Media/Attachment'}`
                }]);

                if (error) {
                  console.error(`[${platform.toUpperCase()} Webhook DB Error]:`, error.message);
                } else {
                  console.log(`[${platform.toUpperCase()} Lead Captured] Added ${customerName} to CRM.`);
                }
              }
            }

            // Send direct auto-reply back to Facebook Messenger / Instagram DM
            await sendMetaAutoReply(senderId, platform, messageText);

            // Also forward the webhook event to external bot server if configured
            const botServerUrl = process.env.BOT_SERVER_URL;
            if (botServerUrl) {
              axios.post(`${botServerUrl}/webhook`, body).catch(err => {
                console.error(`[${platform.toUpperCase()} Webhook Forward Error]:`, err.message);
              });
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
