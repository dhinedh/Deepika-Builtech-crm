import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('tasks').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all tasks', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single tasks
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('tasks').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: `Get tasks ${req.params.id}`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new tasks
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('tasks').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new tasks', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update tasks
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('tasks').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: `Update tasks ${req.params.id}`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tasks
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: `Delete tasks ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
