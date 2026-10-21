import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, applyDataScope } from '../middleware/auth.middleware';

const router = Router();

router.get('/temporal', authenticate, applyDataScope, AnalyticsController.getTemporal);
router.get('/geographic', authenticate, applyDataScope, AnalyticsController.getGeographic);
router.get('/categories', authenticate, applyDataScope, AnalyticsController.getCategories);
router.get('/severity', authenticate, applyDataScope, AnalyticsController.getSeverity);
router.get('/hotspots', authenticate, applyDataScope, AnalyticsController.getHotspots);
router.get('/compare', authenticate, applyDataScope, AnalyticsController.compare);

export default router;
