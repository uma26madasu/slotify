// src/services/calendar/calendar.js
import axios from 'axios';
import { auth } from '../../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://procalender-backend.onrender.com';

class CalendarService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add Firebase auth token to requests
    this.api.interceptors.request.use(async (config) => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });
  }

  // Initialize Google Calendar OAuth flow (redirects to backend)
  async initializeGoogleAuth() {
    try {
      const response = await this.api.get('/api/auth/google/url');
      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to get OAuth URL');
      }
    } catch (error) {
      console.error('Error initializing Google auth:', error);
      throw error;
    }
  }

  // Check if Google Calendar is connected
  async checkConnectionStatus(email) {
    try {
      const response = await this.api.get(`/api/auth/google/status?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return { connected: false };
    }
  }

  // Get calendar events
  async getEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        calendarId: params.calendarId || 'primary',
        timeMin: params.startDate || new Date().toISOString(),
        timeMax: params.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxResults: params.limit || 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const response = await this.api.get(`/api/google-calendar/events?${queryParams}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Get today's meetings
  async getTodaysMeetings() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return this.getEvents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }

  // Get this week's meetings
  async getWeekMeetings() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    return this.getEvents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }

  // Create a new event
  async createEvent(event) {
    try {
      const response = await this.api.post('/api/google-calendar/events', {
        calendarId: 'primary',
        event
      });
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an event
  async updateEvent(eventId, updates) {
    try {
      const response = await this.api.put(`/api/google-calendar/events/${eventId}`, {
        calendarId: 'primary',
        event: updates
      });
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const response = await this.api.delete(`/api/google-calendar/events/${eventId}?calendarId=primary`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Check for conflicts
  async checkConflicts(startTime, endTime) {
    try {
      const response = await this.api.post('/api/google-calendar/check-conflicts', {
        startTime,
        endTime,
        calendarIds: ['primary']
      });
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  }

  // Disconnect Google Calendar
  async disconnect(email) {
    try {
      const response = await this.api.post('/api/auth/google/revoke', { 
        email,
        userId: auth.currentUser?.uid
      });
      return response.data.success;
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      return false;
    }
  }

  // Get available time slots
  async getAvailableSlots(linkId, startDate, endDate) {
    try {
      const response = await this.api.get(`/api/bookings/available-slots/${linkId}`, {
        params: { startDate, endDate }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
}

export default new CalendarService();