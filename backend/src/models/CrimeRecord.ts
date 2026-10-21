import mongoose, { Schema, Document } from 'mongoose';
import { ICrimeRecord } from '../types';

export interface ICrimeRecordDocument extends Omit<ICrimeRecord, '_id'>, Document {}

const CrimeRecordSchema = new Schema<ICrimeRecordDocument>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    date: { type: Date, required: true, index: true },
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    day: { type: Number, required: true },
    dayOfWeek: { type: Number, required: true, index: true },
    hour: { type: Number, required: true, index: true },
    crimeCategory: {
      type: String,
      required: true,
      enum: [
        'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
        'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
        'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes',
      ],
      index: true,
    },
    crimeType: { type: String, required: true },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    district: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics and spatial-temporal queries
CrimeRecordSchema.index({ latitude: 1, longitude: 1 });
CrimeRecordSchema.index({ district: 1, crimeCategory: 1 });
CrimeRecordSchema.index({ year: 1, month: 1, crimeCategory: 1 });
CrimeRecordSchema.index({ city: 1, severity: 1 });

export const CrimeRecord = mongoose.model<ICrimeRecordDocument>('CrimeRecord', CrimeRecordSchema);
