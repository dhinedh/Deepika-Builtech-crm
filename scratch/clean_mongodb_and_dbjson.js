import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function cleanUp() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB for cleanup');

  const EnquirySchema = new mongoose.Schema({}, { strict: false });
  const LeadSchema = new mongoose.Schema({}, { strict: false });

  const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
  const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

  const allEnquiries = await Enquiry.find({}).sort({ created_at: -1, createdAt: -1 });
  const allLeads = await Lead.find({}).sort({ created_at: -1, createdAt: -1 });

  console.log(`Initial MongoDB counts - Enquiries: ${allEnquiries.length}, Leads: ${allLeads.length}`);

  // Deduplicate enquiries by contactName (case-insensitive) or phone (if not generic)
  const uniqueEnquiries = [];
  const seenEnqKeys = new Set();

  allEnquiries.forEach(e => {
    const rawName = (e.contactName || e.name || '').trim();
    if (!rawName) return;

    // Filter out test entries like 'Facebook User (XXXXXX)'
    if (rawName.startsWith('Facebook User (') || rawName === 'ANY TIME BUSY' || rawName === 'I am talking to Viknesh from your team') {
      return;
    }

    const key = rawName.toLowerCase();
    if (!seenEnqKeys.has(key)) {
      seenEnqKeys.add(key);
      uniqueEnquiries.push(e);
    }
  });

  console.log(`Clean Unique Enquiries count: ${uniqueEnquiries.length}`);

  // Delete all existing enquiries and leads in MongoDB and insert clean list
  await Enquiry.deleteMany({});
  for (const enq of uniqueEnquiries) {
    const doc = enq.toObject();
    delete doc._id;
    await Enquiry.create(doc);
  }
  console.log(`✅ Re-inserted ${uniqueEnquiries.length} clean enquiries into MongoDB.`);

  // Deduplicate leads
  const uniqueLeads = [];
  const seenLeadKeys = new Set();

  allLeads.forEach(l => {
    const rawName = (l.contactName || l.name || '').trim();
    if (!rawName) return;
    if (rawName.startsWith('Facebook User (') || rawName === 'ANY TIME BUSY' || rawName === 'I am talking to Viknesh from your team') {
      return;
    }
    const key = rawName.toLowerCase();
    if (!seenLeadKeys.has(key)) {
      seenLeadKeys.add(key);
      uniqueLeads.push(l);
    }
  });

  await Lead.deleteMany({});
  for (const lead of uniqueLeads) {
    const doc = lead.toObject();
    delete doc._id;
    await Lead.create(doc);
  }
  console.log(`✅ Re-inserted ${uniqueLeads.length} clean leads into MongoDB.`);

  // Also update local db.json to match clean MongoDB state
  const dbPath = path.resolve('backend/db.json');
  const dbData = {
    enquiries: uniqueEnquiries.map((e, idx) => {
      const obj = e.toObject ? e.toObject() : e;
      delete obj._id;
      if (!obj.id) obj.id = `enq-clean-${idx + 1}`;
      return obj;
    }),
    leads: uniqueLeads.map((l, idx) => {
      const obj = l.toObject ? l.toObject() : l;
      delete obj._id;
      if (!obj.id) obj.id = `lead-clean-${idx + 1}`;
      return obj;
    })
  };

  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  console.log(`✅ Updated backend/db.json with ${dbData.enquiries.length} enquiries and ${dbData.leads.length} leads.`);

  await mongoose.disconnect();
  process.exit(0);
}

cleanUp().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
