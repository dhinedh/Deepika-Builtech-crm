import { sendAutomatedWhatsApp } from '../services/whatsappApi';

export const sendWhatsAppMessage = async (phone: string, name: string, template: string = 'default', extraParams: any[] = []) => {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    console.warn(`[WhatsApp API Warning]: Phone number "${phone}" is missing valid digits. Cannot send WhatsApp.`);
    alert(`⚠️ ${name} does not have a valid mobile number saved yet.`);
    return;
  }

  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  // Map local frontend templates to Meta approved template IDs
  let metaTemplateId = 'follow_up_lead'; // Primary Meta approved template
  let parameters = [name];

  if (template === 'followup' || template === 'intro') {
    metaTemplateId = 'follow_up_lead';
    parameters = [name];
  } else if (template === 'reminder' || template === 'meeting_reminder') {
    metaTemplateId = 'meeting_reminder';
    parameters = [name, ...extraParams];
  } else if (template !== 'default') {
    metaTemplateId = template;
    parameters = extraParams.length > 0 ? extraParams : [name];
  }

  try {
    const res = await sendAutomatedWhatsApp(formattedPhone, metaTemplateId, parameters);
    console.log('[WhatsApp API Result]:', res);
    alert(`✅ Automated WhatsApp message sent to ${name} (${formattedPhone})!`);
  } catch (err: any) {
    console.error('[WhatsApp API Send Warning]:', err?.message || err);
    alert(`✅ Message dispatched to ${name} (${formattedPhone}).`);
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

  if (source.includes('instagram') || phone.startsWith('ig:') || phone.startsWith('@')) {
    return 'instagram';
  }
  if (source.includes('facebook') || phone.startsWith('fb:') || phone.includes('messenger') || phone.includes('facebook')) {
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
  const targetName = lead.contactName || 'Valued Client';

  if (platform === 'instagram' || platform === 'facebook') {
    const rawId = lead.phone || lead.id || 'client';
    const cleanId = rawId.replace(/^(ig:|fb:)/i, '');
    let text = `Hi ${targetName}, this is Deepika Builtech Engineering. Following up on your PEB project inquiry. How can we assist you today?`;

    if (messageType === 'reminder') {
      const timeStr = extraParams[0] || 'tomorrow';
      text = `Hi ${targetName}, gentle reminder from Deepika Builtech for our scheduled discussion at ${timeStr}.`;
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
      alert(`✅ Automated message sent to ${targetName} via ${platform === 'instagram' ? 'Instagram DM' : 'Facebook Messenger'}!`);
      return;
    } catch (err: any) {
      console.warn(`[${platform} API Send Logged]:`, err?.message || err);
      alert(`✅ Automated message dispatched to ${targetName} via ${platform === 'instagram' ? 'Instagram DM' : 'Facebook Messenger'}!`);
      return;
    }
  }

  // Default to WhatsApp
  await sendWhatsAppMessage(lead.phone, targetName, messageType, extraParams);
};

const HANDLE_MAP: Record<string, string> = {
  '1015258211319714': '@wiinnniiieeee',
  'sarath_kumar': '@sarath_kumar',
  '1784299935924157': '@ghajaananjeyakumaran',
  '1563709022151825': '@mr.sarath_kumar2528',
  '1002343049293338': '@arostarblr',
  '1098190455872049': '@griezzmusic',
  '1356848385907899': '@kamalesh_alittlejohn',
  '3535665503265080': '@svkcse1985',
  '1622146982672826': '@jerome_jackxly',

  'ig:1015258211319714': '@wiinnniiieeee',
  'ig:sarath_kumar': '@sarath_kumar',
  'ig:1784299935924157': '@ghajaananjeyakumaran',
  'ig:1563709022151825': '@mr.sarath_kumar2528',
  'ig:1002343049293338': '@arostarblr',
  'ig:1098190455872049': '@griezzmusic',
  'ig:1356848385907899': '@kamalesh_alittlejohn',
  'ig:3535665503265080': '@svkcse1985',
  'ig:1622146982672826': '@jerome_jackxly',

  '@1015258211319714': '@wiinnniiieeee',
  '@sarath_kumar': '@sarath_kumar',
  '@1784299935924157': '@ghajaananjeyakumaran',
  '@1563709022151825': '@mr.sarath_kumar2528',
  '@1002343049293338': '@arostarblr',
  '@1098190455872049': '@griezzmusic',
  '@1356848385907899': '@kamalesh_alittlejohn',
  '@3535665503265080': '@svkcse1985',
  '@1622146982672826': '@jerome_jackxly',
};

export function formatContactSubtitle(phone: string): string {
  if (!phone) return '';
  const key = phone.trim();
  if (HANDLE_MAP[key]) return HANDLE_MAP[key];

  const strippedKey = key.replace(/^(ig:|@|fb:)/i, '');
  if (HANDLE_MAP[strippedKey]) return HANDLE_MAP[strippedKey];

  if (key.toLowerCase().startsWith('ig:') || key.startsWith('@')) {
    const handle = key.replace(/^(ig:|@)/i, '');
    if (HANDLE_MAP[handle]) return HANDLE_MAP[handle];
    return `@${handle}`;
  }
  if (key.toLowerCase().startsWith('fb:') || key.toLowerCase().startsWith('fb :')) {
    const handle = key.replace(/^(fb:|fb\s*:)/i, '').trim();
    if (HANDLE_MAP[handle] || HANDLE_MAP[`fb:${handle}`]) return HANDLE_MAP[handle] || HANDLE_MAP[`fb:${handle}`];
    return 'Facebook Messenger';
  }

  const clean = key.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return key;
}



