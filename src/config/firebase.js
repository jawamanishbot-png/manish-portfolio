import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDziUnGrhoc0o3FXG5Hxb7GRciLwIHScIc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'manish-portfolio-bookings.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'manish-portfolio-bookings',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'manish-portfolio-bookings.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '851417415489',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:851417415489:web:a54c985a72fdefbb70ebc0',
};

console.log('[Firebase] Initializing with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyExists: !!firebaseConfig.apiKey,
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable auth emulator in development if needed
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (e) {
    // Ignore if already connected
  }
}

export default app;
