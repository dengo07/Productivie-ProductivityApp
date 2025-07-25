import Timer from "./Timer.jsx";

const PomodoroSection = ({
  mode,
  setMode,
  isRunning,
  setIsRunning,
  settings,
  completedPomodoros,
  setCompletedPomodoros,
  pomodoroKey,
  setPomodoroKey,
}) => {
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);
      if (newCompleted % settings.longBreakInterval === 0) {
        setMode("long_break");
      } else {
        setMode("short_break");
      }
    } else {
      setMode("pomodoro");
    }
    setPomodoroKey((prev) => prev + 1);
  };

  const switchMode = (newMode) => {
    if (isRunning) {
      if (
        !confirm(
          "The timer is running. Are you sure you want to switch? This will reset the current timer."
        )
      ) {
        return;
      }
    }
    setIsRunning(false);
    setMode(newMode);
    setPomodoroKey((prev) => prev + 1);
  };

  const modeTabs = [
    { key: "pomodoro", name: "Pomodoro" },
    { key: "short_break", name: "Short Break" },
    { key: "long_break", name: "Long Break" },
  ];

  return (
    <div className="card shadow-lg mb-6 bg-base-200">
      <div className="card-body items-center">
        <div className="tabs tabs-boxed mb-4">
          {modeTabs.map((tab) => (
            <a
              key={tab.key}
              className={`tab ${
                mode === tab.key ? "tab-active" : ""
              } capitalize`}
              onClick={() => switchMode(tab.key)}
            >
              {tab.name}
            </a>
          ))}
        </div>

        {/* Timer */}
        <Timer
          timerKey={pomodoroKey}
          mode={mode}
          settings={settings}
          onComplete={handleTimerComplete}
          onToggle={setIsRunning}
          isRunning={isRunning}
        />

        <div className="text-center mt-4">
          <p className="text-sm">
            Completed Pomodoros:{" "}
            <strong className="text-lg">{completedPomodoros}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroSection;