import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seed.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

export const createApp = () => {
  const app = express();

  // Security & parsing middlewares
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database connection check middleware (handles cold starts in serverless)
  app.use(async (_req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      try {
        await connectDB();
      } catch (err: any) {
        console.error('Database connection error:', err);
        return res.status(500).json({
          success: false,
          alert: {
            type: 'error',
            title: 'Database Connection Error',
            message: err.message || 'Failed to connect to MongoDB',
          },
        });
      }
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'Financial Analytics API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dbConnected: mongoose.connection.readyState === 1,
      hasMongoUri: Boolean(process.env.MONGODB_URI || env.MONGODB_URI),
      nodeEnv: process.env.NODE_ENV,
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/export', exportRoutes);

  // 404 handler for unmatched routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      alert: {
        type: 'error',
        title: 'Endpoint Not Found',
        message: 'The requested API route does not exist.',
      },
    });
  });

  // Centralized Error Middleware
  app.use(errorHandler);

  return app;
};

// Start server if run as main and not in Vercel Serverless environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();

      const app = createApp();
      const PORT = Number(env.PORT) || 5001;

      app.listen(PORT, () => {
        console.log(`Financial Analytics Server running on http://localhost:${PORT}`);
        console.log(`Health check available at http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error('Failed to start application server:', error);
      process.exit(1);
    }
  })();
}

// Trigger restart
