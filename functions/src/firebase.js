import admin from 'firebase-admin';

// Initialize Firebase Admin SDK on module load
if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp();
  console.log('[Firebase] Admin SDK initialized');
}

export const getDb = () => {
  return admin.firestore();
};

export const getAuth = () => {
  return admin.auth();
};

export default admin;
