import { db, auth } from '../utils/firebase-admin.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jawa.manish@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
}
