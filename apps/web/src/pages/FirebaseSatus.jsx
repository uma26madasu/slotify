import { useState, useEffect } from 'react';
import { auth } from '../firebase';

export default function FirebaseStatus() {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [domainInfo, setDomainInfo] = useState({});
  const [firebaseConfig, setFirebaseConfig] = useState({});
  
  useEffect(() => {
    // Check domain info
    const currentDomain = window.location.hostname;
    const protocol = window.location.protocol;
    const fullURL = window.location.href;
    
    setDomainInfo({
      currentDomain,
      protocol,
      fullURL,
    });
    
    // Check Firebase auth
    if (!auth) {
      setAuthStatus('Firebase Auth not initialized');
      return;
    }
    
    // Get Firebase config info
    try {
      const config = {
        authDomain: auth.config?.authDomain || 'Not available',
        apiKey: auth.app?.options?.apiKey ? 'Present (hidden)' : 'Missing',
        projectId: auth.app?.options?.projectId || 'Not available'
      };
      setFirebaseConfig(config);
      setAuthStatus('Firebase Auth initialized');
    } catch (error) {
      setAuthStatus(`Error checking Firebase: ${error.message}`);
    }
  }, []);
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Firebase Authentication Status</h1>
        
        <div className={`p-4 mb-6 rounded-md ${
          authStatus.includes('initialized') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
        }`}>
          <p className="font-semibold">Auth Status: {authStatus}</p>
        </div>
        
        <div className="p-4 mb-6 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Domain Information</h2>
          <div className="bg-white p-3 rounded-md">
            <p><strong>Current Domain:</strong> {domainInfo.currentDomain}</p>
            <p><strong>Protocol:</strong> {domainInfo.protocol}</p>
            <p><strong>Full URL:</strong> {domainInfo.fullURL}</p>
          </div>
        </div>
        
        <div className="p-4 mb-6 bg-purple-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Firebase Configuration</h2>
          <div className="bg-white p-3 rounded-md">
            <p><strong>Auth Domain:</strong> {firebaseConfig.authDomain}</p>
            <p><strong>API Key:</strong> {firebaseConfig.apiKey}</p>
            <p><strong>Project ID:</strong> {firebaseConfig.projectId}</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Refresh
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}