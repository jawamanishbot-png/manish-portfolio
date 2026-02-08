import admin from 'firebase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAILS || 'jawa.manish@gmail.com';

// Ensure Firebase Admin is initialized on first use
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore('default');
}

function getAuth() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.auth();
}

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

    const snapshot = await db.collection('bookings')
      .orderBy('created_at', 'desc')
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing bookings:', error);
    return res.status(500).json({ error: error.message });
  }
};
