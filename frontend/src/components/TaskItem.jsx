import { useState } from 'react';

// COMPONENT: TaskItem

const TaskItem = ({
  task,
  index,
  onToggle,
  onDelete,
  onUpdatePomodoros,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isDark, 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(task.estimatedPomodoros || 1);

  const handlePomodoroUpdate = () => {
    onUpdatePomodoros(index, pomodoroCount);
    setIsEditing(false); 
  };


  const textColorClass = task.done
    ? 'text-gray-400' 
    : isDark
    ? 'text-gray-200'
    : 'text-gray-800'; 


  const backgroundColorClass = isDark ? 'bg-base-200' : 'bg-base-100';

  return (
    <li
      className={`flex items-center justify-between p-4 rounded-lg shadow-sm ${backgroundColorClass}`}
    >
      <div className="flex items-center flex-1">
        <span
          className={`cursor-pointer flex-1 ${textColorClass}`}
          onClick={() => onToggle(index)}
        >
          {task.text}
        </span>


        <div className="flex items-center space-x-2 ml-4">
          {isEditing ? (
   
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="1"
                max="20"
                value={pomodoroCount}
                onChange={(e) => setPomodoroCount(parseInt(e.target.value) || 1)}
                className="input input-bordered input-sm w-16 text-center"
                aria-label="Estimated Pomodoros"
              />
              <button className="btn btn-success btn-sm" onClick={handlePomodoroUpdate} aria-label="Save Pomodoros">
                ✓
              </button>

              <button className="btn btn-neutral btn-sm" onClick={() => setIsEditing(false)} aria-label="Cancel Editing">
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline btn-sm flex items-center gap-1"
              aria-label="Edit Estimated Pomodoros"
            >
              <span role="img" aria-label="Tomato icon">🍅</span> <span>{task.estimatedPomodoros || 1}</span>
            </button>
          )}
        </div>
      </div>


      <div className="flex items-center space-x-1 ml-4">

        <button
          onClick={() => onMoveUp(index)}
          disabled={isFirst} 
          className="btn btn-xs btn-ghost"
          aria-label="Move task up"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={isLast} 
          className="btn btn-xs btn-ghost"
          aria-label="Move task down"
        >
          ↓
        </button>
        <button
          onClick={() => onDelete(index)}
          className="btn btn-xs btn-error text-white"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
