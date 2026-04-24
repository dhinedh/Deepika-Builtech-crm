import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all quotations
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('quotations').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all quotations', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single quotations
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('quotations').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get quotations ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new quotations
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('quotations').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new quotations', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update quotations
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('quotations').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update quotations ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE quotations
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('quotations').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete quotations ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
