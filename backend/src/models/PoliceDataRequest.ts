import mongoose, { Schema, Document } from 'mongoose';
import { IPoliceDataRequest } from '../types';

export interface IPoliceDataRequestDocument extends Omit<IPoliceDataRequest, '_id'>, Document {}

const PoliceDataRequestSchema = new Schema<IPoliceDataRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    userEmail: { type: String, trim: true, lowercase: true },
    officerName: { type: String, required: true, trim: true },
    badgeNumber: { type: String, required: true, trim: true, index: true },
    rank: { type: String, required: true, trim: true },
    policeStation: { type: String, required: true, trim: true },
    districts: [{ type: String, required: true, trim: true, index: true }],
    contactPhone: { type: String, required: true, trim: true },
    officialEmail: { type: String, trim: true, lowercase: true },
    idProofType: {
      type: String,
      enum: ['POLICE_ID_CARD', 'COURT_ORDER', 'DEPT_MEMO', 'OFFICIAL_WARRANT'],
      default: 'POLICE_ID_CARD',
      required: true,
    },
    idProofNumber: { type: String, required: true, trim: true },
    idProofAttachment: { type: String, trim: true },
    firNumber: { type: String, required: true, trim: true },
    requestedDataScope: { type: String, required: true, trim: true },
    purposeDescription: { type: String, required: true, trim: true },
    urgencyLevel: {
      type: String,
      enum: ['ROUTINE', 'HIGH_PRIORITY', 'ACTIVE_INVESTIGATION_EMERGENCY'],
      default: 'HIGH_PRIORITY',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminRemarks: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    statutoryDeclaration: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

export const PoliceDataRequest = mongoose.model<IPoliceDataRequestDocument>(
  'PoliceDataRequest',
  PoliceDataRequestSchema
);
