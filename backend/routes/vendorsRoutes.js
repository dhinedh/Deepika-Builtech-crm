import express from 'express';
import mongoose from 'mongoose';
import { Vendor } from '../config/mongodb.js';

const router = express.Router();

function getFilter(id) {
  const filter = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter.push({ _id: id });
  }
  return { $or: filter };
}

router.get('/', async (req, res) => {
  try {
    const items = await Vendor.find({}).sort({ created_at: -1 });
    const data = items.map(i => {
      const obj = i.toObject();
      obj.id = obj.id || obj._id.toString();
      return obj;
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Vendor.findOne(getFilter(req.params.id));
    if (!item) return res.status(404).json({ error: 'Vendor not found' });
    const data = item.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newItem = await Vendor.create(req.body);
    const data = newItem.toObject();
    data.id = data.id || data._id.toString();
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Vendor.findOneAndUpdate(getFilter(req.params.id), req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Vendor not found' });
    const data = updated.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Vendor.deleteOne(getFilter(req.params.id));
    res.json({ success: true, message: `Deleted vendor ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
