'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      <div className="flex space-x-4">
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </Link>
        <Link 
          href="/pages/expense"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go to Expenses
        </Link>
      </div>
    </div>
  );
} 