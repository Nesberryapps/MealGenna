
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

type FirebaseServices = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

// This function is the single point of entry for Firebase initialization.
export function initializeFirebase(): FirebaseServices {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  // Check if critical config is present
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase API Key is missing. Skipping initialization.");
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  try {
      if (getApps().length) {
        const app = getApp();
        return {
          firebaseApp: app,
          auth: getAuth(app),
          firestore: getFirestore(app),
        };
      }
      
      const firebaseApp = initializeApp(firebaseConfig);
      return {
        firebaseApp,
        auth: getAuth(firebaseApp),
        firestore: getFirestore(firebaseApp),
      };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return {
        firebaseApp: null,
        auth: null,
        firestore: null,
    };
  }
}
