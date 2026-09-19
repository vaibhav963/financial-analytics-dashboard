import { createApp } from '../server/src/server.js';
import { connectDB } from '../server/src/config/db.js';
import type { Request, Response, NextFunction } from 'express';

// Initialize the Express app
const app = createApp();

let isConnected = false;

// Vercel Serverless Function Database Middleware
// Ensures the DB is connected on cold starts before processing any route
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!isConnected) {
    console.log('Serverless cold start: Connecting to MongoDB...');
    await connectDB();
    isConnected = true;
  }
  next();
});

// Export the app for Vercel's Serverless Function Node builder
export default app;
