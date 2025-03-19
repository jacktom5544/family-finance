'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import MonthPicker from '@/app/components/MonthPicker';
import { formatAmount } from '@/app/utils/formatter';
import { 
  fetchBudget, 
  fetchExpenses, 
  postBudget
} from '@/app/utils/api';

interface Food {
  _id: string;
  amount: number;
  note: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function FoodPage() {
  const [foodData, setFoodData] = useState({
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [foodItems, setFoodItems] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Monthly view state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [monthlyFoodItems, setMonthlyFoodItems] = useState<Food[]>([]);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  
  // Tab state for grid/table view
  const [activeTab, setActiveTab] = useState<'grid' | 'table'>('grid');
  const [gridOrientation, setGridOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  // Modal state for editing food item
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState<Food | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    note: '',
    date: ''
  });

  // State for budget management
  const [dailyBudget, setDailyBudget] = useState('');
  const [savedDailyBudget, setSavedDailyBudget] = useState(0);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Fetch food items on component mount
  useEffect(() => {
    fetchMonthlyFoodItems();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyFoodItems = async () => {
    setIsLoadingMonthly(true);
    try {
      // Create date range for selected month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`/api/food?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyFoodItems(data);
      }
    } catch (error) {
      console.error('Error fetching monthly food items:', error);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  const handleFoodChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFoodData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFoodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData),
      });
      
      if (response.ok) {
        // Reset form
        setFoodData({
          amount: '',
          note: '',
          date: new Date().toISOString().split('T')[0]
        });
        
        // Refresh food items
        fetchMonthlyFoodItems();
      } else {
        const errorData = await response.json();
        console.error('Error creating food item:', errorData);
      }
    } catch (error) {
      console.error('Error submitting food item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (foodItem: Food) => {
    setEditingFoodItem(foodItem);
    setEditFormData({
      amount: foodItem.amount.toString(),
      note: foodItem.note,
      date: new Date(foodItem.date).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFoodItem) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/food/${editingFoodItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchMonthlyFoodItems();
      } else {
        const errorData = await response.json();
        console.error('Error updating food item:', errorData);
      }
    } catch (error) {
      console.error('Error updating food item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFoodItem = async () => {
    if (!editingFoodItem) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/food/${editingFoodItem._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchMonthlyFoodItems();
      } else {
        const errorData = await response.json();
        console.error('Error deleting food item:', errorData);
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group food items by day
  const groupFoodItemsByDay = () => {
    const groupedData: { [key: string]: Food[] } = {};
    
    // Get the number of days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Initialize empty arrays for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = i.toString().padStart(2, '0');
      groupedData[dayStr] = [];
    }
    
    // Group food items by day
    monthlyFoodItems.forEach(foodItem => {
      const day = new Date(foodItem.date).getDate().toString().padStart(2, '0');
      if (groupedData[day]) {
        groupedData[day].push(foodItem);
      }
    });
    
    return groupedData;
  };

  // Calculate total for a specific day
  const calculateDayTotal = (foodItems: Food[]) => {
    return foodItems.reduce((total, item) => total + item.amount, 0);
  };

  // Prepare data for charts
  const prepareDailyChartData = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];
    
    // Create data for each day in the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Find food items for this day
      const dayFoodItems = monthlyFoodItems.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getDate() === i;
      });
      
      // Calculate total for this day
      const total = calculateDayTotal(dayFoodItems);
      
      // Add data point with day number as string
      data.push({
        name: i,  // Use actual number here
        total: total
      });
    }
    
    return data;
  };

  // Load the saved daily budget when month or year changes
  useEffect(() => {
    fetchDailyBudget();
  }, [selectedYear, selectedMonth]);

  // Fetch the daily budget from the server
  const fetchDailyBudget = async () => {
    try {
      const queryParams = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString()
      });
      
