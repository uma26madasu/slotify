// src/utils/debugFirebase.js
export function checkDomainAuthorization() {
  const currentDomain = window.location.hostname;
  const protocol = window.location.protocol;
  const fullURL = window.location.href;
  
  console.log('Firebase Authentication Debug Info:');
  console.log('Current Domain:', currentDomain);
  console.log('Protocol:', protocol);
  console.log('Full URL:', fullURL);
  
  // Common Firebase authorized domains
  const commonDomains = [
    'localhost',
    'procalender-frontend.vercel.app',
    'procalender-frontend-knf7ns85g-uma26madasus-projects.vercel.app',
    'procalender-frontend-uma26madasus-projects.vercel.app'
  ];
  
  console.log('Is current domain in common list?', commonDomains.includes(currentDomain));
  
  // Return info that can be displayed to the user
  return {
    currentDomain,
    protocol,
    fullURL,
    isCommonDomain: commonDomains.includes(currentDomain)
  };
}