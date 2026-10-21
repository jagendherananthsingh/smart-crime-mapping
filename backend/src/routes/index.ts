import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import crimeRoutes from './crime.routes';
import analyticsRoutes from './analytics.routes';
import mapRoutes from './map.routes';
import datasetRoutes from './dataset.routes';
import mlRoutes from './ml.routes';
import reportRoutes from './report.routes';
import adminRoutes from './admin.routes';
import dataRequestRoutes from './dataRequest.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/crimes', crimeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/map', mapRoutes);
router.use('/datasets', datasetRoutes);
router.use('/ml', mlRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/data-requests', dataRequestRoutes);

export default router;
