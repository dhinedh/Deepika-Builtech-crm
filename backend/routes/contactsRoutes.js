import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all contacts
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('contacts').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all contacts', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contacts
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('contacts').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get contacts ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new contacts
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('contacts').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new contacts', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update contacts
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('contacts').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update contacts ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contacts
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('contacts').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete contacts ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
