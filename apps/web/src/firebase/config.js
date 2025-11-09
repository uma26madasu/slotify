import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Prevent duplicate app initialization
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  app = getApp();
}

// Initialize Firebase services (NO GOOGLE OAUTH)
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
export let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

export default app;