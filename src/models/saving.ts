import mongoose, { Schema, models, model } from 'mongoose';

export interface JapaneseSaving {
  bankSaving: number;
  date: Date;
  userId: string;
}

export interface PhilippinesSaving {
  bpiBankSaving: number;
  bdoBankSaving: number;
  unionBankSaving: number;
  mobileWalletSaving: number; // Gcash/Grab
  cashSaving: number;
  date: Date;
  userId: string;
}

const japaneseSavingSchema = new Schema<JapaneseSaving>({
  bankSaving: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

const philippinesSavingSchema = new Schema<PhilippinesSaving>({
  bpiBankSaving: { type: Number, required: true },
  bdoBankSaving: { type: Number, required: true },
  unionBankSaving: { type: Number, required: true },
  mobileWalletSaving: { type: Number, required: true },
  cashSaving: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, { timestamps: true });

// Prevent model recompilation error in development
export const JapaneseSaving = models.JapaneseSaving || model<JapaneseSaving>('JapaneseSaving', japaneseSavingSchema);
export const PhilippinesSaving = models.PhilippinesSaving || model<PhilippinesSaving>('PhilippinesSaving', philippinesSavingSchema); 