import { Request, Response } from 'express';
import { ReportService } from '../services/reports/report.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middleware/auth.middleware';

export class ReportController {
  public static async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = req.body || {};
      const report = await ReportService.generateAcademicReport(filters);

      await logAudit('REPORT_GENERATE', 'Report', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
      });

      sendSuccess(res, report, 'Academic crime report generated successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportService.generateAcademicReport(req.query);
      sendSuccess(res, report, 'Report retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
