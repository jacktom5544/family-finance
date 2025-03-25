'use client';

import React from 'react';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Test Page</h1>
      <p className="text-lg mb-8">If you can see this, the Next.js routing is working!</p>
      
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Home
        </Link>
        
        <Link
          href="/pages/expense"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Expenses
        </Link>
      </div>
    </div>
  );
} 