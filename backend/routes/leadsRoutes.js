import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Lead } from '../config/mongodb.js';

const router = express.Router();

function getFilter(id) {
  const filter = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter.push({ _id: id });
  }
  return { $or: filter };
}

// GET all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ created_at: -1, createdAt: -1 });
    if (leads && leads.length > 0) {
      const data = leads.map(l => {
        const obj = l.toObject();
        obj.id = obj.id || obj._id.toString();
        return obj;
      });
      return res.json({ success: true, data });
    }
  } catch (error) {
    console.warn('[Leads API Warning]: MongoDB query failed, using local db.json:', error.message);
  }

  try {
    const dbPath = path.resolve('db.json');
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const fileDb = JSON.parse(raw);
      return res.json({ success: true, data: fileDb.leads || [] });
    }
  } catch (fsErr) {}
  res.json({ success: true, data: [] });
});

// GET single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne(getFilter(req.params.id));
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const data = lead.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new lead
router.post('/', async (req, res) => {
  try {
    const newLead = await Lead.create(req.body);
    const data = newLead.toObject();
    data.id = data.id || data._id.toString();
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update lead
router.put('/:id', async (req, res) => {
  try {
    const updated = await Lead.findOneAndUpdate(getFilter(req.params.id), req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    const data = updated.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    await Lead.deleteOne(getFilter(req.params.id));
    res.json({ success: true, message: `Deleted lead ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
