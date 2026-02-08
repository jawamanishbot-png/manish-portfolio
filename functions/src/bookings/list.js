import admin from 'firebase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAILS || 'jawa.manish@gmail.com';

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

    // Fetch bookings from Cloud Storage
    const storage = admin.storage();
    const bucket = storage.bucket('manish-portfolio-bookings-bookings');
    const [files] = await bucket.getFiles({ prefix: 'bookings/' });

    const bookings = [];
    for (const file of files) {
      try {
        const [data] = await file.download();
        const booking = JSON.parse(data.toString());
        bookings.push(booking);
      } catch (e) {
        console.error(`Error reading ${file.name}:`, e);
      }
    }

    // Sort by created_at descending
    bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing bookings:', error);
    return res.status(500).json({ error: error.message });
  }
};
