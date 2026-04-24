import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// This service is built to connect with the Official Meta WhatsApp Cloud API
// Or a provider like Twilio / Interakt

export const sendWhatsAppMessage = async (phone, templateId, parameters) => {
  console.log(`[WhatsApp API] Attempting to send message to ${phone}`);
  
  try {
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    // --- EXAMPLE FOR META WHATSAPP CLOUD API ---
    /*
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
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
    return response.data;
    */

    // Simulated success response until API keys are provided
    console.log(`[WhatsApp API] Successfully simulated sending template '${templateId}' to ${finalPhone}`);
    return { success: true, messageId: `wamid.HBgLMjMx${Date.now()}` };

  } catch (error) {
    console.error(`[WhatsApp API] Failed to send message:`, error.message);
    throw error;
  }
};
