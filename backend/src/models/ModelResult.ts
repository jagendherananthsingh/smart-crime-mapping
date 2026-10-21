import mongoose, { Schema, Document } from 'mongoose';
import { IModelResult } from '../types';

export interface IModelResultDocument extends Omit<IModelResult, '_id'>, Document {}

const ModelResultSchema = new Schema<IModelResultDocument>(
  {
    modelName: {
      type: String,
      required: true,
      enum: ['Random Forest', 'Decision Tree', 'Logistic Regression'],
      index: true,
    },
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset' },
    accuracy: { type: Number, required: true },
    precision: { type: Number, required: true },
    recall: { type: Number, required: true },
    f1Score: { type: Number, required: true },
    confusionMatrix: {
      labels: [{ type: String }],
      matrix: [[{ type: Number }]],
    },
    featureImportance: [
      {
        feature: { type: String, required: true },
        importance: { type: Number, required: true },
      },
    ],
    trainingTimeMs: { type: Number, required: true },
    testSetSize: { type: Number, required: true },
    trainSetSize: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const ModelResult = mongoose.model<IModelResultDocument>('ModelResult', ModelResultSchema);
