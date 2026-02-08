import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDziUnGrhoc0o3FXG5Hxb7GRciLwIHScIc',
  authDomain: 'manish-portfolio-bookings.firebaseapp.com',
  projectId: 'manish-portfolio-bookings',
  storageBucket: 'manish-portfolio-bookings.firebasestorage.app',
  messagingSenderId: '851417415489',
  appId: '1:851417415489:web:a54c985a72fdefbb70ebc0',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
