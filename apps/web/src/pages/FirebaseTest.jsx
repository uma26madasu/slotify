import { useState, useEffect } from 'react';
import { auth } from '../firebase';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Loading...');
  const [details, setDetails] = useState({});
  
  useEffect(() => {
    // Check Firebase initialization
    if (auth === null) {
      setStatus('Firebase Auth is null');
    } else {
      setStatus('Firebase initialized');
      setDetails({
        currentUser: auth.currentUser ? 'Logged in' : 'Not logged in',
        authDomain: auth.config.authDomain,
        apiKey: auth.app.options.apiKey ? 'Present' : 'Missing'
      });
    }
  }, []);
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      
      <div className="p-4 bg-blue-50 rounded-lg mb-6">
        <p className="font-semibold">Status: {status}</p>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Details</h2>
        <pre className="bg-white p-3 rounded overflow-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Domain Info</h2>
        <p><strong>Current Domain:</strong> {window.location.hostname}</p>
        <p><strong>Protocol:</strong> {window.location.protocol}</p>
        <p><strong>Full URL:</strong> {window.location.href}</p>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Refresh
      </button>
    </div>
  );
}