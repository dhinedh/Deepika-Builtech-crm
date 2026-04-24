import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Project, ProjectType, ProjectStatus } from '../../types';
import { Save } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
  initialData?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, initialData }) => {
  const { addProject, updateProject, companies, contacts } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Project>>(
    initialData || {
      name: '',
      clientId: contacts[0]?.id || '',
      companyId: companies[0]?.id || '',
      projectType: 'PEB Warehouse',
      siteAddress: '',
      contractValue: 0,
      advanceReceived: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Planning',
      percentComplete: 0,
      projectManager: 'u2',
      siteEngineer: 'u4',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateProject(initialData.id, formData);
    } else {
      const newProject: Project = {
        ...formData as Project,
        id: `P-${Date.now()}`,
        dealId: 'd-new',
        quotationId: 'q-new',
        createdAt: new Date().toISOString(),
      };
      addProject(newProject);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Project Name *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Client</label>
        <select 
          className="select"
          value={formData.clientId}
          onChange={e => setFormData({...formData, clientId: e.target.value})}
        >
          {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Company</label>
        <select 
          className="select"
          value={formData.companyId}
          onChange={e => setFormData({...formData, companyId: e.target.value})}
        >
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Project Type</label>
        <select 
          className="select"
          value={formData.projectType}
          onChange={e => setFormData({...formData, projectType: e.target.value as ProjectType})}
        >
          <option value="PEB Warehouse">PEB Warehouse</option>
          <option value="Cold Storage">Cold Storage</option>
          <option value="Mezzanine Floor">Mezzanine Floor</option>
          <option value="EOT Crane">EOT Crane</option>
          <option value="Factory/Shed">Factory/Shed</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Contract Value (Lakhs) *</label>
        <input 
          type="number" 
          className="input" 
          required 
          value={formData.contractValue}
          onChange={e => setFormData({...formData, contractValue: Number(e.target.value)})}
        />
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Site Address</label>
        <textarea 
          className="textarea" 
          rows={2}
          value={formData.siteAddress}
          onChange={e => setFormData({...formData, siteAddress: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Start Date</label>
        <input 
          type="date" 
          className="input" 
          value={formData.startDate?.split('T')[0]}
          onChange={e => setFormData({...formData, startDate: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Target End Date</label>
        <input 
          type="date" 
          className="input" 
          value={formData.targetEndDate?.split('T')[0]}
          onChange={e => setFormData({...formData, targetEndDate: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> {initialData ? 'Update' : 'Create'} Project</button>
      </div>
    </form>
  );
};
