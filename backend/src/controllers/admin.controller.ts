import { Response } from 'express';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middleware/auth.middleware';
import { seedDatabase } from '../utils/seed';

export class AdminController {
  public static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      sendSuccess(res, users, 'Users retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role } = req.body;
      if (!role || !['ADMIN', 'POLICE', 'USER'].includes(role)) {
        sendError(res, 'Invalid role. Must be ADMIN, POLICE, or USER', 400);
        return;
      }

      // Prevent demoting own admin account
      if (req.user?.userId === req.params.id && role !== 'ADMIN') {
        sendError(res, 'You cannot demote your own administrator account', 400);
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      await logAudit('ADMIN_ROLE_CHANGE', 'User', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        resourceId: user._id.toString(),
        metadata: { newRole: role, targetEmail: user.email },
      });

      sendSuccess(res, user, `User role updated to ${role}`);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        sendError(res, 'isActive must be a boolean value', 400);
        return;
      }

      // Prevent deactivating own account
      if (req.user?.userId === req.params.id && !isActive) {
        sendError(res, 'You cannot deactivate your own account', 400);
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      await logAudit('ADMIN_STATUS_CHANGE', 'User', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        resourceId: user._id.toString(),
        metadata: { isActive, targetEmail: user.email },
      });

      sendSuccess(res, user, `User account ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
      sendSuccess(res, logs, 'Audit logs retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async resetDemoData(req: AuthRequest, res: Response): Promise<void> {
    try {
      await seedDatabase(true);
      await logAudit('ADMIN_RESET_DEMO', 'System', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
      });
      sendSuccess(res, null, 'Demo dataset and models reseeded successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
