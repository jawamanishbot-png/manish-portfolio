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
import { verifyGoogle } from './auth/verify-google.js';
import { trackEvent } from './analytics/track.js';
import { analyticsSummary } from './analytics/summary.js';
import { createCalendarEvent } from './calendar/create-event.js';
import { createPaymentLink } from './stripe/create-payment-link.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.post('/api/bookings/create', createBooking);
app.get('/api/bookings/list', listBookings);
app.post('/api/bookings/approve', approveBooking);
app.post('/api/bookings/reject', rejectBooking);
app.post('/api/auth/verify-google', verifyGoogle);
app.post('/api/analytics/track', trackEvent);
app.get('/api/analytics/summary', analyticsSummary);
app.post('/api/calendar/create-event', createCalendarEvent);
app.post('/api/stripe/create-payment-link', createPaymentLink);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export const api = functions.https.onRequest(app);
