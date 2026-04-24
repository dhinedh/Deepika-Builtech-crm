import React, { useState } from 'react';
import { MessageSquare, Calendar, Check, X } from 'lucide-react';
import { sendWhatsAppMessage } from '../../utils/whatsapp';
import { useCRMStore } from '../../store/useCRMStore';

interface AutoFollowProps {
  phone: string;
  name: string;
  contactId: string;
  leadId: string;
}

export const WhatsAppAutoFollow: React.FC<AutoFollowProps> = ({ phone, name, contactId, leadId }) => {
  const { addCommunicationLog, completeFollowUp, scheduleAutoFollowUp, currentUser } = useCRMStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWhatsApp = () => {
    sendWhatsAppMessage(phone, name, 'intro');
    
    // Complete previous follow-ups
    completeFollowUp(contactId, 'WhatsApp message sent');
    
    setShowConfirm(true);
    
    // Log the action immediately
    addCommunicationLog({
      id: `LOG-${Date.now()}`,
      channel: 'WhatsApp',
      direction: 'Outbound',
      date: new Date().toISOString(),
      loggedBy: currentUser?.id || 'u1',
      contactId,
      linkedToType: 'Lead',
      linkedToId: leadId,
      summary: `Sent introductory WhatsApp message to ${name}`,
      outcome: 'Sent'
    });
  };

  const handleConfirmFollowUp = (days: number) => {
    scheduleAutoFollowUp(contactId, 'WhatsApp Message', days);
    setShowConfirm(false);
  };

  return (
    <div className="whatsapp-auto-follow">
      {!showConfirm ? (
        <button className="icon-btn whatsapp-btn" onClick={handleWhatsApp} title="WhatsApp & Auto-Follow">
          <MessageSquare size={16} />
        </button>
      ) : (
        <div className="follow-up-confirm">
          <button className="close-confirm" onClick={() => setShowConfirm(false)}>
            <X size={14} />
          </button>
          <p>Schedule Next Follow-up?</p>
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
