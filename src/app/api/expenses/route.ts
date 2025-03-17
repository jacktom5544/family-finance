import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Expense } from '@/models/expense';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectToDatabase();
    
    let query: any = { userId: MOCK_USER_ID };
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const expenses = await Expense.find(query).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received expense data:', data);
    
    const { amount, category, note, date } = data;
    
    // Validate required fields
    if (!amount || !category || !date) {
      console.error('Validation failed:', { amount, category, date });
      return NextResponse.json(
        { error: 'Amount, category, and date are required' }, 
        { status: 400 }
      );
    }
    
    try {
      await connectToDatabase();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 });
    }
    
    try {
      const expenseData = {
        amount: parseFloat(amount),
        category,
        note: note || '', // Default to empty string if note is not provided
        date: new Date(date),
        userId: MOCK_USER_ID,
      };
      
      console.log('Creating expense with data:', expenseData);
      const newExpense = new Expense(expenseData);
      
      const savedExpense = await newExpense.save();
      console.log('Expense saved successfully:', savedExpense);
      return NextResponse.json(savedExpense, { status: 201 });
    } catch (saveError: any) {
      console.error('Error saving expense:', saveError);
      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.keys(saveError.errors).map(field => ({
          field,
          message: saveError.errors[field].message
        }));
        console.error('Validation errors:', validationErrors);
        return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
      }
      throw saveError; // Re-throw for the outer catch
    }
  } catch (error: any) {
    console.error('Error creating expense:', error);
    // Return more detailed error message
    return NextResponse.json({ 
      error: 'Failed to create expense', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 