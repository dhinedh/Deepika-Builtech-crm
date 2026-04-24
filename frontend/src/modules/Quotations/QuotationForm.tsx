import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Quotation, ProjectType } from '../../types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface QuotationFormProps {
  onClose: () => void;
  initialData?: Quotation;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ onClose, initialData }) => {
  const { addQuotation, updateQuotation, contacts, companies } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Quotation>>(
    initialData || {
      id: `Q-${Date.now()}`,
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      revisionNo: 1,
      contactId: contacts[0]?.id || '',
      companyId: companies[0]?.id || '',
      projectType: 'PEB Warehouse',
      projectLocation: '',
      builtUpArea: 0,
      items: [],
      subTotal: 0,
      discount: 0,
      taxableAmount: 0,
      gst: 0,
      grandTotal: 0,
      status: 'Draft',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateQuotation(initialData.id, formData);
    } else {
      addQuotation(formData as Quotation);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Quote ID</label>
        <input type="text" className="input" disabled value={formData.id} />
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
        </select>
      </div>
      <div className="input-group">
        <label className="label">Client</label>
        <select 
          className="select"
          value={formData.contactId}
          onChange={e => setFormData({...formData, contactId: e.target.value})}
        >
          {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Project Location</label>
        <input 
          type="text" 
          className="input" 
          value={formData.projectLocation}
          onChange={e => setFormData({...formData, projectLocation: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Built-up Area (Sq.Ft)</label>
        <input 
          type="number" 
          className="input" 
          value={formData.builtUpArea}
          onChange={e => setFormData({...formData, builtUpArea: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label className="label">Total Amount (₹ Lakhs) *</label>
        <input 
          type="number" 
          className="input" 
          required
          value={formData.grandTotal}
          onChange={e => setFormData({...formData, grandTotal: Number(e.target.value)})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> Generate Quote</button>
      </div>
    </form>
  );
};
