import { useState, useCallback, useEffect,} from 'react';
import { 
  Target, Brain, Settings, 
  Sun, Moon, Trash2, HelpCircle, Save, FolderOpen,
 
} from 'lucide-react';

import { Analytics } from "@vercel/analytics/react"
import PomodoroSection from './components/PomodoroSection';
import TaskSection from './components/TaskSection';
import SettingsModal from './components/SettingsModal';
import DailyFocus from './components/DailyFocus';
import KanbanBoard from './components/KanbanBoard';
import Mindmap from './components/MindMap';
import WorkspaceModal from './components/WorkspaceModal';
import DraggableComponent from './components/DraggableComponent';
import ComponentPalette from './components/ComponentPalette';
import WelcomeModal from './components/WelcomeModal';

// Workspace Management Hook - FIXED VERSION
const useWorkspaceManager = () => {
  // Initialize with localStorage data immediately
  const [savedWorkspaces, setSavedWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('productivie-workspaces');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load workspaces:', e);
      return [];
    }
  });
  
  const [currentWorkspaceName, setCurrentWorkspaceName] = useState('');
  const [isLoaded, setIsLoaded] = useState(true); // Since we load immediately

  // Save workspaces to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('productivie-workspaces', JSON.stringify(savedWorkspaces));
    } catch (e) {
      console.error('Failed to save workspaces:', e);
    }
  }, [savedWorkspaces]);

  const saveWorkspace = useCallback((name, workspaceData) => {
    const newWorkspace = {
      id: Date.now().toString(),
      name,
      data: workspaceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedWorkspaces(prev => {
      const existing = prev.find(ws => ws.name === name);
      if (existing) {
        return prev.map(ws => ws.name === name ? 
          { ...newWorkspace, id: existing.id, createdAt: existing.createdAt } : ws
        );
      }
      return [...prev, newWorkspace];
    });

    setCurrentWorkspaceName(name);
    return true;
  }, []);

  const loadWorkspace = useCallback((workspaceId) => {
    const workspace = savedWorkspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceName(workspace.name);
      return workspace.data;
    }
    return null;
  }, [savedWorkspaces]);

  const deleteWorkspace = useCallback((workspaceId) => {
    setSavedWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    
    // If deleted workspace was the current one, clear current name
    const deletedWorkspace = savedWorkspaces.find(ws => ws.id === workspaceId);
    if (deletedWorkspace && deletedWorkspace.name === currentWorkspaceName) {
      setCurrentWorkspaceName('');
      // Clear last workspace from localStorage
      try {
        localStorage.removeItem('productivie-last-workspace');
      } catch (e) {
        console.error('Failed to remove last workspace:', e);
      }
    }
  }, [savedWorkspaces, currentWorkspaceName]);

  const exportWorkspace = useCallback((workspaceData, name = 'workspace') => {
    const exportData = {
      name,
      data: workspaceData,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workspace.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importWorkspace = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          if (importData.data && importData.name) {
            resolve(importData);
          } else {
            reject(new Error('Invalid workspace file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse workspace file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  return {
    savedWorkspaces,
    currentWorkspaceName,
    setCurrentWorkspaceName,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    exportWorkspace,
    importWorkspace,
    isLoaded
  };
};

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
  // All original state variables preserved
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('productivie-theme') || 'retro';
    } catch (e) {
      return 'retro';
    }
  });
  
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('productivie-settings');
      return saved ? JSON.parse(saved) : {
        pomodoro: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60,
        longBreakInterval: 4,
      };
    } catch (e) {
      return {
        pomodoro: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60,
        longBreakInterval: 4,
      };
    }
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
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const [activeComponents, setActiveComponents] = useState([
    { id: 'dailyFocus', type: 'DailyFocus', title: 'Daily Focus', x: 50, y: 100, width: 320, height: 220 },
    { id: 'pomodoro', type: 'PomodoroSection', title: 'Focus Timer', x: 400, y: 100, width: 340, height: 280 },
    { id: 'tasks', type: 'TaskSection', title: 'Task List', x: 50, y: 350, width: 320, height: 300 },
  ]);

  // Initialize workspace manager
  const {
    savedWorkspaces,
    currentWorkspaceName,
    setCurrentWorkspaceName,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    exportWorkspace,
    importWorkspace,
    isLoaded
  } = useWorkspaceManager();

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('productivie-theme', theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [theme]);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('productivie-settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Auto-save current workspace
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentWorkspaceName) {
        const workspaceData = {
          activeComponents,
          tasks,
          theme,
          settings,
          mode,
          completedPomodoros,
          taskInput
        };
        saveWorkspace(currentWorkspaceName, workspaceData);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentWorkspaceName, activeComponents, tasks, theme, settings, mode, completedPomodoros, taskInput, saveWorkspace]);

  // Load last used workspace on mount - FIXED
  useEffect(() => {
    if (isLoaded && savedWorkspaces.length > 0) {
      try {
        const lastWorkspace = localStorage.getItem('productivie-last-workspace');
        if (lastWorkspace) {
          const workspace = savedWorkspaces.find(ws => ws.id === lastWorkspace);
          if (workspace) {
            handleLoadWorkspace(workspace.id);
          }
        }
      } catch (e) {
        console.error('Failed to load last workspace:', e);
      }
    }
  }, [isLoaded, savedWorkspaces]);

  // Check if user is new
  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('productivie-visited');
      if (!hasVisited) {
        setShowWelcome(true);
        localStorage.setItem('productivie-visited', 'true');
      }
    } catch (e) {
      console.error('Failed to check visit status:', e);
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
    if (activeComponents.length >= 8) return;

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

  const clearWorkspace = useCallback(() => {
    if (confirm('Are you sure you want to remove all components? This cannot be undone.')) {
      setActiveComponents([]);
      setSelectedComponent(null);
      setCurrentWorkspaceName('');
      try {
        localStorage.removeItem('productivie-last-workspace');
      } catch (e) {
        console.error('Failed to remove last workspace:', e);
      }
    }
  }, [setCurrentWorkspaceName]);

  // Workspace management functions - FIXED
  const handleSaveWorkspace = useCallback((name, data = null) => {
    const workspaceData = data || {
      activeComponents,
      tasks,
      theme,
      settings,
      mode,
      completedPomodoros,
      taskInput
    };
    
    const success = saveWorkspace(name, workspaceData);
    if (success) {
      // Find the workspace ID after saving
      const workspace = savedWorkspaces.find(ws => ws.name === name) || 
                       { id: Date.now().toString() }; // Fallback
      try {
        localStorage.setItem('productivie-last-workspace', workspace.id);
      } catch (e) {
        console.error('Failed to save last workspace:', e);
      }
    }
    return success;
  }, [activeComponents, tasks, theme, settings, mode, completedPomodoros, taskInput, saveWorkspace, savedWorkspaces]);

  const handleLoadWorkspace = useCallback((workspaceId) => {
    const workspaceData = loadWorkspace(workspaceId);
    if (workspaceData) {
      setActiveComponents(workspaceData.activeComponents || []);
      setTasks(workspaceData.tasks || []);
      setTheme(workspaceData.theme || 'retro');
      setSettings(workspaceData.settings || {
        pomodoro: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60,
        longBreakInterval: 4,
      });
      setMode(workspaceData.mode || 'pomodoro');
      setCompletedPomodoros(workspaceData.completedPomodoros || 0);
      setTaskInput(workspaceData.taskInput || '');
      setSelectedComponent(null);
      
      try {
        localStorage.setItem('productivie-last-workspace', workspaceId);
      } catch (e) {
        console.error('Failed to save last workspace:', e);
      }
    }
  }, [loadWorkspace]);

  const handleExportWorkspace = useCallback(() => {
    const workspaceData = {
      activeComponents,
      tasks,
      theme,
      settings,
      mode,
      completedPomodoros,
      taskInput
    };
    
    const exportName = currentWorkspaceName || 'my_workspace';
    exportWorkspace(workspaceData, exportName);
  }, [activeComponents, tasks, theme, settings, mode, completedPomodoros, taskInput, currentWorkspaceName, exportWorkspace]);

  const handleImportWorkspace = useCallback(async (file) => {
    try {
      const importData = await importWorkspace(file);
      return importData;
    } catch (error) {
      throw error;
    }
  }, [importWorkspace]);

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
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-300">
        <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <Analytics/>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-content" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary truncate">
                  Productivie
                </h1>
                {currentWorkspaceName && (
                  <p className="text-xs text-base-content/60 truncate">
                    {currentWorkspaceName}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="badge badge-outline text-xs hidden sm:flex">
                {activeComponents.length}/8
              </div>

              {/* Workspace Management Button */}
              <button
                className="btn btn-xs sm:btn-sm btn-ghost"
                onClick={() => setIsWorkspaceModalOpen(true)}
                title="Manage workspaces"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline text-sm">Workspace</span>
              </button>
              
              <HelpTooltip content="Need help? Click for a quick tour!">
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost"
                  onClick={() => setShowWelcome(true)}
                  title="Help & Tour"
                >
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </HelpTooltip>

              <button
                className="btn btn-xs sm:btn-sm btn-ghost"
                onClick={() => setIsSettingsOpen(true)}
                title="Open settings"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:inline text-sm">Settings</span>
              </button>
              
              <button
                className="btn btn-xs sm:btn-sm btn-ghost"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === 'night' ? 
                  <Sun className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                  <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                }
                <span className="hidden md:inline text-sm">{theme === 'night' ? 'Light' : 'Dark'}</span>
              </button>

              {activeComponents.length > 0 && (
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost hover:btn-error"
                  onClick={clearWorkspace}
                  title="Clear workspace"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <ComponentPalette 
          onAddComponent={addComponent} 
          componentCount={activeComponents.length}
          maxComponents={8}
        />
      </div>

      {/* Workspace area */}
      <div className="px-3 sm:px-6">
        <div className={`relative w-full ${isMobile ? 'min-h-[500vh]' : 'min-h-[500vh]'} rounded-xl sm:rounded-2xl bg-base-50 border-2 border-dashed border-base-300 overflow-hidden`}>
          {activeComponents.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
              <div className="text-center max-w-md">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-base-content/50" />
                <h3 className="text-lg sm:text-xl font-semibold text-base-content/60 mb-2">
                  Your workspace is empty
                </h3>
                <p className="text-sm sm:text-base text-base-content/40 mb-4">
                  Add productivity tools from the palette above to get started, or load a saved workspace
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => setShowWelcome(true)}
                    className="btn btn-sm btn-primary"
                  >
                    Show me how it works
                  </button>
                  <button
                    onClick={() => setIsWorkspaceModalOpen(true)}
                    className="btn btn-sm btn-ghost"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Load Workspace
                  </button>
                </div>
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
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Workspace Management Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
        onLoad={handleLoadWorkspace}
        onDelete={deleteWorkspace}
        onExport={handleExportWorkspace}
        onImport={handleImportWorkspace}
        savedWorkspaces={savedWorkspaces}
        currentWorkspaceName={currentWorkspaceName}
      />

      {/* Custom styles */}
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