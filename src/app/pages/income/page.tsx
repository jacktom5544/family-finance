'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface Income {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  date: Date;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState<string>('');

  // Monthly view state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [monthlyIncomes, setMonthlyIncomes] = useState<Income[]>([]);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState<boolean>(false);

  // Edit Income modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: new Date()
  });
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);

  // Add a number formatter function
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch incomes
  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/income');
      if (!response.ok) throw new Error('Failed to fetch incomes');
      const data = await response.json();
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  // Fetch monthly incomes
  const fetchMonthlyIncomes = async () => {
    setIsLoadingMonthly(true);
    try {
      // Create date range for selected month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`/api/income?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch monthly incomes');
      
      const data = await response.json();
      setMonthlyIncomes(data);
    } catch (error) {
      console.error('Error fetching monthly incomes:', error);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/income-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle form submission for adding income
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      alert('Please select a category');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          note,
          date
        }),
      });

      if (!response.ok) throw new Error('Failed to add income');
      
      // Reset form
      setAmount('');
      setCategory('');
      setNote('');
      setDate(new Date());
      
      // Refresh incomes list
      fetchIncomes();
      
      // Refresh monthly incomes if the added income falls in the selected month/year
      const incomeDate = new Date(date);
      if (incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear) {
        fetchMonthlyIncomes();
      }
    } catch (error) {
      console.error('Error adding income:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the edit modal
  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setEditFormData({
      amount: income.amount.toString(),
      category: income.category,
      note: income.note || '',
      date: new Date(income.date)
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change in edit form
  const handleEditDateChange = (date: Date | null) => {
    setEditFormData(prev => ({
      ...prev,
      date: date || new Date()
    }));
  };

  // Handle saving edited income
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;
    
    // Validate fields
    if (!editFormData.amount || isNaN(parseFloat(editFormData.amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!editFormData.category) {
      alert('Please select a category');
      return;
    }
    
    setIsEditLoading(true);
    
    try {
      // Make sure the date is in ISO format for the API
      const formattedDate = editFormData.date instanceof Date ? 
        editFormData.date.toISOString() : 
        new Date(editFormData.date).toISOString();
      
      const response = await fetch(`/api/income/${editingIncome._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(editFormData.amount),
          category: editFormData.category,
          note: editFormData.note,
          date: formattedDate
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update income: ${errorText}`);
      }
      
      // Close modal and refresh data
      setIsEditModalOpen(false);
      setEditingIncome(null);
      fetchIncomes();
      fetchMonthlyIncomes();
    } catch (error) {
      console.error('Error updating income:', error);
      alert('Failed to update income. Please try again.');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingIncome(null);
  };

  // Handle deleting income
  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    
    try {
      const response = await fetch(`/api/income/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete income: ${errorText}`);
      }
      
      // Refresh data
      fetchIncomes();
      fetchMonthlyIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income. Please try again.');
    }
  };

  // Handle adding a new category
  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      const response = await fetch('/api/income-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });
      
      if (response.ok) {
        setNewCategory('');
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        if (response.status === 409) {
          alert('Category already exists');
        }
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category._id);
    setEditedCategoryName(category.name);
  };

  // Handle updating a category
  const handleUpdateCategory = async (categoryId: string) => {
    if (!editedCategoryName.trim()) return;
    
    try {
      const response = await fetch(`/api/income-categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedCategoryName })
      });
      
      if (response.ok) {
        setEditingCategoryId(null);
        setEditedCategoryName('');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  // Handle canceling category edit
  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditedCategoryName('');
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/income-categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Group incomes by category for the monthly view
  const getIncomesByCategory = () => {
    const incomeByCategory: { [key: string]: number } = {};
    
    monthlyIncomes.forEach(income => {
      if (!incomeByCategory[income.category]) {
        incomeByCategory[income.category] = 0;
      }
      incomeByCategory[income.category] += income.amount;
    });
    
    return incomeByCategory;
  };

  // Prepare data for the pie chart
  const getPieChartData = () => {
    const incomeByCategory = getIncomesByCategory();
    
    // Format data for Recharts
    return Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Define chart colors
  const CHART_COLORS = [
    '#0088FE', // Blue
    '#00C49F', // Teal
    '#FFBB28', // Yellow
    '#FF8042', // Orange
    '#FF6384', // Red
    '#9966FF', // Purple
    '#C0C0C0', // Gray
    '#50C878', // Green
    '#FF7F50', // Coral
    '#6A0DAD'  // Purple
  ];

  // Custom tooltip renderer
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalValue = getPieChartData().reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">₱{formatAmount(data.value)}</p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    
    return null;
  };

  // Total monthly income
  const getTotalMonthlyIncome = () => {
    return monthlyIncomes.reduce((total, income) => total + income.amount, 0);
  };

  // Load data on component mount
  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  // Fetch monthly incomes when year or month changes
  useEffect(() => {
    fetchMonthlyIncomes();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Income Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <DatePicker
                selected={date}
                onChange={(date: Date | null) => setDate(date || new Date())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note about this income (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Income'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Income Category</h2>
          <form className="space-y-4 mb-6" onSubmit={handleCategorySubmit}>
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Category
            </button>
          </form>
          
          <h3 className="text-lg font-medium mb-2">Your Categories</h3>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">No categories found. Add one above.</p>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  {editingCategoryId === category._id ? (
                    <>
                      <input
                        type="text"
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <div>
                        <button 
                          onClick={() => handleUpdateCategory(category._id)}
                          className="text-green-600 hover:text-green-800 mr-2"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{category.name}</span>
                      <div>
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Monthly Income Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Income Overview</h2>
        <div className="mb-4">
          <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Year
          </label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value));
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 overflow-x-auto">
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                <button
                  key={month}
                  className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${
                    selectedMonth === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedMonth(index);
                  }}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Monthly Summary */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear} Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Total Income</p>
              <p className="text-2xl font-bold text-blue-900">
                ₱{formatAmount(getTotalMonthlyIncome())}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Number of Income Records</p>
              <p className="text-2xl font-bold text-blue-900">{monthlyIncomes.length}</p>
            </div>
          </div>
        </div>
        
        {/* Income by Category - Pie Chart */}
        {isLoadingMonthly ? (
          <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-300">
              <h3 className="text-lg font-medium">Income by Category</h3>
            </div>
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-300">
              <h3 className="text-lg font-medium">Income by Category</h3>
            </div>
            {monthlyIncomes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No income records for this month.
              </div>
            ) : (
              <div className="p-4">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Income Entries Table */}
        <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-300">
            <h3 className="text-lg font-medium">Income Entries</h3>
          </div>
          {monthlyIncomes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No income records for this month.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyIncomes.map((income) => (
                    <tr key={income._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(income.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₱{formatAmount(income.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.note || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleEditIncome(income)} 
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteIncome(income._id)} 
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={2}>
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₱{formatAmount(getTotalMonthlyIncome())}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Income Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Income</h3>
              <button 
                onClick={handleCloseEditModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="edit-amount"
                    name="amount"
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <DatePicker
                    selected={editFormData.date}
                    onChange={handleEditDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700 mb-1">
                    Note <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    id="edit-note"
                    name="note"
                    rows={3}
                    value={editFormData.note}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isEditLoading}
                >
                  {isEditLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 