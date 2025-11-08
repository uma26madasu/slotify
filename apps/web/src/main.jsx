import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#d00', marginTop: 0 }}>Application Error</h1>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', borderRadius: '4px' }}>
            {this.state.error.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('Application starting...');
console.log('Environment check:', {
  viteApiUrl: import.meta.env.VITE_API_URL ? 'present' : 'missing',
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'present' : 'missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'present' : 'missing'
  }
});

const checkBrowserCompatibility = () => {
  const features = {
    localStorage: !!window.localStorage,
    fetch: !!window.fetch,
    serviceWorker: 'serviceWorker' in navigator
  };

  if (!features.localStorage) console.error('localStorage is not supported');
  if (!features.fetch) console.error('fetch API is not supported');
  
  return Object.values(features).every(Boolean);
};

const checkFirebaseDomain = () => {
  const currentDomain = window.location.hostname;
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'procalenderfrontend.firebaseapp.com',
    'procalender-frontend.vercel.app',
    'procalender-frontend-uma26madasus-projects.vercel.app',
    'procalender-frontend-git-main-uma26madasus-projects.vercel.app',
    'procalender-frontend-comtzqmuw-uma26madasus-projects.vercel.app',
    'procalender-frontend-knr7ns85g-uma26madasus-projects.vercel.app',
    'procalender-frontend-glt-main-uma26madasus-projects.vercel.app',
    'procalender-frontend-gf2tk0lrv-uma26madasus-projects.vercel.app'
  ];

  const isDomainAllowed = allowedDomains.includes(currentDomain);
  console.log(`Domain Check: ${currentDomain}, Allowed: ${isDomainAllowed}`);
  return isDomainAllowed;
};

try {
  if (!checkBrowserCompatibility()) {
    throw new Error('Browser missing required features');
  }

  const isFirebaseDomainValid = checkFirebaseDomain();
  if (!isFirebaseDomainValid) {
    console.warn('Current domain not authorized in Firebase. Check Authentication settings.');
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </ErrorBoundary>
  );
} catch (error) {
  console.error('Fatal initialization error:', error);
  document.getElementById('root').innerHTML = `
    <div style="max-width: 500px; margin: 50px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1)">
      <h1 style="color: #d00; margin-top: 0;">Application Failed to Start</h1>
      <p>${error.message}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto; border-radius: 4px;">${error.stack}</pre>
      <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 20px;">
        Refresh Page
      </button>
    </div>
  `;
}