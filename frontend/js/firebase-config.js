/**
 * firebase-config.js
 * -------------------
 * REPLACE the firebaseConfig values below with your actual
 * Firebase project settings (see README for step-by-step).
 *
 * Get these from:
 *   Firebase Console → Your Project → Project Settings → Your Apps → Web App → SDK snippet
 */

const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
