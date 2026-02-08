// Determine API base URL
// In production (Firebase Hosting), use relative paths which are rewritten to Cloud Functions
// In development with emulator, use http://localhost:5001/project-id/us-central1/api
// In development without emulator, use relative paths which are served by Vite
const getApiBase = () => {
  const env = import.meta.env;
  
  // Check if we're in development with Firebase emulator
  if (env.VITE_USE_EMULATOR === 'true' && typeof window !== 'undefined') {
    return `http://localhost:5001/${env.VITE_FIREBASE_PROJECT_ID}/us-central1`;
  }
  
  // Otherwise use relative paths (works for Firebase Hosting and Vite dev server)
  return '';
};

const API_BASE = getApiBase();

/**
 * Create a booking and get Stripe Checkout Session URL
 */
export const createBooking = async (email, context) => {
  const res = await fetch(`${API_BASE}/api/bookings/create`, {
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
 * Get all bookings (admin only)
 */
export const getBookings = async (token) => {
  const res = await fetch(`${API_BASE}/api/bookings/list`, {
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
  const res = await fetch(`${API_BASE}/api/bookings/approve`, {
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
  const res = await fetch(`${API_BASE}/api/bookings/reject`, {
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
