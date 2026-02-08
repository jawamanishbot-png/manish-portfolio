import { getDb } from '../firebase.js';

export const testFirestore = async (req, res) => {
  try {
    console.log('=== FIRESTORE TEST START ===');
    
    // Get Firestore instance
    const db = getDb();
    console.log('Firestore instance obtained');

    // Test 1: Check if we can access Firestore metadata
    console.log('Testing Firestore settings...');
    const settings = db.settings();
    console.log('Firestore settings:', settings);

    // Test 2: Try to write a test document
    console.log('Attempting test write...');
    const testRef = db.collection('_firestore_test').doc('test_' + Date.now());
    await testRef.set({
      timestamp: new Date().toISOString(),
      message: 'Test write from Cloud Functions',
      projectId: process.env.GCLOUD_PROJECT || 'unknown',
    });
    console.log('Test write successful');

    // Test 3: Try to read it back
    console.log('Attempting test read...');
    const testDoc = await testRef.get();
    console.log('Test read successful:', testDoc.data());

    // Test 4: Try to write to bookings collection
    console.log('Attempting bookings write...');
    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      id: bookingRef.id,
      test: true,
      timestamp: new Date().toISOString(),
    });
    console.log('Bookings write successful');

    return res.status(200).json({
      success: true,
      message: 'All Firestore tests passed',
      projectId: process.env.GCLOUD_PROJECT,
      firebaseConfig: {
        projectId: db.app.options.projectId || 'not-set',
      },
      tests: {
        firestoreInstance: 'OK',
        testWrite: 'OK',
        testRead: 'OK',
        bookingsWrite: 'OK',
      },
    });
  } catch (error) {
    console.error('=== FIRESTORE TEST ERROR ===');
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack.split('\n'),
      projectId: process.env.GCLOUD_PROJECT,
    });
  }
};
