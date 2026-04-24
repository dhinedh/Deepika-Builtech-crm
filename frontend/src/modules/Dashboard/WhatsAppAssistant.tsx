import React from 'react';
import { MessageSquare, AlertCircle, CalendarClock, Send } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, addDays } from 'date-fns';
import { sendWhatsAppMessage } from '../../utils/whatsapp';

export const WhatsAppAssistant: React.FC = () => {
  const { leads, followUps } = useCRMStore();
  const today = new Date();
  
  // Find leads that haven't been contacted in 7 days
  const dueWeeklyLeads = leads.filter(lead => {
    if (lead.status === 'Won' || lead.status === 'Lost') return false;
    const lastContact = new Date(lead.updatedAt);
    const daysSinceContact = (today.getTime() - lastContact.getTime()) / (1000 * 3600 * 24);
    return daysSinceContact >= 7;
  });

  // Find follow-ups due tomorrow
  const upcomingFollowUps = followUps.filter(f => {
    if (f.status !== 'Pending') return false;
    const followUpDate = new Date(f.scheduledDate);
    const tomorrow = addDays(today, 1);
    return (
      followUpDate.getDate() === tomorrow.getDate() && 
      followUpDate.getMonth() === tomorrow.getMonth()
    );
  }).map(f => {
    const lead = leads.find(l => l.id === f.linkedToId);
    return { ...f, lead };
  }).filter(f => f.lead);

  const handleSendWeekly = (lead: any) => {
    sendWhatsAppMessage(lead.phone, lead.contactName, 'followup');
  };

  const handleSendReminder = (lead: any, date: string) => {
    const message = `Hi ${lead.contactName}, this is a gentle reminder for our scheduled interaction tomorrow at ${format(new Date(date), 'hh:mm a')}. Looking forward to it! - Deepika Builtech`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };

  if (dueWeeklyLeads.length === 0 && upcomingFollowUps.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #25D366' }}>
      <div className="card-header" style={{ paddingBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#128C7E' }}>
          <MessageSquare size={20} /> WhatsApp Assistant
        </h3>
        <span className="badge badge-warning" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#128C7E' }}>
          {dueWeeklyLeads.length + upcomingFollowUps.length} Actions Required
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dueWeeklyLeads.map(lead => (
          <div key={`weekly-${lead.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--page-bg)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(226, 75, 74, 0.1)', color: 'var(--danger)', borderRadius: '50%' }}>
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="font-600" style={{ fontSize: '14px' }}>Weekly Check-in Due: {lead.contactName}</p>
                <p className="muted-text" style={{ fontSize: '12px' }}>{lead.companyName} • Last updated 7+ days ago</p>
              </div>
            </div>
            <button 
              className="btn" 
              style={{ background: '#25D366', color: 'white', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => handleSendWeekly(lead)}
            >
              <Send size={14} style={{ marginRight: '6px' }}/> Send Now
            </button>
          </div>
        ))}

        {upcomingFollowUps.map(f => (
          <div key={`reminder-${f.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--page-bg)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(24, 95, 165, 0.1)', color: 'var(--info)', borderRadius: '50%' }}>
                <CalendarClock size={16} />
              </div>
              <div>
                <p className="font-600" style={{ fontSize: '14px' }}>Meeting Tomorrow: {f.lead?.contactName}</p>
                <p className="muted-text" style={{ fontSize: '12px' }}>{format(new Date(f.scheduledDate), 'hh:mm a')} • {f.type}</p>
              </div>
            </div>
            <button 
              className="btn" 
              style={{ background: '#25D366', color: 'white', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => handleSendReminder(f.lead, f.scheduledDate)}
            >
              <Send size={14} style={{ marginRight: '6px' }}/> Remind Client
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
