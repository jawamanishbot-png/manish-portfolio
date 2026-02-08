import { db, auth } from '../utils/firebase-admin.js';
import { sendRejectionEmail } from '../utils/email.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jawa.manish@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring('Bearer '.length);

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (decodedToken.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();

    try {
      await sendRejectionEmail(booking.email);
    } catch (emailError) {
      console.error('Email send failed, but continuing:', emailError);
    }

    await db.collection('bookings').doc(bookingId).update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: decodedToken.email,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Booking rejected and email sent',
      bookingId,
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({ error: error.message });
  }
}
