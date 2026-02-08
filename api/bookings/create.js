import Stripe from 'stripe';
import { db } from '../utils/firebase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, context } = req.body;

    if (!email || !context) {
      return res.status(400).json({ error: 'Missing email or context' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Consultation with Manish Jawa',
              description: 'Engineering Leadership & Advisory Session',
            },
            unit_amount: 10000, // $100 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/checkout/cancel`,
      customer_email: email,
      metadata: {
        email,
        context,
      },
    });

    // Create booking record with pending status
    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      id: bookingRef.id,
      email,
      context,
      status: 'pending',
      stripe_session_id: session.id,
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      bookingId: bookingRef.id,
      session_id: session.id,
      checkout_url: session.url,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message });
  }
}
