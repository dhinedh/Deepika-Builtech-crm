import React, { useState } from 'react';
import { useCRMStore } from '../../store/useCRMStore';
import type { Task, TaskType, Priority, TaskStatus } from '../../types';
import { Save } from 'lucide-react';

interface TaskFormProps {
  onClose: () => void;
  initialData?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, initialData }) => {
  const { addTask, updateTask, users } = useCRMStore();
  const [formData, setFormData] = useState<Partial<Task>>(
    initialData || {
      title: '',
      type: 'Follow Up',
      priority: 'Medium',
      assignedTo: 'u3',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'To Do',
      linkedToType: 'Lead',
      linkedToId: '',
      description: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateTask(initialData.id, formData);
    } else {
      const newTask: Task = {
        ...formData as Task,
        id: `T-${Date.now()}`,
        createdBy: 'u1',
        createdAt: new Date().toISOString(),
      };
      addTask(newTask);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Task Title *</label>
        <input 
          type="text" 
          className="input" 
          required 
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
      </div>
      <div className="input-group">
        <label className="label">Task Type</label>
        <select 
          className="select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
        >
          <option value="Call Client">Call Client</option>
          <option value="Send Quotation">Send Quotation</option>
          <option value="Site Visit">Site Visit</option>
          <option value="Follow Up">Follow Up</option>
          <option value="Prepare Design">Prepare Design</option>
          <option value="Collect Payment">Collect Payment</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Priority</label>
        <select 
          className="select"
          value={formData.priority}
          onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div className="input-group">
        <label className="label">Assigned To</label>
        <select 
          className="select"
          value={formData.assignedTo}
          onChange={e => setFormData({...formData, assignedTo: e.target.value})}
        >
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label className="label">Due Date</label>
        <input 
          type="date" 
          className="input" 
          value={formData.dueDate?.split('T')[0]}
          onChange={e => setFormData({...formData, dueDate: e.target.value})}
        />
      </div>
      <div className="input-group" style={{gridColumn: '1 / -1'}}>
        <label className="label">Description</label>
        <textarea 
          className="textarea" 
          rows={3}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary"><Save size={18} /> {initialData ? 'Update' : 'Create'} Task</button>
      </div>
    </form>
  );
};
