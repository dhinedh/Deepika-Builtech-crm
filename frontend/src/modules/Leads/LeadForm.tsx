import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Lead, ProjectType, LeadSource, TimelineRequired } from '../../types';
import { Save, X } from 'lucide-react';

interface LeadFormProps {
  onClose: () => void;
  initialData?: Lead;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onClose, initialData }) => {
  const { addLead, updateLead } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Lead>>(
    initialData || {
      contactName: '',
      companyName: '',
      phone: '',
      email: '',
      projectType: 'PEB Warehouse',
      location: '',
      timeline: '1-3 months',
      source: 'Website Form',
      status: 'New',
      leadScore: 50,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateLead(initialData.id, formData);
    } else {
      const newLead: Lead = {
        ...formData as Lead,
        id: `L-${Date.now()}`,
        assignedTo: 'u3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addLead(newLead);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Contact Name *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.contactName}
          onChange={e => setFormData({...formData, contactName: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Company Name</label>
        <input 
          type="text" 
          className="input" 
          value={formData.companyName}
          onChange={e => setFormData({...formData, companyName: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Phone Number *</label>
        <input 
          type="tel" 
          className="input" 
          required 
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Email Address</label>
        <input 
          type="email" 
          className="input" 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Project Type</label>
        <select 
          className="select"
          value={formData.projectType}
          onChange={e => setFormData({...formData, projectType: e.target.value as ProjectType})}
        >
          <option value="PEB Warehouse">PEB Warehouse</option>
          <option value="Cold Storage">Cold Storage</option>
          <option value="Mezzanine Floor">Mezzanine Floor</option>
          <option value="EOT Crane">EOT Crane</option>
          <option value="Factory/Shed">Factory/Shed</option>
          <option value="Civil Construction">Civil Construction</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Location</label>
        <input 
          type="text" 
          className="input" 
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Lead Source</label>
        <select 
          className="select"
          value={formData.source}
          onChange={e => setFormData({...formData, source: e.target.value as LeadSource})}
        >
          <option value="Website Form">Website Form</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram DM">Instagram DM</option>
          <option value="Facebook Messenger">Facebook Messenger</option>
          <option value="Phone Call">Phone Call</option>
          <option value="Referral">Referral</option>
          <option value="Google Search">Google Search</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Status</label>
        <select 
          className="select"
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value as any})}
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Site Visit Done">Site Visit Done</option>
          <option value="Quotation Sent">Quotation Sent</option>
        </select>
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> {initialData ? 'Update' : 'Create'} Lead</button>
      </div>
    </form>
  );
};
