import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  public static async getTemporal(req: Request, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getTemporalAnalysis(req.query);
      sendSuccess(res, data, 'Temporal analytics retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getGeographic(req: Request, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getGeographicAnalysis(req.query);
      sendSuccess(res, data, 'Geographic analytics retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getCategoryAnalysis(req.query);
      sendSuccess(res, data, 'Crime category analytics retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getSeverity(req: Request, res: Response): Promise<void> {
    try {
      const summary = await AnalyticsService.getSummary(req.query);
      sendSuccess(res, summary.severityBreakdown, 'Severity analytics retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getHotspots(req: Request, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getHotspotsAnalysis(req.query);
      sendSuccess(res, data, 'Hotspot risk density index retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async compare(req: Request, res: Response): Promise<void> {
    try {
      const { districtA, districtB, year } = req.query;
      if (!districtA || !districtB) {
        sendError(res, 'Both districtA and districtB query parameters are required', 400);
        return;
      }
      const data = await AnalyticsService.compareDistricts(
        districtA.toString(),
        districtB.toString(),
        year ? Number(year) : undefined
      );
      sendSuccess(res, data, 'Comparative district benchmark analysis generated');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
