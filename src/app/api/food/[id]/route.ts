import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Food } from '@/models/food';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const foodItem = await Food.findById(params.id);
    
    if (!foodItem) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error('Error fetching food item:', error);
    return NextResponse.json({ error: 'Failed to fetch food item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { amount, note, date } = data;

    await connectToDatabase();
    
    // Find food item by ID
    const foodItem = await Food.findById(params.id);
    if (!foodItem) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    
    // Update fields
    const updatedData: any = {};
    if (amount !== undefined) updatedData.amount = parseFloat(amount);
    if (note !== undefined) updatedData.note = note;
    if (date !== undefined) updatedData.date = new Date(date);
    
    // Update and get the updated document
    const updatedFoodItem = await Food.findByIdAndUpdate(
      params.id,
      updatedData,
      { new: true }
    );
    
    return NextResponse.json(updatedFoodItem);
  } catch (error) {
    console.error('Error updating food item:', error);
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const result = await Food.findByIdAndDelete(params.id);
    
    if (!result) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 });
  }
} 