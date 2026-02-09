import { OAuth2Client } from 'google-auth-library';

const ADMIN_EMAIL = 'jawa.manish@gmail.com';
const GOOGLE_CLIENT_ID = '851417415489-4895qos4rfi6mdkdsb3jfdbdq2fgoqmn.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify Google OAuth token and create admin session
 */
export const verifyGoogle = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    // Verify the token with Google
    let ticket;
    try {
      console.log('Verifying token...');
      console.log('Credential length:', credential.length);
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      console.log('Token verified successfully');
    } catch (error) {
      console.error('Token verification failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error));
      return res.status(401).json({ error: `Invalid token: ${error.message}` });
    }

    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user is authorized admin
    if (email !== ADMIN_EMAIL) {
      return res.status(403).json({
        error: `Access denied. Only ${ADMIN_EMAIL} can access this dashboard.`,
      });
    }

    // Create a simple session token (could be JWT in production)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`Admin login successful: ${email}`);

    return res.status(200).json({
      success: true,
      token: sessionToken,
      email: email,
      name: payload.name,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return res.status(500).json({ error: error.message });
  }
};
