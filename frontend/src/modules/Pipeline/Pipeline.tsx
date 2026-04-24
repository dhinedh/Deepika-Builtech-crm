import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useCRMStore } from '../../store/useCRMStore';
import { KanbanColumn } from './KanbanColumn.tsx';
import { KanbanCard } from './KanbanCard.tsx';
import type { Deal, DealStage } from '../../types';
import './Pipeline.css';

const STAGES: DealStage[] = [
  'New Enquiry', 
  'Contacted', 
  'Qualified', 
  'Site Visit Done', 
  'Quotation Sent', 
  'Negotiation', 
  'Won'
];

const Pipeline: React.FC = () => {
  const { leads, projects } = useCRMStore();
  
  // Mock deals from leads for visualization
  const [deals, setDeals] = useState<Deal[]>(
    leads.map((lead, idx) => ({
      id: `d-${idx}`,
      name: `${lead.companyName} - ${lead.projectType}`,
      leadId: lead.id,
      contactId: 'con1',
      companyId: 'c1',
      value: lead.estimatedBudget || 0,
      projectType: lead.projectType,
      expectedCloseDate: new Date().toISOString(),
      probability: 50,
      stage: lead.status as any, // Simple mapping for demo
      assignedTo: 'u3',
      daysInStage: 2,
      createdAt: lead.createdAt
    }))
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    // Check if dragging over a column
    if (STAGES.includes(overId as DealStage)) {
      if (activeDeal.stage !== overId) {
        setDeals(prev => prev.map(d => 
          d.id === activeId ? { ...d, stage: overId as DealStage } : d
        ));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="pipeline-module">
      <div className="pipeline-header">
        <div className="pipeline-stats">
          <div className="stat-item">
            <span className="label">Total Pipeline</span>
            <h3>₹ 245 L</h3>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="label">Weighted Forecast</span>
            <h3>₹ 128 L</h3>
          </div>
        </div>
      </div>

      <div className="kanban-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            {STAGES.map(stage => (
              <KanbanColumn 
                key={stage} 
                id={stage} 
                title={stage} 
                deals={deals.filter(d => d.stage === stage)} 
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <KanbanCard deal={deals.find(d => d.id === activeId)!} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Pipeline;
