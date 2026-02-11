// Determine API base URL
const getApiBase = () => {
  const env = import.meta.env;
  if (env.VITE_USE_EMULATOR === 'true' && typeof window !== 'undefined') {
    return `http://localhost:5001/${env.VITE_FIREBASE_PROJECT_ID}/us-central1`;
  }
  return '';
};

const API_BASE = getApiBase();

const authHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/**
 * Create a booking request
 */
export const createBooking = async (email, context) => {
  const res = await fetch(`${API_BASE}/api/bookings/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, context }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/**
 * Get all bookings (admin only)
 */
export const getBookings = async (token) => {
  const res = await fetch(`${API_BASE}/api/bookings/list`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/**
 * Approve a booking with optional calendar event and payment link
 */
export const approveBooking = async (token, data) => {
  const res = await fetch(`${API_BASE}/api/bookings/approve`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/**
 * Reject a booking
 */
export const rejectBooking = async (token, bookingId) => {
  const res = await fetch(`${API_BASE}/api/bookings/reject`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/**
 * Create a Google Calendar event with Meet link
 */
export const createCalendarEvent = async (token, data) => {
  const res = await fetch(`${API_BASE}/api/calendar/create-event`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/**
 * Create a Stripe payment link
 */
export const createPaymentLink = async (token, data) => {
  const res = await fetch(`${API_BASE}/api/stripe/create-payment-link`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
