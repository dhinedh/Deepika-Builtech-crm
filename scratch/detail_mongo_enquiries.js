import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function detailMongo() {
  await mongoose.connect(MONGO_URI);
  const EnquirySchema = new mongoose.Schema({}, { strict: false });
  const Enquiry = mongoose.model('Enquiry', EnquirySchema);
  const enquiries = await Enquiry.find({}).sort({ created_at: -1, createdAt: -1 });

  console.log('=== ALL 68 MONGO ENQUIRIES ===');
  enquiries.forEach((e, i) => {
    const name = e.contactName || e.name || 'No Name';
    const date = e.created_at || e.createdAt || e._id.getTimestamp();
    console.log(`[${i + 1}] ID: ${e._id} | Name: "${name}" | Phone: "${e.phone}" | Source: "${e.source}" | Date: ${date}`);
  });

  await mongoose.disconnect();
}

detailMongo().catch(err => console.error(err));
