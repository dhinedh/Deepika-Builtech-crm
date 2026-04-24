import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Vendor } from '../../types';
import { Save } from 'lucide-react';

interface VendorFormProps {
  onClose: () => void;
  initialData?: Vendor;
}

export const VendorForm: React.FC<VendorFormProps> = ({ onClose, initialData }) => {
  const { addVendor, updateVendor } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Vendor>>(
    initialData || {
      name: '',
      type: 'Material Supplier',
      contactPerson: '',
      phone: '',
      email: '',
      gstNumber: '',
      address: '',
      materials: [],
      paymentTerms: '30 Days',
      rating: 0,
      isApproved: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateVendor(initialData.id, formData);
    } else {
      const newVendor: Vendor = {
        ...formData as Vendor,
        id: `V-${Date.now()}`,
      };
      addVendor(newVendor);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group">
        <label className="label">Vendor Name *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Vendor Type</label>
        <select 
          className="select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value})}
        >
          <option value="Material Supplier">Material Supplier</option>
          <option value="Subcontractor">Subcontractor</option>
          <option value="Equipment Rental">Equipment Rental</option>
          <option value="Consultant">Consultant</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Contact Person *</label>
        <input 
          type="text" 
          className="input" 
          required
          value={formData.contactPerson}
          onChange={e => setFormData({...formData, contactPerson: e.target.value})}
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
        <label className="label">GST Number</label>
        <input 
          type="text" 
          className="input" 
          value={formData.gstNumber}
          onChange={e => setFormData({...formData, gstNumber: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Payment Terms</label>
        <input 
          type="text" 
          className="input" 
          value={formData.paymentTerms}
          onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
        />
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Address</label>
        <textarea 
          className="textarea" 
          rows={2} 
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> {initialData ? 'Update Vendor' : 'Add Vendor'}</button>
      </div>
    </form>
  );
};
