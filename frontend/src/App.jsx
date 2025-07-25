import React,{ useState, useCallback,useEffect,useRef,useMemo} from 'react';
import { Rnd } from 'react-rnd';

import { Analytics } from "@vercel/analytics/react"
import PomodoroSection from './components/PomodoroSection';
import TaskSection from './components/TaskSection';
import SettingsModal from './components/SettingsModal';
import DailyFocus from './components/DailyFocus';
import KanbanBoard from './components/KanbanBoard';
import Mindmap from './components/MindMap';

const DraggableComponent =React.memo(({ 
  component, 
  children, 
  onRemove, 
  onUpdate, 
  isSelected, 
  onSelect 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef(null);
  const animationFrameRef = useRef(null);

  // ✅ Throttled update function using RAF
  const throttledUpdate = useCallback((id, updates) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdate(id, updates);
      animationFrameRef.current = null;
    });
  }, [onUpdate]);

  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    
    // GPU layer oluştur
    e.target.style.willChange = 'transform';
  }, []);

  const handleDrag = useCallback((e, d) => {
    // Sadece büyük değişiklikler için update et (performance)
    if (dragStartRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      
      // 5px'den fazla hareket ettiyse update et
      if (deltaX > 5 || deltaY > 5) {
        throttledUpdate(component.id, { x: d.x, y: d.y });
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    }
  }, [component.id, throttledUpdate]);

  const handleDragStop = useCallback((e, d) => {
    setIsDragging(false);
    dragStartRef.current = null;
    
    // GPU layer temizle
    e.target.style.willChange = 'auto';
    
    // Final pozisyonu kaydet
    onUpdate(component.id, { x: d.x, y: d.y });
  }, [component.id, onUpdate]);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResize = useCallback((e, direction, ref, delta, position) => {
    // Resize sırasında throttle
    throttledUpdate(component.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [component.id, throttledUpdate]);

  const handleResizeStop = useCallback((e, direction, ref, delta, position) => {
    setIsResizing(false);
    
    // Final boyutu kaydet
    onUpdate(component.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [component.id, onUpdate]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      onSelect(component.id);
    }
  }, [component.id, onSelect, isDragging, isResizing]);

  // ✅ Memoized styles
  const containerStyle = useMemo(() => ({
    transition: isDragging || isResizing ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: `translateZ(0) ${isSelected ? 'scale(1.01)' : 'scale(1)'}`,
    willChange: isDragging || isResizing ? 'transform' : 'auto',
  }), [isDragging, isResizing, isSelected]);

  const containerClasses = useMemo(() => [
    'relative w-full h-full rounded-xl shadow-lg border overflow-hidden',
    isDragging ? 'is-dragging' : '',
    isSelected ? 'ring-2 ring-primary ring-opacity-60 border-primary bg-base-100 shadow-xl' 
               : 'border-base-300 bg-base-100 hover:shadow-xl hover:border-base-400',
    'transition-all duration-200'
  ].filter(Boolean).join(' '), [isDragging, isSelected]);

  // ✅ Optimize resize handles - sadece gerekli olanlar
  const resizeHandles = useMemo(() => ({
    top: false,
    right: false,
    bottom: false,
    left: false,
    topRight: false,
    bottomRight: true, // Sadece sağ alt köşe
    bottomLeft: false,
    topLeft: false,
  }), []);

  const resizeHandleStyles = useMemo(() => ({
    bottomRight: {
      width: '12px',
      height: '12px',
      background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #64748b 40%, #64748b 60%, transparent 60%)',
      cursor: 'nw-resize',
    }
  }), []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Rnd
      size={{ width: component.width, height: component.height }}
      position={{ x: component.x, y: component.y }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={250}
      minHeight={180}
      dragHandleClassName="drag-handle"
      cancel=".rnd-cancel-drag"
      enableResizing={resizeHandles}
      resizeHandleStyles={resizeHandleStyles}
      style={containerStyle}
      className="draggable-component"
      // ✅ Performance optimizations
      dragAxis="both"
      resizeGrid={[1, 1]} // Grid snap devre dışı
      dragGrid={[1, 1]}
    >
      <div
        onClick={handleClick}
        className={containerClasses}
      >
        {/* Header with drag handle and controls */}
        <div className="drag-handle flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-200 cursor-move">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-2 h-2 rounded-full bg-primary opacity-60 flex-shrink-0"></div>
            <h2 className="text-sm sm:text-lg font-semibold text-base-content truncate">
              {component.title}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(component.id, { 
                  width: component.width === 300 ? 400 : 300,
                  height: component.height === 250 ? 350 : 250 
                });
              }}
              className="btn btn-xs btn-ghost hover:btn-primary transition-colors"
              title="Toggle size"
            >
              📏
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(component.id);
              }}
              className="btn btn-xs btn-ghost hover:btn-error transition-colors"
              title={`Remove ${component.title}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-2 sm:p-4 h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)] overflow-auto custom-scrollbar">
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
});

DraggableComponent.displayName = 'DraggableComponent';

// Welcome Modal for first-time users
function WelcomeModal({ isOpen, onClose}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 p-6 rounded-2xl shadow-2xl max-w-md mx-4 border border-base-300">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-bold text-base-content mb-2">Welcome to Productivie!</h2>
          <p className="text-base-content/70">Your customizable productivity workspace</p>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-lg">🍅</span>
            <div>
              <strong>Pomodoro Timer:</strong> Work in focused 25-minute intervals with breaks
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">📋</span>
            <div>
              <strong>Task Lists:</strong> Keep track of your to-dos and mark them complete
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">📊</span>
            <div>
              <strong>Kanban Board:</strong> Organize tasks in columns (To Do, In Progress, Done)
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">🧠</span>
            <div>
              <strong>Mind Maps:</strong> Create visual connections between ideas
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={onClose}
            className="btn btn-ghost w-full"
          >
            I'll Figure It Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Component palette with limits and better descriptions
function ComponentPalette({ onAddComponent, theme, componentCount, maxComponents = 8 }) {
  const components = [
    { 
      type: 'DailyFocus', 
      title: 'Daily Focus', 
      icon: '🎯', 
      color: 'btn-primary',
      description: 'Set your main goal for today'
    },
    { 
      type: 'PomodoroSection', 
      title: 'Focus Timer', 
      icon: '🍅', 
      color: 'btn-secondary',
      description: '25-min work sessions with breaks'
    },
    { 
      type: 'TaskSection', 
      title: 'Task List', 
      icon: '📋', 
      color: 'btn-accent',
      description: 'Simple to-do list with checkboxes'
    },
    { 
      type: 'KanbanBoard', 
      title: 'Project Board', 
      icon: '📊', 
      color: 'btn-info',
      description: 'Organize tasks in columns'
    },
    { 
      type: 'Mindmap', 
      title: 'Mind Map', 
      icon: '🧠', 
      color: 'btn-primary',
      description: 'Visual brainstorming tool'
    },
  ];

  const isAtLimit = componentCount >= maxComponents;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-base-200 to-base-300 border border-base-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-base-content">Add Productivity Tools</h3>
        <div className="text-sm text-base-content/60">
          {componentCount}/{maxComponents} components
        </div>
      </div>
      
      {isAtLimit && (
        <div className="mb-3 p-2 bg-warning/20 border border-warning/30 rounded-lg text-sm text-warning-content">
          ⚠️ Maximum components reached. Remove some to add new ones.
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {components.map(({ type, title, icon, color, description }) => (
          <div key={type} className="space-y-2">
            <button
              onClick={() => onAddComponent(type)}
              disabled={isAtLimit}
              className={`btn btn-sm ${color} w-full gap-2 transition-all duration-200 hover:scale-105 ${
                isAtLimit ? 'btn-disabled opacity-50' : ''
              }`}
              title={`Add ${title}`}
            >
              <span className="text-lg">{icon}</span>
              <span className="truncate">{title}</span>
            </button>
            <p className="text-xs text-base-content/60 text-center px-1">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Help tooltip component
function HelpTooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-lg whitespace-nowrap z-50 border border-base-200">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-300"></div>
        </div>
      )}
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      title: 'Focus Timer', 
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

  // Check if user is new
  useEffect(() => {
    const hasVisited = localStorage.getItem('productivie-visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('productivie-visited', 'true');
    }
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-arrange components on mobile
  useEffect(() => {
    if (isMobile && activeComponents.length > 0) {
      const mobileArrangedComponents = activeComponents.map((component, index) => ({
        ...component,
        x: 10,
        y: 10 + (index * 320),
        width: Math.min(component.width, window.innerWidth - 40),
        height: component.height
      }));
      setActiveComponents(mobileArrangedComponents);
    }
  }, [isMobile]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'retro' ? 'night' : 'retro'));
  }, []);

  const addComponent = useCallback((type) => {
    // Prevent adding too many components
    if (activeComponents.length >= 8) {
      return;
    }

    const titleMap = {
      DailyFocus: 'Daily Focus',
      PomodoroSection: 'Focus Timer',
      TaskSection: 'Task List',
      KanbanBoard: 'Project Board',
      Mindmap: 'Mind Map',
    };

    // Check if component already exists (prevent duplicates of certain types)
    const existingTypes = activeComponents.map(c => c.type);
    if (['DailyFocus'].includes(type) && existingTypes.includes(type)) {
      return; // Prevent duplicate daily focus
    }

    const newComponent = {
      id: `${type}-${Date.now()}`,
      type,
      title: titleMap[type] || type,
      x: isMobile ? 10 : Math.random() * 100 + 100,
      y: isMobile ? (activeComponents.length * 320) + 10 : Math.random() * 100 + 150,
      width: isMobile ? Math.min(320, window.innerWidth - 40) : 320,
      height: 280,
    };

    setActiveComponents((prev) => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  }, [activeComponents, isMobile]);

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

  const startTour = useCallback(() => {
    setShowWelcome(false);
    // You could implement a proper tour library here
    alert("Tour functionality would be implemented with a library like Intro.js or React Joyride!");
  }, []);

  const clearWorkspace = useCallback(() => {
    if (confirm('Are you sure you want to remove all components? This cannot be undone.')) {
      setActiveComponents([]);
      setSelectedComponent(null);
    }
  }, []);

  const renderComponent = useCallback((component) => {
    switch (component.type) {
      case 'DailyFocus':
        return <DailyFocus key={component.id} isDark={theme === 'night'} />;
      case 'PomodoroSection':
        return (
          <PomodoroSection
            key={component.id}
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
            key={component.id}
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
        return <div key={component.id}>Unknown component type</div>;
    }
  }, [theme, mode, setMode, isRunning, setIsRunning, settings, completedPomodoros, setCompletedPomodoros, pomodoroKey, setPomodoroKey, tasks, setTasks, taskInput, setTaskInput]);

  return (
    <div 
      data-theme={theme} 
      className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 transition-all duration-500"
      onClick={handleBackgroundClick}
    >
      {/* Enhanced header with better mobile support */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Analytics/>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">🧠</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary truncate">
                Productivie
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="badge badge-outline text-xs hidden sm:flex">
                {activeComponents.length}/8
              </div>
              
              <HelpTooltip content="Need help? Click for a quick tour!">
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost"
                  onClick={() => setShowWelcome(true)}
                  title="Help & Tour"
                >
                  <span className="text-sm sm:text-lg">❓</span>
                </button>
              </HelpTooltip>

              <button
                className="btn btn-xs sm:btn-sm btn-ghost"
                onClick={() => setIsSettingsOpen(true)}
                title="Open settings"
              >
                <span className="text-sm sm:text-lg">⚙️</span>
                <span className="hidden md:inline text-sm">Settings</span>
              </button>
              
              <button
                className="btn btn-xs sm:btn-sm btn-ghost"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                <span className="text-sm sm:text-lg">{theme === 'night' ? '☀️' : '🌙'}</span>
                <span className="hidden md:inline text-sm">{theme === 'night' ? 'Light' : 'Dark'}</span>
              </button>

              {activeComponents.length > 0 && (
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost hover:btn-error"
                  onClick={clearWorkspace}
                  title="Clear workspace"
                >
                  <span className="text-sm sm:text-lg">🗑️</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <ComponentPalette 
          onAddComponent={addComponent} 
          theme={theme} 
          componentCount={activeComponents.length}
          maxComponents={8}
        />

        {/* Workspace area with better mobile handling */}
        <div className={`relative ${isMobile ? 'min-h-screen' : 'min-h-[2000px]'} rounded-2xl bg-base-50 border-2 border-dashed border-base-300 overflow-hidden`}>
          {activeComponents.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="text-4xl sm:text-6xl mb-4 opacity-50">🎯</div>
                <h3 className="text-lg sm:text-xl font-semibold text-base-content/60 mb-2">
                  Your workspace is empty
                </h3>
                <p className="text-sm sm:text-base text-base-content/40 mb-4">
                  Add productivity tools from the palette above to get started
                </p>
                <button
                  onClick={() => setShowWelcome(true)}
                  className="btn btn-sm btn-primary"
                >
                  Show me how it works
                </button>
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

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartTour={startTour}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Custom scrollbar styles with mobile optimization */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3);
        }

        @media (max-width: 768px) {
          .draggable-component .react-draggable {
            touch-action: none;
          }
          
          .btn-xs {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
        }

        .container {
          max-width: 100%;
        }

        @media (min-width: 640px) {
          .container {
            max-width: 640px;
          }
        }

        @media (min-width: 768px) {
          .container {
            max-width: 768px;
          }
        }

        @media (min-width: 1024px) {
          .container {
            max-width: 1024px;
          }
        }

        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }

        @media (min-width: 1536px) {
          .container {
            max-width: 1536px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;