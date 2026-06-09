import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';

export default function Auth() {
  const { loginUser, registerUser, setActiveView } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user, organizer
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await loginUser(email, password);
      if (!res.success) {
        setError(res.message || 'Login failed. Verify credentials.');
      }
    } else {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
      const res = await registerUser(name, email, password, role);
      if (!res.success) {
        setError(res.message || 'Registration failed.');
      }
    }
    setLoading(false);
  };

  const handleSkipToSandbox = () => {
    setActiveView('dashboard');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      fontFamily: 'var(--font-family)',
      overflowY: 'auto'
    }}>
      <div className="dashboard-card" style={{ width: '100%', maxWidth: '440px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px', width: '50px', height: '50px' }}>
            <Activity size={24} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome to Eventora
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            {isLogin ? 'Sign in to access event portals and privileges' : 'Create an organizer or attendee account'}
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(255, 118, 117, 0.12)', 
            border: '1px solid #ff7675', 
            borderRadius: '10px', 
            color: '#ff7675', 
            padding: '12px', 
            fontSize: '13px', 
            fontWeight: 600, 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="search-box" style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}>
                <User size={16} />
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="search-box" style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}>
              <Mail size={16} />
              <input 
                type="email" 
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="search-box" style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}>
              <Lock size={16} />
              <input 
                type="password" 
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Select Role</label>
              <select 
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ fontSize: '13px', height: '42px' }}
              >
                <option value="user">Attendee / General User</option>
                <option value="organizer">Event Organizer</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{ color: 'var(--accent-purple)', fontWeight: 700, cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </span>
        </div>

        <div style={{ 
          marginTop: '24px', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '20px', 
          textAlign: 'center' 
        }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleSkipToSandbox}
            style={{ fontSize: '12px', padding: '6px 16px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Skip to Sandbox Mode <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
