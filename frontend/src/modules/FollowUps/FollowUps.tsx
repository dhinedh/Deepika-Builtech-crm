import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, List, Calendar as CalendarIcon, 
  MessageSquare, Phone, Send, CheckCircle, 
  ChevronLeft, ChevronRight, AlertTriangle, Clock, Filter, RefreshCw
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import Modal from '../../components/UI/Modal';
import { FollowUpForm } from './FollowUpForm';
import '../../components/UI/Modal.css';
import './FollowUps.css';

type FilterTab = '3days_due' | 'all' | 'today' | 'overdue';

const FollowUps: React.FC = () => {
  const { followUps, contacts, leads, enquiries, fetchEnquiries, fetchFollowUps, fetchLeads } = useCRMStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<FilterTab>('3days_due');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries?.();
    fetchFollowUps?.();
    fetchLeads?.();
  }, []);

  const getContactName = (id: string, fallbackName?: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) return contact.fullName;
    const lead = leads.find(l => l.id === id || l.phone === id);
    if (lead) return lead.contactName;
    const enquiry = enquiries.find(e => e.id === id || e.phone === id);
    if (enquiry) return enquiry.contactName;
    return fallbackName || 'Client';
  };

  const getChannelBadge = (phoneStr: string) => {
    if (phoneStr.startsWith('ig:')) return { label: '📸 Instagram Direct', bg: 'bg-pink-100 text-pink-800 border-pink-300' };
    if (phoneStr.startsWith('fb:')) return { label: '💬 Facebook Messenger', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: '🟢 WhatsApp', bg: 'bg-green-100 text-green-800 border-green-300' };
  };

  // 1. Calculate 3-Day Due Enquiries (Message sent 3 or more days ago)
  const now = new Date();
  const threeDaysDueEnquiries = enquiries.filter(e => {
    if ((e.status as any) === 'Closed' || e.status === 'Converted') return false;
    const dateStr = e.updatedAt || e.createdAt;

    if (!dateStr) return true;
    const daysAgo = differenceInDays(now, new Date(dateStr));
    return daysAgo >= 3;
  });

  const threeDaysDueLeads = leads.filter(l => {
    if (l.status === 'Won' || l.status === 'Lost') return false;
    const dateStr = (l as any).updated_at || l.updatedAt || (l as any).created_at || l.createdAt;
    if (!dateStr) return true;
    const daysAgo = differenceInDays(now, new Date(dateStr));
    return daysAgo >= 3;
  });

  const overdueFollowUps = followUps.filter(f => f.status === 'Overdue' || (isPast(new Date(f.scheduledDate)) && !isToday(new Date(f.scheduledDate)) && f.status === 'Pending'));
  const todayFollowUps = followUps.filter(f => isToday(new Date(f.scheduledDate)) && f.status === 'Pending');

  // Trigger instant 3-day follow-up message to client
  const handleSendFollowUp = async (id: string, phone: string, name: string) => {
    setSendingId(id);
    try {
      const followUpMsg = `👋 *Hello from Deepika Builtech Engineering!*

Hello ${name}! We are following up regarding your enquiry for PEB & warehouse construction services.

Our expert engineering team is available to assist you with free site consultation, layout designs, and project estimation quotations. 🏗️

📞 Call / WhatsApp: +91 96000 67611 / +91 98844 87938
🌐 Website: deepikabuiltech.com

Reply to this message anytime to connect with our specialists!`;

      // API Call to trigger follow-up dispatch
      const res = await fetch('/api/webhooks/whatsapp-bot-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CustomerName: name,
          WhatsAppNumber: phone,
          FollowUpText: followUpMsg,
          Channel: phone.startsWith('ig:') ? 'Instagram Direct' : phone.startsWith('fb:') ? 'Facebook Messenger' : 'WhatsApp'
        })
      });

      if (res.ok) {
        alert(`⚡ Follow-Up message sent successfully to ${name} (${phone})!`);
        fetchEnquiries?.();
        fetchFollowUps?.();
      } else {
        alert(`Follow-up logged for ${name}`);
      }
    } catch (error) {
      console.error('Error sending follow-up:', error);
      alert(`Follow-up registered for ${name}`);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="followups-module p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="module-header flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="header-info">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="text-amber-600" /> Follow-Up Scheduler & Nurture Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and nurture client enquiries due for 3-day and 7-day follow-up messages
          </p>
        </div>
        <div className="header-actions flex items-center gap-3 flex-wrap">
          <div className="view-toggle flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              className={`toggle-btn px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} /> List
            </button>
            <button 
              className={`toggle-btn px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${viewMode === 'calendar' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>
          <button 
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            + Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="filter-tabs flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('3days_due')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
            activeTab === '3days_due'
              ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Clock size={16} className="text-amber-600" />
          ⚡ 3-Day Follow-Up Due
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {threeDaysDueEnquiries.length + threeDaysDueLeads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
            activeTab === 'today'
              ? 'bg-blue-50 text-blue-900 border-blue-400 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CalendarIcon size={16} className="text-blue-600" />
          Today's Schedule
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {todayFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
            activeTab === 'overdue'
              ? 'bg-red-50 text-red-900 border-red-400 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle size={16} className="text-red-600" />
          Overdue
          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {overdueFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
            activeTab === 'all'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter size={16} className="text-emerald-600" />
          All Follow-ups
          <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {followUps.length}
          </span>
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="followup-list-view space-y-6">

          {/* TAB 1: 3-DAY FOLLOW-UP DUE ENQUIRIES (SENT 3+ DAYS AGO) */}
          {(activeTab === '3days_due' || activeTab === 'all') && (
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/80 p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Clock className="text-amber-600" /> Enquiries Needing Follow-Up (Message Sent 3+ Days Ago)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Clients who received their last message or initial enquiry 3 or more days ago and are due for a nurture check-in
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs border border-amber-300">
                  {threeDaysDueEnquiries.length + threeDaysDueLeads.length} Clients Due
                </span>
              </div>

              {threeDaysDueEnquiries.length > 0 || threeDaysDueLeads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Render 3-Day Enquiries */}
                  {threeDaysDueEnquiries.map(enq => {
                    const daysAgo = differenceInDays(now, new Date(enq.updatedAt || enq.createdAt));
                    const badge = getChannelBadge(enq.phone);

                    return (
                      <div key={enq.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 flex flex-col justify-between gap-3 transition-all shadow-sm">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{enq.contactName}</h4>
                              <p className="text-xs text-gray-500">{enq.phone}</p>
                            </div>
                            <span className={`text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-amber-200/60 mb-2">
                            <p className="text-xs text-gray-700 italic line-clamp-2">
                              "{enq.lastMessage || 'Initial Enquiry Received'}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                            <Clock size={14} />
                            <span>Last message sent: {daysAgo} days ago ({format(new Date(enq.updatedAt || enq.createdAt), 'dd MMM yyyy')})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/60">
                          <button
                            onClick={() => handleSendFollowUp(enq.id, enq.phone, enq.contactName)}
                            disabled={sendingId === enq.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Send size={13} />
                            {sendingId === enq.id ? 'Sending...' : '⚡ Send Instant Follow-Up'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Render 3-Day Leads */}
                  {threeDaysDueLeads.map(lead => {
                    const daysAgo = differenceInDays(now, new Date((lead as any).updated_at || lead.updatedAt || (lead as any).created_at || lead.createdAt));
                    const badge = getChannelBadge(lead.phone);

                    return (
                      <div key={lead.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 flex flex-col justify-between gap-3 transition-all shadow-sm">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{lead.contactName}</h4>
                              <p className="text-xs text-gray-500">{lead.phone} • {lead.projectType}</p>
                            </div>
                            <span className={`text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-amber-200/60 mb-2">
                            <p className="text-xs text-gray-700 italic">
                              "{lead.notes || 'Quotation Lead In Progress'}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                            <Clock size={14} />
                            <span>Last message sent: {daysAgo} days ago ({format(new Date((lead as any).updated_at || lead.updatedAt || (lead as any).created_at || lead.createdAt), 'dd MMM yyyy')})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/60">
                          <button
                            onClick={() => handleSendFollowUp(lead.id, lead.phone, lead.contactName)}
                            disabled={sendingId === lead.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Send size={13} />
                            {sendingId === lead.id ? 'Sending...' : '⚡ Send Instant Follow-Up'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <CheckCircle size={40} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-semibold text-gray-700">All 3-day follow-ups are currently completed!</p>
                  <p className="text-xs">No pending enquiries with last message sent 3+ days ago.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERDUE FOLLOW-UPS */}
          {(activeTab === 'overdue' || activeTab === 'all') && overdueFollowUps.length > 0 && (
            <div className="overdue-section bg-white rounded-xl shadow-sm border border-red-200 p-5">
              <div className="section-header flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" /> Overdue Scheduled Follow-ups
                </h3>
                <span className="badge bg-red-100 text-red-800 border border-red-300 font-bold px-3 py-1 rounded-full text-xs">
                  {overdueFollowUps.length} Overdue
                </span>
              </div>
              <div className="followup-cards space-y-3">
                {overdueFollowUps.map(f => (
                  <div key={f.id} className="card followup-card overdue p-4 rounded-xl border border-red-200 bg-red-50/30 flex justify-between items-center gap-4">
                    <div className="card-left flex items-center gap-3">
                      <div className="type-icon p-2.5 bg-red-100 text-red-700 rounded-lg"><Phone size={18} /></div>
                      <div className="client-info">
                        <h4 className="font-bold text-gray-900">{getContactName(f.contactId, (f as any).contactName)}</h4>
                        <p className="text-xs text-gray-500">{f.type} • Scheduled {format(new Date(f.scheduledDate), 'dd MMM yyyy, hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="card-actions flex gap-2">
                      <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Mark Done</button>
                      <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TODAY'S SCHEDULE */}
          {(activeTab === 'today' || activeTab === 'all') && (
            <div className="today-section bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="section-header mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="text-blue-600" /> Today's Follow-up Schedule
                </h3>
              </div>
              {todayFollowUps.length > 0 ? (
                <div className="followup-cards space-y-3">
                  {todayFollowUps.map(f => (
                    <div key={f.id} className="card followup-card p-4 rounded-xl border border-gray-200 bg-white flex justify-between items-center gap-4 shadow-sm">
                      <div className="card-left flex items-center gap-3">
                        <div className="type-icon info p-2.5 bg-blue-100 text-blue-700 rounded-lg"><MessageSquare size={18} /></div>
                        <div className="client-info">
                          <h4 className="font-bold text-gray-900">{getContactName(f.contactId, (f as any).contactName)}</h4>
                          <p className="text-xs text-gray-500">{f.type} • Today, {format(new Date(f.scheduledDate), 'hh:mm a')}</p>
                        </div>
                      </div>
                      <div className="card-actions flex gap-2">
                        <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Mark Done</button>
                        <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">Reschedule</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <CalendarClock size={40} className="mx-auto text-blue-500 mb-2" />
                  <p className="font-semibold text-gray-700">No follow-ups scheduled for today.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="calendar-placeholder bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="calendar-header flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button className="icon-btn p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><ChevronLeft /></button>
              <h3 className="text-xl font-bold text-gray-900">{format(new Date(), 'MMMM yyyy')}</h3>
              <button className="icon-btn p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><ChevronRight /></button>
            </div>
            <button className="btn bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold">Today</button>
          </div>
          <div className="calendar-grid grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="calendar-day bg-white p-3 min-h-[100px]">
                <span className="day-num font-bold text-xs text-gray-400">{i + 1}</span>
                {i === 20 && <div className="calendar-event bg-emerald-600 text-white text-[0.65rem] font-bold p-1 rounded mt-1">2 Follow-ups</div>}
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
