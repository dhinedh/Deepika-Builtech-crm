import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all followups
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('followups').select('*, leads(*)').order('scheduled_date', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single followup
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('followups').select('*, leads(*)').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new followup
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('followups').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update followup
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('followups').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE followup
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('followups').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: `Deleted followup ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
