import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import { Building2, Plus, Globe, MapPin, IndianRupee, User, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import { CompanyForm } from './CompanyForm';
import '../../components/UI/Modal.css';

import type { Company } from '../../types';

const Companies: React.FC = () => {
  const { companies } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);

  return (
    <div className="companies-module">
      <div className="module-header" style={{background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div className="header-info">
          <h2>Companies</h2>
          <p className="muted-text">Manage corporate accounts and sites</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setEditingCompany(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Address</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id}>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="avatar-sm" style={{backgroundColor: 'var(--accent-cta)'}}><Building2 size={16} /></div>
                    <span className="font-600">{company.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-info">{company.industry}</span></td>
                <td><div className="flex items-center gap-2"><MapPin size={14} className="muted-text" /> {company.officeAddress.split(',').pop()}</div></td>
                <td><div className="flex items-center gap-2"><User size={14} className="muted-text" /> Admin</div></td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="Edit"
                      onClick={() => {
                        setEditingCompany(company);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn danger-text" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
      >
        <CompanyForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingCompany}
        />
      </Modal>
    </div>
  );
};

export default Companies;
