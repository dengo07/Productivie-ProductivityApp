import React, { useState } from 'react';

// Helper function to generate unique IDs
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

const KanbanBoard = () => {
  const [columns, setColumns] = useState(() => ({
    'todo': {
      title: 'To Do',
      tasks: [
        { id: generateUniqueId(), text: 'Develop Pomodoro Application', pomodoros: 4 },
        { id: generateUniqueId(), text: 'Read Book', pomodoros: 1 },
      ],
    },
    'in-progress': {
      title: 'In Progress',
      tasks: [
        { id: generateUniqueId(), text: 'Check Emails', pomodoros: 0.5 },
      ],
    },
    'done': {
      title: 'Done',
      tasks: [
        { id: generateUniqueId(), text: 'Complete Sample Project', pomodoros: 3 },
      ],
    },
  }));

  const addTask = (columnId, taskText) => {
    if (!taskText.trim()) return;
    const newTaskId = generateUniqueId();
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, { id: newTaskId, text: taskText, pomodoros: 1 }],
      }
    }));
  };

  const deleteTask = (columnId, taskId) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: prev[columnId].tasks.filter(task => task.id !== taskId),
      }
    }));
  };

  const handleDragStart = (e, taskId, columnId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', columnId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (!taskId || !sourceColumnId || sourceColumnId === targetColumnId) return;

    setColumns(prev => {
      const sourceTasks = [...prev[sourceColumnId].tasks];
      const targetTasks = [...prev[targetColumnId].tasks];
      const taskIndex = sourceTasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) return prev;

      const [movedTask] = sourceTasks.splice(taskIndex, 1);
      targetTasks.push(movedTask);

      return {
        ...prev,
        [sourceColumnId]: { ...prev[sourceColumnId], tasks: sourceTasks },
        [targetColumnId]: { ...prev[targetColumnId], tasks: targetTasks },
      };
    });
  };

  const handleKeyPress = (e, columnId) => {
    if (e.key === 'Enter') {
      addTask(columnId, e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-lg bg-base-200 mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        🎯 Kanban Board
      </h2>

      <div className="flex flex-wrap justify-center gap-6">
        {Object.entries(columns).map(([columnId, column]) => (
          <div
            key={columnId}
            className="w-full sm:w-[300px] bg-base-100 p-4 rounded-lg shadow-md"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            <h3 className="text-lg font-semibold mb-4 border-b border-base-300 pb-2 text-base-content">
              {column.title} ({column.tasks.length})
            </h3>

            <div className="space-y-3 min-h-[100px] mb-4">
              {column.tasks.length === 0 && (
                <div className="text-center text-sm p-4 text-base-content/60 bg-base-200 rounded-md border border-dashed border-base-300">
                  No tasks here yet.
                </div>
              )}

              {column.tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, columnId)}
                  className="bg-base-300 p-3 rounded-md shadow-sm flex justify-between items-center cursor-grab active:cursor-grabbing hover:bg-base-300/80 transition-colors border border-base-300"
                >
                  <div className="flex-1">
                    <p className="font-medium text-base-content mb-1">{task.text}</p>
                    {task.pomodoros > 0 && (
                      <span className="text-sm text-primary font-medium">
                        {task.pomodoros} 🍅
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(columnId, task.id)}
                    className="btn btn-xs btn-circle btn-ghost hover:btn-error ml-2"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              className="input input-sm input-bordered w-full"
              placeholder="Add new task..."
              onKeyDown={(e) => handleKeyPress(e, columnId)}
            />
            <p className="text-xs text-base-content/60 text-center mt-1">
              Press Enter to add task
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-info/10 rounded-lg border border-info/20">
        <h4 className="font-semibold text-info mb-2">How to use:</h4>
        <ul className="text-sm text-base-content/80 space-y-1">
          <li>• Drag tasks between columns to change their status</li>
          <li>• Type in the input field and press Enter to add new tasks</li>
          <li>• Click the ✕ button to delete tasks</li>
          <li>• 🍅 represents estimated pomodoros needed</li>
        </ul>
      </div>
    </div>
  );
};

export default KanbanBoard;
