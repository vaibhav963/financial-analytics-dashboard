import { Router } from 'express';
import {
  login,
  refreshSession,
  logout,
  getCurrentUser,
  updateProfile,
  loginSchema,
} from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema, 'body'), login);
router.post('/refresh', refreshSession);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
