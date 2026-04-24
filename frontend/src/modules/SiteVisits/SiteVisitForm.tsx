import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { SiteVisit } from '../../types';
import { Save } from 'lucide-react';

interface SiteVisitFormProps {
  onClose: () => void;
  initialData?: SiteVisit;
}

export const SiteVisitForm: React.FC<SiteVisitFormProps> = ({ onClose, initialData }) => {
  const { addSiteVisit, updateSiteVisit, projects, users } = useCRMStore();
  const [formData, setFormData] = useState<Partial<SiteVisit>>(
    initialData || {
      type: 'Pre-sales',
      linkedToType: 'Project',
      linkedToId: projects[0]?.id || '',
      scheduledDate: new Date().toISOString().split('T')[0] + 'T10:00:00',
      visitedBy: users[0]?.id || 'u3',
      siteAddress: '',
      clientPresent: true,
      status: 'Scheduled',
      photos: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateSiteVisit(initialData.id, formData);
    } else {
      const newVisit: SiteVisit = {
        ...formData as SiteVisit,
        id: `SV-${Date.now()}`,
      };
      addSiteVisit(newVisit);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Visit Type</label>
        <select 
          className="select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value as any})}
        >
          <option value="Pre-sales">Pre-sales</option>
          <option value="Design Verification">Design Verification</option>
          <option value="Progress Inspection">Progress Inspection</option>
          <option value="Quality Check">Quality Check</option>
          <option value="Handover">Handover</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Project / Lead *</label>
        <select 
          className="select"
          required
          value={formData.linkedToId}
          onChange={e => setFormData({...formData, linkedToId: e.target.value})}
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
        <label className="label">Assigned Engineer</label>
        <select 
          className="select"
          value={formData.visitedBy}
          onChange={e => setFormData({...formData, visitedBy: e.target.value})}
        >
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Status</label>
        <select 
          className="select"
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value as any})}
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Checked In">Checked In</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Site Address / Location</label>
        <textarea 
          className="textarea" 
          rows={2} 
          value={formData.siteAddress}
          onChange={e => setFormData({...formData, siteAddress: e.target.value})}
        />
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Notes / Findings</label>
        <textarea 
          className="textarea" 
          rows={3} 
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> {initialData ? 'Update Visit' : 'Schedule Visit'}</button>
      </div>
    </form>
  );
};
