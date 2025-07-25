import React, { useState, useEffect } from 'react';

// COMPONENT: DailyFocus

const DailyFocus = ({ isDark }) => {
  
  const [focusText, setFocusText] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedFocus = localStorage.getItem('dailyFocus');
    if (savedFocus) {
      setFocusText(savedFocus);
    }
  }, []);


  const handleSaveFocus = () => {
    localStorage.setItem('dailyFocus', focusText);
    setIsEditing(false); 
  };

  const handleClearFocus = () => {
    setFocusText(''); 
    localStorage.removeItem('dailyFocus'); 
    setIsEditing(true);
  };

  const textColorClass = isDark ? 'text-gray-200' : 'text-gray-800';
  const borderColorClass = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputColorClass = isDark ? 'bg-base-300 text-gray-200' : 'bg-white text-gray-800';

  return (
    <div
      className={`p-4 mb-6 rounded-lg shadow-md border ${borderColorClass} ${isDark ? 'bg-base-200' : 'bg-base-200'}`}
    >
      <h2 className={`text-xl font-semibold mb-3 ${textColorClass}`}>Your Daily Focus:</h2>
      {isEditing || !focusText ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="What are you focusing on today?"
            className={`input input-bordered flex-grow ${inputColorClass}`}
            value={focusText}
            onChange={(e) => setFocusText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveFocus();
              }
            }}
            aria-label="Daily focus input"
          />
          <button
            className="btn btn-primary"
            onClick={handleSaveFocus}
            disabled={!focusText.trim()} 
            aria-label="Save daily focus"
          >
            Save
          </button>
          {focusText && ( 
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className={`text-lg font-medium ${textColorClass}`}>{focusText}</p>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setIsEditing(true)}
              aria-label="Edit daily focus"
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-error text-white"
              onClick={handleClearFocus}
              aria-label="Clear daily focus"
            >
              Clean
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyFocus;