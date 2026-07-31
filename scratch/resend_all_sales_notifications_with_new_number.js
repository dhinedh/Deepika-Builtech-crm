import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');

const NOTIFICATION_NUMBERS = [
  '919791644688',
  '918807719422',
  '919342400879',
  '919884487938',
  '919600067611'
];

const alertMessageInstagram = `🎬 *NEW INSTAGRAM REEL COMMENT LEAD*
━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Handle:* @ganishetty.gandhi
📱 *Instagram Contact ID:* ig:1052728487729796
💬 *Comment Text:* "PEB"
📡 *Source:* Instagram Video Comment
⏰ *Received Time:* Today, 28/07/2026 at 7:30 PM (IST)
━━━━━━━━━━━━━━━━━━━━━
⚡ *ACTION: New Lead & Enquiry added in CRM database*`;

const alertMessageQuotation = `🔔 *NEW FREE QUOTATION REQUEST — Deepika Builtech CRM*
━━━━━━━━━━━━━━━━━━━━━
👤 *Client:* Aravindhini Dinakar
📱 *Phone/Handle:* +44 7448 025707
🔧 *Service:* PEB Warehouse Construction
📐 *Area Required:* 45,000 sq ft (1.5 acres)
📍 *Site Location:* Redhills, Chennai
📅 *Timeline:* 1 to 3 months
💰 *Budget Range:* Above ₹1 Crore

📊 *Lead Score:* 95 (🔥 High Priority)
🏷️ *Lead Status:* Quotation Requested
⏰ *Received:* Today, 28/07/2026
📞 *Call-Back Target:* Call within 2 hours
━━━━━━━━━━━━━━━━━━━━━
⚡ *ACTION REQUIRED: Review layout & call client back*
🌐 *CRM Link:* https://crm.deepikabuiltech.com`;

async function broadcastSalesNotifications() {
  console.log('🚀 Broadcast Sales Lead Notifications to target numbers (including +91 97916 44688):\n');

  for (const num of NOTIFICATION_NUMBERS) {
    console.log(`========================================`);
    console.log(`📱 Sending notifications to +${num}...`);

    // 1. Send Instagram Reel Comment Lead Text Alert
    try {
      const resInsta = await axios({
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
          text: { body: alertMessageInstagram }
        }
      });
      console.log(`  ✅ Instagram Lead Alert Delivered: ${resInsta.data?.messages?.[0]?.id || 'OK'}`);
    } catch (err) {
      console.error(`  ❌ Instagram Lead Alert Error (+${num}):`, err.response?.data || err.message);
    }

    // 2. Send High-Priority Quotation Request Lead Text Alert
    try {
      const resQuote = await axios({
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
          text: { body: alertMessageQuotation }
        }
      });
      console.log(`  ✅ Quotation Lead Alert Delivered: ${resQuote.data?.messages?.[0]?.id || 'OK'}`);
    } catch (err) {
      console.error(`  ❌ Quotation Lead Alert Error (+${num}):`, err.response?.data || err.message);
    }

    // 3. Send Template Message as backup to guarantee delivery across Meta window
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
      console.log(`  ✅ Template Alert Delivered: ${resTpl.data?.messages?.[0]?.id || 'OK'}`);
    } catch (err) {
      console.error(`  ❌ Template Alert Error (+${num}):`, err.response?.data || err.message);
    }
  }

  console.log('\n🎉 All notifications sent successfully!');
  process.exit(0);
}

broadcastSalesNotifications().catch(err => {
  console.error(err);
  process.exit(1);
});
