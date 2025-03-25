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
        This is the Pages Router Index (should redirect to App Router)
      </p>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link href="/test-page" passHref>
          <a style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Test Page
          </a>
        </Link>
        <Link href="/alt-page" passHref>
          <a style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '0.25rem',
            textDecoration: 'none'
          }}>
            Alt Page
          </a>
        </Link>
      </div>
    </div>
  );
} 