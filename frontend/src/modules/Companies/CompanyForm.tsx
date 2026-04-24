import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Company } from '../../types';
import { Save } from 'lucide-react';

interface CompanyFormProps {
  onClose: () => void;
  initialData?: Company;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ onClose, initialData }) => {
  const { addCompany, updateCompany } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Company>>(
    initialData || {
      name: '',
      industry: 'Manufacturing',
      gstNumber: '',
      officeAddress: '',
      accountManager: 'u3',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateCompany(initialData.id, formData);
    } else {
      const newCompany: Company = {
        ...formData as Company,
        id: `C-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      addCompany(newCompany);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Company Name *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Industry</label>
        <input 
          type="text" 
          className="input" 
          value={formData.industry}
          onChange={e => setFormData({...formData, industry: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">GST Number</label>
        <input 
          type="text" 
          className="input" 
          value={formData.gstNumber}
          onChange={e => setFormData({...formData, gstNumber: e.target.value})}
        />
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Office Address *</label>
        <textarea 
          className="textarea" 
          rows={2} 
          required
          value={formData.officeAddress}
          onChange={e => setFormData({...formData, officeAddress: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> Create Company</button>
      </div>
    </form>
  );
};
