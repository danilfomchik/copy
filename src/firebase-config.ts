// Firebase web config. These values identify the project and are public by
// design: they are not secrets. Access is enforced by the Cloud Function and
// the Firestore rules (see docs/firebase-setup.md). Replace the placeholders
// with the values from Project settings > General > Your apps.
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

// Region of the `signInWithPin` Cloud Function (see functions/src/index.ts).
export const FUNCTIONS_REGION = 'europe-west1';
