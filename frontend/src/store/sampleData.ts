import type { Lead, Project, Quotation, User, Contact, Company, Deal, Task, FollowUp } from '../types';
import { subDays, addDays, format } from 'date-fns';

export const sampleUsers: User[] = [
  { id: 'u1', name: 'Admin', email: 'admin@deepika.com', role: 'Admin', status: 'Active' },
  { id: 'u2', name: 'Suresh Kumar', email: 'suresh@deepika.com', role: 'Manager', status: 'Active' },
  { id: 'u3', name: 'Anitha R', email: 'anitha@deepika.com', role: 'Sales Executive', status: 'Active' },
  { id: 'u4', name: 'Balaji S', email: 'balaji@deepika.com', role: 'Field Engineer', status: 'Active' },
];

export const sampleCompanies: Company[] = [
  { id: 'c1', name: 'Kanchipuram Logistics Pvt Ltd', industry: 'Logistics', officeAddress: '12, GST Road, Kanchipuram', accountManager: 'u3', createdAt: subDays(new Date(), 30).toISOString() },
  { id: 'c2', name: 'Tamil Nadu Cold Chain', industry: 'Food & Pharma', officeAddress: 'Plot 45, SIPCOT, Ranipet', accountManager: 'u3', createdAt: subDays(new Date(), 25).toISOString() },
  { id: 'c3', name: 'Thiruvallur Steel Fabricators', industry: 'Manufacturing', officeAddress: 'Sidco Industrial Estate, Thiruvallur', accountManager: 'u3', createdAt: subDays(new Date(), 20).toISOString() },
];

export const sampleContacts: Contact[] = [
  { id: 'con1', fullName: 'Rajesh Kumar', designation: 'Director', companyId: 'c1', phone: '9876543210', isDecisionMaker: true, type: 'Client Active', city: 'Kanchipuram', industry: 'Logistics', createdAt: subDays(new Date(), 30).toISOString() },
  { id: 'con2', fullName: 'Priya Suresh', designation: 'Operations Manager', companyId: 'c2', phone: '9876543211', isDecisionMaker: true, type: 'Client Active', city: 'Ranipet', industry: 'Food & Pharma', createdAt: subDays(new Date(), 25).toISOString() },
  { id: 'con3', fullName: 'Murugan V', designation: 'Proprietor', companyId: 'c3', phone: '9876543212', isDecisionMaker: true, type: 'Client Active', city: 'Thiruvallur', industry: 'Manufacturing', createdAt: subDays(new Date(), 20).toISOString() },
];

export const sampleLeads: Lead[] = [
  {
    id: 'L-2026-001',
    contactName: 'Rajesh Kumar',
    companyName: 'Kanchipuram Logistics Pvt Ltd',
    phone: '9876543210',
    projectType: 'PEB Warehouse',
    location: 'Kanchipuram',
    landArea: '15000',
    estimatedBudget: 45,
    timeline: '1-3 months',
    source: 'WhatsApp',
    assignedTo: 'u3',
    status: 'Quotation Sent',
    leadScore: 85,
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    nextFollowUpDate: addDays(new Date(), 2).toISOString()
  },
  {
    id: 'L-2026-002',
    contactName: 'Priya Suresh',
    companyName: 'Tamil Nadu Cold Chain',
    phone: '9876543211',
    projectType: 'Cold Storage',
    location: 'Ranipet',
    landArea: '8000',
    estimatedBudget: 28,
    timeline: 'Immediate',
    source: 'Website Form',
    assignedTo: 'u3',
    status: 'Site Visit Done',
    leadScore: 75,
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    nextFollowUpDate: addDays(new Date(), 1).toISOString()
  },
  {
    id: 'L-2026-003',
    contactName: 'Murugan V',
    companyName: 'Thiruvallur Steel Fabricators',
    phone: '9876543212',
    projectType: 'PEB Factory',
    location: 'Thiruvallur',
    landArea: '22000',
    estimatedBudget: 78,
    timeline: '1-3 months',
    source: 'Referral',
    assignedTo: 'u3',
    status: 'Qualified',
    leadScore: 90,
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    nextFollowUpDate: addDays(new Date(), 3).toISOString()
  }
] as any; // Cast for ProjectType mapping

