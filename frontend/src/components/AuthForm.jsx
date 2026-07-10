import React, { useEffect, useState } from 'react';

const AuthForm = ({ mode, onSubmit, loading, error, onModeToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setPassword('');
  }, [mode]);

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  const headline = mode === 'login' ? 'Welcome back' : 'Create your focus space';
  const description =
    mode === 'login'
      ? 'Sign in and keep your timers, logs, and settings secure.'
      : 'Create a new account and lock in your focus rhythm.';

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h2>{headline}</h2>
        <p className="auth-card__description">{description}</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email address</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <div className="auth-toggle">
        <span>{mode === 'login' ? 'Need an account?' : 'Already a member?'}</span>
        <button type="button" onClick={onModeToggle} disabled={loading}>
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
