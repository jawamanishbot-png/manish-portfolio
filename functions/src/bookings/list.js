import admin from 'firebase-admin';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

export const listBookings = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring('Bearer '.length);

    // Accept both static token and session tokens from Google OAuth
    // Session tokens start with 'session_'
    const isStaticToken = token === ADMIN_TOKEN;
    const isSessionToken = token.startsWith('session_');
    
    if (!isStaticToken && !isSessionToken) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('bookings').orderBy('created_at', 'desc').get();

    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push(doc.data());
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing bookings:', error);
    return res.status(500).json({ error: error.message });
  }
};
