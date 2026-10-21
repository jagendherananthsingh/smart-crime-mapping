import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticate, DashboardController.getSummary);
router.get('/trends', authenticate, DashboardController.getTrends);
router.get('/categories', authenticate, DashboardController.getCategories);
router.get('/locations', authenticate, DashboardController.getLocations);
router.get('/insights', authenticate, DashboardController.getInsights);

export default router;
