import cron from 'node-cron';
import axios from 'axios';
import { Lead, Enquiry, FollowUp } from '../config/mongodb.js';
import { sendWhatsAppMessage } from '../whatsappService.js';

// In-memory store to prevent duplicate reminders if DB update fails (fallback)
const sentReminders = new Set();

/**
 * Send 7-day reminder message to a lead or enquiry on their original platform (WhatsApp, Instagram, FB)
 */
export async function sendAuto7DayReminder(record) {
  const phone = record.phone || '';
  const name = record.contactName || record.fullName || 'Valued Client';
  const source = (record.source || '').toLowerCase();
  const token = process.env.PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const messageText = `Hi ${name}, this is Deepika Builtech Engineering 🏗️.\n\nFollowing up on your PEB structure & construction inquiry! Do you have any updates or questions regarding your project requirements? We are happy to share layout ideas and a rough cost estimate.\n\n📞 Call / WhatsApp: +91 96000 67611\n🌐 deepikabuiltech.com`;

  // 1. Instagram DM
  if (source.includes('instagram') || phone.startsWith('ig:')) {
    const recipientId = phone.replace(/^ig:/i, '');
    if (token && recipientId) {
      try {
        await axios.post(
          'https://graph.facebook.com/v18.0/me/messages',
          { recipient: { id: recipientId }, message: { text: messageText } },
          { params: { access_token: token } }
        );
        console.log(`[7-Day Auto Reminder] Sent Instagram DM to ${name} (${recipientId})`);
        return true;
      } catch (err) {
        console.warn(`[Auto Reminder Error - Instagram]:`, err.response?.data || err.message);
      }
    }
  }

  // 2. Facebook Messenger
  if (source.includes('facebook') || phone.startsWith('fb:')) {
    const recipientId = phone.replace(/^fb:/i, '');
    if (token && recipientId) {
      try {
        await axios.post(
          'https://graph.facebook.com/v18.0/me/messages',
          { recipient: { id: recipientId }, message: { text: messageText } },
          { params: { access_token: token } }
        );
        console.log(`[7-Day Auto Reminder] Sent FB Messenger message to ${name} (${recipientId})`);
        return true;
      } catch (err) {
        console.warn(`[Auto Reminder Error - Facebook]:`, err.response?.data || err.message);
      }
    }
  }

  // 3. WhatsApp (Default)
  try {
    await sendWhatsAppMessage(phone, 'weekly_nurture_followup', [name]);
    console.log(`[7-Day Auto Reminder] Sent WhatsApp message to ${name} (${phone})`);
    return true;
  } catch (err) {
    console.warn(`[Auto Reminder Error - WhatsApp]:`, err.message);
  }
  return false;
}

/**
 * Execute 7-Day Auto Reminder Scan for all inactive leads and enquiries
 */
export async function execute7DayReminderScan() {
  console.log('[7-Day Auto Reminder Scan] Executing scan for all inactive enquiries & leads...');
  let sentCount = 0;
  const now = new Date();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  try {
    // 1. Scan LEADS collection
    const leads = await Lead.find();
    if (leads && leads.length > 0) {
      for (const lead of leads) {
        if (lead.status === 'Won' || lead.status === 'Lost') continue;
        const lastDate = lead.last_contacted_at || lead.updated_at || lead.updatedAt || lead.created_at || lead.createdAt;
        const lastTime = lastDate ? new Date(lastDate).getTime() : 0;
        
        if (now.getTime() - lastTime >= SEVEN_DAYS_MS) {
          const sent = await sendAuto7DayReminder(lead);
          if (sent) {
            sentCount++;
            await Lead.updateOne({ _id: lead._id }, {
              last_contacted_at: now,
              updated_at: now
            });
          }
        }
      }
    }

    // 2. Scan ENQUIRIES collection
    const enquiries = await Enquiry.find();
    if (enquiries && enquiries.length > 0) {
      for (const enq of enquiries) {
        if (enq.status === 'Closed' || enq.status === 'Converted') continue;
        const lastDate = enq.last_contacted_at || enq.updated_at || enq.updatedAt || enq.created_at || enq.createdAt;
        const lastTime = lastDate ? new Date(lastDate).getTime() : 0;

        if (now.getTime() - lastTime >= SEVEN_DAYS_MS) {
          const sent = await sendAuto7DayReminder(enq);
          if (sent) {
            sentCount++;
            await Enquiry.updateOne({ _id: enq._id }, {
              last_contacted_at: now,
              updated_at: now
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[7-Day Auto Reminder Scan Error]:', err.message);
  }
  console.log(`[7-Day Auto Reminder Scan Complete] Sent ${sentCount} reminders.`);
  return { success: true, sentCount };
}

export const startCronJobs = () => {
  console.log('[Cron Scheduler] Initializing background automated messaging jobs...');

  /**
   * 1. WEEKLY LEAD & ENQUIRY FOLLOW-UP
   * Runs daily at 10:00 AM to check for leads and enquiries that haven't been contacted in 7+ days.
   */
  cron.schedule('0 10 * * *', async () => {
    await execute7DayReminderScan();
  });
  
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron Scheduler] Checking for upcoming scheduled calls/meetings...');
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const followUps = await FollowUp.find({
        status: 'Pending',
        scheduled_date: { $gte: now, $lte: inOneHour }
      });

      const adminPhone = process.env.ADMIN_PHONE || '910000000000';

      if (followUps && followUps.length > 0) {
        for (const fUp of followUps) {
          const fUpId = fUp.id || fUp._id.toString();
          // Check in-memory fallback to prevent duplicates
          if (sentReminders.has(fUpId)) continue;

          // Check DB flag
          if (fUp.reminder_sent === true) continue;

          const associatedLead = await Lead.findOne({ $or: [{ id: fUp.lead_id }, { _id: fUp.lead_id }] });
          const clientPhone = associatedLead?.phone || 'Unknown';
          const clientName = associatedLead?.contactName || 'Client';
          const timeStr = new Date(fUp.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // 1. Send Reminder to Client
          await sendWhatsAppMessage(
            clientPhone,
            'meeting_reminder_client',
            [clientName, fUp.type || 'Meeting', timeStr]
          );

          // 2. Send Alert Reminder to ADMIN
          await sendWhatsAppMessage(
            adminPhone,
            'meeting_reminder_admin',
            [clientName, fUp.type || 'Meeting', timeStr]
          );
          
          console.log(`[Automated Message] Reminders sent for ${fUp.type} with ${clientName}`);
          
          // Prevent duplicate messages
          sentReminders.add(fUpId);

          // 3. Mark as sent in DB permanently
          await FollowUp.updateOne({ _id: fUp._id }, { reminder_sent: true });
        }
      }
    } catch (err) {
      console.error('[Cron Error] Reminder check failed:', err.message);
    }
  });
};
