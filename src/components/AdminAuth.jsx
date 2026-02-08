import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import AdminDashboard from './AdminDashboard';
import './AdminAuth.css';

const ADMIN_EMAIL = 'jawa.manish@gmail.com';
const GOOGLE_CLIENT_ID = '851417415489-4895qos4rfi6mdkdsb3jfdbdq2fgoqmn.apps.googleusercontent.com';

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      // Send credential to backend for verification
      const response = await fetch('/api/auth/verify-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Store token and authenticate
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.email);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="admin-auth-container">
        <div className="admin-auth-form">
          <h1>Admin Dashboard</h1>
          <p className="admin-email-hint">Sign in with {ADMIN_EMAIL}</p>

          <div className="google-login-wrapper">
            {loading ? (
              <div className="loading-spinner">Signing in...</div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                locale="en_US"
                size="large"
                width="300"
              />
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="auth-info">
            <p>
              <strong>Note:</strong> Only{' '}
              <span className="email-highlight">{ADMIN_EMAIL}</span> can access
              this dashboard.
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
