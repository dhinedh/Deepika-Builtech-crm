import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Helper getter functions for Meta credentials
const getWhatsAppToken = () => process.env.WHATSAPP_ACCESS_TOKEN;
const getPhoneNumberId = () => process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Generic function to send a WhatsApp Template message
 */
export const sendWhatsAppMessage = async (phone, templateId, parameters, langCode = "en_US") => {
  console.log(`[WhatsApp API] Attempting to send message to ${phone}`);
  
  const token = getWhatsAppToken();
  const phoneId = getPhoneNumberId();

  if (!token || !phoneId) {
    console.error('[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env');
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: finalPhone,
        type: "template",
        template: {
          name: templateId,
          language: { code: langCode },
          components: [
            {
              type: "body",
              parameters: parameters.map(param => ({
                type: "text",
                text: String(param || '')
              }))
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log(`[WhatsApp API] Successfully sent template '${templateId}' to ${finalPhone}`);
    return { success: true, data: response.data };

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`[WhatsApp API] Failed to send template message:`, errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Specialized function for the 'sales_lead_alert' template
 */
export const sendSalesAlertTemplate = async (phone, clientName, clientPhone, details, time) => {
  return await sendWhatsAppMessage(phone, 'sales_lead_alert', [clientName, clientPhone, details, time], 'en_US');
};

/**
 * Specialized function for the 'follow_up_lead' template
 */
export const sendFollowUpLead = async (phone, customerName) => {
  return await sendWhatsAppMessage(phone, 'follow_up_lead', [customerName], 'en');
};

/**
 * Send direct free-form text message via Meta WhatsApp Cloud API
 */
export const sendDirectWhatsAppText = async (phone, text) => {
  const token = getWhatsAppToken();
  const phoneId = getPhoneNumberId();

  if (!token || !phoneId) {
    console.error('[WhatsApp API] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env');
    return { success: false, error: 'Configuration missing' };
  }
  try {
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: finalPhone,
        type: "text",
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`[WhatsApp Direct API] Successfully sent direct message to ${finalPhone}`);
    return { success: true, data: response.data };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`[WhatsApp Direct API Error]:`, errorMsg);
    return { success: false, error: errorMsg };
  }
};

