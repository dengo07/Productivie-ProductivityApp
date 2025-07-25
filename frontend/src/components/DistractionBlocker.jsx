import React, { useState, useEffect } from 'react';

const DistractionBlocker = ({ isDark, isTimerRunning }) => {
  const [distractions, setDistractions] = useState([]);
  const [newDistraction, setNewDistraction] = useState('');

  useEffect(() => {
    const savedDistractions = localStorage.getItem('distractionList');
    if (savedDistractions) {
      setDistractions(JSON.parse(savedDistractions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('distractionList', JSON.stringify(distractions));
  }, [distractions]);

  const handleAddDistraction = () => {
    const trimmed = newDistraction.trim();
    if (trimmed && !distractions.includes(trimmed)) {
      setDistractions([...distractions, trimmed]);
      setNewDistraction('');
    }
  };

  const handleRemoveDistraction = (index) => {
    setDistractions(distractions.filter((_, i) => i !== index));
  };

  const textColorClass = isDark ? 'text-gray-200' : 'text-gray-800';
  const borderColorClass = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputColorClass = isDark ? 'bg-base-300 text-gray-200' : 'bg-white text-gray-800';
  const warningColorClass = isTimerRunning ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white';

  return (
    <div
      className={`p-4 mb-6 rounded-lg shadow-md border ${borderColorClass} ${isDark ? 'bg-base-200' : 'bg-base-100'}`}
    >
      <h2 className={`text-xl font-semibold mb-3 ${textColorClass}`}>Distraction Blocker</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Add distracting website (e.g., youtube.com)"
          className={`input input-bordered flex-grow ${inputColorClass}`}
          value={newDistraction}
          onChange={(e) => setNewDistraction(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddDistraction();
            }
          }}
          aria-label="Add new distracting website"
        />
        <button
          className="btn btn-primary"
          onClick={handleAddDistraction}
          disabled={!newDistraction.trim()}
          aria-label="Add website to distraction list"
        >
          Add
        </button>
      </div>

      {distractions.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {distractions.map((site, index) => (
            <li
              key={index}
              className={`flex items-center justify-between p-2 rounded-md ${isDark ? 'bg-base-300' : 'bg-gray-100'} ${textColorClass}`}
            >
              <span>{site}</span>
              <button
                className="btn btn-xs btn-error text-white"
                onClick={() => handleRemoveDistraction(index)}
                aria-label={`Remove ${site} from list`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-sm ${textColorClass} italic mb-4`}>No distracting websites added yet.</p>
      )}

      {isTimerRunning ? (
        <div className={`p-3 rounded-lg text-center font-bold ${warningColorClass}`}>
          Focus! Avoid these sites while the timer is running!
        </div>
      ) : (
        <div className={`p-3 rounded-lg text-center font-bold ${isDark ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800'}`}>
          Timer is paused. You can add or review your distraction list.
        </div>
      )}
    </div>
  );
};

export default DistractionBlocker;
