import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contact
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new contact
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update contact
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('contacts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: `Deleted contact ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
