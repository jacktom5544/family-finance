'use client';

import React, { useState } from 'react';
import { YearlyBarChart, MonthlyLineChart } from '../components/Charts';

// Sample data - in a real app, this would come from the database
const yearlyData = [
  { name: '2019', income: 1200, expense: 900 },
  { name: '2020', income: 1000, expense: 800 },
  { name: '2021', income: 1500, expense: 1200 },
  { name: '2022', income: 1300, expense: 1100 },
  { name: '2023', income: 1700, expense: 1300 },
  { name: '2024', income: 1600, expense: 1400 },
];

const monthlyData = [
  { name: 'Jan', value: 40000 },
  { name: 'Feb', value: 30000 },
  { name: 'Mar', value: 45000 },
  { name: 'Apr', value: 35000 },
  { name: 'May', value: 50000 },
  { name: 'Jun', value: 42000 },
  { name: 'Jul', value: 48000 },
  { name: 'Aug', value: 52000 },
  { name: 'Sep', value: 45000 },
  { name: 'Oct', value: 55000 },
  { name: 'Nov', value: 48000 },
  { name: 'Dec', value: 60000 },
];

const dailyData = [
  { name: '1', value: 1200 },
  { name: '2', value: 1500 },
  { name: '3', value: 1000 },
  { name: '4', value: 1800 },
  { name: '5', value: 1300 },
  { name: '6', value: 900 },
  { name: '7', value: 1100 },
  { name: '8', value: 1400 },
  { name: '9', value: 1600 },
  { name: '10', value: 1200 },
  { name: '11', value: 1000 },
  { name: '12', value: 1700 },
  { name: '13', value: 1300 },
  { name: '14', value: 1500 },
  { name: '15', value: 1800 },
];

// Keep this for future use if needed
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Home() {
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  });

  // Add a number formatter function
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Yearly summary</h2>
          <YearlyBarChart data={yearlyData} />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Daily Expense</h2>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">₱{formatAmount(163)}</p>
                <p className="text-sm text-green-500 flex items-center justify-center">
                  <span className="mr-1">↑</span>
                  <span>11.2% Per day</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Expense</h2>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">₱{formatAmount(1263)}</p>
                <p className="text-sm text-green-500 flex items-center justify-center">
                  <span className="mr-1">↑</span>
                  <span>11.2% Per month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentDate}</span>
              <div className="flex border rounded-md overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm ${chartView === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setChartView('daily')}
                >
                  Daily
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${chartView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setChartView('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
          <MonthlyLineChart data={chartView === 'daily' ? dailyData : monthlyData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Bank Account</h2>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">You Send</span>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs mr-1">
                  $
                </div>
                <span className="text-sm">USA</span>
              </div>
            </div>
            <p className="text-xl font-semibold">$1,910.34</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">You Receive</span>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-1">
                  ₱
                </div>
                <span className="text-sm">PHP</span>
              </div>
            </div>
            <p className="text-xl font-semibold">$1,910.34</p>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
            Send Now
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction</h2>
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${chartView === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setChartView('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-3 py-1 text-sm ${chartView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setChartView('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        MR
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Marilyn Ramirez</div>
                        <div className="text-sm text-gray-500">marilyn@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">INV29834590</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>LM9840557FCN</div>
                    <div className="text-xs">Miles Road, Sunriseland</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$1,910.34</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Daily Transaction Limit</h2>
            <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded-full">Highly risky</span>
          </div>
          <p className="text-xl font-semibold mb-2">₱{formatAmount(1900)} <span className="text-sm font-normal text-gray-500">spent of ₱{formatAmount(2499)}</span></p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '76%' }}></div>
          </div>
          <div className="text-right">
            <span className="font-semibold">76%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
