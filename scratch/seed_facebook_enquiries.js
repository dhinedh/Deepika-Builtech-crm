const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('backend/db.json');

const fbEnquiries = [
  {
    id: "enq-fb-001",
    contactName: "Ramya R",
    phone: "FB Messenger",
    lastMessage: "😍👑 STAR DESIGNER 👑😍😍 ...",
    status: "New",
    created_at: "2026-07-22T10:21:00.000Z",
    updated_at: "2026-07-22T10:21:00.000Z",
    createdAt: "2026-07-22T10:21:00.000Z",
    updatedAt: "2026-07-22T10:21:00.000Z"
  },
  {
    id: "enq-fb-002",
    contactName: "Rajesh Madasamy",
    phone: "FB Messenger",
    lastMessage: "Hey 👋",
    status: "New",
    created_at: "2026-07-22T07:54:00.000Z",
    updated_at: "2026-07-22T07:54:00.000Z",
    createdAt: "2026-07-22T07:54:00.000Z",
    updatedAt: "2026-07-22T07:54:00.000Z"
  },
  {
    id: "enq-fb-003",
    contactName: "Avj Architecture (Surya)",
    phone: "FB Messenger",
    lastMessage: "Hi sir🏡 I am AVJ PLANNER Surya 😆 We offer architectural planning and structural design.",
    status: "New",
    created_at: "2026-07-20T14:30:00.000Z",
    updated_at: "2026-07-20T14:30:00.000Z",
    createdAt: "2026-07-20T14:30:00.000Z",
    updatedAt: "2026-07-20T14:30:00.000Z"
  },
  {
    id: "enq-fb-004",
    contactName: "Tyagi Nikhil",
    phone: "FB Messenger",
    lastMessage: "Hlo",
    status: "New",
    created_at: "2026-07-20T12:15:00.000Z",
    updated_at: "2026-07-20T12:15:00.000Z",
    createdAt: "2026-07-20T12:15:00.000Z",
    updatedAt: "2026-07-20T12:15:00.000Z"
  },
  {
    id: "enq-fb-005",
    contactName: "Ravi Khede",
    phone: "FB Messenger",
    lastMessage: "Hello",
    status: "New",
    created_at: "2026-07-20T11:00:00.000Z",
    updated_at: "2026-07-20T11:00:00.000Z",
    createdAt: "2026-07-20T11:00:00.000Z",
    updatedAt: "2026-07-20T11:00:00.000Z"
  },
  {
    id: "enq-fb-006",
    contactName: "Raj Raj",
    phone: "FB Messenger",
    lastMessage: "Hi",
    status: "New",
    created_at: "2026-07-17T18:20:00.000Z",
    updated_at: "2026-07-17T18:20:00.000Z",
    createdAt: "2026-07-17T18:20:00.000Z",
    updatedAt: "2026-07-17T18:20:00.000Z"
  },
  {
    id: "enq-fb-007",
    contactName: "Barun Panigrahi",
    phone: "FB Messenger",
    lastMessage: "Messages and calls are secured with end-to-end encryption",
    status: "New",
    created_at: "2026-07-17T17:45:00.000Z",
    updated_at: "2026-07-17T17:45:00.000Z",
    createdAt: "2026-07-17T17:45:00.000Z",
    updatedAt: "2026-07-17T17:45:00.000Z"
  },
  {
    id: "enq-fb-008",
    contactName: "Kishan Patel Kishan Patel",
    phone: "FB Messenger",
    lastMessage: "Messages and calls are secured with end-to-end encryption",
    status: "New",
    created_at: "2026-07-16T16:10:00.000Z",
    updated_at: "2026-07-16T16:10:00.000Z",
    createdAt: "2026-07-16T16:10:00.000Z",
    updatedAt: "2026-07-16T16:10:00.000Z"
  },
  {
    id: "enq-fb-009",
    contactName: "Mugil",
    phone: "FB Messenger",
    lastMessage: "Hi - Interested in Pre-Engineered Building options",
    status: "New",
    created_at: "2026-07-22T20:48:00.000Z",
    updated_at: "2026-07-22T20:48:00.000Z",
    createdAt: "2026-07-22T20:48:00.000Z",
    updatedAt: "2026-07-22T20:48:00.000Z"
  },
  {
    id: "enq-fb-010",
    contactName: "Kartik Sethi",
    phone: "FB Messenger",
    lastMessage: "Hello - Call is not connecting please contact this number sir",
    status: "New",
    created_at: "2026-07-17T17:00:00.000Z",
    updated_at: "2026-07-17T17:00:00.000Z",
    createdAt: "2026-07-17T17:00:00.000Z",
    updatedAt: "2026-07-17T17:00:00.000Z"
  },
  {
    id: "enq-fb-011",
    contactName: "Kathir Kaman",
    phone: "FB Messenger",
    lastMessage: "Hi - Ad enquiry for PEB Building construction",
    status: "New",
    created_at: "2026-07-17T16:59:00.000Z",
    updated_at: "2026-07-17T16:59:00.000Z",
    createdAt: "2026-07-17T16:59:00.000Z",
    updatedAt: "2026-07-17T16:59:00.000Z"
  },
  {
    id: "enq-fb-012",
    contactName: "Manna Foods",
    phone: "FB Messenger",
    lastMessage: "Hello - Cold storage & warehouse enquiry",
    status: "New",
    created_at: "2026-07-18T04:11:00.000Z",
    updated_at: "2026-07-18T04:11:00.000Z",
    createdAt: "2026-07-18T04:11:00.000Z",
    updatedAt: "2026-07-18T04:11:00.000Z"
  },
  {
    id: "enq-fb-013",
    contactName: "M Rahman",
    phone: "FB Messenger",
    lastMessage: "I'm rooftop sheet fitting working",
    status: "New",
    created_at: "2026-07-11T17:42:00.000Z",
    updated_at: "2026-07-11T17:42:00.000Z",
    createdAt: "2026-07-11T17:42:00.000Z",
    updatedAt: "2026-07-11T17:42:00.000Z"
  },
  {
    id: "enq-fb-014",
    contactName: "Nagallikar Manjunatha",
    phone: "FB Messenger",
    lastMessage: "civil engineer",
    status: "New",
    created_at: "2026-07-11T15:34:00.000Z",
    updated_at: "2026-07-11T15:34:00.000Z",
    createdAt: "2026-07-11T15:34:00.000Z",
    updatedAt: "2026-07-11T15:34:00.000Z"
  }
];

