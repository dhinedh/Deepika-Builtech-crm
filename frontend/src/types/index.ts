export type UserRole = 'Admin' | 'Manager' | 'Sales Executive' | 'Field Engineer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Site Visit Done' | 'Quotation Sent' | 'Won' | 'Not Interested' | 'Lost';
export type ProjectType = 'PEB Warehouse' | 'Cold Storage' | 'Mezzanine Floor' | 'EOT Crane' | 'Factory/Shed' | 'Civil Construction' | 'Other';
export type LeadSource = 'Website Form' | 'WhatsApp' | 'Instagram DM' | 'Facebook Messenger' | 'Phone Call' | 'Referral' | 'Google Search' | 'Site Walk-in' | 'LinkedIn' | 'Trade Fair';
export type TimelineRequired = 'Immediate' | '1-3 months' | '3-6 months' | 'Planning stage';

export interface Lead {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  email?: string;
  projectType: ProjectType;
  location: string;
  landArea?: string;
  estimatedBudget?: number; // in lakhs
  timeline: TimelineRequired;
  source: LeadSource;
  assignedTo: string; // User ID
  status: LeadStatus;
  leadScore: number;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactType = 'Client Active' | 'Client Past' | 'Prospect' | 'Referrer' | 'Vendor' | 'Subcontractor';

export interface Contact {
  id: string;
  fullName: string;
  designation: string;
  companyId?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isDecisionMaker: boolean;
  type: ContactType;
  city: string;
  industry: string;
  birthday?: string;
  notes?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  gstNumber?: string;
  officeAddress: string;
  siteAddress?: string;
  accountManager: string; // User ID
  notes?: string;
  createdAt: string;
}

export type DealStage = 'New Enquiry' | 'Contacted' | 'Qualified' | 'Site Visit Done' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
export type LostReason = 'Price too high' | 'Chose competitor' | 'Budget cancelled' | 'Project postponed' | 'No response' | 'Other';

export interface Deal {
  id: string;
  name: string;
  leadId: string;
  contactId: string;
  companyId: string;
  value: number; // in lakhs
  projectType: ProjectType;
  expectedCloseDate: string;
  probability: number; // 0-100
  stage: DealStage;
  assignedTo: string; // User ID
  lostReason?: LostReason;
  notes?: string;
  daysInStage: number;
  createdAt: string;
}

export type QuotationStatus = 'Draft' | 'Sent to Client' | 'Revision Requested' | 'Client Approved' | 'Rejected' | 'Expired';

export interface BOQItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  date: string;
  validUntil: string;
  revisionNo: number;
  dealId: string;
  contactId: string;
  companyId: string;
  projectLocation: string;
  projectType: ProjectType;
  builtUpArea: number;
  baySpacing?: string;
  eaveHeight?: string;
  clearSpan?: string;
  items: BOQItem[];
  subTotal: number;
  discount: number;
  taxableAmount: number;
  gst: number;
  grandTotal: number;
  paymentTerms: string;
  deliveryTimeline: string;
  validity: string;
  specialConditions?: string;
  status: QuotationStatus;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  companyId: string;
  projectType: ProjectType;
  siteAddress: string;
  gpsCoordinates?: string;
  contractValue: number;
  advanceReceived: number;
  paymentTerms: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  projectManager: string; // User ID
  siteEngineer: string; // User ID
  percentComplete: number;
  dealId: string;
  quotationId: string;
  notes?: string;
  createdAt: string;
}

export type TaskType = 'Call Client' | 'Send Quotation' | 'Site Visit' | 'Follow Up' | 'Prepare Design' | 'Collect Payment' | 'Update Client' | 'Procure Material' | 'Quality Check' | 'Handover' | 'Other';
export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  priority: Priority;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  status: TaskStatus;
  linkedToType: 'Lead' | 'Contact' | 'Project' | 'Deal';
  linkedToId: string;
  description?: string;
  reminderDate?: string;
  completedAt?: string;
  createdAt: string;
}

export type FollowUpStatus = 'Pending' | 'Done' | 'Overdue' | 'Rescheduled' | 'Skipped';
export type FollowUpType = 'Phone Call' | 'WhatsApp Message' | 'Email' | 'Site Visit' | 'Meeting' | 'Send Document';

export interface FollowUp {
  id: string;
  contactId: string;
  linkedToType: 'Lead' | 'Project' | 'Deal';
  linkedToId: string;
  type: FollowUpType;
  scheduledDate: string;
  assignedTo: string;
  reminder: string;
  notes?: string;
  status: FollowUpStatus;
  outcome?: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  channel: string;
  direction: 'Inbound' | 'Outbound';
  date: string;
  duration?: number;
  loggedBy: string;
  contactId: string;
  linkedToType: 'Lead' | 'Project' | 'Deal';
  linkedToId: string;
  summary: string;
  outcome: string;
  attachment?: string;
}

export type SiteVisitStatus = 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled';

export interface SiteVisit {
  id: string;
  type: 'Pre-sales' | 'Design Verification' | 'Progress Inspection' | 'Quality Check' | 'Handover';
  linkedToType: 'Lead' | 'Project';
  linkedToId: string;
  scheduledDate: string;
  actualDate?: string;
  visitedBy: string;
  siteAddress: string;
  gpsCoordinates?: string;
  checkInTime?: string;
  checkOutTime?: string;
  dimensions?: string;
  soilType?: string;
  siteAccess?: string;
  clientPresent: boolean;
  notes?: string;
  photos: string[];
  nextAction?: string;
  followUpDate?: string;
  travelDistance?: number;
  status: SiteVisitStatus;
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  address: string;
  materials: string[];
  paymentTerms: string;
  rating: number;
  isApproved: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  projectId: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  requiredDate: string;
  actualDate?: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Delivered' | 'Partially Delivered' | 'Cancelled';
  invoiceNumber?: string;
  invoiceReceived: boolean;
  paidAmount: number;
  paymentDate?: string;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  approvedBy: string;
  notes?: string;
}

export interface Enquiry {
  id: string;
  contactName: string;
  phone: string;
  lastMessage: string;
  status: 'New' | 'Converted' | 'Ignored';
  createdAt: string;
  updatedAt: string;
}
