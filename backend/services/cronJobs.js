import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { sendWhatsAppMessage } from '../whatsappService.js';

// In-memory store to prevent duplicate reminders if DB update fails (fallback)
const sentReminders = new Set();

export const startCronJobs = () => {
  console.log('[Cron Scheduler] Initializing background automated messaging jobs...');

  /**
   * 1. WEEKLY LEAD FOLLOW-UP
   * Runs daily at 10:00 AM to check for leads that haven't been contacted in 7+ days.
   */
  cron.schedule('0 10 * * *', async () => {
    console.log('[Cron Scheduler] Executing Weekly Lead Follow-up check...');
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .in('status', ['New', 'Contacted']);

      if (error) throw error;

      if (leads && leads.length > 0) {
        const now = new Date();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

        for (const lead of leads) {
          const lastContactedDate = lead.last_contacted_at ? new Date(lead.last_contacted_at) : new Date(lead.created_at || now);
          const timeSinceLastContact = now.getTime() - lastContactedDate.getTime();

          // If it's been 7 days or more since the last contact
          if (timeSinceLastContact >= SEVEN_DAYS_MS) {
            
            // 1. Send the WhatsApp Follow-up Message
            await sendWhatsAppMessage(
              lead.phone, 
              'weekly_nurture_followup', 
              [lead.contactName || 'there']
            );
            console.log(`[Automated Message] Sent weekly follow-up to ${lead.contactName}`);
            
            // 2. Update the DB so they don't get messaged again tomorrow
            const { error: updateError } = await supabase
              .from('leads')
              .update({ last_contacted_at: now.toISOString() })
              .eq('id', lead.id);

            if (updateError) {
              console.warn(`[Cron Warning] Failed to update last_contacted_at for lead ${lead.id}. Please ensure 'last_contacted_at' column exists in Supabase.`);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Cron Error] Weekly Follow-up Failed:', err.message);
    }
  });
  
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron Scheduler] Checking for upcoming scheduled calls/meetings...');
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const { data: followUps, error } = await supabase
        .from('followups')
        .select('*, leads(*)')
        .eq('status', 'Pending')
        .gte('scheduled_date', now.toISOString())
        .lte('scheduled_date', inOneHour.toISOString());

      if (error) throw error;

      const adminPhone = process.env.ADMIN_PHONE || '910000000000';

      if (followUps && followUps.length > 0) {
        for (const fUp of followUps) {
          // Check in-memory fallback to prevent duplicates
          if (sentReminders.has(fUp.id)) continue;

          // Check DB flag (if the column exists and was set)
          if (fUp.reminder_sent === true) continue;

          const clientPhone = fUp.leads?.phone || 'Unknown';
          const clientName = fUp.leads?.contactName || 'Client';
          const timeStr = new Date(fUp.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // 1. Send Reminder to Client
          await sendWhatsAppMessage(
            clientPhone,
            'meeting_reminder_client',
            [clientName, fUp.type, timeStr]
          );

          // 2. Send Alert Reminder to ADMIN
          await sendWhatsAppMessage(
            adminPhone,
            'meeting_reminder_admin',
            [clientName, fUp.type, timeStr]
          );
          
          console.log(`[Automated Message] Reminders sent for ${fUp.type} with ${clientName}`);
          
          // Prevent duplicate messages
          sentReminders.add(fUp.id);

          // 3. Mark as sent in DB permanently
          const { error: updateError } = await supabase
            .from('followups')
            .update({ reminder_sent: true })
            .eq('id', fUp.id);

          if (updateError) {
             console.warn(`[Cron Warning] Failed to update reminder_sent for follow_up ${fUp.id}. Please ensure 'reminder_sent' boolean column exists in Supabase.`);
          }
        }
      }
    } catch (err) {
      console.error('[Cron Error] Reminder check failed:', err.message);
    }
  });
};
