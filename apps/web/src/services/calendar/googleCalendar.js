// src/services/calendar/googleCalendar.js - COMPLETE WORKING VERSION
import axios from 'axios';
import { auth } from '../../firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://procalender-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting Firebase ID token:', error);
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - user may need to re-login');
    }
    return Promise.reject(error);
  }
);

class GoogleCalendarService {
  async initializeGoogleAuth() {
    try {
      console.log('🚀 Initiating Google Calendar connection...');
      
      // Get OAuth URL from backend
      const response = await api.get('/api/auth/google/url');
      
      if (response.data.success && response.data.url) {
        console.log('✅ Redirecting to Google OAuth...');
        // Redirect to Google OAuth
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to get OAuth URL from backend');
      }
    } catch (error) {
      console.error('❌ Error initiating Google auth:', error);
      throw new Error('Failed to start Google Calendar connection. Please try again.');
    }
  }

  async checkConnectionStatus() {
    try {
      const response = await api.get('/api/auth/google/status');
      return {
        connected: response.data.connected || false,
        email: response.data.email || ''
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return { connected: false, email: '' };
    }
  }

  async getEvents(params = {}) {
    try {
      const response = await api.get('/api/calendar/events', { params });
      return response.data.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.data?.reconnect) {
        throw new Error('RECONNECT_REQUIRED');
      }
      throw error;
    }
  }

  async getTodaysMeetings() {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      return await this.getEvents({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      });
    } catch (error) {
      console.error('Error getting today\'s meetings:', error);
      return [];
    }
  }

  async getWeekMeetings() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    try {
      return await this.getEvents({
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString()
      });
    } catch (error) {
      console.error('Error getting week\'s meetings:', error);
      return [];
    }
  }

  async createEvent(eventDetails) {
    try {
      const response = await api.post('/api/calendar/events', eventDetails);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId, updates) {
    try {
      const response = await api.put(`/api/calendar/events/${eventId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      await api.delete(`/api/calendar/events/${eventId}`);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      const response = await api.post('/api/auth/google/disconnect');
      return response.data.success || false;
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      return false;
    }
  }

  async checkConflicts(startTime, endTime) {
    try {
      const response = await api.post('/api/calendar/conflicts', {
        startTime,
        endTime
      });
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  }
}

// Export the service instance
const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;

// Export helper function for other components
export const getGoogleAuthUrl = async () => {
  return googleCalendarService.initializeGoogleAuth();
};