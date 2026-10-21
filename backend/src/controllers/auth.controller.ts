import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        sendError(res, 'Mail id or user with mail already exists', 400);
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || 'USER',
        isActive: true,
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await logAudit('USER_REGISTER', 'User', {
        userId: user._id.toString(),
        userEmail: user.email,
        metadata: { role: user.role },
      });

      sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        'Registration successful',
        201
      );
    } catch (error: any) {
      if (error.code === 11000 || (error.message && error.message.includes('email') && error.message.includes('unique'))) {
        sendError(res, 'Mail id or user with mail already exists', 400);
      } else {
        sendError(res, error.message, 500);
      }
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        sendError(res, 'Invalid email or password', 401);
        return;
      }

      if (!user.isActive) {
        sendError(res, 'Your account has been deactivated. Please contact an Administrator at admin@crimeanalytics.local', 403);
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        sendError(res, 'Invalid email or password', 401);
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await logAudit('USER_LOGIN', 'User', {
        userId: user._id.toString(),
        userEmail: user.email,
        metadata: { role: user.role },
      });

      sendSuccess(
        res,
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
          },
        },
        'Login successful'
      );
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const user = await User.findById(req.user.userId).select('-passwordHash');
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'Profile retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { name } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name },
        { new: true }
      ).select('-passwordHash');

      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        sendError(res, 'Incorrect current password', 400);
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();

      await logAudit('PASSWORD_CHANGE', 'User', {
        userId: user._id.toString(),
        userEmail: user.email,
      });

      sendSuccess(res, null, 'Password changed successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async logout(req: AuthRequest, res: Response): Promise<void> {
    if (req.user) {
      await logAudit('USER_LOGOUT', 'User', {
        userId: req.user.userId,
        userEmail: req.user.email,
      });
    }
    sendSuccess(res, null, 'Logged out successfully');
  }

  public static async markNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const user = await User.findById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }
      
      if (user.notifications) {
        user.notifications.forEach(n => n.read = true);
        await user.save();
      }
      
      sendSuccess(res, null, 'Notifications marked as read');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
