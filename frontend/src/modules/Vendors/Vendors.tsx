import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import { Truck, Plus, Phone, Mail, Edit2, Trash2, Search, MapPin } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import { VendorForm } from './VendorForm';
import '../../components/UI/Modal.css';
import type { Vendor } from '../../types';

const Vendors: React.FC = () => {
  const { vendors } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);

  return (
    <div className="vendors-module">
      <div className="module-header" style={{background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div className="header-info">
          <h2>Vendors</h2>
          <p className="muted-text">Manage suppliers and subcontractors</p>
        </div>
        <div className="header-actions" style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <div className="search-box" style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
            <Search size={18} className="muted-text" />
            <input type="text" placeholder="Search vendors..." style={{border: 'none', background: 'transparent', outline: 'none'}} />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingVendor(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="table-container" style={{background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead style={{background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)'}}>
            <tr>
              <th style={{padding: '16px', fontWeight: '500'}}>Vendor Name</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Type</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Contact</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Status</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={5} style={{padding: '32px', textAlign: 'center', color: 'var(--text-muted)'}}>
                  No vendors found. Click "Add Vendor" to create one.
                </td>
              </tr>
            ) : (
              vendors.map(vendor => (
                <tr key={vendor.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                  <td style={{padding: '16px'}}>
                    <div className="flex items-center gap-4">
                      <div className="avatar-sm" style={{width: '32px', height: '32px', borderRadius: '6px', background: 'var(--accent-cta)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Truck size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-600">{vendor.name}</span>
                        <span className="muted-text" style={{fontSize: '12px'}}>{vendor.gstNumber || 'No GST'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{padding: '16px'}}><span className="badge badge-info">{vendor.type}</span></td>
                  <td style={{padding: '16px'}}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2"><Phone size={12} className="muted-text" /> <span style={{fontSize: '13px'}}>{vendor.phone}</span></div>
                      <div className="flex items-center gap-2"><MapPin size={12} className="muted-text" /> <span style={{fontSize: '13px'}}>{vendor.address.split(',')[0]}</span></div>
                    </div>
                  </td>
                  <td style={{padding: '16px'}}>
                    <span className={`badge badge-${vendor.isApproved ? 'success' : 'warning'}`}>
                      {vendor.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{padding: '16px'}}>
                    <div className="action-buttons" style={{display: 'flex', gap: '8px'}}>
                      <button 
                        className="icon-btn" 
                        title="Edit"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setIsModalOpen(true);
                        }}
                        style={{padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)'}}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger-text" title="Delete" style={{padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444'}}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
      >
        <VendorForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingVendor}
        />
      </Modal>
    </div>
  );
};

export default Vendors;
