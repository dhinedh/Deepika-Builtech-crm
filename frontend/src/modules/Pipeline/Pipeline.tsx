import React, { useState, useEffect } from 'react';
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
  sortableKeyboardCoordinates
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
  const { leads } = useCRMStore();
  
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    setDeals(
      leads.map((lead, idx) => ({
        id: `d-${idx}`,
        name: `${lead.companyName || lead.contactName} - ${lead.projectType}`,
        leadId: lead.id,
        contactId: '',
        companyId: '',
        value: lead.estimatedBudget || 0,
        projectType: lead.projectType,
        expectedCloseDate: new Date().toISOString(),
        probability: 50,
        stage: (STAGES.includes(lead.status as any) ? lead.status : 'New Enquiry') as DealStage,
        assignedTo: 'u3',
        daysInStage: 1,
        createdAt: lead.createdAt
      }))
    );
  }, [leads]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalPipeline = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedForecast = deals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 50) / 100), 0);

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

    if (STAGES.includes(overId as DealStage)) {
      if (activeDeal.stage !== overId) {
        setDeals(prev => prev.map(d => 
          d.id === activeId ? { ...d, stage: overId as DealStage } : d
        ));
      }
    }
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="pipeline-module">
      <div className="pipeline-header">
        <div className="pipeline-stats">
          <div className="stat-item">
            <span className="label">Total Pipeline</span>
            <h3>₹ {totalPipeline} L</h3>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="label">Weighted Forecast</span>
            <h3>₹ {Math.round(weightedForecast)} L</h3>
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
