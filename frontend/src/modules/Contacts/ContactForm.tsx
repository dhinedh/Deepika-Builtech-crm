import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Contact, ContactType } from '../../types';
import { Save } from 'lucide-react';

interface ContactFormProps {
  onClose: () => void;
  initialData?: Contact;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onClose, initialData }) => {
  const { addContact, updateContact, companies } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Contact>>(
    initialData || {
      fullName: '',
      designation: '',
      companyId: companies[0]?.id || '',
      phone: '',
      email: '',
      isDecisionMaker: true,
      type: 'Prospect',
      city: '',
      industry: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateContact(initialData.id, formData);
    } else {
      const newContact: Contact = {
        ...formData as Contact,
        id: `CON-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      addContact(newContact);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Full Name *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.fullName}
          onChange={e => setFormData({...formData, fullName: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Designation</label>
        <input 
          type="text" 
          className="input" 
          value={formData.designation}
          onChange={e => setFormData({...formData, designation: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Phone *</label>
        <input 
          type="tel" 
          className="input" 
          required 
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Email</label>
        <input 
          type="email" 
          className="input" 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Company</label>
        <select 
          className="select"
          value={formData.companyId}
          onChange={e => setFormData({...formData, companyId: e.target.value})}
        >
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Contact Type</label>
        <select 
          className="select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value as ContactType})}
        >
          <option value="Prospect">Prospect</option>
          <option value="Client Active">Client Active</option>
          <option value="Vendor">Vendor</option>
          <option value="Subcontractor">Subcontractor</option>
        </select>
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> Create Contact</button>
      </div>
    </form>
  );
};
