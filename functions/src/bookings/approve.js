import admin from 'firebase-admin';
import { sendApprovalEmail } from '../email.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAILS || 'jawa.manish@gmail.com';

export const approveBooking = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring('Bearer '.length);
    const auth = admin.auth();

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { bookingId, calEventUrl } = req.body;

    if (!bookingId || !calEventUrl) {
      return res.status(400).json({ error: 'Missing bookingId or calEventUrl' });
    }

    try {
      new URL(calEventUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const db = admin.firestore();
    const docRef = db.collection('bookings').doc(bookingId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = doc.data();

    try {
      await sendApprovalEmail(booking.email, calEventUrl);
    } catch (emailError) {
      console.error('Email send failed, but continuing:', emailError);
    }

    await docRef.update({
      status: 'approved',
      cal_event_url: calEventUrl,
      approved_at: new Date().toISOString(),
      approved_by: decodedToken.email,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, message: 'Booking approved and email sent' });
  } catch (error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
