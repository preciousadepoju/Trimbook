import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Dashboard routes
router.get('/', authMiddleware, getDashboardData as any);

export default router;
