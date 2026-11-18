// Firebase web config. These values identify the project and are public by
// design: they are not secrets. Access is enforced by the Cloud Function and
// the Firestore rules (see docs/firebase-setup.md). Replace the values with
// those from Project settings > General > Your apps. Web config values are
// public by design, so they are committed (access is enforced by the rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyARF-LjO1ayF4D8IYpDPNgPSXeRJqtf7KU',
  authDomain: 'copy-6dadd.firebaseapp.com',
  projectId: 'copy-6dadd',
  storageBucket: 'copy-6dadd.firebasestorage.app',
  messagingSenderId: '59591060156',
  appId: '1:59591060156:web:8b8cc1c2796449cabc3eb9',
};

// Region of the `signInWithPin` Cloud Function (see functions/src/index.ts).
export const FUNCTIONS_REGION = 'europe-west1';
