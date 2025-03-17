import mongoose, { Schema, models, model } from 'mongoose';

export interface Income {
  amount: number;
  category: 'Salary' | 'Remittance' | 'ETC';
  note: string;
  date: Date;
  userId: string;
}

const incomeSchema = new Schema<Income>({
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Salary', 'Remittance', 'ETC']
  },
  note: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const Income = models.Income || model<Income>('Income', incomeSchema); 