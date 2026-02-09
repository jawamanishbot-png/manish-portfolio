import admin from 'firebase-admin';
import { sendBookingNotificationEmail } from '../email.js';

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

    const db = admin.firestore();
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bookingData = {
      id: bookingId,
      email,
      context,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection('bookings').doc(bookingId).set(bookingData);

    console.log(`Booking created: ${bookingId}`);

    // Send notification email to admin (non-blocking)
    sendBookingNotificationEmail(bookingData).catch(error => {
      console.error('Failed to send notification email:', error);
      // Don't fail the booking if email fails
    });

    return res.status(200).json({
      success: true,
      bookingId,
      message: 'Your request has been submitted. Awaiting admin review.',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
