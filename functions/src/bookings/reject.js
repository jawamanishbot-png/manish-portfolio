import admin from 'firebase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAILS || 'jawa.manish@gmail.com';

// Ensure Firebase Admin is initialized on first use
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

function getAuth() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.auth();
}

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
    const auth = getAuth();
    const db = getDb();

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

    const bookingRef = db.collection('bookings').doc(bookingId);
    await bookingRef.update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, message: 'Booking rejected' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
