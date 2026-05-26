import express from 'express';
import { sendWhatsAppMessage } from '../whatsappService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected endpoint to send WhatsApp Template messages
router.post('/send', requireAuth, async (req, res) => {
  const { phone, templateId, parameters } = req.body;

  if (!phone || !templateId) {
    return res.status(400).json({ error: 'Missing phone number or template ID' });
  }

  try {
    const params = Array.isArray(parameters) ? parameters : [];
    const result = await sendWhatsAppMessage(phone, templateId, params);

    if (result.success) {
      res.status(200).json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('[WhatsApp Send Error]:', err);
    res.status(500).json({ error: err.message || 'Internal server error while sending WhatsApp message' });
  }
});

export default router;
