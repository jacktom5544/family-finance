import React from 'react';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Family Finance
      </h1>
      <p style={{ marginBottom: '2rem' }}>
        Your personal finance management application
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}>
        <a href="/pages/expense" style={{
          padding: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Expenses
        </a>
        <a href="/pages/income" style={{
          padding: '1rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Income
        </a>
        <a href="/pages/food" style={{
          padding: '1rem',
          backgroundColor: '#f59e0b',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Food
        </a>
      </div>
    </div>
  );
} 