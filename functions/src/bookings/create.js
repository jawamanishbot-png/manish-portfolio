import admin from 'firebase-admin';

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

    // Use Cloud Storage instead of Firestore
    const storage = admin.storage();
    const bucket = storage.bucket('manish-portfolio-bookings-bookings');
    
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bookingData = {
      id: bookingId,
      email,
      context,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in Cloud Storage
    const file = bucket.file(`bookings/${bookingId}.json`);
    await file.save(JSON.stringify(bookingData, null, 2));

    console.log(`Booking created: ${bookingId}`);

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
