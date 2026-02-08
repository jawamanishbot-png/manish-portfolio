// MUST initialize Firebase Admin FIRST
import admin from 'firebase-admin';

// Initialize immediately at module load
if (admin.apps.length === 0) {
  admin.initializeApp();
  console.log('Firebase Admin initialized');
}

// NOW import everything else
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { createBooking } from './bookings/create.js';
import { approveBooking } from './bookings/approve.js';
import { rejectBooking } from './bookings/reject.js';
import { listBookings } from './bookings/list.js';
import { handleStripeWebhook } from './webhooks/stripe.js';
import { testFirestore } from './bookings/test.js';
import { diagnostic } from './bookings/diagnostic.js';
import { verifyGoogle } from './auth/verify-google.js';

const app = express();

app.use(cors({ origin: true }));
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// Auth endpoints
app.post('/api/auth/verify-google', verifyGoogle);

// Booking endpoints
app.post('/api/bookings/create', createBooking);
app.get('/api/bookings/list', listBookings);
app.post('/api/bookings/approve', approveBooking);
app.post('/api/bookings/reject', rejectBooking);

// Webhook endpoints
app.post('/api/webhooks/stripe', handleStripeWebhook);

// Debug endpoints
app.get('/api/test/firestore', testFirestore);
app.get('/api/diagnostic', diagnostic);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export const api = functions.https.onRequest(app);
