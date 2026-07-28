const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function migrateData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for migration.');

    const dbPath = path.resolve(__dirname, 'db.json');
    if (!fs.existsSync(dbPath)) {
      console.log('No local db.json found for migration.');
      process.exit(0);
    }

    const localData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Define Schemas
    const LeadSchema = new mongoose.Schema({
      contactName: String,
      companyName: String,
      phone: { type: String, index: true },
      projectType: String,
      location: String,
      landArea: String,
      estimatedBudget: mongoose.Schema.Types.Mixed,
      timeline: String,
      source: String,
      assignedTo: String,
      status: { type: String, default: 'New' },
      notes: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

    const EnquirySchema = new mongoose.Schema({
      contactName: String,
      phone: { type: String, index: true },
      lastMessage: String,
      status: { type: String, default: 'New' },
      source: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

    const ContactSchema = new mongoose.Schema({
      fullName: String,
      designation: String,
      phone: { type: String, index: true },
      email: String,
      isDecisionMaker: Boolean,
      type: String,
      city: String,
      industry: String,
      created_at: { type: Date, default: Date.now }
    });

    const FollowUpSchema = new mongoose.Schema({
      lead_id: String,
      contactId: String,
      type: String,
      scheduled_date: Date,
      status: { type: String, default: 'Pending' },
      notes: String,
      created_at: { type: Date, default: Date.now }
    });

    const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
    const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
    const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
    const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);

    // 1. Migrate Leads
    if (Array.isArray(localData.leads) && localData.leads.length > 0) {
      console.log(`Migrating ${localData.leads.length} leads...`);
      for (const lead of localData.leads) {
        if (!lead.phone) continue;
        await Lead.findOneAndUpdate(
          { phone: lead.phone },
          {
            contactName: lead.contactName || lead.name || 'Customer',
            companyName: lead.companyName || '',
            phone: lead.phone,
            projectType: lead.projectType || 'PEB Warehouse',
            location: lead.location || '',
            landArea: lead.landArea || '',
            timeline: lead.timeline || '',
            source: lead.source || 'WhatsApp Bot',
            status: lead.status || 'New',
            notes: lead.notes || '',
            updated_at: new Date()
          },
          { upsert: true, new: true }
        );
      }
      console.log('✅ Leads migration completed.');
    }

    // 2. Migrate Enquiries
    if (Array.isArray(localData.enquiries) && localData.enquiries.length > 0) {
      console.log(`Migrating ${localData.enquiries.length} enquiries...`);
      for (const enq of localData.enquiries) {
        if (!enq.phone) continue;
        await Enquiry.findOneAndUpdate(
          { phone: enq.phone },
          {
            contactName: enq.contactName || 'Customer',
            phone: enq.phone,
            lastMessage: enq.lastMessage || '',
            status: enq.status || 'New',
            source: enq.source || 'WhatsApp',
            updated_at: new Date()
          },
          { upsert: true, new: true }
        );
      }
      console.log('✅ Enquiries migration completed.');
    }

    // 3. Migrate Contacts
    if (Array.isArray(localData.contacts) && localData.contacts.length > 0) {
      console.log(`Migrating ${localData.contacts.length} contacts...`);
      for (const con of localData.contacts) {
        if (!con.phone) continue;
        await Contact.findOneAndUpdate(
          { phone: con.phone },
          {
            fullName: con.fullName || con.name || 'Customer',
            designation: con.designation || 'Client',
            phone: con.phone,
            email: con.email || '',
            isDecisionMaker: con.isDecisionMaker !== false,
            type: con.type || 'Client Active',
            city: con.city || '',
            industry: con.industry || 'Construction'
          },
          { upsert: true, new: true }
        );
      }
      console.log('✅ Contacts migration completed.');
    }

    console.log('🎉 Full Data Migration to MongoDB Atlas Successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  }
}

migrateData();
