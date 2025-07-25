import { useState, useEffect } from 'react'; 
import TaskItem from './TaskItem.jsx';

// COMPONENT: TaskSection
const TaskSection = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error("Error parsing tasks from localStorage:", error);
      return []; 
    }
  });
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput, done: false, estimatedPomodoros: 1 }]);
      setTaskInput('');
    }
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTaskPomodoros = (index, count) => {
    const updated = [...tasks];
    updated[index].estimatedPomodoros = count;
    setTasks(updated);
  };

  const moveTaskUp = (index) => {
    if (index === 0) return;
    const updated = [...tasks];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setTasks(updated);
  };

  const moveTaskDown = (index) => {
    if (index === tasks.length - 1) return;
    const updated = [...tasks];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setTasks(updated);
  };

  return (
    <div className="p-6 rounded-lg shadow-lg bg-base-200">
      <h2 className="text-2xl font-bold mb-4">
        📝 Your Tasks
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          className="input input-bordered w-full"
          placeholder="Add a new task and press Enter"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') addTask();
          }}
        />
        <button onClick={addTask} className="btn btn-success">
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem
            key={index}
            task={task}
            index={index}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdatePomodoros={updateTaskPomodoros}
            onMoveUp={moveTaskUp}
            onMoveDown={moveTaskDown}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-sm p-4 text-base-content/70">
            No tasks yet. Add one to get started!
          </p>
        )}
      </ul>

      <div className="mt-6 text-center text-base-content/80">
        <p className="text-xs">
          Total Estimated: <strong>{tasks.reduce((sum, task) => sum + (task.estimatedPomodoros || 1), 0)}</strong> 🍅
        </p>
      </div>
    </div>
  );
};

export default TaskSection;