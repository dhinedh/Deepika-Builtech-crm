import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Download, 
  MoreHorizontal, CheckCircle, Clock, RotateCcw 
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { QuotationForm } from './QuotationForm';
import '../../components/UI/Modal.css';
import './Quotations.css';
import type { Quotation } from '../../types';

const Quotations: React.FC = () => {
  const { quotations, leads } = useCRMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);

  return (
    <div className="quotations-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Quotations</h2>
          <p className="muted-text">Manage and track commercial proposals</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by Quote ID or Client..." />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingQuotation(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> Create Quote
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Date</th>
              <th>Client / Project</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Revision</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample row since quotations might be empty */}
            <tr>
              <td><span className="font-600">Q-2026-001</span></td>
              <td>15/04/2026</td>
              <td>
                <div className="flex flex-col">
                  <span className="font-600">Kanchipuram Logistics</span>
                  <span className="muted-text">PEB Warehouse</span>
                </div>
              </td>
              <td><span className="font-600">₹ 45,00,000</span></td>
              <td><span className="badge badge-success">Approved</span></td>
              <td>Rev 2</td>
              <td>
                <div className="action-buttons">
                  <button className="icon-btn" title="Download PDF" onClick={() => alert('PDF generation coming soon')}><Download size={16} /></button>
                  <button className="icon-btn" title="Revise" onClick={() => alert('Quotation revision coming soon')}><RotateCcw size={16} /></button>
                  <button className="icon-btn" onClick={() => alert('More options coming soon')}><MoreHorizontal size={16} /></button>
                </div>
              </td>
            </tr>
            {quotations.map(quote => (
              <tr key={quote.id}>
                <td><span className="font-600">{quote.id}</span></td>
                <td>{format(new Date(quote.date), 'dd/MM/yyyy')}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-600">Client Name</span>
                    <span className="muted-text">{quote.projectType}</span>
                  </div>
                </td>
                <td><span className="font-600">₹ {quote.grandTotal.toLocaleString('en-IN')}</span></td>
                <td><span className={`badge badge-${quote.status === 'Client Approved' ? 'success' : 'info'}`}>{quote.status}</span></td>
                <td>Rev {quote.revisionNo}</td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="Download PDF" onClick={() => alert('PDF generation coming soon')}><Download size={16} /></button>
                    <button 
                      className="icon-btn" 
                      title="Edit / Revise"
                      onClick={() => {
                        setEditingQuotation(quote);
                        setIsModalOpen(true);
                      }}
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => alert('More options coming soon')}><MoreHorizontal size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingQuotation ? 'Edit / Revise Quotation' : 'Create New Quotation'}
      >
        <QuotationForm 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingQuotation}
        />
      </Modal>
    </div>
  );
};

export default Quotations;
