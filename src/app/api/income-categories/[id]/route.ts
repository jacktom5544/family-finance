import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { IncomeCategory } from '@/models/income';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

// Helper function to extract ID from URL
const extractIdFromUrl = (req: NextRequest) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
};

// GET a specific income category
export async function GET(req: NextRequest) {
  try {
    const id = extractIdFromUrl(req);
    
    await connectToDatabase();
    
    const category = await IncomeCategory.findOne({
      _id: id,
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
export async function PUT(req: NextRequest) {
  try {
    const id = extractIdFromUrl(req);
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const updatedCategory = await IncomeCategory.findOneAndUpdate(
      { _id: id, userId: MOCK_USER_ID },
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
export async function DELETE(req: NextRequest) {
  try {
    const id = extractIdFromUrl(req);
    
    await connectToDatabase();
    
    const deletedCategory = await IncomeCategory.findOneAndDelete({
      _id: id,
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