import { secureFetch } from './api';

export const sendAutomatedWhatsApp = async (phone: string, templateId: string, parameters: any[]) => {
  console.log(`[WhatsApp Service] Triggering WhatsApp send via backend: to ${phone}, template: ${templateId}`);
  try {
    const data = await secureFetch('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, templateId, parameters })
    });
    return data;
  } catch (err: any) {
    console.error('[WhatsApp Service Error]:', err.message);
    throw err;
  }
};
