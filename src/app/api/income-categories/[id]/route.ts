import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IncomeCategory } from '@/models/income';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

// GET a specific income category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const category = await IncomeCategory.findOne({
      _id: params.id,
      userId: MOCK_USER_ID
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Income category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching income category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income category' }, 
      { status: 500 }
    );
  }
}

// PUT - Update a specific income category
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const updatedCategory = await IncomeCategory.findOneAndUpdate(
      { _id: params.id, userId: MOCK_USER_ID },
      { name },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Income category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating income category:', error);
    return NextResponse.json(
      { error: 'Failed to update income category' }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific income category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedCategory = await IncomeCategory.findOneAndDelete({
      _id: params.id,
      userId: MOCK_USER_ID
    });
    
    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Income category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Income category deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting income category:', error);
    return NextResponse.json(
      { error: 'Failed to delete income category' }, 
      { status: 500 }
    );
  }
} 