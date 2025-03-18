import mongoose, { Schema, models, model } from 'mongoose';

export interface IncomeCategory {
  name: string;
  userId: string;
}

export interface Income {
  amount: number;
  category: string;
  note?: string;
  date: Date;
  userId: string;
}

const incomeCategorySchema = new Schema<IncomeCategory>({
  name: { type: String, required: true },
  userId: { type: String, required: true },
}, { timestamps: true });

const incomeSchema = new Schema<Income>({
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    required: true
  },
  note: { type: String, required: false },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const IncomeCategory = models.IncomeCategory || model<IncomeCategory>('IncomeCategory', incomeCategorySchema);
export const Income = models.Income || model<Income>('Income', incomeSchema); 