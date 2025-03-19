import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FoodBudget } from '@/models/foodBudget';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

// Helper to get current year and month
const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth()
  };
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get current year and month if not specified
    const { year, month } = getCurrentYearMonth();
    
    const foodBudget = await FoodBudget.findOne({
      userId: MOCK_USER_ID,
      year,
      month
    });
    
    if (!foodBudget) {
      return NextResponse.json({ dailyFoodBudget: 0 });
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
    const { dailyFoodBudget } = data;
    
    // Validate required fields
    if (dailyFoodBudget === undefined) {
      return NextResponse.json(
        { error: 'Daily food budget is required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get current year and month
    const { year, month } = getCurrentYearMonth();
    
    // Update or create budget
    const result = await FoodBudget.findOneAndUpdate(
      {
        userId: MOCK_USER_ID,
        year,
        month
      },
      {
        dailyBudget: parseFloat(dailyFoodBudget),
        userId: MOCK_USER_ID,
        year,
        month
      },
      { 
        new: true,
        upsert: true 
      }
    );
    
    // Format response with the field name expected by the client
    return NextResponse.json({
      success: true,
      dailyFoodBudget: result.dailyBudget
    });
  } catch (error: any) {
    console.error('Error saving food budget:', error);
    return NextResponse.json({ 
      error: 'Failed to save food budget', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 