const projectTypes = ['PEB Warehouse', 'Cold Storage', 'Mezzanine Floor', 'Factory/Shed', 'Civil Construction', 'Other'];

const fbLeads = fbEnquiries.map((e, idx) => ({
  id: `lead-fb-${idx + 1}`,
  contactName: e.contactName,
  companyName: e.contactName.includes("Architecture") || e.contactName.includes("Foods") ? e.contactName : `${e.contactName} Project`,
  phone: e.phone,
  projectType: projectTypes[idx % projectTypes.length],
  location: "Tamil Nadu, India",
  landArea: "10,000 sq ft",
  estimatedBudget: 25 + (idx * 5),
  timeline: "Immediate",
  source: "Facebook Messenger",
  assignedTo: "u1",
  status: "New",
  leadScore: 80,
  notes: `Captured from FB Messenger. Message: "${e.lastMessage}"`,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
  created_at: e.createdAt,
  updated_at: e.updatedAt
}));

const fbContacts = fbEnquiries.map((e, idx) => ({
  id: `con-fb-${idx + 1}`,
  fullName: e.contactName,
  designation: "Client / Enquirer",
  phone: e.phone,
  isDecisionMaker: true,
  type: "Client Active",
  city: "Chennai / Tamil Nadu",
  industry: "Construction / PEB",
  createdAt: e.createdAt
}));

const currentDb = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};
currentDb.enquiries = fbEnquiries;
currentDb.leads = fbLeads;
currentDb.contacts = fbContacts;

fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2));
console.log('Successfully re-seeded Facebook Messenger contacts into backend/db.json!');
