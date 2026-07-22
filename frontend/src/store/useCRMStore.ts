import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureFetch } from '../services/api';
import type {
  Lead, Contact, Company, Project, Deal, Task, FollowUp, Quotation,
  CommunicationLog, SiteVisit, Vendor, PurchaseOrder, User, Enquiry
} from '../types';
import { sampleLeads, sampleEnquiries, sampleProjects, sampleUsers, sampleContacts, sampleCompanies, sampleFollowUps } from './sampleData';

interface CRMState {
  leads: Lead[];
  enquiries: Enquiry[];
  contacts: Contact[];
  companies: Company[];
  projects: Project[];
  deals: Deal[];
  tasks: Task[];
  followUps: FollowUp[];
  quotations: Quotation[];
  communications: CommunicationLog[];
  siteVisits: SiteVisit[];
  vendors: Vendor[];
  pos: PurchaseOrder[];
  users: User[];
  currentUser: User | null;

  // Actions
  fetchLeads: () => Promise<void>;
  fetchEnquiries: () => Promise<void>;
  fetchFollowUps: () => Promise<void>;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  setFollowUps: (followUps: FollowUp[]) => void;
  addFollowUp: (followUp: FollowUp) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;

  setQuotations: (quotations: Quotation[]) => void;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;

  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;

  addSiteVisit: (visit: SiteVisit) => void;
  updateSiteVisit: (id: string, updates: Partial<SiteVisit>) => void;

  addCommunicationLog: (log: CommunicationLog) => void;
  completeFollowUp: (contactId: string, outcome: string) => void;
  scheduleAutoFollowUp: (contactId: string, type: string, days: number) => void;

