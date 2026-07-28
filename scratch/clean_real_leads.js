import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Lead, Enquiry, Contact, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

async function cleanAndAuditLeads() {
  await connectDB();
  console.log('🔍 Auditing and cleaning all Leads in MongoDB Atlas...');

  const leads = await Lead.find({});
  console.log(`Found ${leads.length} total leads in MongoDB.`);

  for (const lead of leads) {
    const isMock = lead.id?.startsWith('lead-fb-') || lead.notes?.includes('Captured from FB Messenger') || false;
    
    // Check if this lead genuinely completed the quote chatbot flow or submitted quote specs
    const hasRealQuoteInfo = Boolean(
      lead.phone === '919876512345' || 
      (lead.isQuoteRequested === true && lead.landArea && lead.landArea !== '10,000 sq ft' && lead.landArea !== 'As per layout requirements')
    );

    if (hasRealQuoteInfo) {
      console.log(`✅ Real Quote Request Kept: ${lead.contactName} (${lead.phone})`);
      lead.isQuoteRequested = true;
      lead.status = 'Quotation Requested';
      await lead.save();
    } else {
      // General Lead / Contact (Not a completed quote request)
      console.log(`ℹ️ General Inquiry (Not Quote Request): ${lead.contactName} (${lead.phone})`);
      lead.isQuoteRequested = false;
      if (lead.status === 'Quotation Requested') {
        lead.status = 'New';
      }
      
      // Clean out fake mock data if it was set by seed script
      if (lead.landArea === '10,000 sq ft' || lead.landArea === 'As per layout requirements') {
        lead.landArea = '';
      }
      if (lead.location === 'Tamil Nadu, India' || lead.location === 'Not Specified') {
        lead.location = '';
      }
      if (lead.timeline === 'Immediate') {
        lead.timeline = '';
      }
      if (lead.budgetRange === '₹20–50 Lakhs' || lead.budgetRange === 'To be estimated after site visit') {
        lead.budgetRange = '';
      }
      await lead.save();
    }
  }

  console.log('🎉 Audit & Cleanup complete!');
  process.exit(0);
}

cleanAndAuditLeads().catch(err => {
  console.error(err);
  process.exit(1);
});
