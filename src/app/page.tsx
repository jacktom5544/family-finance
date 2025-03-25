'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { useAuth } from './context/AuthContext';
import { fetchExpenses, fetchBudget, fetchMonthlyIncome, fetchMonthlyExpenses } from '@/app/utils/api';
import { formatAmount } from '@/app/utils/formatter';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Home() {
  // Debug info
  console.log("Home component rendering...");
  
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  
  // Log auth state for debugging
  console.log("Auth state:", { isLoggedIn, authLoading });
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [monthlyFoodItems, setMonthlyFoodItems] = useState<any[]>([]);
  const [savedDailyBudget, setSavedDailyBudget] = useState(0);
  const [monthlyIncomeItems, setMonthlyIncomeItems] = useState<any[]>([]);
  const [monthlyExpenseItems, setMonthlyExpenseItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Fetch all necessary data for the dashboard
  useEffect(() => {
    // Skip data fetching if still determining auth state or not logged in
    if (authLoading || !isLoggedIn) {
      setIsLoading(false);
      return;
    }

    console.log("Fetching dashboard data...");
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        // Fetch food expenses
        const foodResponse = await fetchExpenses(selectedMonth, selectedYear);
        console.log("Food response:", foodResponse);
        if (Array.isArray(foodResponse)) {
          setMonthlyFoodItems(foodResponse.map(item => ({
            ...item,
            amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0'),
            date: item.date ? new Date(item.date) : null
          })));
        } else {
          setMonthlyFoodItems([]);
        }
        
        // Fetch budget
        const budgetResponse = await fetchBudget(selectedMonth, selectedYear);
        console.log("Budget response:", budgetResponse);
        const budgetValue = budgetResponse?.dailyFoodBudget || 0;
        const numericBudget = typeof budgetValue === 'number' ? budgetValue : parseFloat(budgetValue || '0');
        setSavedDailyBudget(numericBudget > 0 ? numericBudget : 0);
        
        // Fetch income
        const incomeResponse = await fetchMonthlyIncome(selectedMonth, selectedYear);
        console.log("Income response:", incomeResponse);
        if (Array.isArray(incomeResponse)) {
          setMonthlyIncomeItems(incomeResponse.map(item => ({
            ...item,
            amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0')
          })));
        } else {
          setMonthlyIncomeItems([]);
        }
        
        // Fetch expenses
        const expensesResponse = await fetchMonthlyExpenses(selectedMonth, selectedYear);
        console.log("Expenses response:", expensesResponse);
        if (Array.isArray(expensesResponse)) {
          setMonthlyExpenseItems(expensesResponse.map(item => ({
            ...item,
            amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0')
          })));
        } else {
          setMonthlyExpenseItems([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMonthlyFoodItems([]);
        setMonthlyIncomeItems([]);
        setMonthlyExpenseItems([]);
        setSavedDailyBudget(0);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, authLoading, selectedMonth, selectedYear]);

  // If auth is still loading, show a loading spinner
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">Initializing application...</h2>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, show the login form
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">Family Finance</h1>
        <LoginForm />
      </div>
    );
  }

  // If there's an error loading, show an error message with a button to navigate to expenses
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h1 className="text-2xl font-bold mb-4">Failed to load dashboard data</h1>
        <p className="mb-6">Something went wrong while loading the dashboard.</p>
        <button 
          onClick={() => router.push('/pages/expense')} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Expense Page
        </button>
      </div>
    );
  }

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">Loading dashboard...</h2>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate average daily expense
  const calculateAverageDailyExpense = () => {
    if (!monthlyFoodItems || monthlyFoodItems.length === 0) return 0;
    
    // Group expenses by day to get daily totals first
    const dailyTotals: { [key: string]: number } = {};
    
    monthlyFoodItems.forEach(expense => {
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        const dateKey = expenseDate.toISOString().split('T')[0];
        
        if (!dailyTotals[dateKey]) {
          dailyTotals[dateKey] = 0;
        }
        
        dailyTotals[dateKey] += parseFloat(expense.amount);
      }
    });
    
    // Calculate the average of all daily totals
    const totalDays = Object.keys(dailyTotals).length;
    if (totalDays === 0) return 0;
    
    const sumOfDailyTotals = Object.values(dailyTotals).reduce((sum, amount) => sum + amount, 0);
    return sumOfDailyTotals / totalDays;
  };

  // Calculate total income for the month
  const calculateTotalIncome = () => {
    if (!monthlyIncomeItems || monthlyIncomeItems.length === 0) return 0;
    return monthlyIncomeItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  // Calculate total expenses for the month
  const calculateTotalExpenses = () => {
    if (!monthlyExpenseItems || monthlyExpenseItems.length === 0) return 0;
    return monthlyExpenseItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  };

  // Get data for the daily expenses bar chart
  const getDailyExpenses = () => {
    if (!monthlyFoodItems || monthlyFoodItems.length === 0) return [];
    
    // Group expenses by day
    const dailyExpenses: { [key: string]: number } = {};
    
    monthlyFoodItems.forEach(expense => {
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        const day = expenseDate.getDate().toString();
        
        if (!dailyExpenses[day]) {
          dailyExpenses[day] = 0;
        }
        
        dailyExpenses[day] += parseFloat(expense.amount);
      }
    });
    
    // Convert to array format for chart
    return Object.entries(dailyExpenses).map(([day, amount]) => ({
      day,
      amount
    })).sort((a, b) => parseInt(a.day) - parseInt(b.day));
  };

  // Create expense category data for pie chart
  const getExpenseCategories = () => {
    if (!monthlyExpenseItems || monthlyExpenseItems.length === 0) return [];
    
    // Group expenses by category
    const categoryExpenses: { [key: string]: number } = {};
    
    monthlyExpenseItems.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }
      
      categoryExpenses[category] += parseFloat(expense.amount);
    });
    
    // Convert to array format for chart
    return Object.entries(categoryExpenses).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Get emoji based on budget status
  const getBudgetEmoji = () => {
    const avgDailyExpense = calculateAverageDailyExpense();
    
    if (savedDailyBudget === 0) return '📊';
    if (avgDailyExpense <= savedDailyBudget * 0.5) return '😀';
    if (avgDailyExpense <= savedDailyBudget * 0.8) return '🙂';
    if (avgDailyExpense <= savedDailyBudget) return '😐';
    if (avgDailyExpense <= savedDailyBudget * 1.2) return '😕';
    return '😨';
  };

  // Dashboard UI
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard {getBudgetEmoji()}</h1>
      
      {/* Month and Year Selector */}
      <div className="flex mb-6 space-x-4">
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Daily Food Budget</h2>
          <p className="text-2xl">{formatAmount(savedDailyBudget)}</p>
          <p className="text-sm text-gray-600">
            Avg Daily: {formatAmount(calculateAverageDailyExpense())}
          </p>
        </div>
        
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Income</h2>
          <p className="text-2xl">{formatAmount(calculateTotalIncome())}</p>
          <p className="text-sm text-gray-600">
            From {monthlyIncomeItems.length} sources
          </p>
        </div>
        
        <div className="bg-red-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Expenses</h2>
          <p className="text-2xl">{formatAmount(calculateTotalExpenses())}</p>
          <p className="text-sm text-gray-600">
            Across {monthlyExpenseItems.length} items
          </p>
        </div>
      </div>
      
      {/* Daily Expenses Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Food Expenses</h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getDailyExpenses()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(value as number)} />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Daily Food Expense" />
              {savedDailyBudget > 0 && (
                <Bar 
                  dataKey={() => savedDailyBudget} 
                  fill="#82ca9d" 
                  name="Daily Budget"
                  stackId="stack"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Expense Categories Pie Chart */}
      {monthlyExpenseItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getExpenseCategories()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getExpenseCategories().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => router.push('/pages/expense')}
          className="p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Manage Expenses
        </button>
        
        <button 
          onClick={() => router.push('/pages/income')}
          className="p-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Manage Income
        </button>
        
        <button 
          onClick={() => router.push('/pages/food')}
          className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Food Tracking
        </button>
        
        <button 
          onClick={() => router.push('/pages/saving')}
          className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Savings Goals
        </button>
      </div>
    </div>
  );
}