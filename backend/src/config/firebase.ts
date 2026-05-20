import * as admin from 'firebase-admin';
import path from 'path';

// Path to service account
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccount.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucket
  });
  console.log(`[Firebase] Storage Bucket Configured: ${bucket}`);
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
