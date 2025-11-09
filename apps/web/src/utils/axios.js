// src/utils/axios.js
import axios from 'axios';

// Create an axios instance with authentication headers
export const axiosWithAuth = axios.create({
  baseURL: 'https://www.googleapis.com/calendar/v3',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add an interceptor to set the auth token before each request
axiosWithAuth.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('googleCalendarTokens');
  
  if (token) {
    const tokenData = JSON.parse(token);
    config.headers.Authorization = `Bearer ${tokenData.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration
axiosWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token logic would go here
        // For now, redirect to reconnect Google Calendar
        alert('Your Google Calendar session has expired. Please reconnect.');
        window.location.href = '/dashboard';
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosWithAuth;