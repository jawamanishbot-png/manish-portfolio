import Stripe from 'stripe';
import { db } from '../utils/firebase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Update booking with payment confirmation
        const bookingsSnapshot = await db.collection('bookings')
          .where('payment_intent_id', '==', paymentIntent.id)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingRef = bookingsSnapshot.docs[0].ref;
          await bookingRef.update({
            payment_status: 'succeeded',
            payment_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.id}`);

        // Update booking with payment failure
        const bookingsSnapshot = await db.collection('bookings')
          .where('payment_intent_id', '==', paymentIntent.id)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingRef = bookingsSnapshot.docs[0].ref;
          await bookingRef.update({
            payment_status: 'failed',
            payment_error: paymentIntent.last_payment_error?.message || 'Payment failed',
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
