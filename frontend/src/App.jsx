import React, { useState, useEffect, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SessionSettings from './components/SessionSettings';
import SessionLogs from './components/SessionLogs';
import AuthForm from './components/AuthForm';
import './App.css';

const MIN_DURATION = 1;
const MAX_DURATION = 60;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

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

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pomodoro_token'));
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);

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

  const fetchCurrentUser = useCallback(async token => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Unable to fetch profile');
      }
      const user = await response.json();
      setAuthUser(user);
    } catch (error) {
      console.warn('Auth refresh failed', error);
      localStorage.removeItem('pomodoro_token');
      setAuthToken(null);
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    if (!authToken) {
      setAuthUser(null);
      return;
    }
    fetchCurrentUser(authToken);
  }, [authToken, fetchCurrentUser]);

  const handleAuthSubmit = useCallback(
    async formData => {
      if (!formData.email || !formData.password) {
        setAuthError('Email and password are required.');
        return;
      }

      setAuthLoading(true);
      setAuthError('');

      try {
        const endpoint = authMode === 'login' ? 'login' : 'register';
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail || 'Unexpected server response');
        }
        localStorage.setItem('pomodoro_token', payload.access_token);
        setAuthToken(payload.access_token);
        setAuthUser(payload.user);
      } catch (error) {
        setAuthError(error.message || 'Unable to authenticate at the moment.');
      } finally {
        setAuthLoading(false);
      }
    },
    [authMode]
  );

  const toggleAuthMode = () => {
    setAuthError('');
    setAuthMode(prev => (prev === 'login' ? 'signup' : 'login'));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setAuthError('');
    localStorage.removeItem('pomodoro_token');
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(workDuration * 60);
    setSessionCount(0);
    setSessionLogs([]);
  };

  if (!authToken) {
    return (
      <div className="app-shell">
        <div className="glass-card">
          <AuthForm
            mode={authMode}
            onSubmit={handleAuthSubmit}
            loading={authLoading}
            error={authError}
            onModeToggle={toggleAuthMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="glass-card">
        <header className="app-header app-header--auth">
          <div>
            <h1>Pomodoro Focus</h1>
            <p>Balanced focus & break cycles with a calm, customizable experience.</p>
          </div>
          <div className="auth-meta">
            {authUser && <small className="auth-meta__user">Signed in as {authUser.email}</small>}
            <button className="auth-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>
        <TimerDisplay timeLeft={timeLeft} isWorkSession={isWorkSession} sessionCount={sessionCount} />
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
