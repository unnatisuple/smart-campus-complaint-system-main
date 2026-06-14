import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth';
import complaintRoutes from './routes/complaints';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaints', generalLimiter, complaintRoutes);
app.use('/api', generalLimiter, userRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/notifications', generalLimiter, notificationRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
