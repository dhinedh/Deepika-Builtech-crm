import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Eye, Edit2, CheckCircle, 
  MessageSquare, Phone, Mail, MapPin, Calendar 
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format } from 'date-fns';
import { WhatsAppAutoFollow } from '../../components/Actions/WhatsAppAutoFollow.tsx';
import '../../components/Actions/WhatsAppAutoFollow.css';
import './Leads.css';

import Modal from '../../components/UI/Modal';
import { LeadForm } from './LeadForm';
import '../../components/UI/Modal.css';
import { formatContactSubtitle } from '../../utils/whatsapp';
import type { Lead } from '../../types/index.ts';

const Leads: React.FC = () => {

  const { leads, updateLead, fetchLeads } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (lead.phone && lead.phone.includes(searchTerm)) ||
                         (lead.source && lead.source.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || 
                         (lead.source && lead.source.toLowerCase().includes(sourceFilter.toLowerCase()));
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const getSourceBadgeClass = (source?: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('facebook') || s.includes('messenger')) return 'badge-facebook';
    if (s.includes('instagram') || s.includes('ig')) return 'badge-instagram';
    if (s.includes('whatsapp')) return 'badge-whatsapp';
    return 'badge-info';
  };

  return (
    <div className="leads-module">
      <div className="module-header">
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone or source..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select 
              className="select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Won">Won</option>
            </select>
            <select 
              className="select" 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="All">All Sources</option>
              <option value="Facebook">Facebook Messenger</option>
              <option value="Instagram">Instagram DM</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
            <button className="btn btn-secondary">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingLead(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Contact Name</th>
              <th>Source</th>
              <th>Company</th>
              <th>Project Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td><span className="font-600">{lead.id}</span></td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-600">{lead.contactName}</span>
                    <span className="muted-text">{formatContactSubtitle(lead.phone)}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getSourceBadgeClass(lead.source)}`}>
                    {lead.source || 'Direct Enquiry'}
                  </span>
                </td>
                <td>{lead.companyName || '—'}</td>
                <td><span className="badge badge-info">{lead.projectType}</span></td>
                <td>
                  <span className={`badge badge-${lead.status === 'Won' ? 'success' : lead.status === 'Lost' ? 'danger' : 'info'}`}>
                    {lead.status}
                  </span>
                </td>
                <td>{format(new Date(lead.createdAt), 'dd/MM/yyyy')}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn" 
                      title="View"
                      onClick={() => {
                        setEditingLead(lead);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="icon-btn" 
                      title="Edit"
                      onClick={() => {
                        setEditingLead(lead);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <WhatsAppAutoFollow 
                      phone={lead.phone} 
                      name={lead.contactName} 
                      contactId={lead.id} 
                      leadId={lead.id} 
                      source={lead.source}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <p className="muted-text">Showing {filteredLeads.length} of {leads.length} leads</p>
        <div className="pagination-buttons">
          <button className="btn btn-secondary" disabled>Previous</button>
          <button className="btn btn-secondary" disabled>Next</button>
        </div>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <LeadForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingLead}
        />
      </Modal>
    </div>
  );
};

export default Leads;
