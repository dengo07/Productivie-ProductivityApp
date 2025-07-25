import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';

import PomodoroSection from './components/PomodoroSection';
import TaskSection from './components/TaskSection';
import SettingsModal from './components/SettingsModal';
import DailyFocus from './components/DailyFocus';
import KanbanBoard from './components/KanbanBoard';
import Mindmap from './components/MindMap';

function DraggableComponent({ component, children, onRemove, onUpdate, isSelected, onSelect }) {
  const handleDragStop = useCallback((e, d) => {
    onUpdate(component.id, { x: d.x, y: d.y });
  }, [component.id, onUpdate]);

  const handleResizeStop = useCallback((e, direction, ref, delta, position) => {
    onUpdate(component.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [component.id, onUpdate]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(component.id);
  }, [component.id, onSelect]);

  return (
    <Rnd
      size={{ width: component.width, height: component.height }}
      position={{ x: component.x, y: component.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={250}
      minHeight={180}
      dragHandleClassName="drag-handle"
      cancel=".rnd-cancel-drag"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      resizeHandleStyles={{
        bottomRight: {
          width: '12px',
          height: '12px',
          background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #64748b 40%, #64748b 60%, transparent 60%)',
        }
      }}
      className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-opacity-60' : ''}`}
    >
      <div
        onClick={handleClick}
        className={`
          relative w-full h-full rounded-xl shadow-lg border transition-all duration-200 overflow-hidden
          ${isSelected 
            ? 'border-primary bg-base-100 shadow-xl' 
            : 'border-base-300 bg-base-100 hover:shadow-xl hover:border-base-400'
          }
        `}
      >
        {/* Header with drag handle and controls */}
        <div className="drag-handle flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-200 cursor-move">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary opacity-60"></div>
            <h2 className="text-lg font-semibold text-base-content truncate">{component.title}</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(component.id, { 
                  width: component.width === 300 ? 400 : 300,
                  height: component.height === 250 ? 350 : 250 
                });
              }}
              className="btn btn-xs btn-ghost hover:btn-primary"
              title="Toggle size"
            >
              📏
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(component.id);
              }}
              className="btn btn-xs btn-ghost hover:btn-error"
              title={`Remove ${component.title}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 h-[calc(100%-4rem)] overflow-auto custom-scrollbar">
          {children}
        </div>

        {/* Resize indicator */}
        <div className="absolute bottom-0 right-0 w-4 h-4 opacity-40 pointer-events-none">
          <svg viewBox="0 0 12 12" className="w-full h-full text-base-content">
            <path d="M12 12L8 12L12 8Z" fill="currentColor" opacity="0.3"/>
            <path d="M12 12L4 12L12 4Z" fill="currentColor" opacity="0.2"/>
          </svg>
        </div>
      </div>
    </Rnd>
  );
}

// Component palette for adding new components
function ComponentPalette({ onAddComponent, theme }) {
  const components = [
    { type: 'DailyFocus', title: 'Daily Focus', icon: '🎯', color: 'btn-primary' },
    { type: 'PomodoroSection', title: 'Pomodoro Timer', icon: '🍅', color: 'btn-secondary' },
    { type: 'TaskSection', title: 'Task List', icon: '📋', color: 'btn-accent' },
    { type: 'KanbanBoard', title: 'Kanban Board', icon: '📊', color: 'btn-info' },
    { type: 'Mindmap', title: 'Mindmap', icon: '🧠', color: 'btn-primary' },
  ];

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-base-200 to-base-300 border border-base-300">
      <h3 className="text-lg font-semibold mb-3 text-base-content">Add Components</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {components.map(({ type, title, icon, color }) => (
          <button
            key={type}
            onClick={() => onAddComponent(type)}
            className={`btn btn-sm ${color} gap-2 transition-all duration-200 hover:scale-105`}
            title={`Add ${title}`}
          >
            <span className="text-lg">{icon}</span>
            <span className="hidden sm:inline">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState('retro');
  const [settings, setSettings] = useState({
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    longBreakInterval: 4,
  });

  const [mode, setMode] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [pomodoroKey, setPomodoroKey] = useState(0);
  const [taskInput, setTaskInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const [activeComponents, setActiveComponents] = useState([
    { 
      id: 'dailyFocus', 
      type: 'DailyFocus', 
      title: 'Daily Focus', 
      x: 50, 
      y: 100, 
      width: 320, 
      height: 220 
    },
    { 
      id: 'pomodoro', 
      type: 'PomodoroSection', 
      title: 'Pomodoro Timer', 
      x: 400, 
      y: 100, 
      width: 340, 
      height: 280 
    },
    { 
      id: 'tasks', 
      type: 'TaskSection', 
      title: 'Task List', 
      x: 50, 
      y: 350, 
      width: 320, 
      height: 300 
    },
  ]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'retro' ? 'night' : 'retro'));
  }, []);

  const addComponent = useCallback((type) => {
    const titleMap = {
      DailyFocus: 'Daily Focus',
      PomodoroSection: 'Pomodoro Timer',
      TaskSection: 'Task List',
      KanbanBoard: 'Kanban Board',
      MindMap: 'Mindmap',
    };

    const newComponent = {
      id: `${type}-${Date.now()}`,
      type,
      title: titleMap[type] || type,
      x: Math.random() * 100 + 100,
      y: Math.random() * 100 + 150,
      width: 320,
      height: 280,
    };

    setActiveComponents((prev) => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  }, []);

  const removeComponent = useCallback((id) => {
    setActiveComponents((prev) => prev.filter((comp) => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const updateComponent = useCallback((id, updates) => {
    setActiveComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  const renderComponent = useCallback((component) => {
    // Corrected: Pass key directly, and then spread other props
    switch (component.type) {
      case 'DailyFocus':
        return <DailyFocus key={component.id} isDark={theme === 'night'} />;
      case 'PomodoroSection':
        return (
          <PomodoroSection
            key={component.id} // Key passed directly
            mode={mode}
            setMode={setMode}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            settings={settings}
            completedPomodoros={completedPomodoros}
            setCompletedPomodoros={setCompletedPomodoros}
            pomodoroKey={pomodoroKey}
            setPomodoroKey={setPomodoroKey}
            isDark={theme === 'night'}
          />
        );
      case 'TaskSection':
        return (
          <TaskSection
            key={component.id} // Key passed directly
            tasks={tasks}
            setTasks={setTasks}
            taskInput={taskInput}
            setTaskInput={setTaskInput}
          />
        );
      case 'KanbanBoard':
        return <KanbanBoard key={component.id} />;
      case 'Mindmap':
        return <Mindmap key={component.id} isDark={theme === 'night'} />;
      default:
        return <div key={component.id}>Unknown component type</div>; // Always provide a key if rendering a list
    }
  }, [theme, mode, setMode, isRunning, setIsRunning, settings, completedPomodoros, setCompletedPomodoros, pomodoroKey, setPomodoroKey, tasks, setTasks, taskInput, setTaskInput]);

  return (
    <div 
      data-theme={theme} 
      className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 transition-all duration-500"
      onClick={handleBackgroundClick}
    >
      {/* Enhanced header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Productivity Hub
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="badge badge-outline">
                {activeComponents.length} components
              </div>
              <button
                className="btn btn-sm btn-ghost gap-2"
                onClick={() => setIsSettingsOpen(true)}
                title="Open settings"
              >
                <span className="text-lg">⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                className="btn btn-sm btn-ghost gap-2"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                <span className="text-lg">{theme === 'night' ? '☀️' : '🌙'}</span>
                <span className="hidden sm:inline">{theme === 'night' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <ComponentPalette onAddComponent={addComponent} theme={theme} />

        {/* Workspace area */}
        <div className="relative min-h-[2000px] rounded-2xl bg-base-50 border-2 border-dashed border-base-300 overflow-hidden">
          {activeComponents.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-50">🎯</div>
                <h3 className="text-xl font-semibold text-base-content/60 mb-2">
                  Your workspace is empty
                </h3>
                <p className="text-base-content/40">
                  Add components from the palette above to get started
                </p>
              </div>
            </div>
          ) : (
            activeComponents.map((component) => (
              <DraggableComponent
                key={component.id}
                component={component}
                onRemove={removeComponent}
                onUpdate={updateComponent}
                isSelected={selectedComponent === component.id}
                onSelect={setSelectedComponent}
              >
                {renderComponent(component)}
              </DraggableComponent>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Custom scrollbar styles */}
      {/* Corrected: Removed the 'jsx' attribute */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3);
        }
      `}</style>
    </div>
  );
}

export default App;