import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Get Firebase config from environment variables
const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__ENV__) {
    return {
      apiKey: window.__ENV__.VITE_FIREBASE_API_KEY,
      authDomain: window.__ENV__.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: window.__ENV__.VITE_FIREBASE_PROJECT_ID,
      storageBucket: window.__ENV__.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.__ENV__.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: window.__ENV__.VITE_FIREBASE_APP_ID,
      measurementId: window.__ENV__.VITE_FIREBASE_MEASUREMENT_ID
    };
  }
  
  if (import.meta && import.meta.env) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
  }
  
  return {
    apiKey: "AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8",
    authDomain: "procalenderfrontend.firebaseapp.com",
    projectId: "procalenderfrontend",
    storageBucket: "procalenderfrontend.firebasestorage.app",
    messagingSenderId: "302768668350",
    appId: "1:302768668350:web:b92f80489662289e28e8ef",
    measurementId: "G-QJWKGJN76S"
  };
};

// Initialize Firebase with error handling
let app;
let auth = null;
let db = null;

try {
  const firebaseConfig = getFirebaseConfig();
  
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration properties');
  }
  
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize services (NO GOOGLE OAUTH)
  auth = getAuth(app);
  db = getFirestore(app);
  
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

// Export only email/password auth functions
export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};