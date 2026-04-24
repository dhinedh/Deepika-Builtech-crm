import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all leads
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('leads').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all leads', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single leads
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get leads ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new leads
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('leads').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new leads', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update leads
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('leads').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update leads ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE leads
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete leads ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
