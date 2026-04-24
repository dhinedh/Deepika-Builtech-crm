import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('projects').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all projects', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single projects
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('projects').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get projects ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new projects
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('projects').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new projects', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update projects
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('projects').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update projects ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE projects
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete projects ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
