import React from 'react';

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TimerDisplay = ({ timeLeft, isWorkSession, sessionCount }) => (
  <div className={`timer-display ${isWorkSession ? 'focus' : 'break'}`}>
    <div className="session-chip">
      <span>{isWorkSession ? 'Work session' : 'Break session'}</span>
    </div>
    <div className="countdown">{formatTime(timeLeft)}</div>
    <div className="session-counter">
      <span>Sessions completed</span>
      <strong>{sessionCount}</strong>
    </div>
  </div>
);

export default TimerDisplay;
