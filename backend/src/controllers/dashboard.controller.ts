import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  public static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const data = await AnalyticsService.getSummary(filters);
      sendSuccess(res, data, 'Dashboard summary retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const data = await AnalyticsService.getTemporalAnalysis(filters);
      sendSuccess(res, data, 'Dashboard temporal trends retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const data = await AnalyticsService.getCategoryAnalysis(filters);
      sendSuccess(res, data, 'Crime categories retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getLocations(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const data = await AnalyticsService.getGeographicAnalysis(filters);
      sendSuccess(res, data, 'Geographic location analysis retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const data = await AnalyticsService.getDynamicInsights(filters);
      sendSuccess(res, data, 'Dynamic statistical insights generated');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
