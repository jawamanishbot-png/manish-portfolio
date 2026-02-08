import { db } from '../firebase-admin.js';

export const createBooking = async (req, res) => {
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

    // Create booking record with pending status (no Stripe)
    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      id: bookingRef.id,
      email,
      context,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      bookingId: bookingRef.id,
      message: 'Your request has been submitted. Awaiting admin review.',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
