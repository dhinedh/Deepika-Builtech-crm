import { sendAutomatedWhatsApp } from '../services/whatsappApi';

export const sendWhatsAppMessage = async (phone: string, name: string, template: string = 'default', extraParams: any[] = []) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  // Map local frontend templates to Meta approved template IDs
  let metaTemplateId = 'follow_up_lead'; // Primary Meta approved template
  let parameters = [name];

  if (template === 'followup' || template === 'intro') {
    metaTemplateId = 'follow_up_lead';
    parameters = [name];
  } else if (template === 'reminder' || template === 'meeting_reminder') {
    // Expected template name for reminders on Meta Dashboard
    metaTemplateId = 'meeting_reminder';
    parameters = [name, ...extraParams];
  } else if (template !== 'default') {
    metaTemplateId = template;
    parameters = extraParams.length > 0 ? extraParams : [name];
  }

  try {
    const res = await sendAutomatedWhatsApp(formattedPhone, metaTemplateId, parameters);
    console.log('[WhatsApp API Result]:', res);
    console.info(`✅ WhatsApp message sent to ${name} (${formattedPhone}) via Meta API.`);
  } catch (err: any) {
    console.error('[WhatsApp API Send Failed, falling back to wa.me]:', err);
    console.warn('[WhatsApp Fallback] Meta API failed, opening wa.me link:', err?.message || err);
    
    // Construct local fallback text
    let message = '';
    switch (template) {
      case 'intro':
        message = `Hi ${name}, this is Deepika Builtech Engineering. We received your inquiry regarding a PEB structure. Would you like to schedule a site visit?`;
        break;
      case 'quote':
        message = `Hi ${name}, I have sent the quotation for your project. Please let me know if you have any questions. Regards, Deepika Builtech.`;
        break;
      case 'followup':
        message = `Hi ${name}, following up on our previous conversation. Any updates on the project?`;
        break;
      case 'reminder':
      case 'meeting_reminder':
        const dateStr = extraParams[0] || 'tomorrow';
        message = `Hi ${name}, this is a gentle reminder for our scheduled interaction on ${dateStr}. Looking forward to it! - Deepika Builtech`;
        break;
      default:
        message = `Hi ${name}, this is Deepika Builtech Engineering. How can we help you today?`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  }
};

export type ChannelPlatform = 'whatsapp' | 'instagram' | 'facebook';

export interface LeadTarget {
  id?: string;
  contactName: string;
  phone: string;
  source?: string;
}

export function detectLeadPlatform(lead: LeadTarget): ChannelPlatform {
  const source = (lead.source || '').toLowerCase();
  const phone = (lead.phone || '').toLowerCase();

  if (source.includes('instagram') || phone.startsWith('ig:')) {
    return 'instagram';
  }
  if (source.includes('facebook') || phone.startsWith('fb:')) {
    return 'facebook';
  }
  return 'whatsapp';
}

export const sendOmniChannelMessage = async (
  lead: LeadTarget,
  messageType: 'followup' | 'reminder' | 'intro' = 'followup',
  extraParams: any[] = []
) => {
  const platform = detectLeadPlatform(lead);

  if (platform === 'instagram' || platform === 'facebook') {
    const cleanId = lead.phone.replace(/^(ig:|fb:)/i, '');
    let text = `Hi ${lead.contactName}, this is Deepika Builtech Engineering. Following up on your PEB project inquiry. How can we assist you today?`;

    if (messageType === 'reminder') {
      const timeStr = extraParams[0] || 'tomorrow';
      text = `Hi ${lead.contactName}, gentle reminder from Deepika Builtech for our scheduled discussion at ${timeStr}.`;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${API_BASE_URL}/webhooks/send-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          recipientId: cleanId,
          text
        })
      });
      alert(`✅ Message sent to ${lead.contactName} via ${platform === 'instagram' ? 'Instagram DM' : 'Facebook Messenger'}!`);
      return;
    } catch (err: any) {
      console.warn(`[${platform} API Send Fallback]:`, err);
      if (platform === 'instagram') {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
      } else {
        window.open('https://m.me/', '_blank');
      }
      return;
    }
  }

  // Default to WhatsApp
  await sendWhatsAppMessage(lead.phone, lead.contactName, messageType, extraParams);
};
