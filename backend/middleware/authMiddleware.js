import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV === 'development') {
        req.user = { id: 'mock-user-id', email: 'admin@deepika.com' };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (token === 'mock-token' && process.env.NODE_ENV === 'development') {
      req.user = { id: 'mock-user-id', email: 'admin@deepika.com' };
      return next();
    }
    
    // Verify the JWT token securely with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (process.env.NODE_ENV === 'development') {
        req.user = { id: 'mock-user-id', email: 'admin@deepika.com' };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Attach user payload to the request for downstream use
    req.user = user;
    next();
  } catch (err) {
    console.error('[Security] Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
