'use client';

import React, { useState, useEffect } from 'react';
import { IncomeExpenseChart } from './Charts';

interface FormData {
  [key: string]: number;
}

interface PredictionData {
  month: number;
  year: number;
  income: FormData;
  expense: FormData;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const INITIAL_INCOME_FIELDS: { [key: string]: string } = {
  mumsSalary: 'Mum\'s Salary',
  mumsIncentive: 'Mum\'s Incentive',
  dadsTransfer: 'Dad\'s Income'
};

const INITIAL_EXPENSE_FIELDS: { [key: string]: string } = {
  home: 'Home',
  tuition: 'Tuition',
  electricity: 'Electricity',
  internet: 'Internet',
  transportation: 'Transportation',
  mobile: 'Mobile',
  groceries: 'Groceries (Food)',
  toiletries: 'Toiletries',
  vitaminsCosmeticsMeds: 'Vitamins/Cosmetics/Meds',
  restaurant: 'Restaurant',
  investment: 'Investment',
  water: 'Water',
  schoolMisc: 'School Misc',
  utilities: 'Utilities'
};

export default function PredictionTabs({ currentSaving = 0 }: { currentSaving?: number }) {
  const [activeTab, setActiveTab] = useState(0);
  const [predictionYear, setPredictionYear] = useState(2025);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Exchange rate state
  const [phpToJpy, setPhpToJpy] = useState(2.7); // Default fallback rate
  const [isRateLoading, setIsRateLoading] = useState(true);
  
  // Custom income and expense field management
  const [customIncomeFields, setCustomIncomeFields] = useState<{[key: string]: string}>({});
  const [customExpenseFields, setCustomExpenseFields] = useState<{[key: string]: string}>({});
  
  // Form state for new custom fields
  const [newIncomeFieldName, setNewIncomeFieldName] = useState('');
  const [newExpenseFieldName, setNewExpenseFieldName] = useState('');

  // Fetch exchange rate
  const fetchExchangeRate = async () => {
    try {
      setIsRateLoading(true);
      // Fetch PHP to JPY exchange rate (we'll get the inverse of JPY to PHP and calculate)
      const response = await fetch('https://open.er-api.com/v6/latest/PHP');
      
      if (response.ok) {
        const data = await response.json();
        if (data.rates && data.rates.JPY) {
          setPhpToJpy(data.rates.JPY);
          console.log('Updated exchange rate: 1 PHP =', data.rates.JPY, 'JPY');
        } else {
          // Try alternative approach - get JPY to PHP and calculate inverse
          const altResponse = await fetch('https://open.er-api.com/v6/latest/JPY');
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.rates && altData.rates.PHP) {
              // Calculate inverse (PHP to JPY)
              const phpToJpyRate = 1 / altData.rates.PHP;
              setPhpToJpy(phpToJpyRate);
              console.log('Updated exchange rate (calculated inverse): 1 PHP =', phpToJpyRate, 'JPY');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Keep the default fallback rate
    } finally {
      setIsRateLoading(false);
    }
  };

  // Create default predictions for each month
  const createDefaultPredictions = () => {
    const defaultPredictions: PredictionData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      defaultPredictions.push({
        month,
        year: predictionYear,
        income: Object.keys(INITIAL_INCOME_FIELDS).reduce((acc, key) => {
          acc[key] = 0;
          return acc;
        }, {} as FormData),
        expense: Object.keys(INITIAL_EXPENSE_FIELDS).reduce((acc, key) => {
          acc[key] = 0;
          return acc;
        }, {} as FormData)
      });
    }
    
    return defaultPredictions;
  };

  // Fetch data on component mount - including exchange rate
  useEffect(() => {
    const fetchData = async () => {
      // Fetch exchange rate first
      await fetchExchangeRate();
      
      // Then fetch predictions
      await fetchPredictions();
    };
    
    fetchData();
  }, [predictionYear]);

  // Fetch predictions (separate function for readability)
  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/predictions?year=${predictionYear}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.predictions.length > 0) {
          // Make sure we have all 12 months
          let allPredictions = [...data.predictions];
          
          // Check if we have all months
          for (let month = 1; month <= 12; month++) {
            if (!allPredictions.some(p => p.month === month)) {
              // Add missing month
              allPredictions.push({
                month,
                year: predictionYear,
                income: Object.keys(INITIAL_INCOME_FIELDS).reduce((acc, key) => {
                  acc[key] = 0;
                  return acc;
                }, {} as FormData),
                expense: Object.keys(INITIAL_EXPENSE_FIELDS).reduce((acc, key) => {
                  acc[key] = 0;
                  return acc;
                }, {} as FormData)
              });
            }
          }
          
          // Sort by month for consistency
          allPredictions.sort((a, b) => a.month - b.month);
          
          setPredictions(allPredictions);
          
          // Extract custom fields from saved data
          const customIncome: {[key: string]: string} = {};
          const customExpense: {[key: string]: string} = {};
          
          data.predictions.forEach((prediction: PredictionData) => {
            // Check for custom income fields
            Object.keys(prediction.income).forEach(key => {
              if (!INITIAL_INCOME_FIELDS[key] && !customIncome[key]) {
                customIncome[key] = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              }
            });
            
            // Check for custom expense fields
            Object.keys(prediction.expense).forEach(key => {
              if (!INITIAL_EXPENSE_FIELDS[key] && !customExpense[key]) {
                customExpense[key] = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              }
            });
          });
          
          setCustomIncomeFields(customIncome);
          setCustomExpenseFields(customExpense);

          // Make sure all custom fields exist in all months
          if (Object.keys(customIncome).length > 0 || Object.keys(customExpense).length > 0) {
            allPredictions = allPredictions.map(prediction => {
              const updatedPrediction = { ...prediction };
              
              // Add missing custom income fields
              Object.keys(customIncome).forEach(key => {
                if (!updatedPrediction.income[key]) {
                  updatedPrediction.income = { ...updatedPrediction.income, [key]: 0 };
                }
              });
              
              // Add missing custom expense fields
              Object.keys(customExpense).forEach(key => {
                if (!updatedPrediction.expense[key]) {
                  updatedPrediction.expense = { ...updatedPrediction.expense, [key]: 0 };
                }
              });
              
              return updatedPrediction;
            });
          }
        } else {
          setPredictions(createDefaultPredictions());
        }
      } else {
        setPredictions(createDefaultPredictions());
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions(createDefaultPredictions());
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new custom income field
  const addCustomIncomeField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeFieldName.trim()) return;
    