  setCurrentUser: (user: User | null) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set) => ({
      leads: sampleLeads,
      enquiries: sampleEnquiries,
      contacts: sampleContacts,
      companies: [],
      projects: [],
      deals: [],
      tasks: [],
      followUps: [],
      quotations: [],
      communications: [],
      siteVisits: [],
      vendors: [],
      pos: [],
      users: sampleUsers,
      currentUser: sampleUsers[0] || null,

      fetchEnquiries: async () => {
        try {
          const res = await secureFetch('/enquiries');
          if (res.success && Array.isArray(res.data)) {
            const mappedEnquiries: Enquiry[] = res.data.map((e: any) => ({
              id: e.id,
              contactName: e.contactName || 'WhatsApp Customer',
              phone: e.phone || '',
              lastMessage: e.lastMessage || '',
              status: e.status || 'New',
              createdAt: e.created_at || e.createdAt || new Date().toISOString(),
              updatedAt: e.updated_at || e.updatedAt || new Date().toISOString()
            }));
            set({ enquiries: mappedEnquiries });
          }
        } catch (err) {
          console.error('Failed to fetch enquiries from backend:', err);
        }
      },

      fetchLeads: async () => {
        try {
          const res = await secureFetch('/leads');
          if (res.success && Array.isArray(res.data)) {
            const mappedLeads: Lead[] = res.data.map((lead: any) => ({
              id: lead.id,
              contactName: lead.contactName || 'Unspecified',
              companyName: lead.companyName || '',
              phone: lead.phone || '',
              projectType: lead.projectType || 'PEB',
              location: lead.location || '',
              landArea: lead.landArea || '',
              estimatedBudget: lead.estimatedBudget || 0,
              timeline: lead.timeline || '',
              source: lead.source || 'Website',
              status: lead.status || 'New',
              leadScore: lead.leadScore || 0,
              notes: lead.notes || '',
              createdAt: lead.created_at || lead.createdAt || new Date().toISOString(),
              updatedAt: lead.updated_at || lead.updatedAt || new Date().toISOString()
            }));
            set({ leads: mappedLeads });
          }
        } catch (err) {
          console.error('Failed to fetch leads from backend:', err);
        }
      },

      fetchFollowUps: async () => {
        try {
          const res = await secureFetch('/followups');
          if (res.success && Array.isArray(res.data)) {
            const mappedFollowUps: FollowUp[] = res.data.map((f: any) => ({
              id: f.id,
              contactId: f.lead_id || f.contactId || '',
              linkedToType: 'Lead',
              linkedToId: f.lead_id || '',
              type: f.type || 'Phone Call',
              scheduledDate: f.scheduled_date || f.scheduledDate || new Date().toISOString(),
              assignedTo: f.assignedTo || 'u1',
              reminder: '1 day before',
              status: f.status || 'Pending',
              notes: f.notes || '',
              outcome: f.outcome || '',
              createdAt: f.created_at || new Date().toISOString(),
              updatedAt: f.updated_at || new Date().toISOString()
            }));
            set({ followUps: mappedFollowUps });
          }
        } catch (err) {
          console.error('Failed to fetch followups from backend:', err);
        }
      },

      setLeads: (leads) => set({ leads }),
      
      addLead: async (lead) => {
        set((state) => ({ leads: [lead, ...state.leads] }));
        try {
          const dbLead = {
            contactName: lead.contactName,
            companyName: lead.companyName,
            phone: lead.phone,
            projectType: lead.projectType,
            location: lead.location || '',
            landArea: lead.landArea || '',
            source: lead.source,
            status: lead.status,
            leadScore: lead.leadScore,
            notes: lead.notes
          };
          await secureFetch('/leads', {
            method: 'POST',
            body: JSON.stringify(dbLead)
          });
        } catch (err) {
          console.error('Failed to save new lead to database:', err);
        }
      },

      updateLead: async (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)
        }));
        try {
          const dbUpdates: any = {};
          if (updates.contactName !== undefined) dbUpdates.contactName = updates.contactName;
          if (updates.companyName !== undefined) dbUpdates.companyName = updates.companyName;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.projectType !== undefined) dbUpdates.projectType = updates.projectType;
          if (updates.location !== undefined) dbUpdates.location = updates.location;
          if (updates.status !== undefined) dbUpdates.status = updates.status;
          if (updates.leadScore !== undefined) dbUpdates.leadScore = updates.leadScore;
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
          
          await secureFetch(`/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dbUpdates)
          });
        } catch (err) {
          console.error('Failed to sync updated lead to database:', err);
        }
      },

      addContact: (contact) => set((state) => ({ contacts: [contact, ...state.contacts] })),
      updateContact: (id, updates) => set((state) => ({
        contacts: state.contacts.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      addCompany: (company) => set((state) => ({ companies: [company, ...state.companies] })),
      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),

      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),

      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),

      setFollowUps: (followUps) => set({ followUps }),
      addFollowUp: (followUp) => set((state) => ({ followUps: [followUp, ...state.followUps] })),
      updateFollowUp: (id, updates) => set((state) => ({
        followUps: state.followUps.map((f) => f.id === id ? { ...f, ...updates } : f)
      })),

      setQuotations: (quotations) => set({ quotations }),
      addQuotation: (quotation) => set((state) => ({ quotations: [quotation, ...state.quotations] })),
      updateQuotation: (id, updates) => set((state) => ({
        quotations: state.quotations.map((q) => q.id === id ? { ...q, ...updates } : q)
      })),

      addVendor: (vendor) => set((state) => ({ vendors: [vendor, ...state.vendors] })),
      updateVendor: (id, updates) => set((state) => ({
        vendors: state.vendors.map((v) => v.id === id ? { ...v, ...updates } : v)
      })),

      addSiteVisit: (visit) => set((state) => ({ siteVisits: [visit, ...state.siteVisits] })),
      updateSiteVisit: (id, updates) => set((state) => ({
        siteVisits: state.siteVisits.map((v) => v.id === id ? { ...v, ...updates } : v)
      })),

      addCommunicationLog: (log) => set((state) => ({ communications: [log, ...state.communications] })),
      
      completeFollowUp: (contactId, outcome) => set((state) => ({
        followUps: state.followUps.map(f => 
          (f.contactId === contactId && (f.status === 'Pending' || f.status === 'Overdue'))
            ? { ...f, status: 'Done', outcome, updatedAt: new Date().toISOString() }
            : f
        )
      })),

      scheduleAutoFollowUp: (contactId, type, days) => set((state) => {
        const newFollowUp: FollowUp = {
          id: `F-${Date.now()}`,
          contactId,
          linkedToType: 'Lead', // Default
          linkedToId: '',
          type: type as any,
          scheduledDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: state.currentUser?.id || 'u1',
          reminder: '1 day before',
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        return { followUps: [newFollowUp, ...state.followUps] };
      }),

      setCurrentUser: (currentUser) => set({ currentUser }),
    }),
    {
      name: 'deepika-crm-storage',
    }
  )
);
