import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PhilippinesSaving } from '@/models/saving';

// Temporary user ID (replace with actual auth implementation)
const TEMP_USER_ID = 'user123';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get the latest Philippines saving record for the user
    const saving = await PhilippinesSaving.findOne({ userId: TEMP_USER_ID })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ saving }, { status: 200 });
  } catch (error) {
    console.error('Error fetching Philippines saving:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Philippines saving' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    // Create a new Philippines saving record
    const saving = new PhilippinesSaving({
      bpiBankSaving: data.bpiBankSaving,
      bdoBankSaving: data.bdoBankSaving,
      unionBankSaving: data.unionBankSaving,
      mobileWalletSaving: data.mobileWalletSaving,
      cashSaving: data.cashSaving,
      userId: TEMP_USER_ID,
      date: new Date() 
    });
    
    await saving.save();
    
    return NextResponse.json(
      { message: 'Philippines saving updated successfully', saving }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating Philippines saving:', error);
    return NextResponse.json(
      { error: 'Failed to update Philippines saving' }, 
      { status: 500 }
    );
  }
} 