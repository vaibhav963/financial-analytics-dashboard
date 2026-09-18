import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
} from '../controllers/transactionController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all transaction routes with JWT authentication
router.use(authenticateJWT);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
