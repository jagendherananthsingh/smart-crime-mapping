import { Router } from 'express';
import { DataRequestController } from '../controllers/dataRequest.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Submit new requisition (Public or Authenticated)
router.post('/', DataRequestController.create);

// Get my requisitions (Any authenticated user)
router.get('/my', authenticate, DataRequestController.getMyRequests);

// Admin Only Routes
router.get('/stats', authenticate, requireRole(['ADMIN']), DataRequestController.getStats);
router.get('/', authenticate, requireRole(['ADMIN']), DataRequestController.getAll);
router.get('/:id', authenticate, DataRequestController.getById);
router.patch('/:id/review', authenticate, requireRole(['ADMIN']), DataRequestController.review);

export default router;
