import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IncomeCategory } from '@/models/income';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await IncomeCategory.find({ userId: MOCK_USER_ID }).sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    return NextResponse.json({ error: 'Failed to fetch income categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Check if category already exists
    const existingCategory = await IncomeCategory.findOne({ userId: MOCK_USER_ID, name });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }
    
    const newCategory = new IncomeCategory({
      name,
      userId: MOCK_USER_ID
    });
    
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating income category:', error);
    return NextResponse.json({ error: 'Failed to create income category' }, { status: 500 });
  }
} 