// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      if (token && email) {
        // Verify token is still valid by making an API call
        setUser({ email, userId });
        
        // Check Google Calendar connection status
        const API_URL = import.meta.env.VITE_API_URL || window.__ENV__?.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app';
        const response = await axios.get(
          `${API_URL}/api/auth/google/status?email=${encodeURIComponent(email)}`
        );
        
        setIsGoogleConnected(response.data.connected);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid session
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // This is a placeholder - implement your actual login logic
      const API_URL = import.meta.env.VITE_API_URL || window.__ENV__?.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app';
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const loginWithGoogle = () => {
    const API_URL = import.meta.env.VITE_API_URL || window.__ENV__?.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app';
    window.location.href = `${API_URL}/api/auth/google/url`;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setUser(null);
    setIsGoogleConnected(false);
  };

  const updateGoogleConnectionStatus = (connected) => {
    setIsGoogleConnected(connected);
  };

  const value = {
    user,
    loading,
    isGoogleConnected,
    login,
    loginWithGoogle,
    logout,
    checkAuthStatus,
    updateGoogleConnectionStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};