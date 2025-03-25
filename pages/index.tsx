import React from 'react';
import Link from 'next/link';

export default function LegacyIndexPage() {
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
        Family Finance - Legacy Page
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        This is the Pages Router Index 
      </p>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <a 
          href="/test-page" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}
        >
          Test Page
        </a>
        <a 
          href="/alt-page" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}
        >
          Alt Page
        </a>
      </div>
      
      <div style={{
        marginTop: '2rem',
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        width: '100%',
        maxWidth: '600px'
      }}>
        <a
          href="/pages/expense"
          style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Expenses
        </a>
        <a
          href="/pages/income"
          style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Income
        </a>
        <a
          href="/pages/food"
          style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Food
        </a>
      </div>
    </div>
  );
} 