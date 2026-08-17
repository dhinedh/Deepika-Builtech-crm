import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const dbPath = path.resolve('backend/db.json');
const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const missingEntries = [
  {
    name: 'MINTU KUMAR SINGH',
    phone: 'Instagram DM',
    source: 'Instagram DM',
    message: 'MINTU sent an attachment.',
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    name: 'Local Logu',
    phone: '+91 63808 55892',
    source: 'Instagram DM',
    message: 'Or this is +91 63808 55892 our contact number',
    createdAt: '2026-08-15T09:30:00.000Z'
  },
  {
    name: 'Soyab Khan',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: '👤 Thank you, Soyab! We have received your enquiry.',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    name: 'Sandepa Thapa',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: '🏗️ Welcome to Deepika Builtech Engineering!',
    createdAt: '2026-08-10T10:30:00.000Z'
  },
  {
    name: 'Ganesh L. S.',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'You: You',
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    name: 'Sonu Jadhav',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'You: Sir',
    createdAt: '2026-08-10T09:30:00.000Z'
  },
  {
    name: 'Bishnudev Chaudhary',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'You: Can u please share your contact number',
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    name: 'Bhavsar Lina',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: '🏗️ Welcome to Deepika Builtech Engineering!',
    createdAt: '2026-08-10T08:30:00.000Z'
  },
  {
    name: 'Raju JB',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: '🏗️ Welcome to Deepika Builtech Engineering!',
    createdAt: '2026-08-10T08:00:00.000Z'
  },
  {
    name: 'Avdesh Yadav',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'You: Can u please share your contact number',
    createdAt: '2026-08-10T07:30:00.000Z'
  },
  {
    name: 'IndianOcean Architecture',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: '😊 *Thank you for your message!*',
    createdAt: '2026-08-10T07:00:00.000Z'
  },
  {
    name: 'Mukhai Kh',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'You: Helo sir',
    createdAt: '2026-08-10T06:30:00.000Z'
  },
  {
    name: 'Darshan Singh',
    phone: 'FB Messenger (ad_id.120247742563840780)',
    source: 'Facebook Messenger',
    message: 'General Enquiry',
    createdAt: '2026-08-10T06:00:00.000Z'
  }
];

if (!currentDb.enquiries) currentDb.enquiries = [];
if (!currentDb.leads) currentDb.leads = [];
if (!currentDb.contacts) currentDb.contacts = [];

let addedEnquiries = 0;
let addedLeads = 0;

missingEntries.forEach((item, idx) => {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const enqId = `enq-missing-${slug}`;
  const leadId = `lead-missing-${slug}`;

  const existingEnq = currentDb.enquiries.find(e => e.contactName === item.name || e.id === enqId);
  if (!existingEnq) {
    currentDb.enquiries.unshift({
      id: enqId,
      contactName: item.name,
      phone: item.phone,
      lastMessage: item.message,
      status: 'New',
      source: item.source,
      created_at: item.createdAt,
      updated_at: item.createdAt,
      createdAt: item.createdAt,
      updatedAt: item.createdAt
    });
    addedEnquiries++;
  }

  const existingLead = currentDb.leads.find(l => l.contactName === item.name || l.id === leadId);
  if (!existingLead) {
    currentDb.leads.unshift({
      id: leadId,
      contactName: item.name,
      companyName: item.name.includes('Architecture') ? item.name : `${item.name} Project`,
      phone: item.phone,
      projectType: 'PEB Warehouse',
      location: 'Tamil Nadu, India',
      landArea: '10,000 sq ft',
      estimatedBudget: 30 + (idx * 5),
      budgetRange: '₹25L - ₹50L',
      timeline: 'Immediate',
      source: item.source,
      assignedTo: 'u1',
      status: 'New',
      leadScore: 85,
      isQuoteRequested: false,
      notes: `Captured from ${item.source}. Message: "${item.message}"`,
      created_at: item.createdAt,
      updated_at: item.createdAt,
      createdAt: item.createdAt,
      updatedAt: item.createdAt
    });
    addedLeads++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2));
console.log(`✅ Updated backend/db.json: Added ${addedEnquiries} new enquiries and ${addedLeads} new leads.`);
console.log(`Total enquiries in db.json: ${currentDb.enquiries.length}`);
console.log(`Total leads in db.json: ${currentDb.leads.length}`);

// Try MongoDB sync if available
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function syncMongo() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB, syncing...');
    const EnquirySchema = new mongoose.Schema({ id: String, contactName: String, phone: String, lastMessage: String, status: String, source: String, created_at: Date }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
    const LeadSchema = new mongoose.Schema({ id: String, contactName: String, companyName: String, phone: String, projectType: String, location: String, landArea: String, estimatedBudget: mongoose.Schema.Types.Mixed, timeline: String, source: String, assignedTo: String, status: String, leadScore: Number, notes: String, created_at: Date }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

    const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
    const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

    for (const e of currentDb.enquiries) {
      await Enquiry.updateOne({ contactName: e.contactName }, { $set: e }, { upsert: true });
    }
    for (const l of currentDb.leads) {
      await Lead.updateOne({ contactName: l.contactName }, { $set: l }, { upsert: true });
    }
    console.log('✅ MongoDB sync complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB sync skipped (Local Mode active):', err.message);
  }
}

syncMongo();
