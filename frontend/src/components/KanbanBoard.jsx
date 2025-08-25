import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, GripVertical, Calendar, Clock, User, Flag } from 'lucide-react';

// Helper function to generate unique IDs
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

const KanbanBoard = ({ columns, onColumnsChange }) => {
  const [newTaskInputs, setNewTaskInputs] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Default columns structure matching MainApp
  const currentColumns = columns || {
    'todo': { title: 'To Do', tasks: [] },
    'in-progress': { title: 'In Progress', tasks: [] },
    'done': { title: 'Done', tasks: [] },
  };

  // Add a new task to a column
  const addTask = useCallback((columnId, taskText) => {
    if (!taskText.trim()) return;
    
    const newTask = {
      id: generateUniqueId(),
      text: taskText.trim(),
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newColumns = {
      ...currentColumns,
      [columnId]: {
        ...currentColumns[columnId],
        tasks: [...currentColumns[columnId].tasks, newTask],
      }
    };

    onColumnsChange(newColumns);
    
    // Clear the input
    setNewTaskInputs(prev => ({
      ...prev,
      [columnId]: ''
    }));
  }, [currentColumns, onColumnsChange]);

  // Delete a task
  const deleteTask = useCallback((columnId, taskId) => {
    const newColumns = {
      ...currentColumns,
      [columnId]: {
        ...currentColumns[columnId],
        tasks: currentColumns[columnId].tasks.filter(task => task.id !== taskId),
      }
    };
    onColumnsChange(newColumns);
  }, [currentColumns, onColumnsChange]);

  // Update a task
  const updateTask = useCallback((columnId, taskId, updates) => {
    const newColumns = {
      ...currentColumns,
      [columnId]: {
        ...currentColumns[columnId],
        tasks: currentColumns[columnId].tasks.map(task =>
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      }
    };
    onColumnsChange(newColumns);
  }, [currentColumns, onColumnsChange]);

  // Handle drag start
  const handleDragStart = useCallback((e, taskId, columnId) => {
    const taskData = {
      taskId,
      sourceColumnId: columnId
    };
    
    setDraggedTask(taskData);
    e.dataTransfer.setData('application/json', JSON.stringify(taskData));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, targetColumnId) => {
    e.preventDefault();
    
    let taskData;
    try {
      const dataString = e.dataTransfer.getData('application/json');
      taskData = JSON.parse(dataString);
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }

    const { taskId, sourceColumnId } = taskData;

    if (!taskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }
    
    const sourceTasks = [...currentColumns[sourceColumnId].tasks];
    const targetTasks = [...currentColumns[targetColumnId].tasks];
    const taskIndex = sourceTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      setDraggedTask(null);
      return;
    }

    const [movedTask] = sourceTasks.splice(taskIndex, 1);
    
    // Update task status based on target column
    const updatedTask = {
      ...movedTask,
      updatedAt: new Date().toISOString(),
      status: targetColumnId
    };
    
    targetTasks.push(updatedTask);

    const newColumns = {
      ...currentColumns,
      [sourceColumnId]: { 
        ...currentColumns[sourceColumnId], 
        tasks: sourceTasks 
      },
      [targetColumnId]: { 
        ...currentColumns[targetColumnId], 
        tasks: targetTasks 
      },
    };
    
    onColumnsChange(newColumns);
    setDraggedTask(null);
  }, [currentColumns, onColumnsChange]);

  // Handle key press for adding tasks
  const handleKeyPress = useCallback((e, columnId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = newTaskInputs[columnId] || '';
      if (value.trim()) {
        addTask(columnId, value);
      }
    }
  }, [newTaskInputs, addTask]);

  // Handle input change
  const handleInputChange = useCallback((columnId, value) => {
    setNewTaskInputs(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, []);


  return (
    <div className="w-full h-full flex flex-col bg-base-100 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
          🎯 Kanban Board
        </h2>
        <div className="text-xs text-base-content/60">
          {Object.values(currentColumns).reduce((total, col) => total + col.tasks.length, 0)} tasks
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full ">
          {Object.entries(currentColumns).map(([columnId, column]) => (
            <div
              key={columnId}
              className="flex flex-col w-72 bg-base-200 rounded-lg shadow-sm"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-base-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base-content">
                    {column.title}
                  </h3>
                  <span className="badge badge-sm badge-ghost">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[200px]">
                {column.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <div className="text-4xl mb-2 opacity-30">📝</div>
                    <p className="text-sm text-base-content/50">
                      Drop tasks here or add new ones
                    </p>
                  </div>
                ) : (
                  column.tasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, columnId)}
                      className={`
                        group bg-base-100 p-3 rounded-lg shadow-sm border border-base-300
                        cursor-grab hover:shadow-md transition-all duration-200
                        ${draggedTask?.taskId === task.id ? 'opacity-50 scale-95' : ''}
                        active:cursor-grabbing active:scale-95
                      `}
                    >
                      {/* Task Content */}
                      <div className="space-y-2">
                        {/* Main Content */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {editingTask === task.id ? (
                              <input
                                type="text"
                                defaultValue={task.text}
                                className="input input-xs w-full"
                                onBlur={(e) => {
                                  updateTask(columnId, task.id, { text: e.target.value });
                                  setEditingTask(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateTask(columnId, task.id, { text: e.target.value });
                                    setEditingTask(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingTask(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <p
                                className="text-sm font-medium text-base-content cursor-pointer truncate"
                                onClick={() => setEditingTask(task.id)}
                                title={task.text}
                              >
                                {task.text}
                              </p>
                            )}
                            
                            {task.description && (
                              <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <GripVertical className="w-3 h-3 text-base-content/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                              onClick={() => deleteTask(columnId, task.id)}
                              className="btn btn-xs btn-circle btn-ghost hover:btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete task"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                  
                        </div>

                       
                      </div>
                  ))
                )}
              </div>

              {/* Add Task Input */}
              <div className="p-3 border-t border-base-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskInputs[columnId] || ''}
                    onChange={(e) => handleInputChange(columnId, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, columnId)}
                    className="input input-xs flex-1"
                    placeholder="Add new task..."
                  />
                  <button
                    onClick={() => addTask(columnId, newTaskInputs[columnId] || '')}
                    className="btn btn-xs btn-primary"
                    disabled={!newTaskInputs[columnId]?.trim()}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-base-content/50 mt-1 text-center">
                  Press Enter or click + to add
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Help */}
      <div className="p-3 border-t border-base-300 bg-base-50">
        <div className="text-xs text-base-content/60 space-y-1">
          <p>💡 <strong>Tips:</strong> Drag tasks between columns • Click task text to edit • Use priority flags</p>
          <p>🎯 Data automatically saves to your workspace</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .min-w-max {
          min-width: max-content;
        }
        
        @media (max-width: 768px) {
          .w-72 {
            width: 16rem;
          }
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;