import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ExpenseCategory } from '@/models/expense';

// Mock user ID (in a real app, you would get this from an authenticated session)
const MOCK_USER_ID = 'user123';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const data = await request.json();
    const { name } = data;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find and update the category
    const updatedCategory = await ExpenseCategory.findOneAndUpdate(
      { _id: id, userId: MOCK_USER_ID },
      { name: name.trim() },
      { new: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectToDatabase();
    
    // Find and delete the category
    const deletedCategory = await ExpenseCategory.findOneAndDelete({
      _id: id,
      userId: MOCK_USER_ID
    });
    
    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 