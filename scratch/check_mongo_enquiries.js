import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function checkMongo() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB!');

  const EnquirySchema = new mongoose.Schema({
    id: String,
    contactName: String,
    phone: String,
    lastMessage: String,
    status: String,
    source: String,
    created_at: Date,
    createdAt: Date
  });

  const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
  const all = await Enquiry.find({});
  console.log(`Total enquiries in MongoDB: ${all.length}`);

  const nameCounts = {};
  all.forEach(e => {
    const name = e.contactName || 'Unknown';
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  });

  console.log('\n--- Name Frequencies in MongoDB ---');
  Object.entries(nameCounts).forEach(([name, count]) => {
    if (count > 1) {
      console.log(`⚠️ DUPLICATE [${count}x]: ${name}`);
    } else {
      console.log(`[1x]: ${name}`);
    }
  });

  await mongoose.disconnect();
}

checkMongo().catch(err => console.error('Mongo error:', err));
