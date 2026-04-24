import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all companies
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('companies').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all companies', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single companies
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('companies').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get companies ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new companies
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('companies').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new companies', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update companies
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('companies').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update companies ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE companies
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('companies').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete companies ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
