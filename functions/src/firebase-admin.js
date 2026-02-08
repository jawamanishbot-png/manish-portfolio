import admin from 'firebase-admin';

// In Cloud Functions, the Admin SDK initializes automatically
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
