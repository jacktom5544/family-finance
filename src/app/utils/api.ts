/**
 * Fetch food expenses for specified month and year
 */
export const fetchExpenses = async (month: number, year: number) => {
  try {
    const response = await fetch(`/api/food?month=${month}&year=${year}`);
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

/**
 * Fetch saved budget
 */
export const fetchBudget = async () => {
  try {
    const response = await fetch('/api/budget');
    if (!response.ok) {
      throw new Error('Failed to fetch budget');
    }
    
    const data = await response.json();
    // Check if we get valid data with the expected property
    if (data && (data.dailyFoodBudget !== undefined || data.dailyBudget !== undefined)) {
      return {
        // Support both field names for compatibility
        dailyFoodBudget: data.dailyFoodBudget !== undefined ? data.dailyFoodBudget : data.dailyBudget
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