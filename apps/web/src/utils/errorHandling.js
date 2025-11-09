// src/utils/errorHandling.js
export const handleFirebaseAuthError = (error) => {
  const errorMap = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/unauthorized-domain': 'This domain is not authorized for Firebase authentication. Please contact support.',
    'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.'
  };
  
  const message = errorMap[error.code] || error.message || 'An error occurred. Please try again.';
  console.error(`Auth error (${error.code}):`, error.message);
  return message;
};