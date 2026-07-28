import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

async function updateAravindhini() {
  await connectDB();
  console.log('Updating Aravindhini Dinakar lead in MongoDB Atlas...');

  const updated = await Lead.findOneAndUpdate(
    { contactName: /Aravindhini/i },
    {
      contactName: 'Aravindhini Dinakar',
      phone: '+44 7448 025707',
      projectType: 'PEB Warehouse',
      landArea: '45,000 sq ft (1.5 acres)',
      location: 'Redhills, Chennai',
      timeline: '1 to 3 months',
      budgetRange: 'Above ₹1 Crore',
      status: 'Quotation Requested',
      isQuoteRequested: true,
      leadScore: 95,
      notes: 'Real Quote Request from Instagram DM: Warehouse development on 1.5 acres in Redhills, Chennai with built-up area 45,000-55,000 sq. ft. Contact: +44 7448 025707',
      updated_at: new Date()
    },
    { new: true }
  );

  console.log('✅ Aravindhini Lead updated successfully:', JSON.stringify(updated, null, 2));
  process.exit(0);
}

updateAravindhini().catch(err => {
  console.error(err);
  process.exit(1);
});
