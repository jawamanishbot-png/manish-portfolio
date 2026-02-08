import Stripe from 'stripe';
import { db } from '../_firebase.js';
import { handleError } from '../_utils.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BOOKING_AMOUNT = 10000; // $100 in cents

/**
 * POST /api/bookings/create
 * Create a booking and return Stripe payment intent client secret
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, context } = req.body;

    if (!email || !context) {
      return res.status(400).json({
        error: 'Email and context are required',
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: BOOKING_AMOUNT,
      currency: 'usd',
      description: `Booking request from ${email}`,
      metadata: {
        email,
        context,
      },
    });

    // Create booking record in Firestore (initial status: pending_payment)
    const booking = {
      email,
      context,
      status: 'pending_payment',
      stripe_id: paymentIntent.id,
      created_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      cal_link: null,
    };

    const docRef = await db.collection('bookings').add(booking);

    return res.status(200).json({
      success: true,
      bookingId: docRef.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Booking create error:', err);
    return handleError(res, err);
  }
}
