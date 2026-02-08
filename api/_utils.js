import { admin, db } from './_firebase.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Create a JWT token for admin user
 */
export const createToken = (userId, email) => {
  return jwt.sign(
    { uid: userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Get authenticated user from request
 */
export const getAuthUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  // Verify user is an admin
  const adminUserDoc = await admin.firestore().collection('admin_users').doc(decoded.uid).get();
  if (!adminUserDoc.exists) {
    throw new Error('User is not authorized as admin');
  }

  return decoded;
};

/**
 * Send email (using nodemailer)
 */
export const sendEmail = async (to, subject, html) => {
  try {
    // Implementation depends on email provider setup
    // For now, we'll just log it
    console.log(`Email to ${to}: ${subject}`);
    console.log(html);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
};

/**
 * Create booking record in Firestore
 */
export const createBookingRecord = async (email, context, stripeId) => {
  const booking = {
    email,
    context,
    status: 'pending',
    stripe_id: stripeId,
    created_at: new Date().toISOString(),
    approved_at: null,
    cal_link: null,
  };

  const docRef = await db.collection('bookings').add(booking);
  return { id: docRef.id, ...booking };
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id) => {
  const doc = await db.collection('bookings').doc(id).get();
  if (!doc.exists) {
    throw new Error('Booking not found');
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Update booking status
 */
export const updateBooking = async (id, updates) => {
  await db.collection('bookings').doc(id).update(updates);
  return getBookingById(id);
};

/**
 * Handle API errors consistently
 */
export const handleError = (res, err, statusCode = 400) => {
  console.error('API Error:', err);
  return res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
};
