import { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import './AdminAuth.css';

const ADMIN_EMAIL = 'jawa.manish@gmail.com';
const GOOGLE_CLIENT_ID = '851417415489-4895qos4rfi6mdkdsb3jfdbdq2fgoqmn.apps.googleusercontent.com';

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogle = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          width: '300',
          locale: 'en_US',
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      setError('');

      // Send credential to backend for verification
      const res = await fetch('/api/auth/verify-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    // Clear Google session
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-form">
        <h1>Admin Dashboard</h1>
        <p className="admin-email-hint">Sign in with {ADMIN_EMAIL}</p>

        <div className="google-login-wrapper">
          {loading ? (
            <div className="loading-spinner">Signing in...</div>
          ) : (
            <div id="googleSignInButton" className="google-button-container"></div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            {error.includes('invalid_client') && (
              <p style={{ marginTop: '10px', fontSize: '12px' }}>
                💡 <strong>Troubleshooting:</strong> Make sure https://manish-portfolio-bookings.web.app is added as an authorized JavaScript origin in Google Cloud Console OAuth 2.0 Client ID settings.
              </p>
            )}
          </div>
        )}

        <div className="auth-info">
          <p>
            <strong>Note:</strong> Only{' '}
            <span className="email-highlight">{ADMIN_EMAIL}</span> can access
            this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
