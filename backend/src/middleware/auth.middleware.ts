import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { UserRole } from '../types';
import { User } from '../models/User';
import { PoliceDataRequest } from '../models/PoliceDataRequest';

export interface AuthRequest extends Request {
  user?: TokenPayload & { name?: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user is still active in database
    const user = await User.findById(decoded.userId).select('name isActive role');
    if (!user || !user.isActive) {
      sendError(res, 'User account is inactive or not found', 401);
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role as UserRole,
      name: user.name,
    };

    next();
  } catch (err: any) {
    sendError(res, 'Invalid or expired authentication token', 401);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};

export const applyDataScope = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role === 'POLICE') {
      const requests = await PoliceDataRequest.find({ userId: req.user.userId, status: 'APPROVED' });
      const allowedDistricts = new Set<string>();
      requests.forEach(r => {
        if (Array.isArray(r.districts)) {
          r.districts.forEach(d => allowedDistricts.add(d));
        }
        if ((r as any).district && typeof (r as any).district === 'string') {
          allowedDistricts.add((r as any).district);
        }
      });
      
      const allowedArray = Array.from(allowedDistricts);
      
      if (req.query.district && req.query.district !== 'ALL') {
        const requested = Array.isArray(req.query.district) ? req.query.district : [req.query.district];
        const valid = requested.filter(d => allowedDistricts.has(d as string));
        req.query.district = valid.length > 0 ? valid : ['NONE_ALLOWED'];
      } else {
        req.query.district = allowedArray.length > 0 ? allowedArray : ['NONE_ALLOWED'];
      }
    }
    next();
  } catch (error) {
    sendError(res, 'Failed to apply data scope', 500);
  }
};
