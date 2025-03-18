import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Income } from '@/models/income';
import mongoose from 'mongoose';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET a specific income by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const income = await Income.findOne({
      _id: params.id,
      userId: MOCK_USER_ID
    });
    
    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' }, 
      { status: 500 }
    );
  }
}

// PUT - Update a specific income
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' }, 
        { status: 400 }
      );
    }
    
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { amount, category, note, date } = body;
    
    await connectToDatabase();
    
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: params.id, userId: MOCK_USER_ID },
      { 
        amount,
        category, 
        note,
        date: date ? new Date(date) : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedIncome) {
      return NextResponse.json(
        { error: 'Income not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update income: ${errorMessage}` }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific income
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const result = await Income.findOneAndDelete({
      _id: params.id,
      userId: MOCK_USER_ID
    });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Income not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Income deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting income:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete income: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 