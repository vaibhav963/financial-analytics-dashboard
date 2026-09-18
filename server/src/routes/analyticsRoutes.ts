import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analyticsController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect analytics routes with JWT authentication
router.use(authenticateJWT);

router.get('/summary', getAnalyticsSummary);

export default router;
