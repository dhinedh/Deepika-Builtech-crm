import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead, Enquiry, Contact, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

async function checkRecentInstagramEntries() {
  await connectDB();
  console.log('🔍 Checking recent Instagram Enquiries, Leads & Contacts in MongoDB...\n');

  const enquiries = await Enquiry.find({ source: { $regex: /instagram/i } }).sort({ created_at: -1 }).limit(10);
  console.log(`--- Instagram Enquiries (Top 10) ---`);
  enquiries.forEach(e => {
    console.log(`- ID: ${e._id || e.id} | Name: ${e.contactName} | Handle/Phone: ${e.phone} | Status: ${e.status} | Source: ${e.source}`);
    console.log(`  Message: ${e.lastMessage}`);
    console.log(`  Created: ${e.created_at}\n`);
  });

  const leads = await Lead.find({ source: { $regex: /instagram/i } }).sort({ created_at: -1 }).limit(10);
  console.log(`--- Instagram Leads (Top 10) ---`);
  leads.forEach(l => {
    console.log(`- ID: ${l._id || l.id} | Name: ${l.contactName} | Handle/Phone: ${l.phone} | Status: ${l.status} | Source: ${l.source}`);
    console.log(`  Created: ${l.created_at}\n`);
  });

  const contacts = await Contact.find({ type: { $regex: /instagram/i } }).sort({ created_at: -1 }).limit(10);
  console.log(`--- Instagram Contacts (Top 10) ---`);
  contacts.forEach(c => {
    console.log(`- ID: ${c._id || c.id} | Name: ${c.fullName} | Phone: ${c.phone} | Type: ${c.type}\n`);
  });

  // Also check whatsapp-bot contacts collection
  try {
    const botContactSchema = new mongoose.Schema({}, { strict: false });
    const BotContact = mongoose.models.BotContact || mongoose.model('BotContact', botContactSchema, 'contacts');
    const botContacts = await BotContact.find({ phone: { $regex: /^ig:/ } }).sort({ lastSeen: -1 }).limit(5);
    console.log(`--- WhatsApp Bot Contacts with ig: prefix (Top 5) ---`);
    botContacts.forEach(bc => {
      console.log(`- Name: ${bc.name} | Phone: ${bc.phone} | Messages: ${JSON.stringify(bc.messages)}`);
    });
  } catch (err) {
    console.warn('Notice:', err.message);
  }

  process.exit(0);
}

checkRecentInstagramEntries().catch(err => {
  console.error(err);
  process.exit(1);
});
