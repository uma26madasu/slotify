// src/pages/DebugPage.jsx
import { useState, useEffect } from 'react';
import { auth } from '../firebase';

export default function DebugPage() {
  const [domainInfo, setDomainInfo] = useState({});
  
  useEffect(() => {
    const domain = window.location.hostname;
    const fullUrl = window.location.href;
    
    setDomainInfo({
      domain,
      fullUrl,
      firebaseInitialized: auth !== null
    });
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold">Domain Info</h2>
        <p>Current domain: {domainInfo.domain}</p>
        <p>Full URL: {domainInfo.fullUrl}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold">Firebase Status</h2>
        <p>Firebase initialized: {domainInfo.firebaseInitialized ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}