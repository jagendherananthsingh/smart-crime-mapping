import { Request, Response } from 'express';
import { DataRequestService } from '../services/dataRequest.service';
import { sendSuccess, sendError } from '../utils/response';

export class DataRequestController {
  /**
   * Submit new official police data request
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      // Allow both authenticated and public requests
      const userId = user ? (user.userId || user.id || user._id) : undefined;
      const userEmail = user ? user.email : undefined;

      const request = await DataRequestService.createRequest(
        userId,
        userEmail,
        req.body
      );

      sendSuccess(res, request, 'Official Law Enforcement Requisition submitted successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get requests submitted by current authenticated user
   */
  public static async getMyRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      const userId = user.userId || user.id || user._id;
      const requests = await DataRequestService.getMyRequests(userId);
      sendSuccess(res, requests, 'User requisitions retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get all requests (Admin Only)
   */
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, district, urgency, search } = req.query;
      const requests = await DataRequestService.getAllRequests({
        status: status?.toString(),
        district: district?.toString(),
        urgency: urgency?.toString(),
        search: search?.toString(),
      });

      sendSuccess(res, requests, 'All official data requisitions retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get single request detail
   */
  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request = await DataRequestService.getRequestById(id);
      if (!request) {
        sendError(res, 'Requisition not found', 404);
        return;
      }
      sendSuccess(res, request, 'Requisition details retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  /**
   * Review (Approve/Reject) a request (Admin Only)
   */
  public static async review(req: Request, res: Response): Promise<void> {
    try {
      const admin = (req as any).user;
      const { id } = req.params;
      const { status, adminRemarks, grantPoliceRole } = req.body;

      if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        sendError(res, 'Valid decision status (APPROVED or REJECTED) is required', 400);
        return;
      }

      const adminId = admin.userId || admin.id || admin._id;
      const updated = await DataRequestService.reviewRequest(
        id,
        adminId,
        admin.email,
        {
          status,
          adminRemarks,
          grantPoliceRole,
        }
      );

      sendSuccess(res, updated, `Requisition ${status.toLowerCase()} successfully`);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get summary counts (Admin Only)
   */
  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await DataRequestService.getStats();
      sendSuccess(res, stats, 'Requisition statistics retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
