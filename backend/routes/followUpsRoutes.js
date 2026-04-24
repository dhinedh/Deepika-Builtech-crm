import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all followUps
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('followUps').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all followUps', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single followUps
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('followUps').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get followUps ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new followUps
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('followUps').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new followUps', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update followUps
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('followUps').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update followUps ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE followUps
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('followUps').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete followUps ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
