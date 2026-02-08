import admin from 'firebase-admin';

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

    // Update in Cloud Storage
    const storage = admin.storage();
    const bucket = storage.bucket('manish-portfolio-bookings-bookings');
    const file = bucket.file(`bookings/${bookingId}.json`);

    try {
      const [data] = await file.download();
      const booking = JSON.parse(data.toString());
      booking.status = 'rejected';
      booking.rejected_at = new Date().toISOString();
      booking.updated_at = new Date().toISOString();
      
      await file.save(JSON.stringify(booking, null, 2));
      return res.status(200).json({ success: true, message: 'Booking rejected' });
    } catch (error) {
      return res.status(404).json({ error: 'Booking not found' });
    }
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
