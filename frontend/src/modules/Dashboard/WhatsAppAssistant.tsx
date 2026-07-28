import React from 'react';
import { MessageSquare, AlertCircle, CalendarClock, Send } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, addDays } from 'date-fns';
import { sendOmniChannelMessage, detectLeadPlatform } from '../../utils/whatsapp';


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
    sendOmniChannelMessage(lead, 'followup');
  };

  const handleSendReminder = (lead: any, date: string) => {
    const formattedDateTime = format(new Date(date), 'hh:mm a');
    sendOmniChannelMessage(lead, 'reminder', [formattedDateTime]);
  };

  const getPlatformStyle = (lead: any) => {
    const platform = detectLeadPlatform(lead);
    if (platform === 'instagram') {
      return {
        label: 'Instagram DM',
        bg: '#E1306C',
        badgeBg: 'rgba(225, 48, 108, 0.1)',
        textColor: '#E1306C',
        icon: <MessageSquare size={14} style={{ marginRight: '6px' }} />
      };
    }
    if (platform === 'facebook') {
      return {
        label: 'FB Messenger',
        bg: '#0084FF',
        badgeBg: 'rgba(0, 132, 255, 0.1)',
        textColor: '#0084FF',
        icon: <MessageSquare size={14} style={{ marginRight: '6px' }} />
      };
    }

    return {
      label: 'WhatsApp',
      bg: '#25D366',
      badgeBg: 'rgba(37, 211, 102, 0.1)',
      textColor: '#128C7E',
      icon: <Send size={14} style={{ marginRight: '6px' }} />
    };
  };

  if (dueWeeklyLeads.length === 0 && upcomingFollowUps.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #1b50a0' }}>
      <div className="card-header" style={{ paddingBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b50a0' }}>
          <MessageSquare size={20} /> Smart Omni-Channel Follow-up Assistant
        </h3>
        <span className="badge badge-warning" style={{ background: 'rgba(27, 80, 160, 0.1)', color: '#1b50a0', fontWeight: 600 }}>
          {dueWeeklyLeads.length + upcomingFollowUps.length} Actions Required
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dueWeeklyLeads.map(lead => {
          const style = getPlatformStyle(lead);
          return (
            <div key={`weekly-${lead.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--page-bg)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(226, 75, 74, 0.1)', color: 'var(--danger)', borderRadius: '50%' }}>
                  <AlertCircle size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="font-600" style={{ fontSize: '14px' }}>Weekly Check-in Due: {lead.contactName}</p>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: style.badgeBg, color: style.textColor, fontWeight: 700 }}>
                      {style.label}
                    </span>
                  </div>
                  <p className="muted-text" style={{ fontSize: '12px' }}>{lead.companyName ? `${lead.companyName} • ` : ''}Source: {lead.source || 'Website'} • Last updated 7+ days ago</p>
                </div>
              </div>
              <button 
                className="btn" 
                style={{ background: style.bg, color: 'white', padding: '6px 14px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                onClick={() => handleSendWeekly(lead)}
              >
                {style.icon} Send via {style.label}
              </button>
            </div>
          );
        })}

        {upcomingFollowUps.map(f => {
          const style = getPlatformStyle(f.lead);
          return (
            <div key={`reminder-${f.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--page-bg)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(24, 95, 165, 0.1)', color: 'var(--info)', borderRadius: '50%' }}>
                  <CalendarClock size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="font-600" style={{ fontSize: '14px' }}>Meeting Tomorrow: {f.lead?.contactName}</p>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: style.badgeBg, color: style.textColor, fontWeight: 700 }}>
                      {style.label}
                    </span>
                  </div>
                  <p className="muted-text" style={{ fontSize: '12px' }}>{format(new Date(f.scheduledDate), 'hh:mm a')} • {f.type}</p>
                </div>
              </div>
              <button 
                className="btn" 
                style={{ background: style.bg, color: 'white', padding: '6px 14px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                onClick={() => handleSendReminder(f.lead, f.scheduledDate)}
              >
                {style.icon} Remind via {style.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
