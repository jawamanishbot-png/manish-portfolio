import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getBookings, approveBooking, rejectBooking } from '../services/api';
import './AdminDashboard.css';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'jawa.manish@gmail.com';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('paid'); // paid, pending, approved, rejected, all
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [calEventUrl, setCalEventUrl] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Verify user is Manish
        if (firebaseUser.email !== ADMIN_EMAIL) {
          setError(`Access denied. Only ${ADMIN_EMAIL} can access this dashboard.`);
          await signOut(auth);
          return;
        }
        setUser(firebaseUser);
        await fetchBookings(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBookings = async (firebaseUser) => {
    try {
      setLoading(true);
      const token = await firebaseUser.getIdToken();
      const data = await getBookings(token);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(`Failed to load bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email !== ADMIN_EMAIL) {
        setError(`Access denied. Only ${ADMIN_EMAIL} can access this dashboard.`);
        await signOut(auth);
      }
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setBookings([]);
    } catch (err) {
      setError(`Logout failed: ${err.message}`);
    }
  };

  const handleApprove = async (booking) => {
    if (!calEventUrl.trim()) {
      alert('Please enter the Cal.com event URL');
      return;
    }

    try {
      const token = await user.getIdToken();
      await approveBooking(token, booking.id, calEventUrl);
      alert('Booking approved! User will receive the Cal.com link via email.');
      setSelectedBooking(null);
      setCalEventUrl('');
      await fetchBookings(user);
    } catch (err) {
      alert(`Failed to approve booking: ${err.message}`);
    }
  };

  const handleReject = async (booking) => {
    if (!confirm(`Reject booking from ${booking.email}?`)) {
      return;
    }

    try {
      const token = await user.getIdToken();
      await rejectBooking(token, booking.id);
      alert('Booking rejected.');
      await fetchBookings(user);
    } catch (err) {
      alert(`Failed to reject booking: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h1>Admin Dashboard</h1>
          <p>Sign in with Google to manage bookings</p>
          <button className="btn btn-primary" onClick={handleGoogleLogin}>
            Sign In with Google
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Booking Dashboard</h1>
        <div className="admin-user">
          <span>{user.email}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-filters">
        <button
          className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          💰 Paid - Awaiting Review ({bookings.filter((b) => b.status === 'paid').length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending ({bookings.filter((b) => b.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          ✓ Approved ({bookings.filter((b) => b.status === 'approved').length})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          ✕ Rejected ({bookings.filter((b) => b.status === 'rejected').length})
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
      </div>

      {loading && <p className="loading">Loading bookings...</p>}

      {filteredBookings.length === 0 ? (
        <p className="no-bookings">No {filter} bookings at this time.</p>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={`booking-card status-${booking.status}`}>
              <div className="booking-card-header">
                <h3>{booking.email}</h3>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="booking-card-body">
                <p className="booking-context">
                  <strong>Topic:</strong> {booking.context}
                </p>
                <p className="booking-meta">
                  <strong>Requested:</strong>{' '}
                  {new Date(booking.created_at).toLocaleDateString()} at{' '}
                  {new Date(booking.created_at).toLocaleTimeString()}
                </p>
                {booking.payment_id && (
                  <p className="booking-meta">
                    <strong>Payment:</strong> {booking.payment_id.slice(0, 10)}...
                  </p>
                )}
              </div>

              {(booking.status === 'pending' || booking.status === 'paid') && (
                <div className="booking-card-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(booking)}
                  >
                    Reject
                  </button>
                </div>
              )}

              {booking.status === 'approved' && booking.cal_event_url && (
                <p className="booking-cal-link">
                  <strong>Cal.com Link:</strong>{' '}
                  <a href={booking.cal_event_url} target="_blank" rel="noopener noreferrer">
                    {booking.cal_event_url}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Booking</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Email:</strong> {selectedBooking.email}
              </p>
              <p>
                <strong>Topic:</strong> {selectedBooking.context}
              </p>

              <div className="form-group">
                <label htmlFor="calEventUrl">Cal.com Event URL</label>
                <input
                  id="calEventUrl"
                  type="url"
                  value={calEventUrl}
                  onChange={(e) => setCalEventUrl(e.target.value)}
                  placeholder="https://cal.com/manish/your-event"
                  required
                />
                <small>
                  User will receive this link in an email to schedule their time slot
                </small>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => handleApprove(selectedBooking)}>
                  Send Approval & Link
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
