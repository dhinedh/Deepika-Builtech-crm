import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

async function resetAllLeads() {
  await connectDB();
  console.log('🧹 Resetting all existing leads in MongoDB Atlas...');

  const result = await Lead.updateMany(
    {},
    {
      $set: {
        isQuoteRequested: false,
        status: 'New',
        landArea: '',
        location: '',
        timeline: '',
        budgetRange: '',
        estimatedBudget: 0
      }
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} leads in MongoDB Atlas!`);
  
  // Verify 0 quote requests remain
  const count = await Lead.countDocuments({
    $or: [{ isQuoteRequested: true }, { status: 'Quotation Requested' }]
  });
  console.log(`Current Total Quote Requests in MongoDB Atlas: ${count}`);

  process.exit(0);
}

resetAllLeads().catch(err => {
  console.error(err);
  process.exit(1);
});
