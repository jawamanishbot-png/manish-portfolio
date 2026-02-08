import { useState, useEffect } from 'react';
import { getBookings, approveBooking, rejectBooking } from '../services/api';
import './AdminDashboard.css';

// Get a token from localStorage for API calls
function getAdminToken() {
  return localStorage.getItem('adminToken') || 'manish-portfolio-admin-2026';
}

export default function AdminDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [calEventUrl, setCalEventUrl] = useState('');

  // Initialize with dummy user (already authenticated by parent component)
  useEffect(() => {
    setUser({ email: 'admin@manish-portfolio' }); // Placeholder user
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(`Failed to load bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setUser(null);
    setBookings([]);
    onLogout?.();
  };

  const handleApprove = async (booking) => {
    if (!calEventUrl.trim()) {
      alert('Please enter the Cal.com event URL');
      return;
    }

    try {
      await approveBooking(null, booking.id, calEventUrl);
      alert('Booking approved! User will receive the Cal.com link via email.');
      setSelectedBooking(null);
      setCalEventUrl('');
      await fetchBookings();
    } catch (err) {
      alert(`Failed to approve booking: ${err.message}`);
    }
  };

  const handleReject = async (booking) => {
    if (!confirm(`Reject booking from ${booking.email}?`)) {
      return;
    }

    try {
      await rejectBooking(null, booking.id);
      alert('Booking rejected.');
      await fetchBookings();
    } catch (err) {
      alert(`Failed to reject booking: ${err.message}`);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Booking Dashboard</h1>
        <div className="admin-user">
          <span>Admin</span>
          <button className="btn btn-secondary" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-filters">
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
              </div>

              {booking.status === 'pending' && (
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

              {booking.status === 'approved' && (booking.cal_event_url || booking.cal_link) && (
                <p className="booking-cal-link">
                  <strong>Cal.com Link:</strong>{' '}
                  <a href={booking.cal_event_url || booking.cal_link} target="_blank" rel="noopener noreferrer">
                    {booking.cal_event_url || booking.cal_link}
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
