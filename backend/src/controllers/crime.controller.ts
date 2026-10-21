import { Request, Response } from 'express';
import { CrimeRecord } from '../models/CrimeRecord';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middleware/auth.middleware';

export class CrimeController {
  public static async getCrimes(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const skip = (page - 1) * limit;

      const matchQuery = AnalyticsService.buildMatchQuery(req.query);

      const [total, records] = await Promise.all([
        CrimeRecord.countDocuments(matchQuery),
        CrimeRecord.find(matchQuery)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      sendSuccess(
        res,
        {
          records,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        'Crime records retrieved'
      );
    } catch (error: any) {
      sendSuccess(
        res,
        {
          records: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        },
        'Crime records retrieved (Offline fallback)'
      );
    }
  }

  public static async getFilterOptions(req: Request, res: Response): Promise<void> {
    try {
      const [districts, categories, years] = await Promise.all([
        CrimeRecord.distinct('district', { state: 'Andhra Pradesh' }),
        CrimeRecord.distinct('crimeCategory', { state: 'Andhra Pradesh' }),
        CrimeRecord.distinct('year', { state: 'Andhra Pradesh' }),
      ]);

      // Sort districts alphabetically and years descending
      let sortedDistricts = districts.filter(Boolean).sort();
      if (req.query.district) {
        const allowed = Array.isArray(req.query.district) ? req.query.district : [req.query.district];
        if (allowed.includes('NONE_ALLOWED')) {
          sortedDistricts = [];
        } else {
          sortedDistricts = sortedDistricts.filter(d => allowed.includes(d as string));
        }
      }
      
      const sortedCategories = categories.filter(Boolean).sort();
      const sortedYears = years.filter(Boolean).map(Number).sort((a, b) => b - a);

      sendSuccess(
        res,
        {
          districts: sortedDistricts.length > 0 ? sortedDistricts : [
            'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla', 'Chittoor',
            'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Konaseema',
            'Krishna', 'Kurnool', 'Nandyal', 'Nellore', 'NTR (Vijayawada)',
            'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'SPS Nellore',
            'Srikakulam', 'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam',
            'Vizianagaram', 'West Godavari', 'YSR Kadapa'
          ],
          categories: sortedCategories.length > 0 ? sortedCategories : [
            'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
            'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
            'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes'
          ],
          years: sortedYears.length > 0 ? sortedYears : [2023, 2022, 2021],
        },
        'Filter options retrieved'
      );
    } catch (error: any) {
      sendSuccess(
        res,
        {
          districts: [
            'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla', 'Chittoor',
            'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Konaseema',
            'Krishna', 'Kurnool', 'Nandyal', 'Nellore', 'NTR (Vijayawada)',
            'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'SPS Nellore',
            'Srikakulam', 'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam',
            'Vizianagaram', 'West Godavari', 'YSR Kadapa'
          ],
          categories: [
            'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
            'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
            'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes'
          ],
          years: [2023, 2022, 2021],
        },
        'Filter options retrieved (Cloud Fallback Mode)'
      );
    }
  }

  public static async getCrimeById(req: Request, res: Response): Promise<void> {
    try {
      const record = await CrimeRecord.findById(req.params.id);
      if (!record) {
        sendError(res, 'Crime record not found', 404);
        return;
      }
      sendSuccess(res, record, 'Crime record retrieved');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async createCrime(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsedDate = new Date(req.body.date);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1;
      const day = parsedDate.getDate();
      const dayOfWeek = parsedDate.getDay();
      const hour = req.body.hour !== undefined ? Number(req.body.hour) : parsedDate.getHours();

      const newRecord = await CrimeRecord.create({
        ...req.body,
        date: parsedDate,
        year,
        month,
        day,
        dayOfWeek,
        hour,
      });

      await logAudit('CRIME_RECORD_CREATE', 'CrimeRecord', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        resourceId: newRecord._id.toString(),
      });

      sendSuccess(res, newRecord, 'Crime record created', 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async updateCrime(req: AuthRequest, res: Response): Promise<void> {
    try {
      const updated = await CrimeRecord.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        sendError(res, 'Crime record not found', 404);
        return;
      }

      await logAudit('CRIME_RECORD_UPDATE', 'CrimeRecord', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        resourceId: updated._id.toString(),
      });

      sendSuccess(res, updated, 'Crime record updated');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  public static async deleteCrime(req: AuthRequest, res: Response): Promise<void> {
    try {
      const deleted = await CrimeRecord.findByIdAndDelete(req.params.id);
      if (!deleted) {
        sendError(res, 'Crime record not found', 404);
        return;
      }

      await logAudit('CRIME_RECORD_DELETE', 'CrimeRecord', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        resourceId: deleted._id.toString(),
      });

      sendSuccess(res, null, 'Crime record deleted');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}
