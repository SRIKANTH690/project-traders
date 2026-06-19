/**
 * firebaseAdmin.js
 * Only initialises Firebase Admin if FIREBASE_PROJECT_ID is set.
 * If not set, exports a stub so the app doesn't crash on startup.
 */
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'REPLACE_WITH_YOUR_PROJECT_ID') {
    try {
      admin.initializeApp({ projectId });
      console.log('✅  Firebase Admin initialised');
    } catch (e) {
      console.warn('⚠️  Firebase Admin init failed:', e.message);
    }
  } else {
    // Initialise with a dummy so admin.apps.length > 0 and no crash
    try {
      admin.initializeApp({ projectId: 'placeholder-not-used' });
    } catch (e) {
      // already initialised
    }
    console.warn('ℹ️   Firebase Admin: FIREBASE_PROJECT_ID not set – Google sign-in disabled');
  }
}

module.exports = admin;
