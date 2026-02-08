import { useEffect, useState } from 'react';
import { getBookings, approveBooking, rejectBooking } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [approvalLink, setApprovalLink] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // Check if user is already logged in via localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
      fetchBookings(storedToken);
    }
  }, []);

  // Fetch bookings
  const fetchBookings = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookings(token);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Google SDK if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
          setTimeout(resolve, 2000);
        });
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      // Show the One Tap UI or redirect to sign-in
      window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
        theme: 'outline',
        size: 'large',
      });
    } catch (err) {
      setError('Failed to initialize Google Sign-In: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send token to backend for verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();

      // Store token and user info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setAuthToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);

      // Fetch bookings
      await fetchBookings(data.token);
    } catch (err) {
      setError('Sign-in failed: ' + err.message);
    }
  };

  // Handle approval
  const handleApprove = async (bookingId) => {
    if (!approvalLink.trim()) {
      setError('Please enter a Cal.com scheduling link');
      return;
    }

    try {
      setApprovingId(bookingId);
      setError(null);

      await approveBooking(authToken, bookingId, approvalLink);

      // Update local bookings
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'approved', cal_link: approvalLink }
            : b
        )
      );

      setApprovalLink('');
      setExpandedBooking(null);
    } catch (err) {
      setError('Failed to approve booking: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  // Handle rejection
  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }

    try {
      setError(null);
      await rejectBooking(authToken, bookingId);

      // Update local bookings
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'rejected' } : b))
      );
    } catch (err) {
      setError('Failed to reject booking: ' + err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setBookings([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h2>Admin Dashboard</h2>
          <p>Sign in with your Google account to manage booking requests</p>
          {error && <div className="error-message">{error}</div>}
          <div id="google-signin-button" style={{ display: 'flex', justifyContent: 'center' }}></div>
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const approvedBookings = bookings.filter((b) => b.status === 'approved');
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <div className="tab-section">
          <h2>
            Pending Requests ({pendingBookings.length})
          </h2>
          {pendingBookings.length === 0 ? (
            <p className="no-data">No pending booking requests</p>
          ) : (
            <div className="bookings-list">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.email}</h3>
                      <p className="booking-date">
                        Submitted: {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="status-badge pending">Pending</span>
                  </div>

                  <div className="booking-content">
                    <p className="booking-context">{booking.context}</p>
                  </div>

                  {expandedBooking === booking.id && (
                    <div className="booking-actions">
                      <div className="form-group">
                        <label htmlFor={`cal-link-${booking.id}`}>
                          Cal.com Scheduling Link
                        </label>
                        <input
                          id={`cal-link-${booking.id}`}
                          type="url"
                          placeholder="https://cal.com/manish/30min"
                          value={approvalLink}
                          onChange={(e) => setApprovalLink(e.target.value)}
                        />
                        <small>Enter the Cal.com booking link for this user</small>
                      </div>

                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="btn btn-success"
                          disabled={approvingId === booking.id}
                        >
                          {approvingId === booking.id ? 'Approving...' : 'Approve & Send Link'}
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setExpandedBooking(null);
                            setApprovalLink('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedBooking !== booking.id && (
                    <button
                      onClick={() => setExpandedBooking(booking.id)}
                      className="btn btn-primary"
                    >
                      Review Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tab-section">
          <h2>Approved ({approvedBookings.length})</h2>
          {approvedBookings.length === 0 ? (
            <p className="no-data">No approved bookings yet</p>
          ) : (
            <div className="bookings-list">
              {approvedBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.email}</h3>
                      <p className="booking-date">
                        Approved: {new Date(booking.approved_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="status-badge approved">Approved</span>
                  </div>
                  <p className="booking-link">
                    Link: <a href={booking.cal_link} target="_blank" rel="noopener noreferrer">{booking.cal_link}</a>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tab-section">
          <h2>Rejected ({rejectedBookings.length})</h2>
          {rejectedBookings.length === 0 ? (
            <p className="no-data">No rejected bookings</p>
          ) : (
            <div className="bookings-list">
              {rejectedBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.email}</h3>
                      <p className="booking-date">
                        Rejected: {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="status-badge rejected">Rejected</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
