import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

let firebaseAdmin: App;

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Missing Firebase configuration. Please check your environment variables.');
  }

  firebaseAdmin = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  firebaseAdmin = getApps()[0];
}

export const adminStorage = getStorage(firebaseAdmin);
export default firebaseAdmin;