export const sampleProjects: Project[] = [
  {
    id: 'P-2026-001',
    name: 'Kanchipuram Logistics Warehouse',
    clientId: 'con1',
    companyId: 'c1',
    projectType: 'PEB Warehouse',
    siteAddress: 'Survey No 123, GST Road, Kanchipuram',
    contractValue: 45,
    advanceReceived: 10,
    paymentTerms: '20% Advance, 40% on Structure, 30% on Roofing, 10% on Handover',
    startDate: subDays(new Date(), 30).toISOString(),
    targetEndDate: addDays(new Date(), 60).toISOString(),
    status: 'In Progress',
    projectManager: 'u2',
    siteEngineer: 'u4',
    percentComplete: 65,
    dealId: 'd1',
    quotationId: 'Q-2026-001',
    createdAt: subDays(new Date(), 30).toISOString()
  },
  {
    id: 'P-2026-002',
    name: 'Tamil Nadu Cold Chain Facility',
    clientId: 'con2',
    companyId: 'c2',
    projectType: 'Cold Storage',
    siteAddress: 'SIPCOT Phase II, Ranipet',
    contractValue: 28,
    advanceReceived: 5,
    paymentTerms: '15% Advance, 50% on Structure, 25% on Panels, 10% on Handover',
    startDate: subDays(new Date(), 15).toISOString(),
    targetEndDate: addDays(new Date(), 75).toISOString(),
    status: 'In Progress',
    projectManager: 'u2',
    siteEngineer: 'u4',
    percentComplete: 30,
    dealId: 'd2',
    quotationId: 'Q-2026-002',
    createdAt: subDays(new Date(), 15).toISOString()
  },
  {
    id: 'P-2026-003',
    name: 'Thiruvallur PEB Factory',
    clientId: 'con3',
    companyId: 'c3',
    projectType: 'Factory/Shed',
    siteAddress: 'Plot 88, Sidco, Thiruvallur',
    contractValue: 78,
    advanceReceived: 15,
    paymentTerms: '20% Advance, 50% on Fabrication, 20% on Erection, 10% on Handover',
    startDate: subDays(new Date(), 5).toISOString(),
    targetEndDate: addDays(new Date(), 120).toISOString(),
    status: 'Planning',
    projectManager: 'u2',
    siteEngineer: 'u4',
    percentComplete: 10,
    dealId: 'd3',
    quotationId: 'Q-2026-003',
    createdAt: subDays(new Date(), 5).toISOString()
  }
] as any;

export const sampleFollowUps: FollowUp[] = [
  { id: 'f1', contactId: 'con1', linkedToType: 'Lead', linkedToId: 'L-2026-001', type: 'Phone Call', scheduledDate: new Date().toISOString(), assignedTo: 'u3', reminder: '15 min before', status: 'Pending', createdAt: subDays(new Date(), 1).toISOString() },
  { id: 'f2', contactId: 'con2', linkedToType: 'Lead', linkedToId: 'L-2026-002', type: 'WhatsApp Message', scheduledDate: new Date().toISOString(), assignedTo: 'u3', reminder: '1 hour before', status: 'Pending', createdAt: subDays(new Date(), 1).toISOString() },
  { id: 'f3', contactId: 'con3', linkedToType: 'Lead', linkedToId: 'L-2026-003', type: 'Meeting', scheduledDate: subDays(new Date(), 1).toISOString(), assignedTo: 'u3', reminder: '1 day before', status: 'Overdue', createdAt: subDays(new Date(), 5).toISOString() },
];
