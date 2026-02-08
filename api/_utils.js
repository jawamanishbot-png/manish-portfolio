import { db } from './_firebase.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

export const createToken = (userId, email) => {
  return jwt.sign(
    { uid: userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const getAuthUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const adminUserDoc = await db.collection('admin_users').doc(decoded.uid).get();
  if (!adminUserDoc.exists) {
    throw new Error('User is not authorized as admin');
  }

  return decoded;
};

export const sendEmail = async (to, subject, html) => {
  try {
    console.log(`Email to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
};

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

export const getBookingById = async (id) => {
  const doc = await db.collection('bookings').doc(id).get();
  if (!doc.exists) {
    throw new Error('Booking not found');
  }
  return { id: doc.id, ...doc.data() };
};

export const updateBooking = async (id, updates) => {
  await db.collection('bookings').doc(id).update(updates);
  return getBookingById(id);
};

export const handleError = (res, err, statusCode = 400) => {
  console.error('API Error:', err);
  return res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
};
