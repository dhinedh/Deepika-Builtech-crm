import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import { Plus, Search, Mail, Phone, Building2, Eye, Edit2 } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import { ContactForm } from './ContactForm';
import '../../components/UI/Modal.css';

import type { Contact } from '../../types';

const Contacts: React.FC = () => {
  const { contacts } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);

  return (
    <div className="contacts-module">
      <div className="module-header" style={{background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div className="header-info">
          <h2>Contacts</h2>
          <p className="muted-text">Manage your client relationships</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setEditingContact(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>FullName</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="avatar-sm" style={{width: '32px', height: '32px'}}>{contact.fullName.split(' ').map(n => n[0]).join('')}</div>
                    <span className="font-600">{contact.fullName}</span>
                  </div>
                </td>
                <td><div className="flex items-center gap-2"><Building2 size={14} className="muted-text" /> {contact.city}</div></td>
                <td><div className="flex items-center gap-2"><Phone size={14} className="muted-text" /> {contact.phone}</div></td>
                <td><div className="flex items-center gap-2"><Mail size={14} className="muted-text" /> {contact.email || 'N/A'}</div></td>
                <td><span className="badge badge-info">{contact.type}</span></td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="View"
                      onClick={() => {
                        setEditingContact(contact);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Edit"
                      onClick={() => {
                        setEditingContact(contact);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
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
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingContact}
        />
      </Modal>
    </div>
  );
};

export default Contacts;
