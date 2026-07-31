import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');

const NOTIFICATION_NUMBERS = [
  '918807719422',
  '919884487938',
  '919600067611'
];

const alertMessage = `🎬 *NEW INSTAGRAM REEL COMMENT LEAD*
━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Handle:* @ganishetty.gandhi
📱 *Instagram Contact ID:* ig:1052728487729796
💬 *Comment Text:* "PEB"
📡 *Source:* Instagram Video Comment
⏰ *Received Time:* Today, 28/07/2026 at 7:30 PM (IST)
━━━━━━━━━━━━━━━━━━━━━
⚡ *ACTION: New Lead & Enquiry added in CRM database*`;

async function resendNotificationsToAll() {
  console.log('🚀 Resending Instagram Lead Alerts to all sales notification numbers...\n');

  for (const num of NOTIFICATION_NUMBERS) {
    console.log(`📱 Sending to +${num}...`);

    // 1. Send free-form alert message
    try {
      const resText = await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          to: num,
          type: 'text',
          text: { body: alertMessage }
        }
      });
      console.log(`  ✅ Text Alert Response: ${resText.data?.messages?.[0]?.id || 'OK'}`);
    } catch (err) {
      console.error(`  ❌ Text Alert Error (+${num}):`, err.response?.data || err.message);
    }

    // 2. Also send template notification as backup to ensure delivery
    try {
      const resTpl = await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          to: num,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' }
          }
        }
      });
      console.log(`  ✅ Template Alert Response: ${resTpl.data?.messages?.[0]?.id || 'OK'}\n`);
    } catch (err) {
      console.error(`  ❌ Template Alert Error (+${num}):`, err.response?.data || err.message, '\n');
    }
  }

  console.log('🎉 Notification broadcast complete!');
  process.exit(0);
}

resendNotificationsToAll().catch(err => {
  console.error(err);
  process.exit(1);
});
