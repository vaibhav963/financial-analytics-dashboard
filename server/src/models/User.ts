import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser, UserRole } from '../types/index.js';

export interface IUserDocument extends Document, Omit<IUser, 'id'> {
  password?: string;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['analyst', 'admin'],
      default: 'analyst',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Financial Planning & Analysis',
      trim: true,
    },
    title: {
      type: String,
      default: 'Financial Analyst',
      trim: true,
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'America/New_York (UTC-5)',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    bio: {
      type: String,
      default: 'Financial data analysis and risk clearance operations.',
    },
    notifications: {
      emailDigest: { type: Boolean, default: true },
      highValueAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
    },
    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).password;
        delete (ret as any).refreshToken;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);
