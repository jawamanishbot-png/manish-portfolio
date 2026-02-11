import Stripe from 'stripe';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

/**
 * Create a Stripe Payment Link for a consultation booking.
 * Admin sets the amount; a one-time payment link is generated
 * and included in the approval email.
 */
export const createPaymentLink = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    const token = authHeader.substring('Bearer '.length);
    if (token !== ADMIN_TOKEN && !token.startsWith('session_')) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const { amount, currency = 'usd', bookingId, attendeeEmail, topic } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a one-time price
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Convert dollars to cents
      currency,
      product_data: {
        name: `Consultation: ${topic || 'Booking Request'}`,
        metadata: {
          bookingId: bookingId || '',
          attendeeEmail: attendeeEmail || '',
        },
      },
    });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        bookingId: bookingId || '',
        attendeeEmail: attendeeEmail || '',
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: process.env.VITE_APP_URL || 'https://manish-portfolio-bookings.web.app',
        },
      },
    });

    return res.status(200).json({
      success: true,
      paymentUrl: paymentLink.url,
      amount,
      currency,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: error.message });
  }
};
