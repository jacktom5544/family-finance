'use client';

import React, { useState, useEffect } from 'react';
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

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [monthlyFoodItems, setMonthlyFoodItems] = useState<any[]>([]);
  const [savedDailyBudget, setSavedDailyBudget] = useState(0);
  const [monthlyIncomeItems, setMonthlyIncomeItems] = useState<any[]>([]);
  const [monthlyExpenseItems, setMonthlyExpenseItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all necessary data for the dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  // Reset the budget when the component unmounts or before new data loads
  useEffect(() => {
    return () => {
      setSavedDailyBudget(0);
    };
  }, [selectedYear, selectedMonth]);

  const fetchDashboardData = async () => {
    // Always reset budget to 0 immediately
    setSavedDailyBudget(0);
    setIsLoading(true);
    try {
      // Fetch food expenses with the current month and year selection
      const foodResponse = await fetchExpenses(selectedMonth, selectedYear);
      console.log('Food expenses response:', foodResponse);
      
      // Ensure we have a valid array of food items with properly formatted data
      if (Array.isArray(foodResponse)) {
        // Process food items to ensure consistent data format
        const processedFoodItems = foodResponse.map(item => ({
          ...item,
          // Ensure amount is a number
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0'),
          // Ensure date is properly formatted
          date: item.date ? new Date(item.date) : null
        }));
        console.log('Processed food items:', processedFoodItems);
        setMonthlyFoodItems(processedFoodItems);
      } else {
        console.error('Invalid food response format:', foodResponse);
        setMonthlyFoodItems([]);
      }
      
      // Fetch daily budget for food
      const budgetResponse = await fetchBudget(selectedMonth, selectedYear);
      console.log('Budget response:', budgetResponse);
      
      // Ensure budget is a number and greater than zero
      const budgetValue = budgetResponse?.dailyFoodBudget || 0;
      // Extra strict validation to ensure budget is always a positive number or exactly 0
      const numericBudget = typeof budgetValue === 'number' ? budgetValue : parseFloat(budgetValue || '0');
      const finalBudgetValue = numericBudget > 0 ? numericBudget : 0;
      console.log(`Setting budget to: ${finalBudgetValue}`);
      setSavedDailyBudget(finalBudgetValue);
      
      // Fetch actual income data from the income page
      const incomeResponse = await fetchMonthlyIncome(selectedMonth, selectedYear);
      
      // Ensure we have a valid array of income items
      if (Array.isArray(incomeResponse)) {
        setMonthlyIncomeItems(incomeResponse.map(item => ({
          ...item,
          // Ensure amount is a number
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0')
        })));
      } else {
        console.error('Invalid income response format:', incomeResponse);
        setMonthlyIncomeItems([]);
      }
      
      // Fetch actual expense data from the expense page
      const expensesResponse = await fetchMonthlyExpenses(selectedMonth, selectedYear);
      
      // Ensure we have a valid array of expense items
      if (Array.isArray(expensesResponse)) {
        setMonthlyExpenseItems(expensesResponse.map(item => ({
          ...item,
          // Ensure amount is a number
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0')
        })));
      } else {
        console.error('Invalid expenses response format:', expensesResponse);
        setMonthlyExpenseItems([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays for all data to avoid undefined errors
      setMonthlyFoodItems([]);
      setMonthlyIncomeItems([]);
      setMonthlyExpenseItems([]);
      setSavedDailyBudget(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average daily expense
  const calculateAverageDailyExpense = () => {
    if (!monthlyFoodItems || monthlyFoodItems.length === 0) return 0;
    
    // Make sure we're working with the correct data format
    console.log('Monthly food items for average calculation:', monthlyFoodItems);
    
    // Group expenses by day to get daily totals first
    const dailyTotals: { [key: string]: number } = {};
    
    monthlyFoodItems.forEach(expense => {
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        
        // Only include if it's a valid date and within the selected month/year
        if (!isNaN(expenseDate.getTime()) && 
            expenseDate.getMonth() === selectedMonth && 
            expenseDate.getFullYear() === selectedYear) {
            
          // Get the day as a string (e.g., "1", "2", etc.)
          const day = expenseDate.getDate().toString();
          
          // Ensure amount is a number
          const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount || '0');
          
          // Add to the daily total
          if (!dailyTotals[day]) {
            dailyTotals[day] = 0;
          }
          dailyTotals[day] += amount;
        }
      }
    });
    
    // Calculate total expenses for the month
    const totalExpenses = Object.values(dailyTotals).reduce((sum, value) => sum + value, 0);
    
    // Get number of days with expenses
    const daysWithExpenses = Object.keys(dailyTotals).length;
    
    console.log(`Days with expenses: ${daysWithExpenses}, Total expenses: ${totalExpenses}`);
    
    // If we have days with expenses, use that for the average
    if (daysWithExpenses > 0) {
      return totalExpenses / daysWithExpenses;
    }
    
    // Otherwise, fall back to dividing by days in month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return totalExpenses / daysInMonth;
  };

  // Check if over budget
  const isOverBudget = () => {
    if (!savedDailyBudget || savedDailyBudget <= 0) return false;
    return calculateAverageDailyExpense() > savedDailyBudget;
  };

  // Calculate budget percentage (for progress bar)
  const getBudgetPercentage = () => {
    if (!savedDailyBudget || savedDailyBudget <= 0) return 0;
    
    const percentage = (calculateAverageDailyExpense() / savedDailyBudget) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Get emoji based on budget status
  const getBudgetEmoji = () => {
    if (!savedDailyBudget || savedDailyBudget <= 0) return '';
    
    const percentage = (calculateAverageDailyExpense() / savedDailyBudget) * 100;
    
    if (percentage > 100) {
      return '😱'; // Way over budget
    } else if (percentage > 90) {
      return '😬'; // Nearly over budget
    } else if (percentage > 75) {
      return '😐'; // Getting close to budget
    } else if (percentage > 50) {
      return '🙂'; // Doing well
    }
    
    return '😊';  // Happy emoji for well under budget
  };

  // Get daily expenses for current month
  const getDailyExpenses = () => {
    if (!monthlyFoodItems || monthlyFoodItems.length === 0) return [];
    
    console.log('Monthly food items for daily expenses chart:', monthlyFoodItems);
    
    // Group expenses by day
    const dailyExpenses: { day: string; value: number }[] = [];
    
    monthlyFoodItems.forEach(expense => {
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        
        // Only include if it's a valid date and within the selected month/year
        if (!isNaN(expenseDate.getTime()) && 
            expenseDate.getMonth() === selectedMonth && 
            expenseDate.getFullYear() === selectedYear) {
            
          // Extract just the day number and convert to string
          const day = expenseDate.getDate().toString();
          
          // Check if we already have an entry for this day
          const existingDay = dailyExpenses.find(item => item.day === day);
          
          // Ensure amount is a number
          const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount || '0');
          
          if (existingDay) {
            // Add to existing day's total
            existingDay.value += amount;
          } else {
            // Create a new entry for this day
            dailyExpenses.push({
              day,
              value: amount
            });
          }
        }
      }
    });
    
    console.log('Processed daily expenses data:', dailyExpenses);
    return dailyExpenses;
  };

  // Process income data for pie chart
  const getIncomeChartData = () => {
    if (!monthlyIncomeItems || monthlyIncomeItems.length === 0) return [];
    
    // Group income by category
    const incomeByCategory: { [key: string]: number } = {};
    
    monthlyIncomeItems.forEach(income => {
      const category = income.category || 'Other';
      if (!incomeByCategory[category]) {
        incomeByCategory[category] = 0;
      }
      incomeByCategory[category] += income.amount;
    });
    
    // Convert to array format for pie chart
    return Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Process expense data for pie chart
  const getExpenseChartData = () => {
    if (!monthlyExpenseItems || monthlyExpenseItems.length === 0) return [];
    
    // Group expenses by category
    const expensesByCategory: { [key: string]: number } = {};
    
    monthlyExpenseItems.forEach(expense => {
      const category = expense.category || 'Other';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });
    
    // Convert to array format for pie chart
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Get total income for the month
  const getTotalIncome = () => {
    return monthlyIncomeItems.reduce((total, item) => total + item.amount, 0);
  };

  // Get total expenses for the month
  const getTotalExpenses = () => {
    return monthlyExpenseItems.reduce((total, item) => total + item.amount, 0);
  };

  // Render total income and expense chart
  const renderIncomeExpenseChart = () => {
    const totalIncome = getTotalIncome();
    const totalExpenses = getTotalExpenses();
    const balance = totalIncome - totalExpenses;
    
    const incomeData = getIncomeChartData();
    const expenseData = getExpenseChartData();
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold">Income & Expenses</h3>
          <div className="text-sm font-medium text-gray-600">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Section */}
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-blue-700">{formatAmount(totalIncome)}</div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-red-800 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-700">{formatAmount(totalExpenses)}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800 mb-1">Balance</div>
              <div className="text-2xl font-bold text-green-700">{formatAmount(balance)}</div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`income-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-sm font-medium">Income Sources</div>
            </div>
            
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-sm font-medium">Expense Categories</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render daily budget section (imported from Food page)
  const renderDailyBudgetSection = () => {
    // Calculate the average daily expense using our fixed function
    const averageDailyExpense = calculateAverageDailyExpense();
    
    // Check if we have a valid budget - never set the state during render!
    const hasBudget = typeof savedDailyBudget === 'number' && savedDailyBudget > 0;
    console.log(`Rendering budget section: Budget=${savedDailyBudget}, Type=${typeof savedDailyBudget}, Has Budget=${hasBudget}`);
    
    // Calculate budget percentage for progress bar
    const budgetPercentage = getBudgetPercentage();
    const overBudget = isOverBudget();
    
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-5">Daily Food Budget</h3>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-end mb-3">
            <span className="block text-sm font-medium text-gray-700">Average Daily Expense</span>
            <span className={`text-xl font-bold ${hasBudget ? (overBudget ? 'text-red-600' : 'text-green-600') : 'text-gray-600'}`}>
              {formatAmount(averageDailyExpense)}
            </span>
          </div>
          
          {hasBudget ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-5 mb-2">
                <div 
                  className={`h-5 rounded-full ${overBudget ? 'bg-red-600' : 'bg-green-600'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>0</span>
                <span>{formatAmount(savedDailyBudget)}</span>
              </div>
              <div className="mt-3 text-sm font-medium text-center p-2 bg-white rounded-md border border-gray-200">
                {overBudget ? (
                  <span className="text-red-600">
                    {getBudgetEmoji()} You are over budget by {formatAmount(averageDailyExpense - savedDailyBudget)} per day
                  </span>
                ) : (
                  <span className="text-green-600">
                    {getBudgetEmoji()} You are under budget by {formatAmount(savedDailyBudget - averageDailyExpense)} per day
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="mt-3 text-sm text-center p-2 bg-white rounded-md border border-gray-200">
              Daily budget is not set.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render daily food expenses chart
  const renderDailyFoodChart = () => {
    const dailyData = getDailyExpenses();
    console.log('Daily data for chart:', dailyData);
    
    if (!dailyData || dailyData.length === 0) {
      return (
        <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-5">Daily Food Expenses</h3>
          <div className="p-10 text-center text-gray-500">No daily expenses found for the selected month</div>
        </div>
      );
    }

    // Calculate the maximum value for scaling
    const maxValue = Math.max(...dailyData.map(item => item.value), 100);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Prepare data for all days in month (including days with zero expenses)
    const allDaysData = Array.from({ length: daysInMonth }, (_, index) => {
      const day = (index + 1).toString();
      const existingData = dailyData.find(item => Number(item.day) === index + 1);
      return {
        day,
        value: existingData ? existingData.value : 0
      };
    });

    // Calculate monthly total and average
    const monthlyTotal = allDaysData.reduce((sum, item) => sum + item.value, 0);
    console.log(`Monthly total: ${monthlyTotal}`);
    
    // Calculate monthly average as total divided by number of days with expenses
    const daysWithExpenses = dailyData.length;
    const monthlyAverage = daysWithExpenses > 0 ? monthlyTotal / daysWithExpenses : 0;
    console.log(`Days with expenses: ${daysWithExpenses}, Monthly average: ${monthlyAverage}`);

    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold">Daily Food Expenses</h3>
          <div className="text-sm font-medium text-gray-600">
            Monthly Average: <span className="text-blue-600 font-bold">{formatAmount(monthlyAverage)}</span>
          </div>
        </div>
        
        <div className="relative h-[300px] mt-4">
          {/* Y-axis labels */}
          <div className="absolute inset-y-0 left-0 w-16 flex flex-col justify-between pr-2 text-xs text-gray-600 text-right">
            <span>{formatAmount(maxValue)}</span>
            <span>{formatAmount(maxValue * 0.75)}</span>
            <span>{formatAmount(maxValue * 0.5)}</span>
            <span>{formatAmount(maxValue * 0.25)}</span>
            <span>{formatAmount(0)}</span>
          </div>
          
          {/* Chart container */}
          <div className="absolute inset-0 left-16 border border-gray-200 rounded-md bg-white">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="h-px border-t border-gray-200 border-dashed"></div>
              <div className="h-px border-t border-gray-200 border-dashed"></div>
              <div className="h-px border-t border-gray-200 border-dashed"></div>
              <div className="h-px border-t border-gray-200 border-dashed"></div>
              <div className="h-px border-t border-gray-200 border-dashed"></div>
            </div>
            
            {/* Bars */}
            <div 
              className="absolute inset-x-0 bottom-8 top-0 px-2" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`, 
                gap: '2px' 
              }}
            >
              {allDaysData.map((item: { day: string; value: number }, index) => {
                const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                const isToday = 
                  selectedMonth === new Date().getMonth() && 
                  selectedYear === new Date().getFullYear() && 
                  index + 1 === new Date().getDate();
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center justify-end relative group"
                  >
                    {/* Bar */}
                    {item.value > 0 && (
                      <div
                        className={`w-5 ${isToday ? 'bg-blue-600' : 'bg-blue-500'} rounded-t-sm transition-all duration-200 group-hover:bg-blue-600`}
                        style={{ height: `${height}%` }}
                      ></div>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity z-10 shadow-lg">
                      <div className="font-semibold">Day {item.day}</div>
                      <div>{formatAmount(item.value)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Day labels */}
            <div 
              className="absolute bottom-0 inset-x-0 h-8 flex items-center px-2"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
                gap: '2px' 
              }}
            >
              {allDaysData.map((item: { day: string; value: number }, index) => {
                const isToday = 
                  selectedMonth === new Date().getMonth() && 
                  selectedYear === new Date().getFullYear() && 
                  index + 1 === new Date().getDate();
                  
                return (
                  <div 
                    key={index} 
                    className={`text-xs text-center ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}
                  >
                    {(index + 1) % 2 === 0 || isToday ? item.day : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {!isLoggedIn ? (
        <LoginForm />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <div className="bg-white p-2 rounded-lg shadow">
              {/* Year Tabs - Now First */}
              <div className="mb-2">
                <div className="flex justify-center space-x-2">
                  {[2024, 2025, 2026].map((year) => (
                    <button
                      key={year}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                        selectedYear === year 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Month Tabs - Now Second */}
              <div>
                <div className="flex flex-wrap justify-center rounded-md bg-gray-50 p-1">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <button
                      key={month}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                        selectedMonth === index 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedMonth(index)}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full p-10 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2 text-gray-600">Loading your financial data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {/* Income & Expenses Overview */}
              {renderIncomeExpenseChart()}
              
              {/* Daily Food Budget */}
              {renderDailyBudgetSection()}
              
              {/* Daily Food Expenses Chart */}
              {renderDailyFoodChart()}
            </div>
          )}
        </>
      )}
    </div>
  );
}