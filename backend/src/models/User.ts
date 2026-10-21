import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface INotification {
  _id?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  notifications?: INotification[];
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'POLICE', 'USER'], default: 'USER' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    notifications: [
      {
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUserDocument>('User', UserSchema);
