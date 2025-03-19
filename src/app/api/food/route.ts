import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Food } from '@/models/food';

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
    
    const foodItems = await Food.find(query).sort({ date: -1 });
    return NextResponse.json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const { amount, note, date } = data;
    
    // Validate required fields
    if (!amount || !date) {
      return NextResponse.json(
        { error: 'Amount and date are required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const foodData = {
      amount: parseFloat(amount),
      note: note || '', // Default to empty string if note is not provided
      date: new Date(date),
      userId: MOCK_USER_ID,
    };
    
    const newFoodItem = new Food(foodData);
    const savedFoodItem = await newFoodItem.save();
    
    return NextResponse.json(savedFoodItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating food item:', error);
    return NextResponse.json({ 
      error: 'Failed to create food item', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 