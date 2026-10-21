import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect entire admin router for ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.get('/logs', AdminController.getAuditLogs);
router.post('/reset-demo', AdminController.resetDemoData);

export default router;
