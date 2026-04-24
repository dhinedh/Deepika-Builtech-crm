import React, { useState } from 'react';
import { 
  Building2, Users, GitBranch, Share2, 
  Mail, Bell, Database, Save, Plus, Edit2, Trash2 
} from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="settings-module">
      <div className="settings-container card">
        <aside className="settings-sidebar">
          <button 
            className={`settings-nav-item ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <Building2 size={18} /> Company Profile
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> User Management
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <GitBranch size={18} /> Pipeline Stages
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <Share2 size={18} /> Lead Sources
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
        </aside>

        <main className="settings-content">
          {activeTab === 'company' && (
            <div className="settings-section">
              <div className="section-header">
                <h3>Company Profile</h3>
                <p className="muted-text">This information will appear on your quotations and reports.</p>
              </div>
              
              <div className="settings-form">
                <div className="input-group">
                  <label className="label">Company Name</label>
                  <input type="text" className="input" defaultValue="Deepika Builtech Engineering" />
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="label">GST Number</label>
                    <input type="text" className="input" defaultValue="33AABCD1234E1Z1" />
                  </div>
                  <div className="input-group">
                    <label className="label">Phone Number</label>
                    <input type="text" className="input" defaultValue="+91 98765 43210" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Address</label>
                  <textarea className="textarea" rows={3} defaultValue="No. 123, Anna Salai, Chennai, Tamil Nadu - 600002" />
                </div>
                <button className="btn btn-primary"><Save size={18} /> Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="settings-section">
              <div className="section-header flex justify-between items-center">
                <div>
                  <h3>User Management</h3>
                  <p className="muted-text">Manage access levels and roles for your team.</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> Add User</button>
              </div>
              
              <div className="table-container" style={{marginTop: '20px'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Admin</td>
                      <td>admin@deepika.com</td>
                      <td><span className="badge badge-info">Admin</span></td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="icon-btn"><Edit2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Anitha R</td>
                      <td>anitha@deepika.com</td>
                      <td><span className="badge badge-info">Sales Executive</span></td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="icon-btn"><Edit2 size={14} /></button>
                          <button className="icon-btn"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'pipeline' && (
            <div className="settings-section">
              <h3>Pipeline Stages</h3>
              <p className="muted-text">Drag to reorder stages or edit probabilities.</p>
              {/* Stages list placeholder */}
              <div className="stages-list" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {['New Enquiry', 'Contacted', 'Qualified', 'Site Visit Done', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'].map((stage, i) => (
                  <div key={stage} className="card" style={{padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div className="flex items-center gap-4">
                      <GitBranch size={16} className="muted-text" />
                      <span className="font-600">{stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="badge badge-info">{10 * (i + 1)}% Probability</span>
                      <button className="icon-btn"><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
