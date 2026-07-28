import express from 'express';
import mongoose from 'mongoose';
import { FollowUp } from '../config/mongodb.js';

const router = express.Router();

function getFilter(id) {
  const filter = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter.push({ _id: id });
  }
  return { $or: filter };
}

// GET all followups
router.get('/', async (req, res) => {
  try {
    const followUps = await FollowUp.find({}).sort({ scheduled_date: 1, created_at: -1 });
    const data = followUps.map(f => {
      const obj = f.toObject();
      obj.id = obj.id || obj._id.toString();
      return obj;
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single followup
router.get('/:id', async (req, res) => {
  try {
    const followup = await FollowUp.findOne(getFilter(req.params.id));
    if (!followup) return res.status(404).json({ error: 'FollowUp not found' });
    const data = followup.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new followup
router.post('/', async (req, res) => {
  try {
    const newFollowUp = await FollowUp.create(req.body);
    const data = newFollowUp.toObject();
    data.id = data.id || data._id.toString();
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update followup
router.put('/:id', async (req, res) => {
  try {
    const updated = await FollowUp.findOneAndUpdate(getFilter(req.params.id), req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'FollowUp not found' });
    const data = updated.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE followup
router.delete('/:id', async (req, res) => {
  try {
    await FollowUp.deleteOne(getFilter(req.params.id));
    res.json({ success: true, message: `Deleted followup ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
