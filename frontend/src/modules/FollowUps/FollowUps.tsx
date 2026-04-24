import React, { useState } from 'react';
import { 
  CalendarClock, List, Calendar as CalendarIcon, 
  MessageSquare, Phone, Mail, User, CheckCircle, 
  ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, isPast, isToday, addDays, subDays } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { FollowUpForm } from './FollowUpForm';
import '../../components/UI/Modal.css';
import './FollowUps.css';

const FollowUps: React.FC = () => {
  const { followUps, contacts } = useCRMStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getContactName = (id: string) => {
    return contacts.find(c => c.id === id)?.fullName || 'Unknown Client';
  };

  const overdueFollowUps = followUps.filter(f => f.status === 'Overdue' || (isPast(new Date(f.scheduledDate)) && !isToday(new Date(f.scheduledDate)) && f.status === 'Pending'));
  const todayFollowUps = followUps.filter(f => isToday(new Date(f.scheduledDate)) && f.status === 'Pending');

  return (
    <div className="followups-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Follow-up Scheduler</h2>
          <p className="muted-text">Nurture client relationships through consistent follow-ups</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} /> List
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={18} /> Calendar
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Schedule Follow-up
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="followup-list-view">
          {overdueFollowUps.length > 0 && (
            <div className="overdue-section">
              <div className="section-header">
                <span className="badge badge-danger">{overdueFollowUps.length} Overdue</span>
              </div>
              <div className="followup-cards">
                {overdueFollowUps.map(f => (
                  <div key={f.id} className="card followup-card overdue">
                    <div className="card-left">
                      <div className="type-icon"><Phone size={18} /></div>
                      <div className="client-info">
                        <h4>{getContactName(f.contactId)}</h4>
                        <p className="muted-text">{f.type} • Scheduled {format(new Date(f.scheduledDate), 'dd MMM, hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-primary">Mark Done</button>
                      <button className="btn btn-secondary">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="today-section">
            <div className="section-header">
              <h3>Today's Schedule</h3>
            </div>
            {todayFollowUps.length > 0 ? (
              <div className="followup-cards">
                {todayFollowUps.map(f => (
                  <div key={f.id} className="card followup-card">
                    <div className="card-left">
                      <div className="type-icon info"><MessageSquare size={18} /></div>
                      <div className="client-info">
                        <h4>{getContactName(f.contactId)}</h4>
                        <p className="muted-text">{f.type} • Today, {format(new Date(f.scheduledDate), 'hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-primary">Mark Done</button>
                      <button className="btn btn-secondary">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state card">
                <CalendarClock size={48} />
                <p>No follow-ups scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="calendar-placeholder card">
          <div className="calendar-header">
            <div className="flex items-center gap-4">
              <button className="icon-btn"><ChevronLeft /></button>
              <h3>{format(new Date(), 'MMMM yyyy')}</h3>
              <button className="icon-btn"><ChevronRight /></button>
            </div>
            <button className="btn btn-secondary">Today</button>
          </div>
          <div className="calendar-grid">
            {/* Simple calendar grid mockup */}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="calendar-day">
                <span className="day-num">{i + 1}</span>
                {i === 20 && <div className="calendar-event">2 Follow-ups</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule Follow-up"
      >
        <FollowUpForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default FollowUps;
