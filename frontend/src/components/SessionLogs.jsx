import React from 'react';

const formatTimestamp = iso => {
  try {
    const date = new Date(iso);
    return {
      time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      date: date.toLocaleDateString(),
    };
  } catch (error) {
    console.warn('Unable to format timestamp', error);
    return { time: '—', date: '—' };
  }
};

const SessionLogs = ({ logs }) => (
  <section className="logs">
    <h2>Session history</h2>
    <div className="logs-grid">
      {logs.length === 0 ? (
        <p className="logs-empty">No sessions logged yet. Finish one to see it here.</p>
      ) : (
        logs.map((log, index) => {
          const { time, date } = formatTimestamp(log.endedAt);
          return (
            <article key={`${log.endedAt}-${index}`} className="log-card">
              <span className="log-type">{log.type} session</span>
              <span className="log-duration">{log.duration} min · {time}</span>
              <small>{date}</small>
            </article>
          );
        })
      )}
    </div>
  </section>
);

export default SessionLogs;
