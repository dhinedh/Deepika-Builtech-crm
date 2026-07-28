import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Lead, Enquiry, Contact, connectDB } from '../backend/config/mongodb.js';

dotenv.config();

const fbEnquiries = [
  {
    id: "enq-fb-001",
    contactName: "Ramya R",
    phone: "Facebook Messenger",
    lastMessage: "Enquiry from Facebook Messenger: PEB Warehouse",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-22T10:21:00.000Z",
    updated_at: "2026-07-22T10:21:00.000Z"
  },
  {
    id: "enq-fb-002",
    contactName: "Rajesh Madasamy",
    phone: "Facebook Messenger",
    lastMessage: "Enquiry from Facebook Messenger: Industrial Shed",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-22T07:54:00.000Z",
    updated_at: "2026-07-22T07:54:00.000Z"
  },
  {
    id: "enq-fb-003",
    contactName: "Avj Architecture (Surya)",
    phone: "Facebook Messenger",
    lastMessage: "Hi sir🏡 I am AVJ PLANNER Surya 😆 We offer architectural planning and structural design.",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-20T14:30:00.000Z",
    updated_at: "2026-07-20T14:30:00.000Z"
  },
  {
    id: "enq-fb-004",
    contactName: "Tyagi Nikhil",
    phone: "Facebook Messenger",
    lastMessage: "Enquiry from Facebook Messenger: Cold Storage Warehouse",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-20T12:15:00.000Z",
    updated_at: "2026-07-20T12:15:00.000Z"
  },
  {
    id: "enq-fb-005",
    contactName: "Ravi Khede",
    phone: "Facebook Messenger",
    lastMessage: "Hello - PEB Shed estimation enquiry",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-20T11:00:00.000Z",
    updated_at: "2026-07-20T11:00:00.000Z"
  },
  {
    id: "enq-fb-006",
    contactName: "Raj Raj",
    phone: "Facebook Messenger",
    lastMessage: "Hi - General Enquiry",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-17T18:20:00.000Z",
    updated_at: "2026-07-17T18:20:00.000Z"
  },
  {
    id: "enq-fb-007",
    contactName: "Barun Panigrahi",
    phone: "Facebook Messenger",
    lastMessage: "Inquiry for Factory Shed",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-17T17:45:00.000Z",
    updated_at: "2026-07-17T17:45:00.000Z"
  },
  {
    id: "enq-fb-008",
    contactName: "Kishan Patel",
    phone: "Facebook Messenger",
    lastMessage: "Warehouse Construction details",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-16T16:10:00.000Z",
    updated_at: "2026-07-16T16:10:00.000Z"
  },

  {
    id: "enq-fb-010",
    contactName: "Kartik Sethi",
    phone: "Facebook Messenger",
    lastMessage: "Call is not connecting please contact this number sir",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-17T17:00:00.000Z",
    updated_at: "2026-07-17T17:00:00.000Z"
  },
  {
    id: "enq-fb-011",
    contactName: "Kathir Kaman",
    phone: "Facebook Messenger",
    lastMessage: "Can u please contact this number +91 97916 44688 for enquiry and more details",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-17T16:59:00.000Z",
    updated_at: "2026-07-17T16:59:00.000Z"
  },
  {
    id: "enq-fb-012",
    contactName: "Manna Foods",
    phone: "Facebook Messenger",
    lastMessage: "Can u please contact this number +91 97916 44688 for enquiry and more details",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-18T04:11:00.000Z",
    updated_at: "2026-07-18T04:11:00.000Z"
  },
  {
    id: "enq-fb-013",
    contactName: "M Rahman",
    phone: "Facebook Messenger",
    lastMessage: "I'm rooftop sheet fitting warking",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-11T17:42:00.000Z",
    updated_at: "2026-07-11T17:42:00.000Z"
  },
  {
    id: "enq-fb-014",
    contactName: "Nagallikar Manjunatha",
    phone: "Facebook Messenger",
    lastMessage: "civil engineer",
    status: "New",
    source: "Facebook Messenger",
    created_at: "2026-07-11T15:34:00.000Z",
    updated_at: "2026-07-11T15:34:00.000Z"
  }
];

const projectTypes = ['PEB Warehouse', 'Cold Storage', 'Mezzanine Floor', 'Factory/Shed', 'Civil Construction'];

const fbLeads = fbEnquiries.map((e, idx) => ({
  id: `lead-fb-${idx + 1}`,
  contactName: e.contactName,
  companyName: (e.contactName.includes("Architecture") || e.contactName.includes("Foods")) ? e.contactName : '',
  phone: e.phone,
  projectType: projectTypes[idx % projectTypes.length],
  location: "Tamil Nadu, India",
  landArea: "10,000 sq ft",
  estimatedBudget: 25 + (idx * 5),
  timeline: "Immediate",
  source: "Facebook Messenger",
  status: "New",
  leadScore: 80,
  notes: `Captured from FB Messenger. Message: "${e.lastMessage}"`,
  createdAt: e.created_at,
  updatedAt: e.updated_at,
  created_at: new Date(e.created_at),
  updated_at: new Date(e.updated_at)
}));

async function seed() {
  await connectDB();
  console.log('Syncing all Facebook Messenger leads into MongoDB Atlas...');

  for (const lead of fbLeads) {
    const existing = await Lead.findOne({ contactName: lead.contactName });
    if (!existing) {
      await Lead.create(lead);
      console.log(`+ Created lead: ${lead.contactName} (${lead.source})`);
    } else {
      await Lead.updateOne({ _id: existing._id }, { source: "Facebook Messenger", companyName: lead.companyName });
      console.log(`~ Updated lead: ${lead.contactName}`);
    }
  }

  for (const enq of fbEnquiries) {
    const existing = await Enquiry.findOne({ contactName: enq.contactName });
    if (!existing) {
      await Enquiry.create({
        id: enq.id,
        contactName: enq.contactName,
        phone: enq.phone,
        lastMessage: enq.lastMessage,
        source: enq.source,
        status: enq.status,
        createdAt: enq.created_at,
        updatedAt: enq.updated_at,
        created_at: new Date(enq.created_at),
        updated_at: new Date(enq.updated_at)
      });
      console.log(`+ Created enquiry: ${enq.contactName} (${enq.source})`);
    }
  }

  // Also update db.json
  const dbPath = path.resolve('backend/db.json');
  if (fs.existsSync(dbPath)) {
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Merge Facebook Messenger leads into db.json
    fbLeads.forEach(fbl => {
      if (!dbData.leads.some(x => x.contactName === fbl.contactName)) {
        dbData.leads.unshift(fbl);
      }
    });

    fbEnquiries.forEach(fbe => {
      if (!dbData.enquiries.some(x => x.contactName === fbe.contactName)) {
        dbData.enquiries.unshift(fbe);
      }
    });

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
    console.log('✅ Synchronized db.json file with all Facebook Messenger leads!');
  }

  const totalLeads = await Lead.countDocuments();
  console.log(`Total Leads now in MongoDB Atlas: ${totalLeads}`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
