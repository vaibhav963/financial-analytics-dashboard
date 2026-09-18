import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// Use Google & Cloudflare DNS to reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

let mongoServerInstance: any = null;

export const connectDB = async (): Promise<string> => {
  if (env.MONGODB_URI) {
    try {
      console.log(`Connecting to MongoDB at ${env.MONGODB_URI}...`);
      await mongoose.connect(env.MONGODB_URI);
      console.log('Connected to MongoDB successfully.');
      return env.MONGODB_URI;
    } catch (err) {
      console.warn('Failed to connect to provided MONGODB_URI. Falling back to in-memory MongoDB...', err);
    }
  }

  // Graceful fallback to mongodb-memory-server for zero-friction evaluation
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServerInstance = await MongoMemoryServer.create();
    const uri = mongoServerInstance.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to in-memory MongoDB at ${uri}`);
    return uri;
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
