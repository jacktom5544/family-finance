import mongoose, { Schema, models, model } from 'mongoose';

export interface ExpenseCategory {
  name: string;
  userId: string;
}

export interface Expense {
  amount: number;
  category: string;
  note?: string;
  imageUrl?: string;
  date: Date;
  userId: string;
}

const expenseCategorySchema = new Schema<ExpenseCategory>({
  name: { type: String, required: true },
  userId: { type: String, required: true },
}, { timestamps: true });

const expenseSchema = new Schema<Expense>({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String, required: false },
  imageUrl: { type: String },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const ExpenseCategory = models.ExpenseCategory || model<ExpenseCategory>('ExpenseCategory', expenseCategorySchema);
export const Expense = models.Expense || model<Expense>('Expense', expenseSchema); 