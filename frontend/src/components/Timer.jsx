import { useState, useEffect } from 'react';


const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


const Timer = ({ mode, settings, onComplete, onToggle, isRunning, timerKey }) => {
  const initialTime = settings[mode] ; 
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {

    setTimeLeft(settings[mode] );
  }, [mode, settings, timerKey]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  useEffect(() => {
    const modeName = mode.replace('_', ' ');
    //document.title = `${formatTime(timeLeft)} - ${modeName.charAt(0).toUpperCase() + modeName.slice(1)}`;
  }, [timeLeft, mode]);

  const resetTimer = () => {
    onToggle(false);
    setTimeLeft(settings[mode]); 
  };

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body items-center text-center">
        <h2 className="text-6xl sm:text-8xl font-mono font-bold text-primary mb-4">
          {formatTime(timeLeft)}
        </h2>
        <div className="flex gap-4">
          <button
            className={`btn btn-primary w-32`}
            onClick={() => onToggle(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className="btn btn-outline"
            onClick={resetTimer}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;