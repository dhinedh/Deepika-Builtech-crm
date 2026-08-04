import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../backend/.env' });

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '2066186237316289';

async function createLeadAlertTemplate() {
  console.log(`Submitting 'sales_lead_alert' template to Meta WABA ID ${WABA_ID}...`);
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${WABA_ID}/message_templates`,
      {
        name: "sales_lead_alert",
        category: "UTILITY",
        allow_category_change: true,
        language: "en_US",
        components: [
          {
            type: "BODY",
            text: "🔔 *NEW LEAD CAPTURED — Deepika Builtech CRM*\n━━━━━━━━━━━━━━━━━━━━━\n👤 *Client:* {{1}}\n📱 *Phone:* {{2}}\n💬 *Details:* {{3}}\n⏰ *Time:* {{4}}\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *ACTION REQUIRED: Review & respond in CRM.*",
            example: {
              body_text: [
                ["John Doe", "+919876543210", "Interested in PEB Warehouse", "10:30 AM"]
              ]
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log('✅ Template Created Successfully:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error Creating Template:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

createLeadAlertTemplate();
