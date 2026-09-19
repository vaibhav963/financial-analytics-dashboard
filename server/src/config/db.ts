import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// Only override DNS servers in local development if needed, NOT in production/Vercel (AWS Lambda blocks custom DNS)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {
    // Ignore in environments where setting DNS servers is restricted
  }
}

let mongoServerInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI || env.MONGODB_URI;
  if (uri) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log('Connected to MongoDB successfully.');
      return uri;
    } catch (err) {
      console.error('Failed to connect to provided MONGODB_URI:', err);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        throw err;
      }
      console.warn('Falling back to in-memory MongoDB...');
    }
  } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings.');
  }

  // Graceful fallback to mongodb-memory-server for zero-friction evaluation
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServerInstance = await MongoMemoryServer.create();
    const memUri = mongoServerInstance.getUri();
    await mongoose.connect(memUri);
    console.log(`Connected to in-memory MongoDB at ${memUri}`);
    return memUri;
  } catch (error) {
    console.error('Failed to initialize in-memory MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};
