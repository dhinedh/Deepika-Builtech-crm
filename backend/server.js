import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { supabase } from './config/supabase.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { cacheMiddleware, clearCache } from './middleware/cacheMiddleware.js';
import { startCronJobs } from './services/cronJobs.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import companiesRoutes from './routes/companiesRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import quotationsRoutes from './routes/quotationsRoutes.js';
import tasksRoutes from './routes/tasksRoutes.js';
import followUpsRoutes from './routes/followUpsRoutes.js';
import vendorsRoutes from './routes/vendorsRoutes.js';
import siteVisitsRoutes from './routes/siteVisitsRoutes.js';
import webhooksRoutes from './routes/webhooksRoutes.js';
import metaWebhookHandler from './api/webhooks/meta.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Automated Background Tasks (Cron Jobs)
startCronJobs();

// ================= SECURITY & SPEED MIDDLEWARES ================= //

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use(express.json({ limit: '10mb' }));

// Apply Cache Middleware to vastly speed up repetitive GET requests
app.use('/api/', cacheMiddleware);
app.use('/api/', clearCache);

// ================================================================= //

// Public Routes
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is running securely and connected!', status: 'success' });
});
app.use('/api/auth', authRoutes);

// Social Media Lead Integrations (Verified via Meta Graph API)
app.all('/api/webhooks/meta', metaWebhookHandler);
app.use('/api/webhooks', webhooksRoutes);

// Protected Routes (Requires valid Supabase JWT)
app.use('/api/leads', requireAuth, leadsRoutes);
app.use('/api/contacts', requireAuth, contactsRoutes);
app.use('/api/companies', requireAuth, companiesRoutes);
app.use('/api/projects', requireAuth, projectsRoutes);
app.use('/api/quotations', requireAuth, quotationsRoutes);
app.use('/api/tasks', requireAuth, tasksRoutes);
app.use('/api/followups', requireAuth, followUpsRoutes);
app.use('/api/vendors', requireAuth, vendorsRoutes);
app.use('/api/sitevisits', requireAuth, siteVisitsRoutes);

// Global Error Handler: Prevents leaking sensitive stack traces to the client
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

app.listen(port, () => {
  console.log(`Secure Backend server listening on port ${port}`);
});
