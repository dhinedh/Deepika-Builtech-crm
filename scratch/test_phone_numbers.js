import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../backend/.env' });

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '2066186237316289';

async function checkStatus() {
  try {
    const res = await axios.get(`https://graph.facebook.com/v20.0/${WABA_ID}/message_templates?name=sales_lead_alert`, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });
    console.log('Template status:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error checking status:', err.response?.data || err.message);
  }
}

checkStatus();
