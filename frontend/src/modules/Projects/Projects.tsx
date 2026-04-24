import React, { useState } from 'react';
import { 
  Briefcase, Calendar, MapPin, User, Clock, 
  ChevronRight, MoreHorizontal, Filter, Plus 
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, differenceInDays } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { ProjectForm } from './ProjectForm';
import type { Project } from '../../types';
import '../../components/UI/Modal.css';
import './Projects.css';

const Projects: React.FC = () => {
  const { projects } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  return (
    <div className="projects-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Project Portfolio</h2>
          <p className="muted-text">Managing {projects.length} active construction projects</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <select className="select">
              <option>All Status</option>
              <option>Planning</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
            </select>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingProject(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map(project => {
          const daysRemaining = differenceInDays(new Date(project.targetEndDate), new Date());
          const isOverdue = daysRemaining < 0;

          return (
            <div key={project.id} className="card project-card">
              <div className="card-top">
                <span className="badge badge-info">{project.projectType}</span>
                <button 
                  className="icon-btn"
                  onClick={() => {
                    setEditingProject(project);
                    setIsModalOpen(true);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              
              <div className="project-title-area">
                <h3>{project.name}</h3>
                <div className="location">
                  <MapPin size={14} />
                  <span>{project.siteAddress.split(',')[1]}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-labels">
                  <span className="label">Overall Progress</span>
                  <span className="font-600">{project.percentComplete}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${project.percentComplete}%`,
                      backgroundColor: project.percentComplete > 80 ? 'var(--success)' : 'var(--info)'
                    }}
                  ></div>
                </div>
              </div>

              <div className="project-details-grid">
                <div className="detail-item">
                  <span className="label">Value</span>
                  <p className="font-600">₹ {project.contractValue} L</p>
                </div>
                <div className="detail-item">
                  <span className="label">Days Remaining</span>
                  <p className={`font-600 ${isOverdue ? 'danger-text' : ''}`}>
                    {isOverdue ? `${Math.abs(daysRemaining)} Overdue` : `${daysRemaining} Days`}
                  </p>
                </div>
              </div>

              <div className="project-team">
                <div className="team-member">
                  <div className="avatar-sm">PM</div>
                  <span>Suresh Kumar</span>
                </div>
                <div className="team-member">
                  <div className="avatar-sm">SE</div>
                  <span>Balaji S</span>
                </div>
              </div>

              <button 
                className="btn btn-secondary w-full"
                onClick={() => {
                  setEditingProject(project);
                  setIsModalOpen(true);
                }}
              >
                View Details <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
        <ProjectForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingProject}
        />
      </Modal>
    </div>
  );
};

export default Projects;
