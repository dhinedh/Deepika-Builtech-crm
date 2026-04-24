import React, { useEffect, useState } from 'react';
import { 
  Users, IndianRupee, Briefcase, CalendarClock, 
  ArrowUpRight, MoreHorizontal 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useCRMStore } from '../../store/useCRMStore';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { WhatsAppAssistant } from './WhatsAppAssistant.tsx';
import './Dashboard.css';

const pipelineData = [
  { stage: 'Enquiry', count: 12 },
  { stage: 'Contacted', count: 8 },
  { stage: 'Qualified', count: 6 },
  { stage: 'Site Visit', count: 4 },
  { stage: 'Quotation', count: 5 },
  { stage: 'Negotiation', count: 3 },
  { stage: 'Won', count: 2 },
];

const sourceData = [
  { name: 'Website', value: 35 },
  { name: 'WhatsApp', value: 25 },
  { name: 'Instagram', value: 15 },
  { name: 'Phone', value: 10 },
  { name: 'Referral', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#0D2C5E', '#1B50A0', '#E8622A', '#1D9E75', '#BA7517', '#718096'];

const Dashboard: React.FC = () => {
  const { leads, projects, followUps } = useCRMStore();
  const navigate = useNavigate();
  
  const todayFollowUps = followUps.filter(f => f.status === 'Pending' || f.status === 'Overdue');
  const overdueCount = followUps.filter(f => f.status === 'Overdue').length;

  const [backendStatus, setBackendStatus] = useState<string>('Checking backend connection...');

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(err => setBackendStatus('Backend disconnected'));
  }, []);

  return (
    <div className="dashboard">
      <div className={`p-2 text-center text-sm font-medium text-white mb-4 rounded-md shadow-sm ${backendStatus.includes('connected') ? 'bg-green-500' : 'bg-red-500'}`}>
        Backend Status: {backendStatus}
      </div>
      <WhatsAppAssistant />

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon leads-icon"><Users size={24} /></div>
          <div className="stat-content">
            <p className="label">Total Leads (Month)</p>
            <div className="stat-value-group">
              <h3>24</h3>
              <span className="trend positive">
                <ArrowUpRight size={14} /> 12%
              </span>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon value-icon"><IndianRupee size={24} /></div>
          <div className="stat-content">
            <p className="label">Pipeline Value</p>
            <div className="stat-value-group">
              <h3>₹ 185 L</h3>
              <span className="trend positive">
                <ArrowUpRight size={14} /> 8.4%
              </span>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon projects-icon"><Briefcase size={24} /></div>
          <div className="stat-content">
            <p className="label">Active Projects</p>
            <div className="stat-value-group">
              <h3>{projects.length}</h3>
              <span className="trend neutral">0%</span>
            </div>
          </div>
        </div>
        
        <div className="card stat-card overdue">
          <div className="stat-icon follow-icon"><CalendarClock size={24} /></div>
          <div className="stat-content">
            <p className="label">Overdue Follow-ups</p>
            <div className="stat-value-group">
              <h3>{overdueCount}</h3>
              {overdueCount > 0 && <span className="trend negative">Attention</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Pipeline Funnel</h3>
            <button className="btn-ghost"><MoreHorizontal size={18} /></button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#1B50A0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3>Lead Sources</h3>
            <button className="btn-ghost"><MoreHorizontal size={18} /></button>
          </div>
          <div className="chart-container flex items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="data-grid">
        <div className="card table-card">
          <div className="card-header">
            <h3>Recent Leads</h3>
            <button 
              className="btn btn-secondary" 
              style={{padding: '6px 12px', fontSize: '12px'}}
              onClick={() => navigate('/leads')}
            >
              View All
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Project Type</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-600">{lead.contactName}</span>
                        <span className="muted-text" style={{fontSize: '11px'}}>{lead.companyName}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{lead.projectType}</span></td>
                    <td><span className={`badge badge-${lead.status === 'Won' ? 'success' : 'info'}`}>{lead.status}</span></td>
                    <td>
                      <span className={`font-600 ${lead.leadScore >= 70 ? 'success-text' : lead.leadScore >= 40 ? 'warning-text' : 'danger-text'}`}>
                        {lead.leadScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card list-card">
          <div className="card-header">
            <h3>Today's Follow-ups</h3>
            <span className="badge badge-danger">{todayFollowUps.length}</span>
          </div>
          <div className="follow-up-list">
            {todayFollowUps.map(f => {
              const contact = useCRMStore.getState().contacts.find(c => c.id === f.contactId);
              return (
                <div key={f.id} className={`follow-up-item ${f.status.toLowerCase()}`}>
                  <div className="follow-up-info">
                    <p className="font-600">{contact?.fullName || 'Unknown'}</p>
                    <p className="muted-text" style={{fontSize: '12px'}}>{f.type} • {format(new Date(f.scheduledDate), 'hh:mm a')}</p>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{padding: '4px 10px', fontSize: '11px'}}
                    onClick={() => navigate('/follow-ups')}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Row */}
      <div className="projects-section">
        <h3 style={{marginBottom: '16px'}}>Active Projects Progress</h3>
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="card project-progress-card">
              <div className="project-header">
                <div>
                  <h4>{project.name}</h4>
                  <p className="muted-text" style={{fontSize: '12px'}}>{project.projectType}</p>
                </div>
                <span className="badge badge-info">In Progress</span>
              </div>
              
              <div className="progress-section">
                <div className="progress-info">
                  <span className="label">Progress</span>
                  <span className="font-600">{project.percentComplete}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${project.percentComplete}%`}}></div>
                </div>
              </div>
              
              <div className="project-footer">
                <div className="footer-item">
                  <p className="label">Value</p>
                  <p className="font-600">₹ {project.contractValue} L</p>
                </div>
                <div className="footer-item">
                  <p className="label">Target Date</p>
                  <p className="font-600">{format(new Date(project.targetEndDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
