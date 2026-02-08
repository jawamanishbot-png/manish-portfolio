import { db } from '../_firebase.js';
import { getAuthUser, handleError } from '../_utils.js';

/**
 * GET /api/bookings/list
 * Get all bookings (admin only)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin user
    const authUser = await getAuthUser(req);

    // Get all bookings
    const snapshot = await db.collection('bookings')
      .orderBy('created_at', 'desc')
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error('Bookings list error:', err);
    return handleError(res, err, 401);
  }
}
