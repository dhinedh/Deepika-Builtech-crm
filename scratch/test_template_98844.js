import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const ACCESS_TOKEN = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const TARGET_PHONE = '919884487938';

async function sendTemplate() {
  console.log(`📱 Sending Meta Approved 'hello_world' template to: +${TARGET_PHONE}`);

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
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      }
    });

    console.log('✅ Template Meta API Success Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Template Meta API Error Response:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

sendTemplate();
