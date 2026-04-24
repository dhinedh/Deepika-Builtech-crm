import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Lead, Contact, Company, Project, Deal, Task, FollowUp, Quotation,
  CommunicationLog, SiteVisit, Vendor, PurchaseOrder, User
} from '../types';
import { sampleLeads, sampleProjects, sampleUsers, sampleContacts, sampleCompanies, sampleFollowUps } from './sampleData';

interface CRMState {
  leads: Lead[];
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
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  
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
      contacts: sampleContacts,
      companies: sampleCompanies,
      projects: sampleProjects,
      deals: [],
      tasks: [],
      followUps: sampleFollowUps,
      quotations: [],
      communications: [],
      siteVisits: [],
      vendors: [],
      pos: [],
      users: sampleUsers,
      currentUser: sampleUsers[0],

      setLeads: (leads) => set({ leads }),
      addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)
      })),

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
