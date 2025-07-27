
import { Timer, CheckSquare, Trello, Brain, Save, Hand } from 'lucide-react';

function WelcomeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    { icon: Timer, title: "Pomodoro Timer", desc: "Work in focused 25-minute intervals with breaks" },
    { icon: CheckSquare, title: "Task Lists", desc: "Keep track of your to-dos and mark them complete" },
    { icon: Trello, title: "Kanban Board", desc: "Organize tasks in columns (To Do, In Progress, Done)" },
    { icon: Brain, title: "Mind Maps", desc: "Create visual connections between ideas" },
    { icon: Save, title: "Save Workspaces", desc: "Save and load your custom workspace layouts" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 p-4 sm:p-6 rounded-2xl shadow-2xl max-w-md mx-4 border border-base-300">
        <div className="text-center mb-4 sm:mb-6">
          <Hand className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-2">Welcome to Productivie!</h2>
          <p className="text-sm text-base-content/70">Your customizable productivity workspace</p>
        </div>
        
        <div className="space-y-3 sm:space-y-4 text-sm">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start space-x-3">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div><strong>{title}:</strong> {desc}</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn btn-ghost w-full mt-4 sm:mt-6">
          I'll Figure It Out
        </button>
      </div>
    </div>
  );
}

export default WelcomeModal;