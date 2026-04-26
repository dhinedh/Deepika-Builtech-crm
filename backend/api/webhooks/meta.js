import { supabase } from '../../config/supabase.js';
import { sendFollowUpLead } from '../../whatsappService.js';

export default async function handler(req, res) {
  // 1. Handle GET (Verification)
  if (req.method === 'GET') {
    const verify_token = process.env.META_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verify_token) {
        console.log('[Meta Webhook] Successfully Verified via Serverless');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(400).send('Bad Request');
  }

  // 2. Handle POST (Inbound Messages)
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      try {
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        if (changes && changes.messages) {
          const msg = changes.messages[0];
          const contact = changes.contacts?.[0];
          const phone = msg.from;
          const messageText = msg.text?.body?.toLowerCase() || '';

          // Filter: Existing Contact?
          const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phone);
          const { data: existingContacts } = await supabase.from('contacts').select('id').eq('phone', phone);

          const isExisting = (existingLeads?.length > 0) || (existingContacts?.length > 0);

          if (!isExisting) {
            // Filter: Lead Intent Keywords
            const leadKeywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
            const isLeadIntent = leadKeywords.some(kw => messageText.includes(kw)) || messageText === '';

            if (isLeadIntent) {
              const customerName = contact?.profile?.name || 'Customer';
              const newLead = {
                contactName: customerName,
                phone: phone,
                source: 'WhatsApp',
                status: 'New',
                projectType: 'Unspecified',
                leadScore: 20,
                notes: `Inquiry via Serverless: ${msg.text?.body || 'Media sent'}`
              };

              const { error } = await supabase.from('leads').insert([newLead]);
              
              if (!error) {
                console.log(`[Serverless Webhook] Lead Captured: ${customerName}`);
                await sendFollowUpLead(phone, customerName);
              }
            }
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      } catch (err) {
        console.error('[Serverless Webhook Error]:', err);
        return res.status(200).send('EVENT_RECEIVED'); // Always return 200 to Meta
      }
    }
    return res.status(404).send('Not Found');
  }

  return res.status(405).send('Method Not Allowed');
}
