const API_BASE = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

/**
 * Create a booking and get Stripe payment intent
 */
export const createBooking = async (email, context) => {
  const res = await fetch('/api/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, context }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

/**
 * Confirm payment and finalize booking
 */
export const confirmBooking = async (bookingId, paymentIntentId) => {
  const res = await fetch('/api/bookings/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, paymentIntentId }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

/**
 * Get all bookings (admin only)
 */
export const getBookings = async (token) => {
  const res = await fetch('/api/bookings/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

/**
 * Approve a booking and send user Cal.com link
 */
export const approveBooking = async (token, bookingId, calEventUrl) => {
  const res = await fetch('/api/bookings/approve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, calEventUrl }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

/**
 * Reject a booking
 */
export const rejectBooking = async (token, bookingId) => {
  const res = await fetch('/api/bookings/reject', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};
