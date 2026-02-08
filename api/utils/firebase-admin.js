import * as admin from 'firebase-admin';

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Parse JSON string from env var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    // Ensure private_key has actual newlines (not escaped)
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not set in environment variables');
  }

  if (!serviceAccount || !serviceAccount.project_id) {
    throw new Error('Invalid Firebase service account configuration');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  throw error;
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
