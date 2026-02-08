import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In Cloud Functions, this is automatically initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
