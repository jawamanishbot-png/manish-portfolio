import Stripe from 'stripe';
import { db } from '../_firebase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the raw body for signature verification
  const body = req.body;
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update booking status to "pending" (ready for admin review)
  const bookingsSnapshot = await db
    .collection('bookings')
    .where('stripe_id', '==', paymentIntent.id)
    .get();

  if (!bookingsSnapshot.empty) {
    const booking = bookingsSnapshot.docs[0];
    await booking.ref.update({
      status: 'pending',
      payment_confirmed_at: new Date().toISOString(),
    });
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update booking status to "payment_failed"
  const bookingsSnapshot = await db
    .collection('bookings')
    .where('stripe_id', '==', paymentIntent.id)
    .get();

  if (!bookingsSnapshot.empty) {
    const booking = bookingsSnapshot.docs[0];
    await booking.ref.update({
      status: 'payment_failed',
    });
  }
}
