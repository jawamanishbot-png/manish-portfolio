import { useState, useEffect } from 'react';
import { getBookings, approveBooking, rejectBooking } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [calEventUrl, setCalEventUrl] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('adminEmail') || 'Admin';
    setUser({ email });
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchBookings(token);
    }
  }, []);

  const fetchBookings = async (token = null) => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('adminToken') || 'manish-portfolio-admin-2026';
      const data = await getBookings(authToken);
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
      const token = localStorage.getItem('adminToken') || 'manish-portfolio-admin-2026';
      await approveBooking(token, booking.id, calEventUrl);
      alert('Booking approved! User will receive the Cal.com link via email.');
      setSelectedBooking(null);
      setCalEventUrl('');
      await fetchBookings(token);
    } catch (err) {
      alert(`Failed to approve booking: ${err.message}`);
    }
  };

  const handleReject = async (booking) => {
    if (!confirm(`Reject booking from ${booking.email}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken') || 'manish-portfolio-admin-2026';
      await rejectBooking(token, booking.id);
      alert('Booking rejected.');
      await fetchBookings(token);
    } catch (err) {
      alert(`Failed to reject booking: ${err.message}`);
    }
  };

  const counts = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    all: bookings.length,
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="admin-container">
      {/* Sticky Header */}
      <div className="admin-header">
        <div className="admin-header-inner">
          <h1>Bookings</h1>
          <div className="admin-user">
            <span className="admin-email">{user?.email}</span>
            <button className="btn-logout" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-inner">
        {/* Stats / Filter Row */}
        <div className="stats-row">
          <div
            className={`stat-item ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <div className="stat-count">{counts.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div
            className={`stat-item ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <div className="stat-count">{counts.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div
            className={`stat-item ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <div className="stat-count">{counts.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div
            className={`stat-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <div className="stat-count">{counts.all}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <strong>Error</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && <p className="loading-state">Loading bookings...</p>}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'pending' ? '~' : filter === 'approved' ? '+' : filter === 'rejected' ? '-' : '*'}
            </div>
            <p>No {filter === 'all' ? '' : filter} bookings yet</p>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 && (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={`booking-card status-${booking.status}`}>
                <div className="booking-card-header">
                  <h3>{booking.email}</h3>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-card-body">
                  <p className="booking-context">
                    <strong>Topic</strong><br />
                    {booking.context}
                  </p>
                  <p className="booking-meta">
                    {new Date(booking.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(booking.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-card-actions">
                    <button
                      className="btn-approve"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(booking)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {booking.status === 'approved' && (booking.cal_event_url || booking.cal_link) && (
                  <p className="booking-cal-link">
                    <a href={booking.cal_event_url || booking.cal_link} target="_blank" rel="noopener noreferrer">
                      View Cal.com link
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
                x
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-detail">
                <span className="modal-detail-label">Email</span>
                <span className="modal-detail-value">{selectedBooking.email}</span>
              </div>
              <div className="modal-detail">
                <span className="modal-detail-label">Topic</span>
                <span className="modal-detail-value">{selectedBooking.context}</span>
              </div>

              <div className="form-group">
                <label htmlFor="calEventUrl">Cal.com Event URL</label>
                <input
                  id="calEventUrl"
                  type="url"
                  value={calEventUrl}
                  onChange={(e) => setCalEventUrl(e.target.value)}
                  placeholder="https://cal.com/manish/consultation"
                  required
                />
                <small>
                  The user will receive this link via email to schedule their time slot.
                </small>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => handleApprove(selectedBooking)}>
                  Send Approval
                </button>
                <button className="btn-cancel" onClick={() => setSelectedBooking(null)}>
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
