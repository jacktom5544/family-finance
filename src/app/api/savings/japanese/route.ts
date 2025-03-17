import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { JapaneseSaving } from '@/models/saving';

// Temporary user ID (replace with actual auth implementation)
const TEMP_USER_ID = 'user123';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get the latest Japanese saving record for the user
    const saving = await JapaneseSaving.findOne({ userId: TEMP_USER_ID })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ saving }, { status: 200 });
  } catch (error) {
    console.error('Error fetching Japanese saving:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Japanese saving' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    // Create a new Japanese saving record
    const saving = new JapaneseSaving({
      bankSaving: data.bankSaving,
      userId: TEMP_USER_ID,
      date: new Date() 
    });
    
    await saving.save();
    
    return NextResponse.json(
      { message: 'Japanese saving updated successfully', saving }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating Japanese saving:', error);
    return NextResponse.json(
      { error: 'Failed to update Japanese saving' }, 
      { status: 500 }
    );
  }
} 