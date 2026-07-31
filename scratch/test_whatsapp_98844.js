import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const TARGET_PHONE = '919884487938';

async function testSend() {
  console.log(`📱 Testing WhatsApp Cloud API message delivery to: +${TARGET_PHONE}`);
  console.log(`Using Phone Number ID: ${PHONE_NUMBER_ID}`);

  const testMessage = `🧪 *Test Notification from Deepika Builtech System*\n\nThis is a test notification to verify sales alert delivery for +91 98844 87938.\n\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: TARGET_PHONE,
        type: 'text',
        text: { body: testMessage }
      }
    });

    console.log('✅ Meta API Success Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Meta API Error Response:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testSend();
