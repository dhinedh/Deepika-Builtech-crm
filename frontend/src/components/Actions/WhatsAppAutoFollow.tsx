import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, X, Clock, Send } from 'lucide-react';
import { sendOmniChannelMessage, detectLeadPlatform } from '../../utils/whatsapp';
import { useCRMStore } from '../../store/useCRMStore';
import { format } from 'date-fns';

interface AutoFollowProps {
  phone: string;
  name: string;
  contactId: string;
  leadId: string;
  source?: string;
}

export const WhatsAppAutoFollow: React.FC<AutoFollowProps> = ({ phone, name, contactId, leadId, source }) => {
  const { addCommunicationLog, completeFollowUp, scheduleAutoFollowUp, currentUser } = useCRMStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastSentDate, setLastSentDate] = useState<string | null>(null);

  const platform = detectLeadPlatform({ contactName: name, phone, id: leadId, source });

  useEffect(() => {
    const saved = localStorage.getItem(`last_followup_${leadId}`);
    if (saved) setLastSentDate(saved);
  }, [leadId]);


  const handleConfirmFollowUp = async (days: number) => {
    const nowIso = new Date().toISOString();
    localStorage.setItem(`last_followup_${leadId}`, nowIso);
    setLastSentDate(nowIso);

    // Send Omni-Channel message (Instagram DM, FB Messenger, or WhatsApp)
    await sendOmniChannelMessage({ contactName: name, phone, id: leadId, source }, 'followup');

    // Complete previous follow-ups & Schedule new auto-followup
    completeFollowUp(contactId, `${platform.toUpperCase()} message sent`);
    scheduleAutoFollowUp(contactId, `${platform.toUpperCase()} Message`, days);

    // Log action
    addCommunicationLog({
      id: `LOG-${Date.now()}`,
      channel: platform === 'instagram' ? 'Instagram DM' : platform === 'facebook' ? 'Facebook Messenger' : 'WhatsApp',
      direction: 'Outbound',
      date: nowIso,
      loggedBy: currentUser?.id || 'u1',
      contactId,
      linkedToType: 'Lead',
      linkedToId: leadId,
      summary: `Sent ${days}-day follow-up message to ${name} via ${platform}`,
      outcome: 'Sent'
    });

    setShowConfirm(false);
  };

  const getPlatformBadge = () => {
    if (platform === 'instagram') {
      return <span style={{ background: '#E1306C', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>📷 Instagram DM</span>;
    }
    if (platform === 'facebook') {
      return <span style={{ background: '#1877F2', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>💬 FB Messenger</span>;
    }
    return <span style={{ background: '#25D366', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>🟢 WhatsApp</span>;
  };

  const formattedLastSent = lastSentDate ? (() => {
    try {
      return format(new Date(lastSentDate), 'dd/MM/yyyy hh:mm a');
    } catch (e) {
      return lastSentDate;
    }
  })() : 'First Follow-Up (Not Sent Yet)';

  return (
    <div className="whatsapp-auto-follow">
      <button 
        className="icon-btn whatsapp-btn" 
        onClick={() => setShowConfirm(true)} 
        title="Schedule Follow-Up & Send Message"
      >
        <MessageSquare size={16} />
      </button>

      {showConfirm && (
        <div className="follow-up-confirm">
          <button className="close-confirm" onClick={() => setShowConfirm(false)}>
            <X size={14} />
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            {getPlatformBadge()}
          </div>

          <p style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: '700' }}>Schedule Next Follow-Up?</p>

          <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#475569', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            <strong>Last Message Sent:</strong> <br />
            <span style={{ color: '#0F172A', fontWeight: '600' }}>{formattedLastSent}</span>
          </div>

          <div className="confirm-buttons">
            <div className="btn-follow" onClick={() => handleConfirmFollowUp(3)}>
              <span className="days">3</span>
              <span className="label">Days</span>
            </div>
            <div className="btn-follow" onClick={() => handleConfirmFollowUp(7)}>
              <span className="days">7</span>
              <span className="label">Days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

