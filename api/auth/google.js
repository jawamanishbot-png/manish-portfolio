import { OAuth2Client } from 'google-auth-library';
import { db } from '../_firebase.js';
import { createToken, handleError } from '../_utils.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['jawa.manish@gmail.com'];

    if (!ADMIN_EMAILS.map(e => e.trim()).includes(email)) {
      return res.status(403).json({
        error: 'You are not authorized to access the admin dashboard',
      });
    }

    await db.collection('admin_users').doc(googleId).set({
      google_id: googleId,
      email,
      name,
      picture,
      last_login: new Date().toISOString(),
    }, { merge: true });

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
