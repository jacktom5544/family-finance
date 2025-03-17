'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for the component that uses charts
const PredictionTabs = dynamic(() => import('@/components/PredictionTabs'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function PredictionPage() {
  const [currentSaving, setCurrentSaving] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current saving on page load
  useEffect(() => {
    const fetchSavingData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Japanese savings
        const japaneseResponse = await fetch('/api/savings/japanese');
        let japaneseSaving = 0;
        if (japaneseResponse.ok) {
          const data = await japaneseResponse.json();
          if (data.saving) {
            // Convert JPY to PHP using the exchange rate
            const exchangeRateResponse = await fetch('https://open.er-api.com/v6/latest/JPY');
            let exchangeRate = 0.37; // Default fallback rate
            
            if (exchangeRateResponse.ok) {
              const rateData = await exchangeRateResponse.json();
              if (rateData.rates && rateData.rates.PHP) {
                exchangeRate = rateData.rates.PHP;
              }
            }
            
            japaneseSaving = data.saving.bankSaving * exchangeRate;
          }
        }
        
        // Fetch Philippines savings
        const philippinesResponse = await fetch('/api/savings/philippines');
        let philippinesSaving = 0;
        if (philippinesResponse.ok) {
          const data = await philippinesResponse.json();
          if (data.saving) {
            philippinesSaving = 
              (data.saving.bpiBankSaving || 0) + 
              (data.saving.bdoBankSaving || 0) + 
              (data.saving.unionBankSaving || 0) + 
              (data.saving.mobileWalletSaving || 0) + 
              (data.saving.cashSaving || 0);
          }
        }
        
        // Set total current saving
        setCurrentSaving(japaneseSaving + philippinesSaving);
      } catch (error) {
        console.error('Error fetching saving data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavingData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Future Predictions</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <PredictionTabs currentSaving={currentSaving} />
        </Suspense>
      )}
    </div>
  );
} 