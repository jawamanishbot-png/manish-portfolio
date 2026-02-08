import { OAuth2Client } from 'google-auth-library';
import { db } from '../_firebase.js';
import { createToken, handleError } from '../_utils.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 * Verify Google token and return JWT for admin access
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user is admin (only manish.jawa.com or hardcoded admins)
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['jawa.manish@gmail.com'];
    
    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({
        error: 'You are not authorized to access the admin dashboard',
      });
    }

    // Store/update admin user in Firestore
    const adminUsersRef = db.collection('admin_users');
    const userDoc = adminUsersRef.doc(googleId);

    await userDoc.set({
      google_id: googleId,
      email,
      name,
      picture,
      last_login: new Date().toISOString(),
    }, { merge: true });

    // Create JWT token
    const jwtToken = createToken(googleId, email);

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: googleId,
        email,
        name,
        picture,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return handleError(res, err, 401);
  }
}
