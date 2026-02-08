import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin SDK FIRST, before importing other modules
try {
  admin.initializeApp();
} catch (error) {
  // Already initialized
  console.log('Firebase Admin already initialized');
}

import { createBooking } from './bookings/create.js';
import { approveBooking } from './bookings/approve.js';
import { rejectBooking } from './bookings/reject.js';
import { listBookings } from './bookings/list.js';
import { handleStripeWebhook } from './webhooks/stripe.js';

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));

// Middleware to handle raw body for Stripe webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());

// Booking Routes
app.post('/api/bookings/create', createBooking);
app.get('/api/bookings/list', listBookings);
app.post('/api/bookings/approve', approveBooking);
app.post('/api/bookings/reject', rejectBooking);

// Webhook Routes
app.post('/api/webhooks/stripe', handleStripeWebhook);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Export the main API function
export const api = functions.https.onRequest(app);
