
import { Target, Timer, CheckSquare, Trello, Brain, HelpCircle } from 'lucide-react';

function ComponentPalette({ onAddComponent, componentCount, maxComponents = 8 }) {
  const components = [
    { type: 'DailyFocus', title: 'Daily Focus', icon: Target, color: 'btn-primary', desc: 'Set your main goal for today' },
    { type: 'PomodoroSection', title: 'Focus Timer', icon: Timer, color: 'btn-secondary', desc: '25-min work sessions with breaks' },
    { type: 'TaskSection', title: 'Task List', icon: CheckSquare, color: 'btn-accent', desc: 'Simple to-do list with checkboxes' },
    { type: 'KanbanBoard', title: 'Project Board', icon: Trello, color: 'btn-info', desc: 'Organize tasks in columns' },
    { type: 'Mindmap', title: 'Mind Map', icon: Brain, color: 'btn-primary', desc: 'Visual brainstorming tool' },
  ];

  const isAtLimit = componentCount >= maxComponents;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-base-200 to-base-300 border border-base-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-base-content">Add Productivity Tools</h3>
        <div className="text-xs sm:text-sm text-base-content/60">{componentCount}/{maxComponents} components</div>
      </div>
      
      {isAtLimit && (
        <div className="mb-3 p-2 bg-warning/20 border border-warning/30 rounded-lg text-xs sm:text-sm text-warning-content">
          <span className="inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Maximum components reached. Remove some to add new ones.
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
        {components.map(({ type, title, icon: Icon, color, desc }) => (
          <div key={type} className="space-y-1 sm:space-y-2">
            <button
              onClick={() => onAddComponent(type)}
              disabled={isAtLimit}
              className={`btn btn-sm ${color} w-full gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 ${
                isAtLimit ? 'btn-disabled opacity-50' : ''
              }`}
              title={`Add ${title}`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate text-xs sm:text-sm">{title}</span>
            </button>
            <p className="text-xs text-base-content/60 text-center px-1 hidden sm:block">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ComponentPalette;