import { Router } from 'express';
import { exportTransactionsCsv, getExportPreview } from '../controllers/exportController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect export routes with JWT authentication
router.use(authenticateJWT);

router.post('/csv', exportTransactionsCsv);
router.post('/preview', getExportPreview);

export default router;
