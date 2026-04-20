import React, { useState } from 'react';
import '../assets/Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://vangeen-backend.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email }));
      if (onLogin) onLogin({ email });

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-brand">
          <div className="login-logo">Vangeen</div>
          <div className="login-subtitle">Elite Financial Intelligence</div>
          <div className="login-divider"></div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Vangeen'}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-tag">
            <div className="login-tag-dot"></div>
            Finance
          </div>
          <div className="login-tag">
            <div className="login-tag-dot"></div>
            Accounting
          </div>
          <div className="login-tag">
            <div className="login-tag-dot"></div>
            Econometrics
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;