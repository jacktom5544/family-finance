import mongoose, { Schema, models, model } from 'mongoose';

export interface PredictionIncome {
  mumsSalary: number;
  mumsIncentive: number;
  dadsTransfer: number;
  [key: string]: number; // Allow dynamic fields
}

export interface PredictionExpense {
  home: number;
  tuition: number;
  electricity: number;
  internet: number;
  transportation: number;
  mobile: number;
  groceries: number;
  toiletries: number;
  vitaminsCosmeticsMeds: number;
  restaurant: number;
  investment: number;
  water: number;
  schoolMisc: number;
  utilities: number;
  [key: string]: number; // Allow dynamic fields
}

export interface Prediction {
  month: number;
  year: number;
  income: PredictionIncome;
  expense: PredictionExpense;
  userId: string;
}

const predictionSchema = new Schema<Prediction>({
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  income: {
    mumsSalary: { type: Number, default: 0 },
    mumsIncentive: { type: Number, default: 0 },
    dadsTransfer: { type: Number, default: 0 }
  },
  expense: {
    home: { type: Number, default: 0 },
    tuition: { type: Number, default: 0 },
    electricity: { type: Number, default: 0 },
    internet: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    groceries: { type: Number, default: 0 },
    toiletries: { type: Number, default: 0 },
    vitaminsCosmeticsMeds: { type: Number, default: 0 },
    restaurant: { type: Number, default: 0 },
    investment: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    schoolMisc: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 }
  },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const Prediction = models.Prediction || model<Prediction>('Prediction', predictionSchema); 