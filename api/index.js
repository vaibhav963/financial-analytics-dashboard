const { createApp } = require('../server/dist/server.js');
const { connectDB } = require('../server/dist/config/db.js');

const app = createApp();

let isConnected = false;

// Vercel Serverless Function Database Middleware
// Ensures the DB is connected on cold starts before processing any route
app.use(async (req, res, next) => {
  if (!isConnected) {
    console.log('Serverless cold start: Connecting to MongoDB...');
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error in serverless function:', err);
    }
  }
  next();
});

module.exports = app;
