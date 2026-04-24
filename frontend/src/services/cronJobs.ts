import { useCRMStore } from '../store/useCRMStore';
import { sendAutomatedWhatsApp } from './whatsappApi';
import { addDays, format } from 'date-fns';

// This would typically run on a Node.js server using a cron library (like node-cron).
// Here we simulate the logic that checks for due messages in a real backend.

export const runDailyCronJob = async () => {
  const state = useCRMStore.getState();
  const leads = state.leads;
  const followUps = state.followUps;
  const today = new Date();

  console.log('[CRON] Running daily WhatsApp automation check...');

  // 1. Weekly automatic message to active leads
  for (const lead of leads) {
    if (lead.status !== 'Won' && lead.status !== 'Lost') {
      const lastContact = new Date(lead.updatedAt);
      const daysSinceContact = (today.getTime() - lastContact.getTime()) / (1000 * 3600 * 24);
      
      if (daysSinceContact >= 7) {
        await sendAutomatedWhatsApp(
          lead.phone, 
          'weekly_checkin', 
          [lead.contactName]
        );
        console.log(`[CRON] Weekly check-in sent to ${lead.contactName}`);
      }
    }
  }

  // 2. Reminders for upcoming meetings/calls (Tomorrow)
  for (const followup of followUps) {
    if (followup.status === 'Pending') {
      const followUpDate = new Date(followup.scheduledDate);
      const tomorrow = addDays(today, 1);
      
      // If the follow-up is scheduled for tomorrow
      if (
        followUpDate.getDate() === tomorrow.getDate() && 
        followUpDate.getMonth() === tomorrow.getMonth()
      ) {
        const lead = leads.find(l => l.id === followup.linkedToId);
        if (lead) {
          // Send reminder to Client
          await sendAutomatedWhatsApp(
            lead.phone,
            'meeting_reminder_client',
            [lead.contactName, format(followUpDate, 'hh:mm a')]
          );
          
          // Send reminder to Admin/User
          await sendAutomatedWhatsApp(
            'USER_PHONE_NUMBER_HERE', 
            'meeting_reminder_admin',
            [lead.contactName, format(followUpDate, 'hh:mm a')]
          );
          console.log(`[CRON] Reminders sent to ${lead.contactName} and Admin for tomorrow's meeting`);
        }
      }
    }
  }
};
