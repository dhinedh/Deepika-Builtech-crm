import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all auth
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('auth').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all auth', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single auth
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('auth').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get auth ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new auth
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('auth').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new auth', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update auth
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('auth').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update auth ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE auth
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('auth').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete auth ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
