import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Lead, Enquiry, Contact, FollowUp, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

const targetIds = [
  '6a68980c4d381061cf2ac3be',
  '6a6893688c6475bf27a8144d',
  '6a68875ec7011608280e70c4'
];

const targetPhones = [
  '+91 98765 43210',
  '919876543210',
  '9876543210',
  '@1385606270165818',
  '1385606270165818',
  '+91 98765 12345',
  '919876512345',
  '9876512345'
];

const targetNames = ['Rajesh', 'Zech', 'dhanush'];

async function removeTargetLeads() {
  await connectDB();
  console.log('🗑️ Removing specified leads/enquiries/contacts from MongoDB...');

  const objectIds = targetIds.map(id => {
    try { return new mongoose.Types.ObjectId(id); } catch(e) { return null; }
  }).filter(Boolean);

  const query = {
    $or: [
      { _id: { $in: objectIds } },
      { id: { $in: targetIds.flatMap(id => [id, `lead-${id}`, `enq-${id}`, `fol-${id}`]) } },
      { phone: { $in: targetPhones } },
      { contactName: { $in: targetNames } }
    ]
  };

  // 1. Remove from Lead
  const deletedLeads = await Lead.deleteMany(query);
  console.log(`Deleted ${deletedLeads.deletedCount} leads from MongoDB.`);

  // 2. Remove from Enquiry
  const deletedEnquiries = await Enquiry.deleteMany(query);
  console.log(`Deleted ${deletedEnquiries.deletedCount} enquiries from MongoDB.`);

  // 3. Remove from Contact
  const deletedContacts = await Contact.deleteMany({
    $or: [
      { _id: { $in: objectIds } },
      { id: { $in: targetIds } },
      { phone: { $in: targetPhones } },
      { fullName: { $in: targetNames } }
    ]
  });
  console.log(`Deleted ${deletedContacts.deletedCount} contacts from MongoDB.`);

  // 4. Remove from FollowUp
  const deletedFollowUps = await FollowUp.deleteMany({
    $or: [
      { _id: { $in: objectIds } },
      { id: { $in: targetIds } },
      { lead_id: { $in: targetIds.flatMap(id => [id, `lead-${id}`, `enq-${id}`]) } }
    ]
  });
  console.log(`Deleted ${deletedFollowUps.deletedCount} follow-ups from MongoDB.`);

  // 5. Remove from db.json if present
  const dbPath = path.resolve('backend/db.json');
  const rootDbPath = path.resolve('db.json');
  for (const filePath of [dbPath, rootDbPath]) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const dbData = JSON.parse(fileContent);
        let modified = false;

        for (const key of ['leads', 'enquiries', 'contacts', 'followups']) {
          if (Array.isArray(dbData[key])) {
            const initialLen = dbData[key].length;
            dbData[key] = dbData[key].filter(item => {
              const itemHexId = item._id || item.id || '';
              const matchId = targetIds.some(tid => itemHexId.includes(tid));
              const matchPhone = targetPhones.includes(item.phone);
              const matchName = targetNames.includes(item.contactName || item.fullName);
              return !(matchId || matchPhone || matchName);
            });
            if (dbData[key].length !== initialLen) {
              modified = true;
              console.log(`Removed ${initialLen - dbData[key].length} entries from ${key} in ${filePath}`);
            }
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, JSON.stringify(dbData, null, 2), 'utf8');
          console.log(`✅ Updated file ${filePath}`);
        }
      } catch (err) {
        console.warn(`Could not process ${filePath}:`, err.message);
      }
    }
  }

  // Also check whatsapp-bot Contact model if connected
  try {
    const botContactSchema = new mongoose.Schema({}, { strict: false });
    const BotContact = mongoose.models.BotContact || mongoose.model('BotContact', botContactSchema, 'contacts');
    const delBot = await BotContact.deleteMany({
      $or: [
        { phone: { $in: targetPhones } },
        { name: { $in: targetNames } }
      ]
    });
    console.log(`Deleted ${delBot.deletedCount} items from whatsapp-bot contacts collection.`);
  } catch (err) {
    console.warn('bot contact delete notice:', err.message);
  }

  console.log('🎉 Removal complete!');
  process.exit(0);
}

removeTargetLeads().catch(err => {
  console.error(err);
  process.exit(1);
});
