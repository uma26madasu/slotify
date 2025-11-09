// src/pages/GoogleCallback.jsx - COMPLETE WORKING VERSION
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = () => {
      // Parse URL parameters
      const searchParams = new URLSearchParams(location.search);
      
      // Get all possible parameters from backend redirect
      const success = searchParams.get('success');
      const error = searchParams.get('error');
      const message = searchParams.get('message');
      const type = searchParams.get('type');
      const email = searchParams.get('email');
      
      console.log('Callback parameters:', {
        success,
        error,
        message,
        type,
        email
      });

      // Determine outcome and redirect to dashboard
      if (success === 'true' || (!error && message)) {
        // Success case
        const successMessage = message 
          ? decodeURIComponent(message)
          : email 
            ? `Google Calendar connected successfully for ${decodeURIComponent(email)}!`
            : 'Google Calendar connected successfully!';
            
        navigate('/dashboard', {
          state: {
            message: successMessage,
            type: 'success'
          }
        });
      } else if (error) {
        // Error case
        const errorMessage = message 
          ? decodeURIComponent(message)
          : `Connection failed: ${decodeURIComponent(error)}`;
          
        navigate('/dashboard', {
          state: {
            message: errorMessage,
            type: 'error'
          }
        });
      } else {
        // Fallback case - no clear success or error
        navigate('/dashboard', {
          state: {
            message: 'Google Calendar connection completed',
            type: 'info'
          }
        });
      }
    };

    // Small delay to ensure proper rendering
    const timeoutId = setTimeout(handleCallback, 500);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google Calendar connection...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we finalize your connection.</p>
      </div>
    </div>
  );
}