import { Router } from 'express';
import { MapController } from '../controllers/map.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/markers', authenticate, requireRole(['ADMIN']), MapController.getMarkers);
router.get('/heatmap', authenticate, requireRole(['ADMIN']), MapController.getHeatmap);
router.get('/area-stats', authenticate, requireRole(['ADMIN']), MapController.getAreaStats);

export default router;
