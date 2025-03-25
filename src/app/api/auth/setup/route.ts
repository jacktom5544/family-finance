import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/user';

// This is a SETUP route to create an admin user
// In production, you should disable this route or protect it with a setup key
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'smoothe' });
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists' },
        { status: 200 }
      );
    }

    // Create new admin user
    const adminUser = await User.create({
      username: 'smoothe',
      password: 'chocotan',
    });

    return NextResponse.json(
      { 
        message: 'Admin user created successfully',
        userId: adminUser._id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
} 