import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Clinic Appointment Management System API is running',
    version: '1.0.0',
    databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
    documentation: {
      auth: '/api/auth',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      admin: '/api/admin'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    databaseState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Middleware: Check Database readiness for /api requests (except health check)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState === 0) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently disconnected. Please verify MongoDB Atlas network access (IP 0.0.0.0/0) and credentials in server/.env'
    });
  }
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
