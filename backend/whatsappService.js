import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// This service is built to connect with the Official Meta WhatsApp Cloud API
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Generic function to send a WhatsApp Template message
 */
export const sendWhatsAppMessage = async (phone, templateId, parameters) => {
  console.log(`[WhatsApp API] Attempting to send message to ${phone}`);
  
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env');
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: finalPhone,
        type: "template",
        template: {
          name: templateId,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: parameters.map(param => ({
                type: "text",
                text: param
              }))
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log(`[WhatsApp API] Successfully sent template '${templateId}' to ${finalPhone}`);
    return { success: true, data: response.data };

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`[WhatsApp API] Failed to send message:`, errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Specialized function for the 'follow_up_lead' template
 * Usage: await sendFollowUpLead("919876543210", "Rajesh");
 */
export const sendFollowUpLead = async (phone, customerName) => {
  return await sendWhatsAppMessage(phone, 'follow_up_lead', [customerName]);
};
