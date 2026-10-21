import { parse } from 'csv-parse/sync';
import { ICrimeRecord, IPreprocessingSummary, CrimeCategory, CrimeSeverity } from '../../types';

export interface RawCrimeRow {
  case_id?: string;
  caseId?: string;
  date?: string;
  crime_category?: string;
  crimeCategory?: string;
  crime_type?: string;
  crimeType?: string;
  location?: string;
  location_name?: string;
  locationName?: string;
  district?: string;
  city?: string;
  latitude?: string | number;
  longitude?: string | number;
  hour?: string | number;
  severity?: string;
  description?: string;
}

const VALID_CATEGORIES: CrimeCategory[] = [
  'Murder',
  'Rape',
  'Kidnapping (Women & Girls)',
  'Kidnapping (Others)',
  'Dowry Deaths',
  'Molestation & Harassment',
  'Dacoity',
  'Robbery',
  'Burglary',
  'Theft',
  'Riots',
  'Cheatings',
  'Other IPC Crimes',
  'Other Crimes',
];

const VALID_SEVERITIES: CrimeSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export class DataCleanerService {
  /**
   * Preprocess CSV content string into validated, normalized crime records with detailed audit summary.
   */
  public static preprocessCSV(
    csvContent: string,
    datasetId?: string
  ): { cleanRecords: Omit<ICrimeRecord, '_id' | 'createdAt' | 'updatedAt'>[]; summary: IPreprocessingSummary } {
    let rawRows: RawCrimeRow[] = [];

    try {
      rawRows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
    } catch (error: any) {
      throw new Error(`CSV Parsing Failed: ${error.message}`);
    }

    const originalRows = rawRows.length;
    let duplicateRows = 0;
    let missingValues = 0;
    let invalidRecords = 0;

    const seenCaseIds = new Set<string>();
    const cleanRecords: Omit<ICrimeRecord, '_id' | 'createdAt' | 'updatedAt'>[] = [];
    const categoriesFoundSet = new Set<string>();
    const districtsFoundSet = new Set<string>();

    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Normalize field names
      const caseIdRaw = (row.case_id || row.caseId || `CASE-${Date.now()}-${i}`).toString().trim();
      const dateStr = (row.date || '').toString().trim();
      const rawCategory = (row.crime_category || row.crimeCategory || '').toString().trim();
      const crimeType = (row.crime_type || row.crimeType || rawCategory || 'General Offense').toString().trim();
      const locationName = (row.location || row.location_name || row.locationName || 'Unspecified').toString().trim();
      const district = (row.district || 'Central District').toString().trim();
      const city = (row.city || 'Metro City').toString().trim();
      const latRaw = row.latitude;
      const lngRaw = row.longitude;
      const hourRaw = row.hour;
      const rawSeverity = (row.severity || 'MEDIUM').toString().toUpperCase().trim();
      const description = (row.description || `Reported ${crimeType} at ${locationName}`).toString().trim();

      // Check Duplicates
      if (seenCaseIds.has(caseIdRaw)) {
        duplicateRows++;
        continue;
      }

      // Check Missing Critical Values
      if (!dateStr || !latRaw || !lngRaw) {
        missingValues++;
        continue;
      }

      // Parse Date
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        invalidRecords++;
        continue;
      }

      // Validate Lat/Lng
      const lat = typeof latRaw === 'number' ? latRaw : parseFloat(latRaw);
      const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(lngRaw);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        invalidRecords++;
        continue;
      }

      // Standardize Category
      let crimeCategory: CrimeCategory = 'Other Crimes';
      const matchedCat = VALID_CATEGORIES.find(
        (c) => c.toLowerCase() === rawCategory.toLowerCase()
      );
      if (matchedCat) {
        crimeCategory = matchedCat;
      } else {
        crimeCategory = 'Other Crimes';
      }

      // Standardize Severity
      let severity: CrimeSeverity = 'MEDIUM';
      if (VALID_SEVERITIES.includes(rawSeverity as CrimeSeverity)) {
        severity = rawSeverity as CrimeSeverity;
      }

      // Parse / Engineer Temporal Features
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1; // 1-12
      const day = parsedDate.getDate();
      const dayOfWeek = parsedDate.getDay(); // 0=Sun, 6=Sat

      let hour = parsedDate.getHours();
      if (hourRaw !== undefined && hourRaw !== '') {
        const parsedHour = typeof hourRaw === 'number' ? hourRaw : parseInt(hourRaw, 10);
        if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour <= 23) {
          hour = parsedHour;
        }
      }

      // Track min/max date
      if (!earliestDate || parsedDate < earliestDate) earliestDate = parsedDate;
      if (!latestDate || parsedDate > latestDate) latestDate = parsedDate;

      seenCaseIds.add(caseIdRaw);
      categoriesFoundSet.add(crimeCategory);
      districtsFoundSet.add(district);

      cleanRecords.push({
        caseId: caseIdRaw,
        date: parsedDate,
        year,
        month,
        day,
        dayOfWeek,
        hour,
        crimeCategory,
        crimeType,
        locationName,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        district,
        city,
        description,
        severity,
        datasetId,
      });
    }

    const cleanRows = cleanRecords.length;
    const removedRows = originalRows - cleanRows;

    const summary: IPreprocessingSummary = {
      originalRows,
      duplicateRows,
      missingValues,
      invalidRecords,
      cleanRows,
      removedRows,
      finalDatasetSize: cleanRows,
      categoriesFound: Array.from(categoriesFoundSet),
      districtsFound: Array.from(districtsFoundSet),
      dateRange: {
        start: earliestDate ? earliestDate.toISOString().split('T')[0] : 'N/A',
        end: latestDate ? latestDate.toISOString().split('T')[0] : 'N/A',
      },
    };

    return { cleanRecords, summary };
  }
}
