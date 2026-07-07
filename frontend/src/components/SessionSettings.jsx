import React from 'react';

const SessionSettings = ({ workDuration, breakDuration, onWorkChange, onBreakChange }) => (
  <section className="settings">
    <h2>Customize your rhythm</h2>
    <div className="settings-grid">
      <label className="settings-card">
        <span>Focus (minutes)</span>
        <input
          type="number"
          min="1"
          max="60"
          value={workDuration}
          onChange={e => onWorkChange(Number(e.target.value))}
        />
        <small>Default 25 minutes</small>
      </label>
      <label className="settings-card">
        <span>Break (minutes)</span>
        <input
          type="number"
          min="1"
          max="60"
          value={breakDuration}
          onChange={e => onBreakChange(Number(e.target.value))}
        />
        <small>Default 5 minutes</small>
      </label>
    </div>
  </section>
);

export default SessionSettings;
