import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

async function checkEnquiries() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const EnquirySchema = new mongoose.Schema({
    contactName: String,
    phone: String,
    lastMessage: String,
    status: String,
    source: String,
    created_at: Date
  }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  const Enquiry = mongoose.model('Enquiry', EnquirySchema);
  const enquiries = await Enquiry.find().sort({ created_at: -1 }).limit(10);
  
  console.log('Recent Enquiries count:', enquiries.length);
  enquiries.forEach((e, idx) => {
    console.log(`\n[${idx + 1}] ID: ${e._id}`);
    console.log(`    Name: ${e.contactName}`);
    console.log(`    Phone: ${e.phone}`);
    console.log(`    Message: ${e.lastMessage}`);
    console.log(`    Status: ${e.status}`);
    console.log(`    Created: ${e.created_at}`);
  });

  await mongoose.disconnect();
}

checkEnquiries().catch(err => console.error(err));
