import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');

const NUMBERS_TO_TEST = [
  '919342400879',
  '918807719422',
  '919884487938',
  '919600067611'
];

async function compareNumbers() {
  console.log('🔍 Testing WhatsApp API delivery status for all sales numbers:');

  for (const num of NUMBERS_TO_TEST) {
    console.log(`\n📱 Testing +${num}...`);
    try {
      const res = await axios({
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
          text: { body: `🧪 Test message to +${num}` }
        }
      });
      console.log(`  ✅ SUCCESS Response ID:`, res.data?.messages?.[0]?.id);
    } catch (err) {
      console.error(`  ❌ ERROR:`, err.response?.data?.error || err.message);
    }
  }
}

compareNumbers();
