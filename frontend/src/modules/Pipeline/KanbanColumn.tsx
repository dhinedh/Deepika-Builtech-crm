import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import type { Deal } from '../../types';
import { KanbanCard } from './KanbanCard.tsx';

interface KanbanColumnProps {
  id: string;
  title: string;
  deals: Deal[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, deals }) => {
  const { setNodeRef } = useDroppable({ id });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="title-group">
          <h4>{title}</h4>
          <span className="count-badge">{deals.length}</span>
        </div>
        <p className="column-value">₹ {totalValue} L</p>
      </div>
      
      <div ref={setNodeRef} className="column-content">
        <SortableContext 
          id={id}
          items={deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map(deal => (
            <KanbanCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
