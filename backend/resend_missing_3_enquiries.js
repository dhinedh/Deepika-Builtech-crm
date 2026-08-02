import dotenv from 'dotenv';
import { sendDirectWhatsAppText } from './whatsappService.js';

dotenv.config({ path: './.env' });

const salesNumbers = (process.env.NOTIFICATION_WHATSAPP_NUMBERS || '919884487938,919791644688,918508599029,919600067611,916380855892')
  .split(',')
  .map(n => n.trim().replace(/\D/g, ''))
  .filter(Boolean);

const missingEnquiries = [
  {
    name: 'Babhu Sabhapathi',
    phone: '919884487938',
    message: 'Hi',
    time: 'Sun Aug 02 2026 08:55:34 IST'
  },
  {
    name: 'mugil9451',
    phone: '919342400879',
    message: 'Selection: btn_about',
    time: 'Sun Aug 02 2026 08:55:03 IST'
  },
  {
    name: '@boa_benji359 (Benjamin)',
    phone: 'ig:923741500020996',
    message: 'Benjamin +919841747887\nI tried reaching you twice no response',
    time: 'Sat Aug 01 2026 12:38:14 IST'
  }
];

async function resendAlerts() {
  console.log('🚀 Resending WhatsApp notification alerts for the 3 missing enquiries to sales numbers:\n');
  console.log('Sales numbers:', salesNumbers.map(n => `+${n}`).join(', '));
  console.log('\n========================================\n');

  for (const enq of missingEnquiries) {
    const alertMsg = `🔔 *NEW ENQUIRY RECEIVED — Deepika Builtech CRM*\n━━━━━━━━━━━━━━━━━━━━━\n👤 *Client:* ${enq.name}\n📱 *Phone/Handle:* ${enq.phone}\n💬 *Message:* ${enq.message}\n🏷️ *Status:* New Enquiry\n⏰ *Received:* ${enq.time}\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *ACTION REQUIRED: Review & respond to client*\n🌐 *CRM Link:* https://crm.deepikabuiltech.com`;

    console.log(`📱 Sending alert for enquiry: ${enq.name} (${enq.phone})...`);

    for (const salesNum of salesNumbers) {
      const res = await sendDirectWhatsAppText(salesNum, alertMsg);
      if (res.success) {
        console.log(`   ✅ Sent to +${salesNum}`);
      } else {
        console.log(`   ❌ Failed sending to +${salesNum}: ${res.error}`);
      }
    }
    console.log('');
  }

  console.log('🎉 All 3 enquiry alerts dispatched successfully to sales team!');
  process.exit(0);
}

resendAlerts().catch(err => {
  console.error('Error running resend script:', err);
  process.exit(1);
});
