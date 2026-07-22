import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Search, Filter, 
  Clock, AlertCircle, User, Link as LinkIcon 
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, isPast, isToday } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { TaskForm } from './TaskForm';
import type { Task } from '../../types';
import '../../components/UI/Modal.css';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { tasks } = useCRMStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const displayTasks = tasks;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return 'badge-danger';
      case 'Medium': return 'badge-warning';
      case 'Low': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const getDueDateStatus = (date: string) => {
    const d = new Date(date);
    if (isPast(d) && !isToday(d)) return 'overdue';
    if (isToday(d)) return 'due-today';
    return '';
  };

  return (
    <div className="tasks-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Task Management</h2>
          <p className="muted-text">Track your daily construction activities and follow-ups</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingTask(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> Add New Task
        </button>
      </div>

      <div className="task-filters">
        <div className="filter-tabs">
          <button className={`filter-tab ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>All Tasks</button>
          <button className={`filter-tab ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>Pending</button>
          <button className={`filter-tab ${statusFilter === 'Completed' ? 'active' : ''}`} onClick={() => setStatusFilter('Completed')}>Completed</button>
          <button className={`filter-tab ${statusFilter === 'Overdue' ? 'active' : ''}`} onClick={() => setStatusFilter('Overdue')}>Overdue</button>
        </div>
      </div>

      <div className="tasks-list">
        {displayTasks.map(task => (
          <div key={task.id} className="card task-item">
            <div className="task-checkbox">
              <div className="check-circle"></div>
            </div>
            
            <div className="task-content">
              <div className="task-main">
                <h4>{task.title}</h4>
                <div className="task-badges">
                  <span className={`badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                  <span className="badge badge-info">{task.type}</span>
                </div>
              </div>
              
              <div className="task-meta">
                <div className={`meta-item ${getDueDateStatus(task.dueDate)}`}>
                  <Clock size={14} />
                  <span>Due {format(new Date(task.dueDate), 'dd MMM, hh:mm a')}</span>
                </div>
                <div className="meta-item">
                  <LinkIcon size={14} />
                  <span>{task.linkedToType}: {task.linkedToId}</span>
                </div>
                <div className="meta-item">
                  <User size={14} />
                  <span>Assigned to Admin</span>
                </div>
              </div>
            </div>
            
            <div className="task-actions">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setEditingTask(task as any);
                  setIsModalOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <TaskForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingTask}
        />
      </Modal>
    </div>
  );
};

export default Tasks;
