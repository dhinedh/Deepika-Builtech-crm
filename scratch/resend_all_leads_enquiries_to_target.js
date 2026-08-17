import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { sendSalesAlertTemplate, sendDirectWhatsAppText } from '../backend/whatsappService.js';

dotenv.config({ path: '../backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';
const TARGET_PHONE = process.argv[2] || '919342400879';

async function processAndResendAll() {
  const formattedTarget = TARGET_PHONE.replace(/\D/g, '');
  const finalTarget = formattedTarget.length === 10 ? `91${formattedTarget}` : formattedTarget;

  console.log(`🚀 Connecting to MongoDB to fetch recent Leads & Enquiries for +${finalTarget}...`);
  await mongoose.connect(MONGO_URI);

  const LeadSchema = new mongoose.Schema({}, { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  const EnquirySchema = new mongoose.Schema({}, { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
  const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);

  const dbLeads = await Lead.find().sort({ created_at: -1 }).limit(20);
  const dbEnquiries = await Enquiry.find().sort({ created_at: -1 }).limit(20);

  const allItems = [];

  dbLeads.forEach(l => {
    const time = l.created_at ? new Date(l.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recent';
    const details = `Project: ${l.projectType || 'PEB Warehouse'} | Area: ${l.landArea || 'N/A'} | Budget: ${l.budgetRange || 'N/A'}`;
    allItems.push({
      type: 'LEAD',
      clientName: l.contactName || 'WhatsApp Customer',
      clientPhone: l.phone || 'N/A',
      details: details,
      time: time
    });
  });

  dbEnquiries.forEach(e => {
    const time = e.created_at ? new Date(e.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recent';
    allItems.push({
      type: 'ENQUIRY',
      clientName: e.contactName || 'WhatsApp Customer',
      clientPhone: e.phone || 'N/A',
      details: e.lastMessage || 'General Enquiry',
      time: time
    });
  });

  console.log(`\nTotal items to dispatch to +${finalTarget}: ${allItems.length}\n========================================\n`);

  let countSuccess = 0;
  let countFailed = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    console.log(`[${i + 1}/${allItems.length}] Sending ${item.type}: ${item.clientName} (${item.clientPhone})...`);

    const res = await sendSalesAlertTemplate(
      finalTarget,
      item.clientName,
      item.clientPhone,
      item.details,
      item.time
    );

    if (res.success) {
      console.log(`   ✅ Successfully sent via Utility Template! (Message ID: ${res.data?.messages?.[0]?.id})`);
      countSuccess++;
    } else {
      console.log(`   ⚠️ Template dispatch failed (${res.error}), trying Direct Text fallback...`);
      const fallbackMsg = `🔔 *CRM ALERT (${item.type})*\n👤 *Client:* ${item.clientName}\n📱 *Phone:* ${item.clientPhone}\n💬 *Details:* ${item.details}\n⏰ *Time:* ${item.time}`;
      const fallbackRes = await sendDirectWhatsAppText(finalTarget, fallbackMsg);
      if (fallbackRes.success) {
        console.log(`   ✅ Successfully sent via Direct Text!`);
        countSuccess++;
      } else {
        console.log(`   ❌ Failed: ${fallbackRes.error}`);
        countFailed++;
      }
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n========================================`);
  console.log(`🎉 Finished dispatching all leads & enquiries to +${finalTarget}!`);
  console.log(`   Success: ${countSuccess} | Failed: ${countFailed}`);

  await mongoose.disconnect();
  process.exit(0);
}

processAndResendAll().catch(err => {
  console.error('Fatal error in resend script:', err);
  process.exit(1);
});
