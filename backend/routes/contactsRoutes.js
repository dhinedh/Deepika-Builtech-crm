import express from 'express';
import mongoose from 'mongoose';
import { Contact } from '../config/mongodb.js';

const router = express.Router();

function getFilter(id) {
  const filter = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter.push({ _id: id });
  }
  return { $or: filter };
}

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ created_at: -1, createdAt: -1 });
    const data = contacts.map(c => {
      const obj = c.toObject();
      obj.id = obj.id || obj._id.toString();
      return obj;
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOne(getFilter(req.params.id));
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    const data = contact.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new contact
router.post('/', async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);
    const data = newContact.toObject();
    data.id = data.id || data._id.toString();
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update contact
router.put('/:id', async (req, res) => {
  try {
    const updated = await Contact.findOneAndUpdate(getFilter(req.params.id), req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    const data = updated.toObject();
    data.id = data.id || data._id.toString();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    await Contact.deleteOne(getFilter(req.params.id));
    res.json({ success: true, message: `Deleted contact ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
