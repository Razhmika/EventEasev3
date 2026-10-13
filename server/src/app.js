import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { apiLimiter } from './middleware/rateLimiter.js';
import { sendError, sendSuccess } from './utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'EventEase API is running.');
});

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Uncaught Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  return sendError(res, 'An unexpected server error occurred.', 500);
});

export default app;
