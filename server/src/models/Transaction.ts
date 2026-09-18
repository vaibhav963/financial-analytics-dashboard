import mongoose, { Document, Schema, Model } from 'mongoose';
import type { ITransaction, TransactionCategory, TransactionStatus } from '../types/index.js';

export interface ITransactionDocument extends Document, Omit<ITransaction, 'id' | 'date'> {
  id: number;
  date: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Revenue', 'Expense'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    user_profile: {
      type: String,
      default: 'https://thispersondoesnotexist.com/',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        if ((ret as any).date instanceof Date) {
          (ret as any).date = (ret as any).date.toISOString();
        }
        return ret;
      },
    },
  }
);

// High-performance B-Tree compound indexes
TransactionSchema.index({ date: -1, status: 1 });
TransactionSchema.index({ category: 1, status: 1 });
TransactionSchema.index({ user_id: 1, date: -1 });
TransactionSchema.index({ amount: 1 });

export const Transaction: Model<ITransactionDocument> = mongoose.model<ITransactionDocument>(
  'Transaction',
  TransactionSchema
);
