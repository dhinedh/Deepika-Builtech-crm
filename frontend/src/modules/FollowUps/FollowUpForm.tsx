import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { FollowUp, FollowUpType, FollowUpStatus } from '../../types';
import { Save } from 'lucide-react';

interface FollowUpFormProps {
  onClose: () => void;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({ onClose }) => {
  const { addFollowUp, contacts, users } = useCRMStore();
  const [formData, setFormData] = useState<Partial<FollowUp>>({
    contactId: contacts[0]?.id || '',
    linkedToType: 'Lead',
    linkedToId: '',
    type: 'Phone Call',
    scheduledDate: new Date().toISOString().split('T')[0] + 'T10:00:00',
    assignedTo: 'u3',
    reminder: '15 min before',
    status: 'Pending',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFollowUp: FollowUp = {
      ...formData as FollowUp,
      id: `F-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    addFollowUp(newFollowUp);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Contact *</label>
        <select 
          className="select"
          value={formData.contactId}
          onChange={e => setFormData({...formData, contactId: e.target.value})}
        >
          {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Follow-up Type</label>
        <select 
          className="select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value as FollowUpType})}
        >
          <option value="Phone Call">Phone Call</option>
          <option value="WhatsApp Message">WhatsApp Message</option>
          <option value="Email">Email</option>
          <option value="Meeting">Meeting</option>
          <option value="Site Visit">Site Visit</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Scheduled Date & Time *</label>
        <input 
          type="datetime-local" 
          className="input" 
          required 
          value={formData.scheduledDate?.slice(0, 16)}
          onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Assigned To</label>
        <select 
          className="select"
          value={formData.assignedTo}
          onChange={e => setFormData({...formData, assignedTo: e.target.value})}
        >
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Notes / Agenda</label>
        <textarea 
          className="textarea" 
          rows={2} 
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> Schedule Follow-up</button>
      </div>
    </form>
  );
};
