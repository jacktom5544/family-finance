/**
 * Fetch food expenses for specified month and year
 */
export const fetchExpenses = async (month: number, year: number) => {
  try {
    console.log(`Fetching food expenses for month=${month}, year=${year}`);
    // Create date range for selected month to ensure consistency with Food page
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString()
    });
    
    const response = await fetch(`/api/food?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    const data = await response.json();
    console.log('Food expenses data received:', data);
    
    // Make sure the data is in the expected format for processing
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

/**
 * Fetch monthly expenses from expense page
 */
export const fetchMonthlyExpenses = async (month: number, year: number) => {
  try {
    // Create date range for selected month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await fetch(`/api/expenses?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch monthly expenses');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    return [];
  }
};

/**
 * Fetch monthly income from income page
 */
export const fetchMonthlyIncome = async (month: number, year: number) => {
  try {
    // Create date range for selected month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await fetch(`/api/income?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch monthly income');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching monthly income:', error);
    return [];
  }
};

/**
 * Fetch saved budget
 */
export const fetchBudget = async (month?: number, year?: number) => {
  try {
    console.log(`Fetching budget data for month=${month}, year=${year}`);
    // Use the same endpoint that Food page uses
    let url = '/api/budget';
    
    // Add query parameters if month and year are provided
    if (month !== undefined && year !== undefined) {
      const queryParams = new URLSearchParams({
        month: month.toString(),
        year: year.toString()
      });
      url = `${url}?${queryParams.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch budget');
    }
    
    const data = await response.json();
    console.log('Budget data received:', data);
    
    // Check if we get valid data with the expected property
    if (data && (data.dailyFoodBudget !== undefined || data.dailyBudget !== undefined)) {
      const budgetValue = data.dailyFoodBudget !== undefined ? data.dailyFoodBudget : data.dailyBudget;
      // Convert to number if it's a string and ensure it's greater than 0
      const numericBudget = typeof budgetValue === 'number' ? budgetValue : parseFloat(budgetValue || '0');
      // Only return a positive budget value
      return {
        dailyFoodBudget: numericBudget > 0 ? numericBudget : 0
      };
    }
    
    // Return default if no valid data
    return { dailyFoodBudget: 0 };
  } catch (error) {
    console.error('Error fetching budget:', error);
    return { dailyFoodBudget: 0 };
  }
};

/**
 * Save budget settings
 */
export const postBudget = async (budgetData: { dailyFoodBudget: number }) => {
  try {
    const response = await fetch('/api/budget', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });
    
    // Check if response is ok first
    if (!response.ok) {
      // Try to parse error message if available
      let errorMessage = 'Failed to save budget';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use text content or status
        const text = await response.text();
        errorMessage = text || `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    // Try to parse JSON response
    try {
      return await response.json();
    } catch (e) {
      // If no valid JSON in response, just return success status
      return { success: true, dailyBudget: budgetData.dailyFoodBudget };
    }
  } catch (error) {
    console.error('Error in postBudget:', error);
    throw error;
  }
}; 