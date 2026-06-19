/**
 * firebaseAdmin.js
 * Initialises the Firebase Admin SDK once and exports it.
 *
 * Set FIREBASE_PROJECT_ID in .env (and optionally a service-account JSON path).
 * For local dev without a service-account file, Application Default Credentials
 * or just the project ID is enough to verify ID tokens.
 */
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId || projectId === 'REPLACE_WITH_YOUR_PROJECT_ID') {
    console.warn(
      '⚠️  FIREBASE_PROJECT_ID not set in .env – Google sign-in will not work until you add it.'
    );
    // Initialise with a dummy project so the app doesn't crash on startup
    admin.initializeApp({ projectId: 'placeholder' });
  } else {
    // If you have a service-account JSON, set GOOGLE_APPLICATION_CREDENTIALS env var
    // pointing to its path, or pass it explicitly below.
    // For simple token verification, just the projectId is sufficient with ADC.
    admin.initializeApp({ projectId });
  }
}

module.exports = admin;
