import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, ReportController.getReport);
router.post('/generate', authenticate, ReportController.generate);

export default router;
