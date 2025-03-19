import mongoose, { Schema, models, model } from 'mongoose';

export interface FoodBudget {
  dailyBudget: number;
  userId: string;
  year: number;
  month: number;
}

const foodBudgetSchema = new Schema<FoodBudget>({
  dailyBudget: { type: Number, required: true },
  userId: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
}, { timestamps: true });

// Add a compound index to ensure one budget per user per month/year
foodBudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

// Prevent model recompilation error in development
export const FoodBudget = models.FoodBudget || model<FoodBudget>('FoodBudget', foodBudgetSchema); 