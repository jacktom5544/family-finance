import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Income } from '@/models/income';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

// GET all incomes with optional date filtering
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
    
    const incomes = await Income.find(query).sort({ date: -1 });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 500 });
  }
}

// POST a new income
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, category, note, date } = body;
    
    await connectToDatabase();
    
    const newIncome = new Income({
      amount,
      category,
      note,
      date: date ? new Date(date) : new Date(),
      userId: MOCK_USER_ID
    });
    
    await newIncome.save();
    
    return NextResponse.json({ success: true, income: newIncome }, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
} 