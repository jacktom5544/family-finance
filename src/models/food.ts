import mongoose, { Schema, models, model } from 'mongoose';

export interface Food {
  amount: number;
  note?: string;
  date: Date;
  userId: string;
}

const foodSchema = new Schema<Food>({
  amount: { type: Number, required: true },
  note: { type: String, required: false },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const Food = models.Food || model<Food>('Food', foodSchema); 