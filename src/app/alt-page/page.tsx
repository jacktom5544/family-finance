import React from 'react';
import Link from 'next/link';

export default function AltPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Family Finance
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Static Alternative Page - No Client Components
      </p>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link href="/" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Home
        </Link>
        <Link href="/test-page" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Test Page
        </Link>
        <Link href="/pages/expense" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Expenses
        </Link>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        This is a server component with minimal dependencies
      </p>
    </div>
  );
} 