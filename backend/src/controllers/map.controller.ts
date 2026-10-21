import { Request, Response } from 'express';
import { CrimeRecord } from '../models/CrimeRecord';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../utils/response';

export class MapController {
  public static async getMarkers(req: Request, res: Response): Promise<void> {
    try {
      const match = AnalyticsService.buildMatchQuery(req.query);
      const limit = parseInt(req.query.limit as string, 10) || 500;

      const markers = await CrimeRecord.find(match)
        .select('caseId date crimeCategory crimeType locationName latitude longitude district city severity')
        .sort({ date: -1 })
        .limit(limit)
        .lean();

      sendSuccess(res, markers, 'Map markers retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const match = AnalyticsService.buildMatchQuery(req.query);

      const records = await CrimeRecord.find(match)
        .select('latitude longitude severity')
        .limit(2000)
        .lean();

      const severityWeights: Record<string, number> = {
        LOW: 0.3,
        MEDIUM: 0.6,
        HIGH: 0.85,
        CRITICAL: 1.0,
      };

      const points = records.map((r) => [
        r.latitude,
        r.longitude,
        severityWeights[r.severity] || 0.5,
      ]);

      sendSuccess(res, points, 'Heatmap data points retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async getAreaStats(req: Request, res: Response): Promise<void> {
    try {
      const { district } = req.query;
      if (!district) {
        sendError(res, 'District query parameter is required', 400);
        return;
      }

      const match = { district: district.toString() };

      const [total, categoryAgg, severityAgg, topLocations] = await Promise.all([
        CrimeRecord.countDocuments(match),
        CrimeRecord.aggregate([
          { $match: match },
          { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        CrimeRecord.aggregate([
          { $match: match },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]),
        CrimeRecord.aggregate([
          { $match: match },
          { $group: { _id: '$locationName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

      const mostCommonCrime = categoryAgg[0]?._id || 'N/A';
      const mostCommonCrimeCount = categoryAgg[0]?.count || 0;

      sendSuccess(
        res,
        {
          district,
          totalIncidents: total,
          mostCommonCrime,
          mostCommonCrimeCount,
          categoryBreakdown: categoryAgg.map((c) => ({
            category: c._id,
            count: c.count,
            percentage: total > 0 ? Number(((c.count / total) * 100).toFixed(1)) : 0,
          })),
          severityBreakdown: severityAgg.map((s) => ({
            severity: s._id,
            count: s.count,
          })),
          topLocations: topLocations.map((l) => ({
            location: l._id,
            count: l.count,
          })),
        },
        'Area statistics retrieved'
      );
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
