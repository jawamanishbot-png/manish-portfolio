import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In Cloud Functions, this is automatically initialized
try {
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error) {
  console.error('Firebase Admin SDK already initialized:', error.message);
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
