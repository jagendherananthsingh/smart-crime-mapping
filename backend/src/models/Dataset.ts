import mongoose, { Schema, Document } from 'mongoose';
import { IDataset } from '../types';

export interface IDatasetDocument extends Omit<IDataset, '_id'>, Document {}

const DatasetSchema = new Schema<IDatasetDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    filename: { type: String, required: true },
    recordCount: { type: Number, default: 0 },
    columns: [{ type: String }],
    uploadedBy: { type: String, default: 'System' },
    status: {
      type: String,
      enum: ['PENDING', 'PREPROCESSED', 'FAILED', 'READY'],
      default: 'PENDING',
    },
    preprocessingSummary: {
      originalRows: Number,
      duplicateRows: Number,
      missingValues: Number,
      invalidRecords: Number,
      cleanRows: Number,
      removedRows: Number,
      finalDatasetSize: Number,
      categoriesFound: [String],
      districtsFound: [String],
      dateRange: {
        start: String,
        end: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Dataset = mongoose.model<IDatasetDocument>('Dataset', DatasetSchema);
