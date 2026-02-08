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
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);

        // Find booking by stripe_session_id
        const bookingsSnapshot = await db.collection('bookings')
          .where('stripe_session_id', '==', session.id)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingRef = bookingsSnapshot.docs[0].ref;
          
          // Only update if payment was successful
          if (session.payment_status === 'paid') {
            await bookingRef.update({
              payment_status: 'paid',
              status: 'paid', // Show as paid, awaiting admin approval
              stripe_session_id: session.id,
              payment_intent_id: session.payment_intent,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            console.log(`Booking ${bookingsSnapshot.docs[0].id} marked as paid`);
          }
        } else {
          console.warn(`No booking found for session ${session.id}`);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        console.log(`Async payment succeeded for session: ${session.id}`);

        const bookingsSnapshot = await db.collection('bookings')
          .where('stripe_session_id', '==', session.id)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingRef = bookingsSnapshot.docs[0].ref;
          await bookingRef.update({
            payment_status: 'paid',
            status: 'paid',
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        console.log(`Async payment failed for session: ${session.id}`);

        const bookingsSnapshot = await db.collection('bookings')
          .where('stripe_session_id', '==', session.id)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingRef = bookingsSnapshot.docs[0].ref;
          await bookingRef.update({
            payment_status: 'failed',
            payment_error: 'Async payment failed',
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
