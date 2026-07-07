import React, { useState, useEffect, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SessionSettings from './components/SessionSettings';
import SessionLogs from './components/SessionLogs';
import './App.css';

const MIN_DURATION = 1;
const MAX_DURATION = 60;

const clampDuration = value => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return MIN_DURATION;
  }
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, numeric));
};

const App = () => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionLogs, setSessionLogs] = useState([]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft((isWorkSession ? workDuration : breakDuration) * 60);
    }
  }, [workDuration, breakDuration, isWorkSession, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [isRunning]);

  const playAlarm = useCallback(() => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 660;
      gainNode.gain.value = 0.18;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
    } catch (error) {
      console.warn('Alarm skipped', error);
    }
  }, []);

  const transitionToNextSession = useCallback(() => {
    const completedSessionType = isWorkSession ? 'Work' : 'Break';
    const completedDuration = isWorkSession ? workDuration : breakDuration;

    setSessionLogs(logs => [
      {
        type: completedSessionType,
        duration: completedDuration,
        endedAt: new Date().toISOString(),
      },
      ...logs,
    ]);

    setIsWorkSession(prev => {
      const nextSession = !prev;
      if (prev) {
        setSessionCount(count => count + 1);
      }
      const nextDuration = nextSession ? workDuration : breakDuration;
      setTimeLeft(nextDuration * 60);
      return nextSession;
    });

    playAlarm();
  }, [breakDuration, isWorkSession, playAlarm, workDuration]);

  useEffect(() => {
    if (!isRunning || timeLeft !== 0) {
      return;
    }
    transitionToNextSession();
  }, [isRunning, timeLeft, transitionToNextSession]);

  const handleStartPause = () => setIsRunning(prev => !prev);

  const handleReset = () => {
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration * 60);
  };

  const updateWorkDuration = minutes => setWorkDuration(clampDuration(minutes));

  const updateBreakDuration = minutes => setBreakDuration(clampDuration(minutes));

  return (
    <div className="app-shell">
      <div className="glass-card">
        <header className="app-header">
          <h1>Pomodoro Focus</h1>
          <p>Balanced focus & break cycles with a calm, customizable experience.</p>
        </header>
        <TimerDisplay
          timeLeft={timeLeft}
          isWorkSession={isWorkSession}
          sessionCount={sessionCount}
        />
        <Controls
          isRunning={isRunning}
          onStartPause={handleStartPause}
          onReset={handleReset}
          isWorkSession={isWorkSession}
        />
        <SessionSettings
          workDuration={workDuration}
          breakDuration={breakDuration}
          onWorkChange={updateWorkDuration}
          onBreakChange={updateBreakDuration}
        />
        <SessionLogs logs={sessionLogs} />
      </div>
    </div>
  );
};

export default App;
