'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Default fallback rate in case API fails
const DEFAULT_YEN_TO_PHP_RATE = 0.37;

export default function SavingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_YEN_TO_PHP_RATE);
  const [isRateLoading, setIsRateLoading] = useState(true);
  
  // Japanese side state
  const [japaneseSaving, setJapaneseSaving] = useState({
    bankSaving: 0
  });
  
  // Philippines side state
  const [philippinesSaving, setPhilippinesSaving] = useState({
    bpiBankSaving: 0,
    bdoBankSaving: 0,
    unionBankSaving: 0,
    mobileWalletSaving: 0,
    cashSaving: 0
  });
  
  // Fetch latest exchange rate
  const fetchExchangeRate = async () => {
    try {
      setIsRateLoading(true);
      const response = await fetch('https://open.er-api.com/v6/latest/JPY');
      if (response.ok) {
        const data = await response.json();
        if (data.rates && data.rates.PHP) {
          setExchangeRate(data.rates.PHP);
          console.log('Updated exchange rate: 1 JPY =', data.rates.PHP, 'PHP');
        } else {
          console.warn('Exchange rate data incomplete, using default rate');
          setExchangeRate(DEFAULT_YEN_TO_PHP_RATE);
        }
      } else {
        console.warn('Failed to fetch exchange rate, using default rate');
        setExchangeRate(DEFAULT_YEN_TO_PHP_RATE);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(DEFAULT_YEN_TO_PHP_RATE);
    } finally {
      setIsRateLoading(false);
    }
  };
  
  // Fetch existing data and exchange rate on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch exchange rate
        await fetchExchangeRate();
        
        // Fetch Japanese savings
        const japaneseResponse = await fetch('/api/savings/japanese');
        if (japaneseResponse.ok) {
          const data = await japaneseResponse.json();
          if (data.saving) {
            setJapaneseSaving({
              bankSaving: data.saving.bankSaving
            });
          }
        }
        
        // Fetch Philippines savings
        const philippinesResponse = await fetch('/api/savings/philippines');
        if (philippinesResponse.ok) {
          const data = await philippinesResponse.json();
          if (data.saving) {
            setPhilippinesSaving({
              bpiBankSaving: data.saving.bpiBankSaving,
              bdoBankSaving: data.saving.bdoBankSaving,
              unionBankSaving: data.saving.unionBankSaving,
              mobileWalletSaving: data.saving.mobileWalletSaving,
              cashSaving: data.saving.cashSaving
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle Japanese saving form submit
  const handleJapaneseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/savings/japanese', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(japaneseSaving),
      });
      
      if (response.ok) {
        setMessage('Japanese savings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update Japanese savings');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error updating Japanese savings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Philippines saving form submit
  const handlePhilippinesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/savings/philippines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(philippinesSaving),
      });
      
      if (response.ok) {
        setMessage('Philippines savings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update Philippines savings');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error updating Philippines savings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate total Philippines savings
  const totalPhilippinesSaving = 
    philippinesSaving.bpiBankSaving + 
    philippinesSaving.bdoBankSaving + 
    philippinesSaving.unionBankSaving + 
    philippinesSaving.mobileWalletSaving + 
    philippinesSaving.cashSaving;
    
  // Calculate Japanese saving in PHP
  const japaneseInPhp = japaneseSaving.bankSaving * exchangeRate;
  
  // Calculate grand total in PHP
  const grandTotal = japaneseInPhp + totalPhilippinesSaving;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Savings Management</h1>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          {isRateLoading ? 'Loading exchange rate...' : `Current exchange rate: 1 JPY = ${exchangeRate.toFixed(4)} PHP`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Philippines Side Current Saving</h2>
          <form className="space-y-4" onSubmit={handlePhilippinesSubmit}>
            <div>
              <label htmlFor="bpiBankSaving" className="block text-sm font-medium text-gray-700 mb-1">
                BPI Bank Saving (PHP)
              </label>
              <input
                type="number"
                id="bpiBankSaving"
                name="bpiBankSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={philippinesSaving.bpiBankSaving}
                onChange={(e) => setPhilippinesSaving({ 
                  ...philippinesSaving, 
                  bpiBankSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="bdoBankSaving" className="block text-sm font-medium text-gray-700 mb-1">
                BDO Bank Saving (PHP)
              </label>
              <input
                type="number"
                id="bdoBankSaving"
                name="bdoBankSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={philippinesSaving.bdoBankSaving}
                onChange={(e) => setPhilippinesSaving({ 
                  ...philippinesSaving, 
                  bdoBankSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="unionBankSaving" className="block text-sm font-medium text-gray-700 mb-1">
                Union Bank Saving (PHP)
              </label>
              <input
                type="number"
                id="unionBankSaving"
                name="unionBankSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={philippinesSaving.unionBankSaving}
                onChange={(e) => setPhilippinesSaving({ 
                  ...philippinesSaving, 
                  unionBankSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="mobileWalletSaving" className="block text-sm font-medium text-gray-700 mb-1">
                Gcash/Grab Saving (PHP)
              </label>
              <input
                type="number"
                id="mobileWalletSaving"
                name="mobileWalletSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={philippinesSaving.mobileWalletSaving}
                onChange={(e) => setPhilippinesSaving({ 
                  ...philippinesSaving, 
                  mobileWalletSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="cashSaving" className="block text-sm font-medium text-gray-700 mb-1">
                Cash Saving (PHP)
              </label>
              <input
                type="number"
                id="cashSaving"
                name="cashSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={philippinesSaving.cashSaving}
                onChange={(e) => setPhilippinesSaving({ 
                  ...philippinesSaving, 
                  cashSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isLoading ? 'Updating...' : 'Update Philippines Savings'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Japanese Side Current Saving</h2>
          <form className="space-y-4" onSubmit={handleJapaneseSubmit}>
            <div>
              <label htmlFor="japaneseBankSaving" className="block text-sm font-medium text-gray-700 mb-1">
                Japanese Bank Saving (JPY)
              </label>
              <input
                type="number"
                id="japaneseBankSaving"
                name="japaneseBankSaving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                value={japaneseSaving.bankSaving}
                onChange={(e) => setJapaneseSaving({ 
                  ...japaneseSaving, 
                  bankSaving: Number(e.target.value)
                })}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isLoading ? 'Updating...' : 'Update Japanese Savings'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Saving Detail</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Japanese Side Saving (JPY)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ¥{japaneseSaving.bankSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Japanese Side Saving in PHP (converted)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{japaneseInPhp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  BPI Bank Saving
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{philippinesSaving.bpiBankSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  BDO Bank Saving
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{philippinesSaving.bdoBankSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Union Bank Saving
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{philippinesSaving.unionBankSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Gcash/Grab Saving
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{philippinesSaving.mobileWalletSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cash Saving
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₱{philippinesSaving.cashSaving.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  Philippines Side Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ₱{totalPhilippinesSaving.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                  Grand Total (PHP)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                  ₱{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 