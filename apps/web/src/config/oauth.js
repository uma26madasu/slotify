// src/config/oauth.js - COMPLETE FIXED VERSION
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://procalender-backend.onrender.com';

export const oauth = {
  // FIXED: Properly fetch OAuth URL from backend, then redirect to Google
  async loginWithGoogle() {
    try {
      console.log('Starting Google OAuth flow...');
      
      // Fetch the OAuth URL from your backend
      const response = await fetch(`${API_BASE_URL}/api/auth/google/url`);
      
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received OAuth URL from backend:', data);
      
      if (data.success && data.url) {
        console.log('Redirecting to Google OAuth...');
        // Redirect to the actual Google OAuth URL
        window.location.href = data.url;
      } else {
        throw new Error('Backend did not return a valid OAuth URL');
      }
      
    } catch (error) {
      console.error('OAuth error:', error);
      alert(`Failed to start Google OAuth: ${error.message}`);
    }
  },

  // Handle when backend redirects back with token
  async handleCallback(urlParams) {
    try {
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const message = urlParams.get('message');
      
      console.log('Handling OAuth callback:', { token: !!token, error, message });
      
      if (error) {
        return { 
          success: false, 
          error: decodeURIComponent(error) 
        };
      }
      
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('Token stored successfully');
        
        return { 
          success: true, 
          token, 
          returnUrl: '/dashboard',
          message: message ? decodeURIComponent(message) : 'Login successful!'
        };
      }
      
      return { 
        success: false, 
        error: 'No authentication token received' 
      };
      
    } catch (error) {
      console.error('Callback handling error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Get stored authentication token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Basic token validation (you can enhance this)
      return token.length > 0;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      
      // Call backend logout if token exists
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (logoutError) {
          console.warn('Backend logout failed:', logoutError);
          // Continue with local logout even if backend fails
        }
      }
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      
      console.log('Logout successful');
      
      // Redirect to home
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force local logout even if there's an error
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  },

  // Get user profile (if you need this)
  async getProfile() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }
      
      return response.json();
      
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }
};