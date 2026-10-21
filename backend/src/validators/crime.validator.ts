import { z } from 'zod';

export const createCrimeRecordSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  date: z.string().or(z.date()),
  crimeCategory: z.enum([
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
  ]),
  crimeType: z.string().min(1, 'Crime type is required'),
  locationName: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export const crimeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  year: z.coerce.number().optional(),
  month: z.coerce.number().optional(),
  crimeCategory: z.string().optional(),
  district: z.union([z.string(), z.array(z.string())]).optional(),
  city: z.string().optional(),
  severity: z.string().optional(),
  search: z.string().optional(),
});
