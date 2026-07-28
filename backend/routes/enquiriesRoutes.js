import express from 'express';
import mongoose from 'mongoose';
import { Enquiry } from '../config/mongodb.js';

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
