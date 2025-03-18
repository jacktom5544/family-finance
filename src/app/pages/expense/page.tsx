'use client';

import React, { useState, useEffect, useRef } from 'react';

// Define interfaces for our data types
interface Category {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  _id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpensePage() {
  const [expenseData, setExpenseData] = useState({
    amount: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Category editing state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  
  // Monthly view state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['all']));
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'table'>('grid');
  const [gridOrientation, setGridOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  // Modal state for editing expense
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: ''
  });

  // Add a number formatter function
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Mouse position tracking for tooltips
  useEffect(() => {
    const trackMousePosition = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', trackMousePosition);
    
    return () => {
      document.removeEventListener('mousemove', trackMousePosition);
    };
  }, []);

  // Fetch categories and expenses on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch monthly expenses when year or month changes
  useEffect(() => {
    fetchMonthlyExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchMonthlyExpenses = async () => {
    setIsLoadingMonthly(true);
    try {
      // Create date range for selected month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyExpenses(data);
        setFilteredExpenses(data);
        
        // Re-apply any existing category filter
        if (selectedCategory !== 'all') {
          setFilteredExpenses(data.filter((exp: Expense) => exp.category === selectedCategory));
        }
      }
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // Upload image if selected
      let imageUrl = null;
      if (selectedFile) {
        setUploadProgress(30);
        imageUrl = await uploadImage();
        setUploadProgress(70);
      }
      
      // Create expense with or without image
      const expensePayload = {
        ...expenseData,
        imageUrl
      };
      
      console.log('Submitting expense payload:', expensePayload);
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensePayload)
      });
      
      setUploadProgress(100);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Expense added successfully:', responseData);
        
        // Reset form and refresh expenses
        setExpenseData({
          amount: '',
          category: '',
          note: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Check if new expense belongs to currently selected month/year, and refresh if so
        const expenseDate = new Date(expenseData.date);
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        
        if (expenseMonth === selectedMonth && expenseYear === selectedYear) {
          fetchMonthlyExpenses();
        }
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert(`Failed to add expense: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Check the console for more details.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });
      
      if (response.ok) {
        setNewCategory('');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category._id);
    setEditedCategoryName(category.name);
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editedCategoryName.trim()) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
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

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditedCategoryName('');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Group expenses by day for the calendar view
  const groupExpensesByDay = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const expensesByDay: { [key: number]: Expense[] } = {};
    
    // Initialize all days
    for (let i = 1; i <= daysInMonth; i++) {
      expensesByDay[i] = [];
    }
    
    // Group expenses by day
    monthlyExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const day = expenseDate.getDate();
      
      if (expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear) {
        if (!expensesByDay[day]) {
          expensesByDay[day] = [];
        }
        expensesByDay[day].push(expense);
      }
    });
    
    return expensesByDay;
  };
  
  // Calculate total amount for a day
  const calculateDayTotal = (expenses: Expense[]) => {
    return expenses.reduce((total, expense) => {
      return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
    }, 0);
  };
  
  // Get category color
  const getCategoryColor = (categoryName: string) => {
    // Predefined colors for common categories
    const categoryColors: Record<string, string> = {
      'Groceries': 'hsl(120, 70%, 85%)',   // Green shade
      'School': 'hsl(220, 70%, 85%)',      // Blue shade
      'Rent': 'hsl(0, 70%, 85%)',          // Red shade
      'Utilities': 'hsl(45, 70%, 85%)',    // Yellow/Orange shade
      'Transportation': 'hsl(270, 70%, 85%)', // Purple shade
      'Entertainment': 'hsl(320, 70%, 85%)', // Pink shade
      'Healthcare': 'hsl(180, 70%, 85%)',  // Teal shade
    };
    
    // Return predefined color if available
    if (categoryName in categoryColors) {
      return categoryColors[categoryName];
    }
    
    // Fallback to hash-based color for other categories
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate more distinct colors by using wider hue range
    // Add offset to avoid similar colors to predefined ones
    const hue = (hash % 360 + 30) % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  // Open edit modal for an expense
  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      note: expense.note,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  // Handle change in edit form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;
    
    try {
      const response = await fetch(`/api/expenses/${editingExpense._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        // Close modal and refresh expenses
        setIsEditModalOpen(false);
        fetchMonthlyExpenses();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Handle expense deletion
  const handleDeleteExpense = async () => {
    if (!editingExpense) return;
    
    try {
      const response = await fetch(`/api/expenses/${editingExpense._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchMonthlyExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Filter expenses by category
  const filterExpensesByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredExpenses(monthlyExpenses);
    } else {
      setFilteredExpenses(monthlyExpenses.filter(exp => exp.category === category));
    }
  };

  // Filter expenses by multiple categories using checkboxes
  const toggleCategoryFilter = (category: string) => {
    const newSelectedCategories = new Set(selectedCategories);
    
    if (category === 'all') {
      // If 'all' is clicked, clear other selections
      newSelectedCategories.clear();
      newSelectedCategories.add('all');
    } else {
      // Remove 'all' if it's present
      if (newSelectedCategories.has('all')) {
        newSelectedCategories.delete('all');
      }
      
      // Toggle the selected category
      if (newSelectedCategories.has(category)) {
        newSelectedCategories.delete(category);
        // If nothing is selected, add 'all' back
        if (newSelectedCategories.size === 0) {
          newSelectedCategories.add('all');
        }
      } else {
        newSelectedCategories.add(category);
      }
    }
    
    setSelectedCategories(newSelectedCategories);
    
    // Apply the filter
    if (newSelectedCategories.has('all')) {
      setFilteredExpenses(monthlyExpenses);
    } else {
      setFilteredExpenses(
        monthlyExpenses.filter(exp => newSelectedCategories.has(exp.category))
      );
    }
  };

  // Move hook call inside component
  useEffect(() => {
    // Add drag scroll functionality
    const element = horizontalScrollRef.current;
    if (!element || activeTab !== 'grid' || gridOrientation !== 'horizontal') return;
    
    let isDragging = false;
    let startX: number;
    let scrollLeft: number;
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
    };
    
    const onMouseUp = () => {
      isDragging = false;
      element.style.cursor = 'grab';
      element.style.removeProperty('user-select');
    };
    
    const onMouseLeave = () => {
      isDragging = false;
      element.style.cursor = 'grab';
      element.style.removeProperty('user-select');
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5; // Speed multiplier
      element.scrollLeft = scrollLeft - walk;
    };
    
    // Touch events for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging = true;
      startX = e.touches[0].pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    };
    
    const onTouchEnd = () => {
      isDragging = false;
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const x = e.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5; // Speed multiplier
      element.scrollLeft = scrollLeft - walk;
    };
    
    // Add event listeners
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseLeave);
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchmove', onTouchMove);
    
    // Set initial cursor
    element.style.cursor = 'grab';
    
    // Cleanup
    return () => {
      element.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('mouseleave', onMouseLeave);
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchmove', onTouchMove);
    };
  }, [activeTab, gridOrientation]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expense Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form className="space-y-4" onSubmit={handleExpenseSubmit}>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={expenseData.date}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₱)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={expenseData.amount}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in ₱"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={expenseData.category}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note (Optional)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={expenseData.note}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note about this expense"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Image (Optional)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedFile && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {selectedFile.name}
                </p>
              )}
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
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
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Expense Overview</h2>
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
              <p className="text-sm text-blue-600">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-900">
                ₱{formatAmount(filteredExpenses.reduce((total, expense) => {
                  return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
                }, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Number of Expenses</p>
              <p className="text-2xl font-bold text-blue-900">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>
        
        {/* Detailed Daily Expense Sheet */}
        {isLoadingMonthly ? (
          <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-300">
              <h3 className="text-lg font-medium">Daily Expense Details</h3>
            </div>
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading expenses...</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Daily Expense Details
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    className={`px-3 py-1 text-sm ${activeTab === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setActiveTab('grid')}
                  >
                    Grid View
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${activeTab === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => setActiveTab('table')}
                  >
                    Table View
                  </button>
                </div>
                {activeTab === 'grid' && (
                  <button
                    className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                    onClick={() => setGridOrientation(gridOrientation === 'vertical' ? 'horizontal' : 'vertical')}
                    title="Switch grid orientation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 3v18" />
                      {gridOrientation === 'vertical' ? (
                        <path d="M3 15h6 M15 15h6 M3 21h6 M15 21h6" strokeDasharray="2" />
                      ) : (
                        <path d="M3 15h18 M3 21h18" strokeDasharray="2" />
                      )}
                    </svg>
                  </button>
                )}
                <div className="relative">
                  <button 
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm flex items-center gap-1"
                    onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                  >
                    <span>Categories</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isCategoryFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48">
                      <div className="p-2 max-h-60 overflow-y-auto">
                        <div className="flex items-center p-1">
                          <input 
                            type="checkbox" 
                            id="category-all" 
                            checked={selectedCategories.has('all')}
                            onChange={() => toggleCategoryFilter('all')}
                            className="mr-2"
                          />
                          <label htmlFor="category-all" className="text-sm cursor-pointer">All Categories</label>
                        </div>
                        {categories.map(cat => (
                          <div key={cat._id} className="flex items-center p-1">
                            <input 
                              type="checkbox" 
                              id={`category-${cat._id}`} 
                              checked={selectedCategories.has(cat.name)}
                              onChange={() => toggleCategoryFilter(cat.name)}
                              className="mr-2"
                            />
                            <label 
                              htmlFor={`category-${cat._id}`} 
                              className="text-sm cursor-pointer flex items-center"
                            >
                              <div 
                                className="w-3 h-3 rounded mr-1" 
                                style={{ backgroundColor: getCategoryColor(cat.name) }}
                              ></div>
                              {cat.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {activeTab === 'grid' && (
              <div>
                {/* Category Color Legend */}
                <div className="p-3 border-b border-gray-300">
                  <h4 className="text-sm font-medium mb-2">Category Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <div key={category._id} className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-1" 
                          style={{ backgroundColor: getCategoryColor(category.name) }}
                        ></div>
                        <span className="text-xs">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {gridOrientation === 'vertical' ? (
                    <div className="min-w-full grid" style={{ gridTemplateColumns: 'auto 1fr auto', minHeight: '400px' }}>
                      {/* Days column */}
                      <div className="bg-gray-50 border-r border-gray-300">
                        <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center justify-center">Day</div>
                        {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                          <div key={`day-${day}`} className="px-3 border-b border-gray-300 text-center h-10 flex items-center justify-center">{day}</div>
                        ))}
                      </div>
                      
                      {/* Expense items */}
                      <div className="bg-white">
                        <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center">Expenses</div>
                        {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                          const dayExpenses = filteredExpenses.filter(exp => {
                            const expDate = new Date(exp.date);
                            return expDate.getDate() === day;
                          });
                          
                          // Format the date as MM/DD/YYYY for the grid title
                          const dateObj = new Date(selectedYear, selectedMonth, day);
                          const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
                          
                          return (
                            <div key={`exp-${day}`} className="px-3 py-1 border-b border-gray-300 h-10 flex items-center overflow-x-auto">
                              <div className="flex flex-nowrap gap-2">
                                {dayExpenses.map(expense => (
                                  <div 
                                    key={expense._id}
                                    className="px-2 py-1 rounded cursor-pointer transition-all duration-200 hover:shadow-md whitespace-nowrap tooltip"
                                    style={{ 
                                      backgroundColor: getCategoryColor(expense.category),
                                      position: 'relative'
                                    }}
                                    data-tooltip={`${expense.category}: ${expense.note || 'No note'}`}
                                    onClick={() => openEditModal(expense)}
                                  >
                                    ₱{formatAmount(typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Daily Totals column */}
                      <div className="bg-gray-50 border-l border-gray-300">
                        <div className="sticky top-0 px-3 py-2 bg-gray-100 border-b border-gray-300 font-medium h-10 flex items-center justify-center">Total</div>
                        {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                          const dayExpenses = filteredExpenses.filter(exp => {
                            const expDate = new Date(exp.date);
                            return expDate.getDate() === day;
                          });
                          
                          const dayTotal = dayExpenses.reduce((total, expense) => {
                            return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
                          }, 0);

                          return (
                            <div key={`total-${day}`} className="px-3 border-b border-gray-300 text-center h-10 flex items-center justify-center font-medium">
                              {dayTotal > 0 && `₱${formatAmount(dayTotal)}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // Horizontal orientation (days as columns)
                    <div 
                      ref={horizontalScrollRef}
                      className="overflow-x-auto scrollbar-thin relative" 
                      style={{ 
                        overscrollBehavior: 'auto', 
                        touchAction: 'pan-x',
                        maxWidth: '100%',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      <div className="pb-4 w-max" style={{ maxWidth: 'fit-content' }}>
                        <table className="border-collapse table-fixed" style={{ width: 'auto' }}>
                          <thead>
                            <tr>
                              <th className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center sticky left-0 z-10 min-w-[120px] shadow-sm">Categories</th>
                              {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                const dateObj = new Date(selectedYear, selectedMonth, day);
                                const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
                                return (
                                  <th key={`day-${day}`} className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center min-w-[60px] max-w-[60px]">
                                    {day}
                                  </th>
                                );
                              })}
                              <th className="px-3 py-2 bg-gray-100 border border-gray-300 font-medium h-10 text-center sticky right-0 z-10 min-w-[80px] shadow-sm">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Category rows */}
                            {categories.map(category => {
                              // Calculate category total
                              const categoryExpenses = filteredExpenses.filter(exp => exp.category === category.name);
                              const categoryTotal = categoryExpenses.reduce((total, expense) => {
                                return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
                              }, 0);
                              
                              return (
                                <tr key={`cat-${category._id}`}>
                                  <td className="px-3 py-2 bg-gray-50 border border-gray-300 sticky left-0 z-10 shadow-sm">
                                    <div className="flex items-center">
                                      <div 
                                        className="w-4 h-4 rounded mr-2" 
                                        style={{ backgroundColor: getCategoryColor(category.name) }}
                                      ></div>
                                      <span className="font-medium">{category.name}</span>
                                    </div>
                                  </td>
                                  
                                  {/* Day cells */}
                                  {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                    // Filter expenses for this category and day
                                    const dayExpenses = filteredExpenses.filter(exp => {
                                      const expDate = new Date(exp.date);
                                      return expDate.getDate() === day && exp.category === category.name;
                                    });
                                    
                                    if (dayExpenses.length === 0) {
                                      return <td key={`${category._id}-${day}`} className="border border-gray-300"></td>;
                                    }
                                    
                                    // Format the date for the tooltip
                                    const dateObj = new Date(selectedYear, selectedMonth, day);
                                    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
                                    
                                    return (
                                      <td key={`${category._id}-${day}`} className="border border-gray-300 p-1">
                                        <div className="flex flex-col gap-1">
                                          {dayExpenses.map(expense => (
                                            <div 
                                              key={expense._id}
                                              className="px-2 py-1 rounded cursor-pointer transition-all duration-200 hover:shadow-md text-center tooltip"
                                              style={{ 
                                                backgroundColor: getCategoryColor(category.name),
                                                position: 'relative',
                                              }}
                                              data-tooltip={`${category.name} : ${expense.note || 'No note'}`}
                                              onClick={() => openEditModal(expense)}
                                            >
                                              ₱{formatAmount(typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)}
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                    );
                                  })}
                                  
                                  {/* Category total */}
                                  <td className="px-3 py-1 bg-gray-50 border border-gray-300 font-medium text-center sticky right-0 z-10 shadow-sm">
                                    {categoryTotal > 0 ? `₱${formatAmount(categoryTotal)}` : ''}
                                  </td>
                                </tr>
                              );
                            })}
                            
                            {/* Daily total row */}
                            <tr className="bg-blue-50">
                              <td className="px-3 py-2 border border-gray-300 font-bold sticky left-0 z-10 shadow-sm bg-blue-50">Daily Total</td>
                              
                              {/* Daily totals */}
                              {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                const dayExpenses = filteredExpenses.filter(exp => {
                                  const expDate = new Date(exp.date);
                                  return expDate.getDate() === day;
                                });
                                
                                const dayTotal = dayExpenses.reduce((total, expense) => {
                                  return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
                                }, 0);
                                
                                return (
                                  <td key={`total-${day}`} className="px-3 py-2 border border-gray-300 text-center font-bold bg-blue-50">
                                    {dayTotal > 0 ? `₱${formatAmount(dayTotal)}` : ''}
                                  </td>
                                );
                              })}
                              
                              {/* Grand total */}
                              <td className="px-3 py-2 bg-blue-100 border border-gray-300 font-bold text-center sticky right-0 z-10 shadow-sm">
                                ₱{formatAmount(filteredExpenses.reduce((total, expense) => {
                                  return total + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount);
                                }, 0))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'table' && (
              <div>
                {/* Category Color Legend */}
                <div className="p-3 border-b border-gray-300">
                  <h4 className="text-sm font-medium mb-2">Category Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <div key={category._id} className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-1" 
                          style={{ backgroundColor: getCategoryColor(category.name) }}
                        ></div>
                        <span className="text-xs">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Expenses List Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Day</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Note</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {filteredExpenses.length === 0 ? (
                        <tr className="h-10">
                          <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                            No expenses found for this month
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((expense) => {
                          const expenseDate = new Date(expense.date);
                          const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][expenseDate.getDay()];
                          const formattedDate = `${expenseDate.getMonth() + 1}/${expenseDate.getDate()}/${expenseDate.getFullYear()}`;
                          
                          return (
                            <tr key={expense._id} className="hover:bg-gray-50 h-10">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formattedDate}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {day}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <span 
                                  className="inline-block px-2 py-1 rounded" 
                                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                                >
                                  {expense.category}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₱{formatAmount(typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {expense.note || '-'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                <div className="flex justify-center space-x-2">
                                  <button 
                                    onClick={() => openEditModal(expense)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingExpense(expense);
                                      handleDeleteExpense();
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Expense Modal */}
      {isEditModalOpen && editingExpense && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Expense</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="edit-date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₱)
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
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  id="edit-note"
                  name="note"
                  rows={3}
                  value={editFormData.note}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a note about this expense"
                ></textarea>
              </div>
              
              <div className="flex justify-between space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleDeleteExpense()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Custom Tooltip Styles */}
      <style jsx global>{`
        .tooltip {
          position: relative;
          z-index: 10;
        }
        
        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: fixed;
          z-index: 99999;
          padding: 8px 12px;
          background-color: #333;
          color: white;
          border-radius: 4px;
          white-space: normal;
          font-weight: normal;
          min-width: 200px;
          max-width: 300px;
          text-align: center;
          font-size: 14px;
          pointer-events: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          animation: tooltipFadeIn 0.1s ease;
        }
        
        .tooltip:hover::before {
          content: '';
          position: fixed;
          z-index: 99999;
          border-width: 5px;
          border-style: solid;
          pointer-events: none;
          animation: tooltipFadeIn 0.1s ease;
        }
        
        /* Default tooltip position (above the element) */
        .tooltip:hover::after {
          left: calc(var(--mouse-x) + 15px);
          top: calc(var(--mouse-y) - 15px);
          transform: translateY(-100%);
        }
        
        .tooltip:hover::before {
          left: calc(var(--mouse-x) + 20px);
          top: calc(var(--mouse-y) - 15px);
          transform: translateY(-100%);
          border-color: #333 transparent transparent transparent;
        }

        @keyframes tooltipFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 