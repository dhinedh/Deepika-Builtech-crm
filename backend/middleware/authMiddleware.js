import { supabase } from '../config/supabase.js';

// Only used for local development, e.g. `ALLOW_DEV_AUTH_BYPASS=true npm run dev`.
// Never set this in Render's production environment variables.
const ALLOW_DEV_AUTH_BYPASS = process.env.ALLOW_DEV_AUTH_BYPASS === 'true';

export const requireAuth = async (req, res, next) => {
  try {
    if (ALLOW_DEV_AUTH_BYPASS) {
      req.user = { id: 'mock-user-id', email: 'admin@deepikabuiltech.com' };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token for real with Supabase — no more hardcoded bypass.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Security] Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};