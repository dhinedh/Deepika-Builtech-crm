import jwt from 'jsonwebtoken';
import { User } from '../config/mongodb.js';

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
    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_custom_tokens';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    let user = await User.findById(decoded.id);
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email });
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Security] Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};