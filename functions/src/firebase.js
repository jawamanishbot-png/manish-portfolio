import admin from 'firebase-admin';

// Initialize Firebase Admin SDK on module load
if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp();
}

export const getDb = () => admin.firestore();
export const getAuth = () => admin.auth();
export default admin;
