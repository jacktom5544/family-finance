import React from 'react';

interface MonthPickerProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    onMonthChange(newMonth, newYear);
  };

  const goToNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    onMonthChange(newMonth, newYear);
  };

  const goToCurrentMonth = () => {
    const currentDate = new Date();
    onMonthChange(currentDate.getMonth(), currentDate.getFullYear());
  };

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={goToPreviousMonth}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Previous month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="text-lg font-medium">
        {months[selectedMonth]} {selectedYear}
      </div>
      
      <button 
        onClick={goToNextMonth}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Next month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button 
        onClick={goToCurrentMonth}
        className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Today
      </button>
    </div>
  );
};

export default MonthPicker; 