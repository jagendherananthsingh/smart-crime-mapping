import mongoose, { Schema, Document } from 'mongoose';
import { IPrediction } from '../types';

export interface IPredictionDocument extends Omit<IPrediction, '_id'>, Document {}

const PredictionSchema = new Schema<IPredictionDocument>(
  {
    modelName: { type: String, required: true },
    modelVersion: { type: String, default: '1.0' },
    inputFeatures: {
      district: { type: String, required: true },
      locationName: { type: String },
      year: { type: Number, required: true },
      month: { type: Number, required: true },
      dayOfWeek: { type: Number, required: true },
      hour: { type: Number, required: true },
      historicalCount: { type: Number, default: 0 },
    },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    probabilities: [
      {
        category: { type: String, required: true },
        probability: { type: Number, required: true },
      },
    ],
    createdBy: { type: String, default: 'Anonymous' },
  },
  {
    timestamps: true,
  }
);

export const Prediction = mongoose.model<IPredictionDocument>('Prediction', PredictionSchema);
