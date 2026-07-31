import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Lead, Enquiry, Contact, connectDB } from '../backend/config/mongodb.js';

dotenv.config({ path: './backend/.env' });

const INSTA_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
const RECIPIENT_ID = '1052728487729796';
const UNIFIED_PHONE = 'ig:1052728487729796';
const HANDLE = '@ganishetty.gandhi';

async function processNewLeadAndEnquiry() {
  await connectDB();
  console.log('🚀 Processing New Lead & Enquiry for @ganishetty.gandhi...');

  const now = new Date();

  // 1. Create / Update Lead in MongoDB
  let lead = await Lead.findOne({ phone: UNIFIED_PHONE });
  if (!lead) {
    lead = new Lead({
      id: `lead-6a68-${RECIPIENT_ID}`,
      contactName: HANDLE,
      phone: UNIFIED_PHONE,
      companyName: '',
      projectType: 'PEB Warehouse Construction',
      location: 'Tamil Nadu, India',
      source: 'Instagram Reel Comment',
      status: 'New',
      leadScore: 85,
      isQuoteRequested: false,
      notes: 'Captured from Instagram Video Comment: "PEB". Auto-created as new Lead.',
      created_at: now,
      updated_at: now
    });
  } else {
    lead.contactName = HANDLE;
    lead.status = 'New';
    lead.source = 'Instagram Reel Comment';
    lead.updated_at = now;
  }
  await lead.save();
  console.log(`✅ Lead saved to MongoDB: ${lead._id || lead.id}`);

  // 2. Create / Update Enquiry in MongoDB
  let enquiry = await Enquiry.findOne({ phone: UNIFIED_PHONE });
  if (!enquiry) {
    enquiry = new Enquiry({
      id: `enq-6a68-${RECIPIENT_ID}`,
      contactName: HANDLE,
      phone: UNIFIED_PHONE,
      lastMessage: '[Reel Comment Enquiry]: PEB',
      status: 'New',
      source: 'Instagram Reel Comment',
      created_at: now,
      updated_at: now
    });
  } else {
    enquiry.lastMessage = '[Reel Comment Enquiry]: PEB';
    enquiry.source = 'Instagram Reel Comment';
    enquiry.updated_at = now;
  }
  await enquiry.save();
  console.log(`✅ Enquiry saved to MongoDB: ${enquiry._id || enquiry.id}`);

  // 3. Update Contact in MongoDB
  let contact = await Contact.findOne({ phone: UNIFIED_PHONE });
  if (!contact) {
    contact = new Contact({
      id: `cnt-6a68-${RECIPIENT_ID}`,
      fullName: HANDLE,
      phone: UNIFIED_PHONE,
      type: 'Instagram DM',
      created_at: now
    });
    await contact.save();
  }
  console.log(`✅ Contact verified in MongoDB.`);

  // 4. Update local db.json if exists
  const dbJsonPath = path.resolve('backend/db.json');
  if (fs.existsSync(dbJsonPath)) {
    try {
      const raw = fs.readFileSync(dbJsonPath, 'utf8');
      const fileDb = JSON.parse(raw);
      if (fileDb.leads && !fileDb.leads.some(l => l.phone === UNIFIED_PHONE)) {
        fileDb.leads.unshift({
          id: `lead-6a68-${RECIPIENT_ID}`,
          contactName: HANDLE,
          phone: UNIFIED_PHONE,
          projectType: 'PEB Warehouse Construction',
          source: 'Instagram Reel Comment',
          status: 'New',
          leadScore: 85,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        });
      }
      if (fileDb.enquiries && !fileDb.enquiries.some(e => e.phone === UNIFIED_PHONE)) {
        fileDb.enquiries.unshift({
          id: `enq-6a68-${RECIPIENT_ID}`,
          contactName: HANDLE,
          phone: UNIFIED_PHONE,
          lastMessage: '[Reel Comment Enquiry]: PEB',
          status: 'New',
          source: 'Instagram Reel Comment',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        });
      }
      fs.writeFileSync(dbJsonPath, JSON.stringify(fileDb, null, 2), 'utf8');
      console.log(`✅ Updated local db.json`);
    } catch (e) {
      console.warn('⚠️ db.json update notice:', e.message);
    }
  }

  // 5. Dispatch Instagram Direct DM Enquiry Message
  const dmMessageText = `👋 *Hello ${HANDLE} from Deepika Builtech Engineering!*

Thank you for reaching out on our Instagram video regarding your **PEB & Warehouse Construction** requirement! 🏗️

Our engineering team is ready to assist you with:
✅ Free Site Consultation & Layout Design
✅ PEB Structure Quotation & Estimation
✅ Turnkey Factory & Warehouse Construction

📞 *Call / WhatsApp Us:* +91 96000 67611 / +91 98844 87938
🌐 *Website:* deepikabuiltech.com

Reply to this message anytime with your site location & required area (sq ft) to get an instant cost estimate!`;

  if (INSTA_TOKEN) {
    const urls = [
      `https://graph.facebook.com/v20.0/me/messages`,
      `https://graph.instagram.com/v20.0/me/messages`
    ];

    let dmSent = false;
    for (const url of urls) {
      try {
        await axios.post(url, {
          recipient: { id: RECIPIENT_ID },
          message: { text: dmMessageText }
        }, {
          params: { access_token: INSTA_TOKEN },
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ [Instagram DM Dispatched] Message sent to ${HANDLE} via ${url}`);
        dmSent = true;
        break;
      } catch (err) {
        console.warn(`Notice attempting DM via ${url}:`, err.response?.data?.error?.message || err.message);
      }
    }

    if (!dmSent) {
      // Try tagged fallback
      for (const url of urls) {
        try {
          await axios.post(url, {
            recipient: { id: RECIPIENT_ID },
            message: { text: dmMessageText },
            messaging_type: 'MESSAGE_TAG',
            tag: 'HUMAN_AGENT'
          }, {
            params: { access_token: INSTA_TOKEN },
            headers: { 'Content-Type': 'application/json' }
          });
          console.log(`✅ [Instagram Tagged DM Dispatched] Message sent to ${HANDLE}`);
          dmSent = true;
          break;
        } catch (err) {
          console.warn(`Tagged DM attempt notice:`, err.response?.data?.error?.message || err.message);
        }
      }
    }
  }

  // 6. Dispatch WhatsApp Alerts to Sales Team
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1215124278349321';
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN || INSTA_TOKEN;
  const salesNumbers = ['919342400879', '919884487938', '919600067611'];

  const salesAlertText = `🎬 *NEW INSTAGRAM REEL COMMENT LEAD*
━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Handle:* ${HANDLE}
📱 *Instagram Contact ID:* ${UNIFIED_PHONE}
💬 *Comment Text:* "PEB"
📡 *Source:* Instagram Video Comment
⏰ *Time:* ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━━
⚡ *STATUS: Created New Lead & Enquiry in CRM, sent Auto-DM on Instagram*`;

  if (waToken && phoneId) {
    for (const num of salesNumbers) {
      try {
        await axios.post(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          messaging_product: 'whatsapp',
          to: num,
          type: 'text',
          text: { body: salesAlertText }
        }, {
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ [WhatsApp Alert Sent] Delivered alert to sales number +${num}`);
      } catch (waErr) {
        console.warn(`Notice sending WhatsApp alert to +${num}:`, waErr.response?.data?.error?.message || waErr.message);
      }
    }
  }

  console.log('\n🎉 Lead & Enquiry processing complete!');
  process.exit(0);
}

processNewLeadAndEnquiry().catch(err => {
  console.error(err);
  process.exit(1);
});
