import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Prediction } from '@/models/prediction';

// Helper function to get yearly totals (not exported)
async function getYearlyTotals(year: number, userId: string = 'default-user') {
  try {
    await connectToDatabase();
    
    const predictions = await Prediction.find({ year, userId }).sort({ month: 1 });
    
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyData = [];
    
    for (const prediction of predictions) {
      // Calculate monthly totals
      const incomeTotal = Object.values(prediction.income).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
      const expenseTotal = Object.values(prediction.expense).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
      
      totalIncome += incomeTotal;
      totalExpense += expenseTotal;
      
      monthlyData.push({
        month: prediction.month,
        income: incomeTotal,
        expense: expenseTotal,
        balance: incomeTotal - expenseTotal
      });
    }
    
    return {
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlyData
    };
  } catch (error) {
    console.error('Error calculating yearly totals:', error);
    throw error;
  }
}

// GET - Fetch all predictions or filter by month/year
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const userId = searchParams.get('userId') || 'default-user'; // Use authentication in prod
    
    // Check if yearly totals are requested
    if (year && searchParams.get('totals') === 'true') {
      try {
        const totals = await getYearlyTotals(parseInt(year), userId);
        return NextResponse.json({ success: true, ...totals });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to calculate yearly totals' },
          { status: 500 }
        );
      }
    }
    
    // Build query based on provided parameters
    const query: any = { userId };
    
    if (month) {
      query.month = parseInt(month);
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    const predictions = await Prediction.find(query).sort({ year: 1, month: 1 });
    
    return NextResponse.json({ success: true, predictions });
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

// POST - Create or update a prediction for a specific month/year
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { month, year, income, expense } = body;
    const userId = body.userId || 'default-user'; // Use authentication in prod
    
    // Validate required fields
    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: 'Month and year are required' },
        { status: 400 }
      );
    }
    
    // Find and update, or create if not exists
    const prediction = await Prediction.findOneAndUpdate(
      { month, year, userId },
      { month, year, income, expense, userId },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    console.error('Failed to save prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save prediction' },
      { status: 500 }
    );
  }
} 