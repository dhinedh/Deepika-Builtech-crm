import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all vendors
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('vendors').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all vendors', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single vendors
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('vendors').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get vendors ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new vendors
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('vendors').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new vendors', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update vendors
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('vendors').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update vendors ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE vendors
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('vendors').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete vendors ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
