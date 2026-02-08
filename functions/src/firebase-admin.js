import admin from 'firebase-admin';

// Firebase Admin SDK is initialized in index.js before this module is loaded
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
export default admin;
