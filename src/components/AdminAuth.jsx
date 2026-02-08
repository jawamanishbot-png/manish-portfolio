import { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import './AdminAuth.css';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026'; // Simple token for now

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token === ADMIN_TOKEN) {
      localStorage.setItem('adminToken', token);
      setIsAuthenticated(true);
      setToken('');
      setError('');
    } else {
      setError('Invalid admin token');
      setToken('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    setError('');
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-form">
        <h1>Admin Dashboard</h1>
        <p>Enter admin token to manage bookings</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">Admin Token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              required
              autoFocus
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
        </form>
        
        <p className="hint" style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          💡 Tip: Token is displayed in your terminal
        </p>
      </div>
    </div>
  );
}
