import * as admin from 'firebase-admin';
import * as firebaseSDK from 'firebase/app';
import * as firestore from 'firebase/firestore';

// Initialize Admin SDK for backend use
let adminApp;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
} catch (err) {
  console.error('Warning: Firebase Admin SDK not initialized. Using client SDK for local development.');
}

// Client-side Firebase for local dev (Vercel will need admin SDK)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = firebaseSDK.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

export { admin, db };
export default app;
