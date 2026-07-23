import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';
import { serializeResponses } from './utils/serialize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Core middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Map every response's numeric `id` to `_id` for frontend compatibility
app.use(serializeResponses);

// Static uploads (local storage MVP)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'GameZone BD API', time: new Date() })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
