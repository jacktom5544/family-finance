import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FoodBudget } from '@/models/foodBudget';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const foodBudget = await FoodBudget.findOne({
      userId: MOCK_USER_ID,
      year: parseInt(year),
      month: parseInt(month)
    });
    
    if (!foodBudget) {
      return NextResponse.json({ dailyBudget: 0 });
    }
    
    return NextResponse.json(foodBudget);
  } catch (error) {
    console.error('Error fetching food budget:', error);
    return NextResponse.json({ error: 'Failed to fetch food budget' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { dailyBudget, year, month } = data;
    
    // Validate required fields
    if (dailyBudget === undefined || !year || !month) {
      return NextResponse.json(
        { error: 'Daily budget, year, and month are required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Update or create budget
    const result = await FoodBudget.findOneAndUpdate(
      {
        userId: MOCK_USER_ID,
        year: parseInt(year),
        month: parseInt(month)
      },
      {
        dailyBudget: parseFloat(dailyBudget),
        userId: MOCK_USER_ID,
        year: parseInt(year),
        month: parseInt(month)
      },
      { 
        new: true,
        upsert: true 
      }
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error saving food budget:', error);
    return NextResponse.json({ 
      error: 'Failed to save food budget', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 