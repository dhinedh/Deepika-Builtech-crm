import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import { Map, Plus, Calendar, MapPin, User, Edit2, Trash2, Camera } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import { SiteVisitForm } from './SiteVisitForm';
import '../../components/UI/Modal.css';
import { format } from 'date-fns';
import type { SiteVisit } from '../../types';

const SiteVisits: React.FC = () => {
  const { siteVisits, projects } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | undefined>(undefined);

  return (
    <div className="site-visits-module">
      <div className="module-header" style={{background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div className="header-info">
          <h2>Site Visits</h2>
          <p className="muted-text">Track site inspections and measurements</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setEditingVisit(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Schedule Visit
        </button>
      </div>

      <div className="table-container" style={{background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead style={{background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)'}}>
            <tr>
              <th style={{padding: '16px', fontWeight: '500'}}>Visit Date</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Project / Lead</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Type</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Status</th>
              <th style={{padding: '16px', fontWeight: '500'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {siteVisits.length === 0 ? (
              <tr>
                <td colSpan={5} style={{padding: '32px', textAlign: 'center', color: 'var(--text-muted)'}}>
                  No site visits scheduled. Click "Schedule Visit" to create one.
                </td>
              </tr>
            ) : (
              siteVisits.map(visit => {
                const project = projects.find(p => p.id === visit.linkedToId);
                return (
                  <tr key={visit.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                    <td style={{padding: '16px'}}>
                      <div className="flex items-center gap-3">
                        <div className="avatar-sm" style={{width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-600">{format(new Date(visit.scheduledDate), 'dd MMM yyyy')}</span>
                          <span className="muted-text" style={{fontSize: '12px'}}>{format(new Date(visit.scheduledDate), 'hh:mm a')}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{padding: '16px'}}>
                      <div className="flex flex-col gap-1">
                        <span className="font-600">{project ? project.name : visit.linkedToId}</span>
                        <div className="flex items-center gap-1 muted-text" style={{fontSize: '12px'}}>
                          <MapPin size={12} /> {visit.siteAddress || 'No address'}
                        </div>
                      </div>
                    </td>
                    <td style={{padding: '16px'}}><span className="badge badge-info">{visit.type}</span></td>
                    <td style={{padding: '16px'}}>
                      <span className={`badge badge-${visit.status === 'Completed' ? 'success' : visit.status === 'Scheduled' ? 'warning' : 'info'}`}>
                        {visit.status}
                      </span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <div className="action-buttons" style={{display: 'flex', gap: '8px'}}>
                        <button className="icon-btn" title="Photos" style={{padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)'}}>
                          <Camera size={16} />
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Edit"
                          onClick={() => {
                            setEditingVisit(visit);
                            setIsModalOpen(true);
                          }}
                          style={{padding: '6px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)'}}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingVisit ? 'Edit Site Visit' : 'Schedule Site Visit'}
      >
        <SiteVisitForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingVisit}
        />
      </Modal>
    </div>
  );
};

export default SiteVisits;
