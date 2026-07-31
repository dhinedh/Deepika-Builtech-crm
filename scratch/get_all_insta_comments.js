import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function fetchAllComments() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const db = mongoose.connection.db;

  // 1. Check contacts collection for messages containing 'Comment' or 'Instagram'
  const contacts = await db.collection('contacts').find({}).toArray();
  console.log(`\n=== Total Contacts in DB: ${contacts.length} ===`);
  
  let foundComment = false;

  contacts.forEach(c => {
    if (c.messages && Array.isArray(c.messages)) {
      c.messages.forEach(m => {
        if (m.text && (m.text.toLowerCase().includes('comment') || m.text.toLowerCase().includes('reel') || m.text.toLowerCase().includes('insta'))) {
          console.log(`💬 Found Comment in Contact [${c.name || c.fullName || c.phone}]:`);
          console.log(`   User: ${c.name} | Phone/Handle: ${c.phone}`);
          console.log(`   Comment Text: ${m.text}`);
          console.log(`   Time: ${m.time || c.lastSeen}\n`);
          foundComment = true;
        }
      });
    }
  });

  // 2. Check enquiries collection
  const enquiries = await db.collection('enquiries').find({}).toArray();
  console.log(`\n=== Total Enquiries in DB: ${enquiries.length} ===`);
  enquiries.forEach(e => {
    if (e.source?.toLowerCase().includes('instagram') || e.source?.toLowerCase().includes('comment') || e.lastMessage?.toLowerCase().includes('comment')) {
      console.log(`📩 Instagram Enquiry:`);
      console.log(`   Name: ${e.contactName}`);
      console.log(`   Handle/Phone: ${e.phone}`);
      console.log(`   Source: ${e.source}`);
      console.log(`   Message: ${e.lastMessage}`);
      console.log(`   Created: ${e.created_at || e.createdAt}\n`);
      foundComment = true;
    }
  });

  // 3. Check db.json
  const dbJsonPath = path.resolve('backend/db.json');
  if (fs.existsSync(dbJsonPath)) {
    const raw = fs.readFileSync(dbJsonPath, 'utf8');
    const data = JSON.parse(raw);
    console.log(`\n=== Checking db.json ===`);
    if (data.enquiries) {
      data.enquiries.forEach(e => {
        if (e.source?.toLowerCase().includes('comment') || e.lastMessage?.toLowerCase().includes('comment')) {
          console.log(`📄 db.json Enquiry: ${e.contactName} (${e.phone}) -> ${e.lastMessage}`);
        }
      });
    }
  }

  process.exit(0);
}

fetchAllComments().catch(err => {
  console.error(err);
  process.exit(1);
});
