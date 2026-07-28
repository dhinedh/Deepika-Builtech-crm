import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../config/mongodb.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_custom_tokens';

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      name: fullName || cleanEmail.split('@')[0],
      role: role || 'Sales'
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    userObj.id = userObj.id || userObj._id.toString();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj, session: { access_token: token } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    userObj.id = userObj.id || userObj._id.toString();
    delete userObj.password;

    res.json({ success: true, user: userObj, session: { access_token: token } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', requireAuth, (req, res) => {
  const userObj = req.user.toObject ? req.user.toObject() : req.user;
  delete userObj.password;
  res.json({ success: true, user: userObj });
});

export default router;
