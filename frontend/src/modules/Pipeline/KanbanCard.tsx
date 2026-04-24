import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Clock } from 'lucide-react';
import type { Deal } from '../../types';
import { format } from 'date-fns';

interface KanbanCardProps {
  deal: Deal;
  isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ deal, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`kanban-card ${isOverlay ? 'overlay' : ''}`}
    >
      <div className="card-top">
        <span className="badge badge-info">{deal.projectType}</span>
        <span className="deal-value">₹ {deal.value} L</span>
      </div>
      
      <h5 className="deal-name">{deal.name}</h5>
      
      <div className="card-footer">
        <div className="footer-info">
          <User size={14} />
          <span>Rajesh Kumar</span>
        </div>
        <div className="footer-info">
          <Clock size={14} />
          <span>{deal.daysInStage}d</span>
        </div>
      </div>
      
      <div className="next-follow-up overdue">
        <Calendar size={12} />
        <span>Next: {format(new Date(deal.expectedCloseDate), 'dd MMM')}</span>
      </div>
    </div>
  );
};
