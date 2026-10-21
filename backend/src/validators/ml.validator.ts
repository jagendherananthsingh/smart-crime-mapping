import { z } from 'zod';

export const trainModelSchema = z.object({
  modelName: z.enum(['Random Forest', 'Decision Tree', 'Logistic Regression']).default('Random Forest'),
  datasetId: z.string().optional(),
  testSplitRatio: z.number().min(0.1).max(0.4).default(0.2),
  features: z.array(z.string()).optional(),
});

export const predictCrimeSchema = z.object({
  district: z.string().min(1, 'District is required'),
  locationName: z.string().optional(),
  year: z.coerce.number().min(2000).max(2050),
  month: z.coerce.number().min(1).max(12),
  dayOfWeek: z.coerce.number().min(0).max(6),
  hour: z.coerce.number().min(0).max(23),
  historicalCount: z.coerce.number().optional().default(0),
  modelName: z.enum(['Random Forest', 'Decision Tree', 'Logistic Regression']).default('Random Forest'),
});
