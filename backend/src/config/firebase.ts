import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let serviceAccount: any;

// First try to load from environment variable (Best for Render/Vercel)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env variable");
  }
} 
// Fallback to local file for development
else {
  try {
    const serviceAccountPath = path.resolve(__dirname, '../../serviceAccount.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    } else {
      console.warn("serviceAccount.json not found. Firebase will fail if credentials aren't provided.");
    }
  } catch (error) {
    console.warn("Error reading serviceAccount.json", error);
  }
}

if (!admin.apps.length && serviceAccount) {
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
