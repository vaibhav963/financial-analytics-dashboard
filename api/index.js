const { createApp } = require('../server/dist/server.js');
const { connectDB } = require('../server/dist/config/db.js');
const mongoose = require('mongoose');

const app = createApp();

// Vercel Serverless Function Database Middleware
// Ensures the DB is connected before processing any route
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('Serverless cold start: Connecting to MongoDB...');
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection error in serverless function:', err);
      return res.status(500).json({
        success: false,
        alert: {
          type: 'error',
          title: 'Database Connection Error',
          message: err.message || 'Failed to connect to MongoDB in serverless environment.',
        },
      });
    }
  }
  next();
});

module.exports = app;