    const key = newIncomeFieldName.toLowerCase().replace(/\s+/g, '');
    setCustomIncomeFields({
      ...customIncomeFields,
      [key]: newIncomeFieldName
    });
    
    // Add this field to all predictions
    setPredictions(prevPredictions => prevPredictions.map(prediction => ({
      ...prediction,
      income: {
        ...prediction.income,
        [key]: 0
      }
    })));
    
    setNewIncomeFieldName('');
  };

  // Add a new custom expense field
  const addCustomExpenseField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseFieldName.trim()) return;
    
    const key = newExpenseFieldName.toLowerCase().replace(/\s+/g, '');
    setCustomExpenseFields({
      ...customExpenseFields,
      [key]: newExpenseFieldName
    });
    
    // Add this field to all predictions
    setPredictions(prevPredictions => prevPredictions.map(prediction => ({
      ...prediction,
      expense: {
        ...prediction.expense,
        [key]: 0
      }
    })));
    
    setNewExpenseFieldName('');
  };

  // Handle form field change
  const handleFieldChange = (
    month: number, 
    category: 'income' | 'expense', 
    field: string, 
    value: string
  ) => {
    const numericValue = value ? parseInt(value) : 0;
    
    setPredictions(prevPredictions => prevPredictions.map(prediction => {
      if (prediction.month === month) {
        return {
          ...prediction,
          [category]: {
            ...prediction[category],
            [field]: numericValue
          }
        };
      }
      return prediction;
    }));
  };

  // Save prediction for a specific month
  const savePrediction = async (month: number) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const prediction = predictions.find(p => p.month === month);
      if (!prediction) return;
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prediction),
      });
      
      if (response.ok) {
        setMessage(`Data for ${MONTHS[month - 1]} ${predictionYear} saved successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save prediction');
      }
    } catch (error) {
      console.error('Error saving prediction:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals for a month
  const calculateMonthTotals = (month: number) => {
    try {
      const prediction = predictions.find(p => p.month === month);
      if (!prediction) return { incomeTotal: 0, expenseTotal: 0, balance: 0 };
      
      const incomeTotal = Object.values(prediction.income || {}).reduce((sum, val) => sum + (val || 0), 0);
      const expenseTotal = Object.values(prediction.expense || {}).reduce((sum, val) => sum + (val || 0), 0);
      
      return {
        incomeTotal,
        expenseTotal,
        balance: incomeTotal - expenseTotal
      };
    } catch (error) {
      console.error('Error calculating monthly totals:', error);
      return { incomeTotal: 0, expenseTotal: 0, balance: 0 };
    }
  };

  // Calculate yearly totals
  const calculateYearlyTotals = () => {
    try {
      let totalIncome = 0;
      let totalExpense = 0;
      
      predictions.forEach(prediction => {
        if (!prediction || !prediction.income || !prediction.expense) return;
        
        const incomeTotal = Object.values(prediction.income).reduce((sum, val) => sum + (val || 0), 0);
        const expenseTotal = Object.values(prediction.expense).reduce((sum, val) => sum + (val || 0), 0);
        
        totalIncome += incomeTotal;
        totalExpense += expenseTotal;
      });
      
      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        projectedSaving: (currentSaving || 0) + totalIncome - totalExpense
      };
    } catch (error) {
      console.error('Error calculating yearly totals:', error);
      return { totalIncome: 0, totalExpense: 0, balance: 0, projectedSaving: currentSaving || 0 };
    }
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    const chartData = predictions.map(prediction => {
      // Ensure all values are properly initialized
      const incomeTotal = Object.values(prediction.income || {}).reduce((sum, val) => sum + (val || 0), 0);
      const expenseTotal = Object.values(prediction.expense || {}).reduce((sum, val) => sum + (val || 0), 0);
      const balance = incomeTotal - expenseTotal;
      
      // Calculate the cumulative saving at each month with proper null checks
      let cumulativeSaving = currentSaving || 0;
      for (let i = 0; i < prediction.month; i++) {
        const p = predictions[i];
        if (p) {
          const monthlyIncome = Object.values(p.income || {}).reduce((sum, val) => sum + (val || 0), 0);
          const monthlyExpense = Object.values(p.expense || {}).reduce((sum, val) => sum + (val || 0), 0);
          cumulativeSaving += monthlyIncome - monthlyExpense;
        }
      }
      
      return {
        month: `${MONTHS[(prediction.month - 1) % 12]} ${predictionYear}`,
        income: Math.round(incomeTotal),
        expense: Math.round(expenseTotal),
        saving: Math.round(balance),
        cumulativeSaving: Math.round(cumulativeSaving)
      };
    });
    
    return chartData;
  };

  // Render income form fields
  const renderIncomeFields = (month: number) => {
    const prediction = predictions.find(p => p.month === month);
    if (!prediction) return null;
    
    return (
      <div className="space-y-3">
        {Object.keys(INITIAL_INCOME_FIELDS).map(key => (
          <div key={key}>
            <label htmlFor={`income-${month}-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
              {INITIAL_INCOME_FIELDS[key]}
            </label>
            <input
              type="number"
              id={`income-${month}-${key}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prediction.income[key] || 0}
              onChange={(e) => handleFieldChange(month, 'income', key, e.target.value)}
              min="0"
            />
          </div>
        ))}
        
        {Object.keys(customIncomeFields).map(key => (
          <div key={key}>
            <label htmlFor={`income-${month}-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
              {customIncomeFields[key]}
            </label>
            <input
              type="number"
              id={`income-${month}-${key}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prediction.income[key] || 0}
              onChange={(e) => handleFieldChange(month, 'income', key, e.target.value)}
              min="0"
            />
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-200">
          <form onSubmit={addCustomIncomeField} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom field"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newIncomeFieldName}
              onChange={(e) => setNewIncomeFieldName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Render expense form fields
  const renderExpenseFields = (month: number) => {
    const prediction = predictions.find(p => p.month === month);
    if (!prediction) return null;
    
    return (
      <div className="space-y-3">
        {Object.keys(INITIAL_EXPENSE_FIELDS).map(key => (
          <div key={key}>
            <label htmlFor={`expense-${month}-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
              {INITIAL_EXPENSE_FIELDS[key]}
            </label>
            <input
              type="number"
              id={`expense-${month}-${key}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prediction.expense[key] || 0}
              onChange={(e) => handleFieldChange(month, 'expense', key, e.target.value)}
              min="0"
            />
          </div>
        ))}
        
        {Object.keys(customExpenseFields).map(key => (
          <div key={key}>
            <label htmlFor={`expense-${month}-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
              {customExpenseFields[key]}
            </label>
            <input
              type="number"
              id={`expense-${month}-${key}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prediction.expense[key] || 0}
              onChange={(e) => handleFieldChange(month, 'expense', key, e.target.value)}
              min="0"
            />
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-200">
          <form onSubmit={addCustomExpenseField} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom field"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newExpenseFieldName}
              onChange={(e) => setNewExpenseFieldName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Render monthly summary for each month tab
  const renderMonthlySummary = (month: number) => {
    try {
      const prediction = predictions.find(p => p.month === month);
      const { incomeTotal, expenseTotal, balance } = calculateMonthTotals(month);
      
      // Calculate Mum's and Dad's income breakdown
      const mumsIncome = prediction ? 
        ((prediction.income?.mumsSalary || 0) + (prediction.income?.mumsIncentive || 0)) : 0;
      const dadsIncome = prediction ? (prediction.income?.dadsTransfer || 0) : 0;
      
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Monthly Summary</h3>
          {isRateLoading && (
            <div className="text-xs text-blue-600 mb-2">
              Loading exchange rate...
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">Total Income</p>
              <p className="text-xl font-bold text-green-600">
                {Math.round(incomeTotal).toLocaleString()} ₱
                <span className="text-sm ml-1 font-normal">
                  ({Math.round(incomeTotal * phpToJpy).toLocaleString()} ¥)
                </span>
              </p>
              <div className="mt-2 pt-2 border-t border-green-100">
                <p className="text-xs text-green-700 flex justify-between">
                  <span>Mum's Total:</span>
                  <span>{Math.round(mumsIncome).toLocaleString()} ₱</span>
                </p>
                <p className="text-xs text-green-700 flex justify-between">
                  <span>Dad's Income:</span>
                  <span>{Math.round(dadsIncome).toLocaleString()} ₱</span>
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">Total Expense</p>
              <p className="text-xl font-bold text-red-600">
                {Math.round(expenseTotal).toLocaleString()} ₱
                <span className="text-sm ml-1 font-normal">
                  ({Math.round(expenseTotal * phpToJpy).toLocaleString()} ¥)
                </span>
              </p>
            </div>
            <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-800' : 'text-yellow-800'} mb-1`}>
                Balance
              </p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {Math.round(balance).toLocaleString()} ₱
                <span className="text-sm ml-1 font-normal">
                  ({Math.round(balance * phpToJpy).toLocaleString()} ¥)
                </span>
              </p>
            </div>
          </div>
          {!isRateLoading && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              Exchange rate: 1 PHP = {phpToJpy.toFixed(2)} JPY
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering monthly summary:', error);
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Monthly Summary</h3>
          <p className="text-sm text-red-600">Error loading summary data. Please try again.</p>
        </div>
      );
    }
  };

  // Render prediction dashboard tab content
  const renderPredictionDashboard = () => {
    try {
      const { totalIncome, totalExpense, balance, projectedSaving } = calculateYearlyTotals();
      const chartData = prepareChartData();
      
      // Calculate total Mum's and Dad's income with error handling
      let totalMumsIncome = 0;
      let totalDadsIncome = 0;
      
      predictions.forEach(prediction => {
        if (!prediction || !prediction.income) return;
        totalMumsIncome += ((prediction.income.mumsSalary || 0) + (prediction.income.mumsIncentive || 0));
        totalDadsIncome += (prediction.income.dadsTransfer || 0);
      });
      
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Financial Projection for {predictionYear}</h2>
            {isRateLoading && (
              <div className="text-xs text-blue-600 mb-3">
                Loading exchange rate...
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Current Saving</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(currentSaving || 0).toLocaleString()} ₱
                </p>
                <p className="text-sm text-blue-600">
                  {Math.round((currentSaving || 0) * phpToJpy).toLocaleString()} ¥
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(totalIncome).toLocaleString()} ₱
                </p>
                <p className="text-sm text-green-600">
                  {Math.round(totalIncome * phpToJpy).toLocaleString()} ¥
                </p>
                <div className="mt-2 pt-2 border-t border-green-100">
                  <p className="text-xs text-green-700 flex justify-between">
                    <span>Mum's Total:</span>
                    <span>{Math.round(totalMumsIncome).toLocaleString()} ₱</span>
                  </p>
                  <p className="text-xs text-green-700 flex justify-between">
                    <span>Dad's Income:</span>
                    <span>{Math.round(totalDadsIncome).toLocaleString()} ₱</span>
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(totalExpense).toLocaleString()} ₱
                </p>
                <p className="text-sm text-red-600">
                  {Math.round(totalExpense * phpToJpy).toLocaleString()} ¥
                </p>
              </div>
              <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-purple-50' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium ${balance >= 0 ? 'text-purple-800' : 'text-yellow-800'} mb-1`}>
                  Projected End-Year Saving
                </p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-purple-600' : 'text-yellow-600'}`}>
                  {Math.round(projectedSaving).toLocaleString()} ₱
                </p>
                <p className={`text-sm ${balance >= 0 ? 'text-purple-600' : 'text-yellow-600'}`}>
                  {Math.round(projectedSaving * phpToJpy).toLocaleString()} ¥
                </p>
              </div>
            </div>
            {!isRateLoading && (
              <div className="text-xs text-gray-500 mt-2 text-right">
                Exchange rate: 1 PHP = {phpToJpy.toFixed(2)} JPY
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Income, Expense & Cumulative Saving Projection</h2>
            <div className="h-96">
              {chartData.length > 0 ? (
                <IncomeExpenseChart data={chartData} height="100%" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available for chart</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering prediction dashboard:', error);
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Financial Projection for {predictionYear}</h2>
            <p className="text-sm text-red-600">Error loading projection data. Please try again.</p>
          </div>
        </div>
      );
    }
  };

  // Render monthly tab content
  const renderMonthTab = (month: number) => {
    return (
      <div>
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {renderMonthlySummary(month)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Income</h2>
            {renderIncomeFields(month)}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Expense</h2>
            {renderExpenseFields(month)}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => savePrediction(month)}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Prediction Year:</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPredictionYear(2025)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                predictionYear === 2025 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setPredictionYear(2026)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                predictionYear === 2026 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              2026
            </button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 0 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(0)}
          >
            Future Prediction
          </button>
          
          {MONTHS.map((month, index) => (
            <button
              key={month}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === index + 1 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(index + 1)}
            >
              {month} {predictionYear}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {activeTab === 0 ? (
          renderPredictionDashboard()
        ) : (
          renderMonthTab(activeTab)
        )}
      </div>
    </div>
  );
} 