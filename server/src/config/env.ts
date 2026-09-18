import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional(),
  // Note: Default secrets are provided for local development and demo evaluation convenience only.
  // In production, always supply secure keys via environment variables (JWT_SECRET / JWT_REFRESH_SECRET).
  JWT_SECRET: z.string().default('financial_analytics_secret_key_access_2026'),
  JWT_REFRESH_SECRET: z.string().default('financial_analytics_secret_key_refresh_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
