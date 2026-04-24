import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all siteVisits
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('siteVisits').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all siteVisits', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single siteVisits
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('siteVisits').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get siteVisits ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new siteVisits
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('siteVisits').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new siteVisits', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update siteVisits
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('siteVisits').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update siteVisits ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE siteVisits
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('siteVisits').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete siteVisits ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
