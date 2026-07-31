import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const TARGET_PHONE = '918807719422';

async function testSend88077() {
  console.log(`📱 Testing WhatsApp Cloud API message delivery to: +${TARGET_PHONE}`);
  console.log(`Using Phone Number ID: ${PHONE_NUMBER_ID}`);

  // 1. Text Message
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
        to: TARGET_PHONE,
        type: 'text',
        text: { body: `🧪 Test message to +91 88077 19422 at ${new Date().toISOString()}` }
      }
    });
    console.log('✅ Text Meta API Response:', JSON.stringify(resText.data, null, 2));
  } catch (error) {
    console.error('❌ Text Meta API Error:', error.response?.data || error.message);
  }

  // 2. Template Message
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
        to: TARGET_PHONE,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      }
    });
    console.log('✅ Template Meta API Response:', JSON.stringify(resTpl.data, null, 2));
  } catch (error) {
    console.error('❌ Template Meta API Error:', error.response?.data || error.message);
  }
}

testSend88077();
