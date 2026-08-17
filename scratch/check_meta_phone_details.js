import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
dotenv.config({ path: path.resolve('../backend/.env') });

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '2066186237316289';

async function checkPhoneDetails() {
  console.log(`Checking Meta Phone Number ID ${PHONE_NUMBER_ID}...`);
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}?fields=display_phone_number,verified_name,code_verification_status,quality_rating,platform_type,throughput`,
      {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      }
    );
    console.log('Phone Details:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching phone details:', err.response?.data || err.message);
  }
}

checkPhoneDetails();
