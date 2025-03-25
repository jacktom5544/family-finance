'use client';

import React from 'react';
import Link from 'next/link';

export default function StaticHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Family Finance</h1>
      <p className="text-lg mb-8">Welcome to your financial management application</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        <Link 
          href="/pages/expense"
          className="p-6 bg-blue-100 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Expenses</h2>
          <p>Manage your daily and monthly expenses</p>
        </Link>
        
        <Link 
          href="/pages/income"
          className="p-6 bg-green-100 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Income</h2>
          <p>Track your income sources</p>
        </Link>
        
        <Link 
          href="/pages/food"
          className="p-6 bg-yellow-100 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Food</h2>
          <p>Monitor your food expenses</p>
        </Link>
        
        <Link 
          href="/pages/prediction"
          className="p-6 bg-purple-100 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Predictions</h2>
          <p>View financial forecasts</p>
        </Link>
        
        <Link 
          href="/pages/saving"
          className="p-6 bg-indigo-100 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">Savings</h2>
          <p>Manage your savings goals</p>
        </Link>
      </div>
    </div>
  );
} 