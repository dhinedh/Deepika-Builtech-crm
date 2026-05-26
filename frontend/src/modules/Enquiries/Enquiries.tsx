import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Trash2, UserCheck, RefreshCw, 
  ExternalLink, Clock
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { LeadForm } from '../Leads/LeadForm';
import { secureFetch } from '../../services/api';
import './Enquiries.css';

const Enquiries: React.FC = () => {
  const { enquiries, fetchEnquiries } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledLeadData, setPrefilledLeadData] = useState<any>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchEnquiries();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await secureFetch(`/enquiries/${id}`, {
          method: 'DELETE'
        });
        await fetchEnquiries();
      } catch (err) {
        console.error('Failed to delete enquiry:', err);
      }
    }
  };

  const handleConvertToLead = (enquiry: any) => {
    setPrefilledLeadData({
      contactName: enquiry.contactName,
      phone: enquiry.phone,
      companyName: '',
      projectType: 'PEB Warehouse',
      location: '',
      timeline: 'Immediate',
      source: 'WhatsApp',
      notes: `Converted from WhatsApp Enquiry: "${enquiry.lastMessage}"`
    });
    setIsModalOpen(true);
  };

  const handleOpenWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const filteredEnquiries = enquiries.filter(item => {
    const matchesSearch = 
      item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.phone.includes(searchTerm) || 
      item.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="enquiries-module">
      <div className="module-header">
        <div className="header-title-section">
          <h2>WhatsApp Greetings & General Enquiries</h2>
          <p className="muted-text">Real-time incoming customer contacts from Deepika WhatsApp Chatbot.</p>
        </div>
        
        <button 
          className={`btn btn-secondary sync-btn ${isSyncing ? 'anim-spin' : ''}`}
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw size={16} /> {isSyncing ? 'Syncing...' : 'Sync Live'}
        </button>
      </div>

      <div className="module-filters">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone or message text..." 
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
            <option value="New">New Greetings</option>
            <option value="Converted">Converted to Lead</option>
            <option value="Ignored">Ignored</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {filteredEnquiries.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} className="empty-icon" />
            <h3>No enquiries found</h3>
            <p>Any incoming greeting (like "hi") to your WhatsApp Bot will instantly appear here.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Phone Number</th>
                <th>Last Message Text</th>
                <th>Status</th>
                <th>Received Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((item) => (
                <tr key={item.id} className={`enquiry-row ${item.status.toLowerCase()}`}>
                  <td>
                    <div className="customer-cell">
                      <div className="avatar">{item.contactName.charAt(0).toUpperCase()}</div>
                      <span className="font-600">{item.contactName}</span>
                    </div>
                  </td>
                  <td><span className="phone-badge">{item.phone}</span></td>
                  <td className="message-cell">
                    <p className="message-text" title={item.lastMessage}>
                      {item.lastMessage || <span className="muted-text">Empty message / Media sent</span>}
                    </p>
                  </td>
                  <td>
                    <span className={`badge badge-${item.status === 'Converted' ? 'success' : item.status === 'Ignored' ? 'secondary' : 'info'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="time-cell">
                      <Clock size={14} className="time-icon" />
                      <span>{format(new Date(item.createdAt), 'dd/MM/yyyy hh:mm a')}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action chat" 
                        title="Chat on WhatsApp"
                        onClick={() => handleOpenWhatsApp(item.phone)}
                      >
                        <ExternalLink size={14} /> WhatsApp
                      </button>
                      
                      {item.status !== 'Converted' && (
                        <button 
                          className="btn-action convert" 
                          title="Convert to full Lead"
                          onClick={() => handleConvertToLead(item)}
                        >
                          <UserCheck size={14} /> Convert
                        </button>
                      )}
                      
                      <button 
                        className="btn-action delete" 
                        title="Delete Enquiry"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <p className="muted-text">Showing {filteredEnquiries.length} of {enquiries.length} enquiries</p>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Convert Enquiry to Lead"
      >
        {prefilledLeadData && (
          <LeadForm 
            onClose={() => {
              setIsModalOpen(false);
              fetchEnquiries();
            }} 
            initialData={prefilledLeadData}
          />
        )}
      </Modal>
    </div>
  );
};

export default Enquiries;
