import React from 'react';

const Controls = ({ isRunning, onStartPause, onReset, isWorkSession }) => (
  <div className="controls">
    <button className="primary" onClick={onStartPause}>
      {isRunning ? 'Pause' : 'Start'}
    </button>
    <button className="secondary" onClick={onReset}>
      Reset
    </button>
    <div className="status">
      <span>{isWorkSession ? 'Focus' : 'Break'} time</span>
    </div>
  </div>
);

export default Controls;