      const response = await fetch(`/api/foodBudget?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSavedDailyBudget(data.dailyBudget || 0);
      }
    } catch (error) {
      console.error('Error fetching daily budget:', error);
    }
  };

  // Handle saving the daily budget
  const handleSaveBudget = async () => {
    if (!dailyBudget || parseFloat(dailyBudget) <= 0) return;
    
    setIsSavingBudget(true);
    
    try {
      const result = await postBudget({ dailyFoodBudget: parseFloat(dailyBudget) });
      // Use either the response value or the input value
      setSavedDailyBudget(result.dailyBudget || parseFloat(dailyBudget));
      setDailyBudget('');
      
      // Show success message if needed
      console.log('Budget saved successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      
      // You can add user notification here if needed
      alert('Failed to save budget. Please try again.');
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Calculate average daily expense
  const calculateAverageDailyExpense = () => {
    if (!monthlyFoodItems || monthlyFoodItems.length === 0) return 0;
    
    // Calculate total expenses for the month
    const totalExpenses = monthlyFoodItems.reduce((total, item) => total + item.amount, 0);
    
    // Determine which days have expenses
    const daysWithExpenses = new Set();
    monthlyFoodItems.forEach(item => {
      const day = new Date(item.date).getDate();
      daysWithExpenses.add(day);
    });
    
    // Get the number of days with expenses
    const numberOfDaysWithExpenses = daysWithExpenses.size;
    
    // If we have days with expenses, use that for the average
    if (numberOfDaysWithExpenses > 0) {
      return totalExpenses / numberOfDaysWithExpenses;
    }
    
    // Otherwise, fall back to dividing by days in month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return totalExpenses / daysInMonth;
  };

  // Check if over budget
  const isOverBudget = () => {
    if (savedDailyBudget <= 0) return false;
    return calculateAverageDailyExpense() > savedDailyBudget;
  };

  // Calculate budget percentage (for progress bar)
  const getBudgetPercentage = () => {
    if (savedDailyBudget <= 0) return 0;
    
    const percentage = (calculateAverageDailyExpense() / savedDailyBudget) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Get emoji based on budget status
  const getBudgetEmoji = () => {
    if (!savedDailyBudget) return '';
    
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
    
    // Group expenses by day
    const dailyExpenses: { day: string; value: number }[] = [];
    
    monthlyFoodItems.forEach(expense => {
      const expenseDate = new Date(expense.date);
      // Extract just the day number and convert to string
      const day = expenseDate.getDate().toString();
      
      // Check if we already have an entry for this day
      const existingDay = dailyExpenses.find(item => item.day === day);
      
      if (existingDay) {
        // Add to existing day's total
        existingDay.value += expense.amount;
      } else {
        // Create a new entry for this day
        dailyExpenses.push({
          day,
          value: expense.amount
        });
      }
    });

    // For debugging
    console.log('Daily expenses data:', dailyExpenses);
    
    return dailyExpenses;
  };

  // Render daily food expenses chart
  const renderDailyChart = () => {
    const dailyData = getDailyExpenses();
    
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

    // Calculate monthly total
    const monthlyTotal = allDaysData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold">Daily Food Expenses</h3>
          <div className="text-sm font-medium text-gray-600">
            Monthly Total: <span className="text-blue-600 font-bold">{formatAmount(monthlyTotal)}</span>
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

  // Render daily budget section
  const renderDailyBudgetSection = () => {
    const averageDailyExpense = calculateAverageDailyExpense();
    const budgetPercentage = getBudgetPercentage();
    const overBudget = isOverBudget();
    
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-5">Daily Food Budget</h3>
        
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[200px]">
            <div className="mb-4">
              <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-700 mb-2">
                Set Daily Budget
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="dailyBudget"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full bg-white shadow-sm"
                  placeholder="Enter amount"
                  min="0"
                />
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={isSavingBudget || !dailyBudget}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
                >
                  {isSavingBudget ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">Current Daily Budget</span>
              <div className="text-2xl font-bold bg-gray-50 p-3 rounded-md border border-gray-200">
                {savedDailyBudget > 0 ? formatAmount(savedDailyBudget) : '—'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-end mb-3">
            <span className="block text-sm font-medium text-gray-700">Average Daily Expense</span>
            <span className={`text-xl font-bold ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
              {formatAmount(averageDailyExpense)}
            </span>
          </div>
          
          {savedDailyBudget > 0 && (
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
          )}
        </div>
      </div>
    );
  };

  // Render the grid view of food items
  const renderFoodGrid = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    if (gridOrientation === 'vertical') {
      return (
        <div className="overflow-x-auto">
          <div className="min-w-full grid" style={{ gridTemplateColumns: 'auto 1fr auto', minHeight: '400px' }}>
            {/* Days column */}
            <div className="bg-gray-50 border-r border-gray-300">
              <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center justify-center">Day</div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={`day-${day}`} className="px-3 border-b border-gray-300 text-center h-10 flex items-center justify-center">{day}</div>
              ))}
            </div>
            
            {/* Food items */}
            <div className="bg-white">
              <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center">Food Expenses</div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayStr = day.toString().padStart(2, '0');
                const dayFoodItems = monthlyFoodItems.filter(item => {
                  const itemDate = new Date(item.date);
                  return itemDate.getDate() === day;
                });
                
                return (
                  <div key={`food-${day}`} className="px-3 py-1 border-b border-gray-300 h-10 flex items-center overflow-x-auto">
                    <div className="flex flex-nowrap gap-2">
                      {dayFoodItems.map(item => (
                        <div 
                          key={item._id}
                          className="px-2 py-1 rounded cursor-pointer transition-all duration-200 hover:shadow-md whitespace-nowrap bg-blue-50 hover:bg-blue-100"
                          onClick={() => openEditModal(item)}
                        >
                          {formatAmount(item.amount)}
                          {item.note && <span className="text-xs text-gray-500 ml-1">({item.note})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Totals column */}
            <div className="bg-gray-50 border-l border-gray-300">
              <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center justify-center">Total</div>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayFoodItems = monthlyFoodItems.filter(item => {
                  const itemDate = new Date(item.date);
                  return itemDate.getDate() === day;
                });
                
                const dayTotal = calculateDayTotal(dayFoodItems);

                return (
                  <div key={`total-${day}`} className="px-3 border-b border-gray-300 text-center h-10 flex items-center justify-center font-medium">
                    {dayTotal > 0 && formatAmount(dayTotal)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else {
      // Horizontal orientation
      return (
        <div 
          ref={horizontalScrollRef}
          className="overflow-x-auto relative" 
        >
          <div className="pb-4 w-max" style={{ maxWidth: 'fit-content' }}>
            <table className="border-collapse table-fixed" style={{ width: 'auto' }}>
              <thead>
                <tr>
                  <th className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center sticky left-0 z-10 min-w-[120px] shadow-sm">Food</th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <th key={`day-${day}`} className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center min-w-[60px] max-w-[60px]">
                      {day}
                    </th>
                  ))}
                  <th className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center sticky right-0 z-10 min-w-[80px] shadow-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 bg-gray-50 border border-gray-300 sticky left-0 z-10 shadow-sm font-medium">
                    Food Expenses
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dayFoodItems = monthlyFoodItems.filter(item => {
                      const itemDate = new Date(item.date);
                      return itemDate.getDate() === day;
                    });
                    
                    return (
                      <td key={`cell-${day}`} className="px-3 py-2 border border-gray-300 align-top">
                        <div className="min-h-[30px] max-w-[120px]">
                          {dayFoodItems.map(item => (
                            <div 
                              key={item._id} 
                              className="mb-1 p-1 bg-blue-50 rounded text-sm cursor-pointer hover:bg-blue-100"
                              onClick={() => openEditModal(item)}
                            >
                              <div className="font-semibold">{formatAmount(item.amount)}</div>
                              {item.note && <div className="text-gray-600 text-xs truncate">{item.note}</div>}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 bg-gray-50 border border-gray-300 text-center sticky right-0 z-10 shadow-sm font-medium">
                    {formatAmount(monthlyFoodItems.reduce((total, item) => total + item.amount, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  // Render the table view of food items
  const renderFoodTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyFoodItems.map(item => {
              const itemDate = new Date(item.date);
              const formattedDate = `${itemDate.getMonth() + 1}/${itemDate.getDate()}/${itemDate.getFullYear()}`;
              
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{formattedDate}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatAmount(item.amount)}</td>
                  <td className="px-4 py-2">{item.note || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {monthlyFoodItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                  No food expenses found for this month.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="px-4 py-2 font-medium">Total</td>
              <td className="px-4 py-2 font-medium">{formatAmount(monthlyFoodItems.reduce((total, item) => total + item.amount, 0))}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // Month tabs for header
  const renderMonthTabsHeader = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear - 1, currentYear, currentYear + 1];
    
    return (
      <div className="mb-6">
        <div className="flex overflow-x-auto border-b border-gray-300">
          {availableYears.map(year => (
            <button
              key={`year-${year}`}
              className={`px-4 py-2 font-medium ${selectedYear === year ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        
        <div className="flex overflow-x-auto py-1">
          {months.map((month, idx) => (
            <button
              key={`month-${idx}`}
              className={`px-4 py-2 whitespace-nowrap ${selectedMonth === idx ? 'bg-blue-600 text-white rounded-md' : 'text-gray-600 hover:bg-gray-100 rounded-md'}`}
              onClick={() => setSelectedMonth(idx)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Month tabs for Food Expenses section
  const renderMonthTabsFoodExpenses = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return (
      <div className="flex flex-wrap mb-4">
        {months.map((month, idx) => (
          <button
            key={`expense-month-${idx}`}
            className={`mr-2 mb-2 px-3 py-1 text-sm rounded-md ${selectedMonth === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setSelectedMonth(idx)}
          >
            {month}
          </button>
        ))}
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="ml-auto px-3 py-1 border rounded-md text-sm"
        >
          {Array.from(
            { length: 10 }, 
            (_, i) => new Date().getFullYear() - 5 + i
          ).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    );
  };

  // Render month selector with styled UI
  const renderMonthSelector = () => {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Food Budget Manager</h2>
          <MonthPicker 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <div>{renderMonthSelector()}</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        
        
          {isLoading ? (
            <div className="w-full p-6 bg-white rounded-lg shadow text-center">
              <div className="py-8">Loading data...</div>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Add Food Expense</h2>
                <form onSubmit={handleFoodSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={foodData.date}
                        onChange={handleFoodChange}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={foodData.amount}
                        onChange={handleFoodChange}
                        required
                        min="0"
                        step="1"
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Note</label>
                      <input
                        type="text"
                        name="note"
                        value={foodData.note}
                        onChange={handleFoodChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Food Expense'}
                    </button>
                  </div>
                </form>
              </div>
              {renderDailyBudgetSection()}
             
             
            </>
          )}
        
      </div>
      <div>{renderDailyChart()}</div>
      
      
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Food Expenses</h2>
          </div>
          
          {renderMonthTabsFoodExpenses()}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('grid')}
              >
                Grid View
              </button>
              <button
                className={`px-3 py-1 rounded-md ${activeTab === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                onClick={() => setActiveTab('table')}
              >
                Table View
              </button>
            </div>
            {activeTab === 'grid' && (
              <button
                className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => setGridOrientation(gridOrientation === 'vertical' ? 'horizontal' : 'vertical')}
                title="Switch grid orientation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 3v18" />
                  {gridOrientation === 'vertical' ? (
                    <path d="M3 15h6 M15 15h6 M3 21h6 M15 21h6" strokeDasharray="2" />
                  ) : (
                    <path d="M3 15h18 M3 21h18" strokeDasharray="2" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {isLoadingMonthly ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'grid' ? (
            renderFoodGrid()
          ) : (
            renderFoodTable()
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && editingFoodItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Food Expense</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditFormChange}
                  required
                  min="0"
                  step="1"
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input
                  type="text"
                  name="note"
                  value={editFormData.note}
                  onChange={handleEditFormChange}
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleDeleteFoodItem}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 