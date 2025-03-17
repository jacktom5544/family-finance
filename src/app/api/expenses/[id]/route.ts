import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Expense } from '@/models/expense';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    const { amount, category, note, date } = data;
    
    // Validate required fields
    if (!amount || !category || !date) {
      return NextResponse.json(
        { error: 'Amount, category, and date are required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find and update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId: MOCK_USER_ID },
      { 
        amount: parseFloat(amount),
        category,
        note: note || '',
        date: new Date(date)
      },
      { new: true }
    );
    
    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectToDatabase();
    
    // Find and delete the expense
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userId: MOCK_USER_ID
    });
    
    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
} 