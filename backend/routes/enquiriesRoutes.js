import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all enquiries
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE enquiry
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: `Deleted enquiry ${req.params.id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
