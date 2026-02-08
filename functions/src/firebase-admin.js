import * as admin from 'firebase-admin';

// Firebase Admin SDK is automatically initialized in Cloud Functions runtime
// No need to initialize it again
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
export default admin;
