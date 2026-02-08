import Stripe from 'stripe';
import { db } from '../utils/firebase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing bookingId or paymentIntentId' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    await db.collection('bookings').doc(bookingId).update({
      payment_status: 'succeeded',
      payment_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      bookingId,
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({ error: error.message });
  }
}
