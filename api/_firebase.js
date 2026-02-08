import admin from 'firebase-admin';

let db;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } catch (parseErr) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseErr.message);
    }
  }
  
  db = admin.firestore();
} catch (err) {
  console.error('Firebase initialization error:', err.message);
  console.log('Make sure Firebase Admin SDK is properly configured for production');
}

export { admin, db };
export default db;
