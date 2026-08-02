import express from 'express';
import mongoose from 'mongoose';
import { Enquiry } from '../config/mongodb.js';
import { sendDirectWhatsAppText } from '../whatsappService.js';

const router = express.Router();

function getFilter(id) {
  const filter = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter.push({ _id: id });
  }
  return { $or: filter };
}

// GET all enquiries
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ created_at: -1, createdAt: -1 });
    const data = enquiries.map(e => {
      const obj = e.toObject();
      obj.id = obj.id || obj._id.toString();
      return obj;
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single enquiry
router.get('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne(getFilter(req.params.id));
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    const data = enquiry.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new enquiry
router.post('/', async (req, res) => {
  try {
    const newEnquiry = await Enquiry.create(req.body);
    const data = newEnquiry.toObject();
    data.id = data.id || data._id.toString();

    // Send WhatsApp notification alert to sales team
    const salesNumbers = (process.env.NOTIFICATION_WHATSAPP_NUMBERS || '919884487938,919791644688,918508599029,919600067611,916380855892')
      .split(',')
      .map(n => n.trim().replace(/\D/g, ''))
      .filter(Boolean);

    const now = new Date();
    const timeReceived = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const alertMsg = `🔔 *NEW ENQUIRY RECEIVED — Deepika Builtech CRM*\n━━━━━━━━━━━━━━━━━━━━━\n👤 *Client:* ${data.contactName || 'Customer'}\n📱 *Phone/Handle:* ${data.phone || 'Not specified'}\n💬 *Message:* ${data.lastMessage || 'New Enquiry'}\n🏷️ *Status:* ${data.status || 'New'}\n⏰ *Received:* ${timeReceived}\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *ACTION REQUIRED: Review & respond to client*\n🌐 *CRM Link:* https://crm.deepikabuiltech.com`;

    for (const num of salesNumbers) {
      sendDirectWhatsAppText(num, alertMsg).catch(e => console.warn(`[Sales Enquiry Alert Error] Failed sending to ${num}:`, e.message));
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update enquiry
router.put('/:id', async (req, res) => {
  try {
    const updated = await Enquiry.findOneAndUpdate(getFilter(req.params.id), req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
    const data = updated.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE enquiry
router.delete('/:id', async (req, res) => {
  try {
    await Enquiry.deleteOne(getFilter(req.params.id));
    res.json({ success: true, message: `Deleted enquiry ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
