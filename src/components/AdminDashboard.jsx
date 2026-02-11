import { useState, useEffect } from 'react';
import { getBookings, approveBooking, rejectBooking, createCalendarEvent, createPaymentLink } from '../services/api';
import { getAnalytics } from '../services/analytics';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [tab, setTab] = useState('bookings');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Approval modal state
  const [approvalStep, setApprovalStep] = useState('options'); // options | scheduling | processing
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('10:00');
  const [meetDuration, setMeetDuration] = useState(25);
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [calendarResult, setCalendarResult] = useState(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('adminEmail') || 'Admin';
    setUser({ email });
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchBookings(token);
      fetchAnalytics(token);
    }
  }, []);

  const getToken = () => localStorage.getItem('adminToken') || 'manish-portfolio-admin-2026';

  const fetchAnalytics = async (token = null) => {
    try {
      setAnalyticsLoading(true);
      const data = await getAnalytics(token || getToken());
      setAnalytics(data);
    } catch {
      // Non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchBookings = async (token = null) => {
    try {
      setLoading(true);
      const data = await getBookings(token || getToken());
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

  const openApprovalModal = (booking) => {
    setSelectedBooking(booking);
    setApprovalStep('options');
    setMeetDate('');
    setMeetTime('10:00');
    setMeetDuration(25);
    setIncludePayment(false);
    setPaymentAmount('');
    setCalendarResult(null);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setApprovalStep('options');
    setCalendarResult(null);
  };

  const handleScheduleMeeting = async () => {
    if (!meetDate || !meetTime) {
      alert('Please select a date and time');
      return;
    }

    try {
      setApprovalStep('processing');
      const result = await createCalendarEvent(getToken(), {
        attendeeEmail: selectedBooking.email,
        topic: selectedBooking.context,
        date: meetDate,
        startTime: meetTime,
        durationMinutes: meetDuration,
      });
      setCalendarResult(result);
      setApprovalStep('options');
    } catch (err) {
      alert(`Failed to create calendar event: ${err.message}`);
      setApprovalStep('scheduling');
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const token = getToken();
      const approvalData = {
        bookingId: selectedBooking.id,
        meetLink: calendarResult?.meetLink || null,
        eventLink: calendarResult?.eventLink || null,
      };

      // Create payment link if requested
      if (includePayment && paymentAmount && parseFloat(paymentAmount) > 0) {
        try {
          const paymentResult = await createPaymentLink(token, {
            amount: parseFloat(paymentAmount),
            bookingId: selectedBooking.id,
            attendeeEmail: selectedBooking.email,
            topic: selectedBooking.context,
          });
          approvalData.paymentUrl = paymentResult.paymentUrl;
          approvalData.paymentAmount = parseFloat(paymentAmount);
        } catch (err) {
          alert(`Failed to create payment link: ${err.message}`);
          setApproving(false);
          return;
        }
      }

      await approveBooking(token, approvalData);
      closeModal();
      await fetchBookings(token);
    } catch (err) {
      alert(`Failed to approve booking: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (booking) => {
    if (!confirm(`Reject booking from ${booking.email}?`)) return;
    try {
      const token = getToken();
      await rejectBooking(token, booking.id);
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

  const maxDailyView = analytics?.dailyViews
    ? Math.max(...analytics.dailyViews.map((d) => d.count), 1)
    : 1;

  // Get tomorrow's date as min for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="admin-container">
      {/* Sticky Header */}
      <div className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${tab === 'bookings' ? 'active' : ''}`}
              onClick={() => setTab('bookings')}
            >
              Bookings
            </button>
            <button
              className={`admin-tab ${tab === 'analytics' ? 'active' : ''}`}
              onClick={() => setTab('analytics')}
            >
              Analytics
            </button>
          </div>
          <div className="admin-user">
            <span className="admin-email">{user?.email}</span>
            <button className="btn-logout" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="admin-inner">
          {analyticsLoading && <p className="loading-state">Loading analytics...</p>}
          {!analyticsLoading && !analytics && (
            <div className="empty-state">
              <div className="empty-icon">~</div>
              <p>No analytics data yet</p>
            </div>
          )}
          {analytics && (
            <>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-card-value">{analytics.views.today}</div>
                  <div className="analytics-card-label">Views Today</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-value">{analytics.visitors.today}</div>
                  <div className="analytics-card-label">Visitors Today</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-value">{analytics.views.week}</div>
                  <div className="analytics-card-label">Views This Week</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-value">{analytics.visitors.week}</div>
                  <div className="analytics-card-label">Visitors This Week</div>
                </div>
              </div>
              <div className="analytics-section">
                <h3 className="analytics-section-title">Last 7 Days</h3>
                <div className="analytics-chart">
                  {analytics.dailyViews.map((day) => (
                    <div key={day.date} className="chart-bar-group">
                      <span className="chart-bar-value">{day.count}</span>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ height: `${(day.count / maxDailyView) * 100}%` }} />
                      </div>
                      <span className="chart-bar-label">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="analytics-two-col">
                <div className="analytics-section">
                  <h3 className="analytics-section-title">Devices</h3>
                  <div className="device-breakdown">
                    <div className="device-row">
                      <span className="device-label">Desktop</span>
                      <div className="device-bar-track">
                        <div className="device-bar-fill" style={{ width: `${((analytics.devices.desktop / (analytics.views.month || 1)) * 100)}%` }} />
                      </div>
                      <span className="device-count">{analytics.devices.desktop}</span>
                    </div>
                    <div className="device-row">
                      <span className="device-label">Mobile</span>
                      <div className="device-bar-track">
                        <div className="device-bar-fill mobile" style={{ width: `${((analytics.devices.mobile / (analytics.views.month || 1)) * 100)}%` }} />
                      </div>
                      <span className="device-count">{analytics.devices.mobile}</span>
                    </div>
                  </div>
                </div>
                <div className="analytics-section">
                  <h3 className="analytics-section-title">Top Sources</h3>
                  {analytics.topReferrers.length === 0 ? (
                    <p className="analytics-empty">No referrer data yet</p>
                  ) : (
                    <div className="referrer-list">
                      {analytics.topReferrers.map((ref) => (
                        <div key={ref.source} className="referrer-row">
                          <span className="referrer-source">{ref.source}</span>
                          <span className="referrer-count">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {analytics.topClicks.length > 0 && (
                <div className="analytics-section">
                  <h3 className="analytics-section-title">Button Clicks</h3>
                  <div className="referrer-list">
                    {analytics.topClicks.map((click) => (
                      <div key={click.label} className="referrer-row">
                        <span className="referrer-source">{click.label.replace(/_/g, ' ')}</span>
                        <span className="referrer-count">{click.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="analytics-footer">
                <span>30-day totals: {analytics.views.month} views from {analytics.visitors.month} visitors</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="admin-inner">
          <div className="stats-row">
            {['pending', 'approved', 'rejected', 'all'].map((key) => (
              <div
                key={key}
                className={`stat-item ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                <div className="stat-count">{counts[key]}</div>
                <div className="stat-label">{key === 'all' ? 'Total' : key}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="error-banner">
              <strong>Error</strong> {error}
            </div>
          )}

          {loading && <p className="loading-state">Loading bookings...</p>}

          {!loading && filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">~</div>
              <p>No {filter === 'all' ? '' : filter} bookings yet</p>
            </div>
          )}

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
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}{' '}at{' '}
                      {new Date(booking.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="booking-card-actions">
                      <button className="btn-approve" onClick={() => openApprovalModal(booking)}>
                        Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(booking)}>
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === 'approved' && (
                    <div className="booking-approved-info">
                      {booking.meet_link && (
                        <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="approved-link meet">
                          Google Meet
                        </a>
                      )}
                      {booking.event_link && (
                        <a href={booking.event_link} target="_blank" rel="noopener noreferrer" className="approved-link calendar">
                          Calendar Event
                        </a>
                      )}
                      {booking.payment_url && (
                        <a href={booking.payment_url} target="_blank" rel="noopener noreferrer" className="approved-link payment">
                          Payment (${booking.payment_amount})
                        </a>
                      )}
                      {(booking.cal_event_url || booking.cal_link) && !booking.meet_link && (
                        <a href={booking.cal_event_url || booking.cal_link} target="_blank" rel="noopener noreferrer" className="approved-link calendar">
                          Cal.com link
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Booking</h2>
              <button className="modal-close" onClick={closeModal}>x</button>
            </div>

            <div className="modal-body">
              {/* Booking Info */}
              <div className="modal-detail-row">
                <div className="modal-detail">
                  <span className="modal-detail-label">Email</span>
                  <span className="modal-detail-value">{selectedBooking.email}</span>
                </div>
                <div className="modal-detail">
                  <span className="modal-detail-label">Topic</span>
                  <span className="modal-detail-value">{selectedBooking.context}</span>
                </div>
              </div>

              {/* Processing State */}
              {approvalStep === 'processing' && (
                <div className="processing-state">
                  <div className="spinner" />
                  <p>Creating calendar event...</p>
                </div>
              )}

              {/* Scheduling Section */}
              {approvalStep === 'scheduling' && (
                <div className="schedule-section">
                  <h3 className="section-heading">Schedule Meeting</h3>
                  <div className="schedule-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={meetDate}
                          min={minDate}
                          onChange={(e) => setMeetDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Time</label>
                        <input
                          type="time"
                          value={meetTime}
                          onChange={(e) => setMeetTime(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <select value={meetDuration} onChange={(e) => setMeetDuration(Number(e.target.value))}>
                          <option value={15}>15 min</option>
                          <option value={25}>25 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                        </select>
                      </div>
                    </div>
                    <div className="schedule-actions">
                      <button className="btn-primary" onClick={handleScheduleMeeting}>
                        Create Event
                      </button>
                      <button className="btn-cancel" onClick={() => setApprovalStep('options')}>
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Options (main view) */}
              {approvalStep === 'options' && (
                <>
                  {/* Calendar Card */}
                  <div className={`option-card ${calendarResult ? 'done' : ''}`}>
                    <div className="option-card-header">
                      <div>
                        <h3 className="option-title">Google Calendar + Meet</h3>
                        <p className="option-desc">
                          {calendarResult
                            ? 'Meeting scheduled — invite sent to attendee'
                            : 'Schedule a meeting and auto-generate a Google Meet link'
                          }
                        </p>
                      </div>
                      {calendarResult ? (
                        <span className="option-done-badge">Scheduled</span>
                      ) : (
                        <button className="btn-option" onClick={() => setApprovalStep('scheduling')}>
                          Schedule
                        </button>
                      )}
                    </div>
                    {calendarResult && (
                      <div className="option-result">
                        {calendarResult.meetLink && (
                          <a href={calendarResult.meetLink} target="_blank" rel="noopener noreferrer" className="result-link">
                            Meet link
                          </a>
                        )}
                        {calendarResult.eventLink && (
                          <a href={calendarResult.eventLink} target="_blank" rel="noopener noreferrer" className="result-link">
                            Calendar event
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Card */}
                  <div className={`option-card ${includePayment ? 'active' : ''}`}>
                    <div className="option-card-header">
                      <div>
                        <h3 className="option-title">Stripe Payment</h3>
                        <p className="option-desc">Optionally require payment before the consultation</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={includePayment}
                          onChange={(e) => setIncludePayment(e.target.checked)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                    {includePayment && (
                      <div className="payment-input">
                        <span className="currency-prefix">$</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="150"
                        />
                        <span className="currency-suffix">USD</span>
                      </div>
                    )}
                  </div>

                  {/* Approve Button */}
                  <div className="modal-actions">
                    <button
                      className="btn-primary"
                      onClick={handleApprove}
                      disabled={approving || (includePayment && (!paymentAmount || parseFloat(paymentAmount) <= 0))}
                    >
                      {approving ? 'Approving...' : 'Send Approval'}
                    </button>
                    <button className="btn-cancel" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
