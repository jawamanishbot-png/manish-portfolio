import admin from 'firebase-admin';
import { getDb } from '../firebase.js';

export const diagnostic = async (req, res) => {
  const results = {};
  
  try {
    // Log 1: Environment variables
    results.env = {
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
      FIREBASE_CONFIG: process.env.FIREBASE_CONFIG,
      NODE_ENV: process.env.NODE_ENV,
      FUNCTION_TARGET: process.env.FUNCTION_TARGET,
    };
    console.log('[DIAGNOSTIC] Environment:', results.env);

    // Log 2: Firebase Admin apps
    results.firebaseApps = admin.apps.length;
    console.log('[DIAGNOSTIC] Firebase Admin apps initialized:', results.firebaseApps);

    // Log 3: Get Firestore instance
    const db = getDb();
    console.log('[DIAGNOSTIC] Firestore instance obtained');
    
    // Log 4: Check app options
    if (db.app && db.app.options) {
      results.appOptions = {
        projectId: db.app.options.projectId,
        databaseId: db.app.options.databaseId,
        apiEndpoint: db._settings?.experimentalForceLongPolling ? 'custom' : 'default',
      };
      console.log('[DIAGNOSTIC] App options:', results.appOptions);
    }

    // Log 5: Try to get settings
    try {
      const settings = db.settings();
      results.settings = JSON.stringify(settings);
      console.log('[DIAGNOSTIC] Firestore settings:', results.settings);
    } catch (e) {
      results.settingsError = e.message;
      console.log('[DIAGNOSTIC] Settings error:', e.message);
    }

    // Log 6: Try to list collections with EXTREMELY detailed logging
    console.log('[DIAGNOSTIC] About to list collections...');
    try {
      const collections = await db.listCollections();
      results.collections = collections.map(c => c.id);
      console.log('[DIAGNOSTIC] Collections found:', results.collections);
    } catch (e) {
      results.collectionsError = {
        message: e.message,
        code: e.code,
        details: e.details,
      };
      console.error('[DIAGNOSTIC] Collections error:', e);
    }

    // Log 7: Try to read existing document
    console.log('[DIAGNOSTIC] About to read test document...');
    try {
      const docRef = db.collection('bookings').doc('test-doc');
      const docSnap = await docRef.get();
      results.docRead = {
        exists: docSnap.exists,
        data: docSnap.data(),
      };
      console.log('[DIAGNOSTIC] Document read successful:', results.docRead);
    } catch (e) {
      results.docReadError = {
        message: e.message,
        code: e.code,
        details: e.details,
      };
      console.error('[DIAGNOSTIC] Document read error:', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Diagnostic data collected',
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('[DIAGNOSTIC] FATAL ERROR:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack.split('\n').slice(0, 10),
      },
      results,
    });
  }
};
