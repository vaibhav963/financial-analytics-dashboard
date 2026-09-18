import rateLimit from 'express-rate-limit';

// Strict rate limiter for authentication endpoints: 10 attempts per 15-minute window
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login requests per window
  standardHeaders: 'draft-7', // draft-6 / draft-7 standard RateLimit-* headers
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test', // Allow unthrottled execution during integration tests
  message: {
    success: false,
    alert: {
      type: 'error',
      title: 'Rate Limit Exceeded',
      message: 'Too many login attempts from this IP address. Please try again in 15 minutes.',
    },
  },
});
