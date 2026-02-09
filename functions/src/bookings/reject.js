import admin from 'firebase-admin';
import { sendRejectionEmail } from '../email.js';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

export const rejectBooking = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring('Bearer '.length);

    // Simple token verification (no Firebase)
    if (token !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const db = admin.firestore();
    const docRef = db.collection('bookings').doc(bookingId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = doc.data();

    try {
      await sendRejectionEmail(booking.email);
    } catch (emailError) {
      console.error('Email send failed, but continuing:', emailError);
    }

    await docRef.update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: decodedToken.email,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, message: 'Booking rejected and email sent' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
