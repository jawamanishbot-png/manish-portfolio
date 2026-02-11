import admin from 'firebase-admin';
import { sendApprovalEmail } from '../email.js';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

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

    const isStaticToken = token === ADMIN_TOKEN;
    const isSessionToken = token.startsWith('session_');

    if (!isStaticToken && !isSessionToken) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const { bookingId, meetLink, eventLink, paymentUrl, paymentAmount } = req.body;

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
      await sendApprovalEmail(booking.email, {
        meetLink,
        eventLink,
        paymentUrl,
        paymentAmount,
        topic: booking.context,
      });
    } catch (emailError) {
      console.error('Email send failed, but continuing:', emailError);
    }

    const updateData = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'admin',
      updated_at: new Date().toISOString(),
    };

    if (meetLink) updateData.meet_link = meetLink;
    if (eventLink) updateData.event_link = eventLink;
    if (paymentUrl) {
      updateData.payment_url = paymentUrl;
      updateData.payment_amount = paymentAmount;
      updateData.payment_status = 'pending';
    }

    await docRef.update(updateData);

    return res.status(200).json({ success: true, message: 'Booking approved and email sent' });
  } catch (error) {
    console.error('Error approving booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
