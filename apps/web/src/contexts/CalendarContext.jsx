// src/contexts/CalendarContext.jsx - COMPLETE WORKING VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import googleCalendarService from '../services/calendar/googleCalendar';

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [calendarEmail, setCalendarEmail] = useState('');
  const [error, setError] = useState(null);

  // Check calendar connection
  const checkCalendarConnection = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setIsConnected(false);
      setCalendarEmail('');
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const status = await googleCalendarService.checkConnectionStatus();
      setIsConnected(status.connected);
      setCalendarEmail(status.email || '');
      
      if (status.connected) {
        await fetchEvents();
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setIsConnected(false);
      setCalendarEmail('');
      setEvents([]);
      setError('Failed to check calendar connection');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!isConnected) return [];
    
    try {
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      const fetchedEvents = await googleCalendarService.getEvents({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        maxResults: 100
      });
      
      setEvents(fetchedEvents);
      setError(null);
      return fetchedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      
      if (error.message === 'RECONNECT_REQUIRED') {
        setIsConnected(false);
        setCalendarEmail('');
        setError('Calendar connection expired. Please reconnect.');
      } else {
        setError('Failed to fetch events');
      }
      
      return [];
    }
  }, [isConnected]);

  // Initialize connection check
  useEffect(() => {
    checkCalendarConnection();
  }, [checkCalendarConnection]);

  // Connect calendar
  const connectCalendar = async () => {
    try {
      setError(null);
      await googleCalendarService.initializeGoogleAuth();
      // Redirect will happen, so we don't need to update state here
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      setError('Failed to connect Google Calendar');
      throw error;
    }
  };

  // Disconnect calendar
  const disconnectCalendar = async () => {
    try {
      setError(null);
      const success = await googleCalendarService.disconnect();
      
      if (success) {
        setIsConnected(false);
        setCalendarEmail('');
        setEvents([]);
      }
      
      return success;
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect Google Calendar');
      throw error;
    }
  };

  // Get today's meetings
  const getTodaysMeetings = useCallback(async () => {
    if (!isConnected) return [];
    
    try {
      return await googleCalendarService.getTodaysMeetings();
    } catch (error) {
      console.error('Error getting today\'s meetings:', error);
      return [];
    }
  }, [isConnected]);

  // Get week's meetings
  const getWeekMeetings = useCallback(async () => {
    if (!isConnected) return [];
    
    try {
      return await googleCalendarService.getWeekMeetings();
    } catch (error) {
      console.error('Error getting week\'s meetings:', error);
      return [];
    }
  }, [isConnected]);

  // Create event
  const createEvent = async (eventDetails) => {
    if (!isConnected) {
      throw new Error('Calendar not connected');
    }
    
    try {
      setError(null);
      const createdEvent = await googleCalendarService.createEvent(eventDetails);
      await fetchEvents(); // Refresh events
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
      throw error;
    }
  };

  // Update event
  const updateEvent = async (eventId, updates) => {
    if (!isConnected) {
      throw new Error('Calendar not connected');
    }
    
    try {
      setError(null);
      const updatedEvent = await googleCalendarService.updateEvent(eventId, updates);
      await fetchEvents(); // Refresh events
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event');
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    if (!isConnected) {
      throw new Error('Calendar not connected');
    }
    
    try {
      setError(null);
      const success = await googleCalendarService.deleteEvent(eventId);
      
      if (success) {
        await fetchEvents(); // Refresh events
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
      return false;
    }
  };

  // Check conflicts
  const checkConflicts = async (startTime, endTime) => {
    if (!isConnected) {
      return { hasConflicts: false, conflicts: [] };
    }
    
    try {
      return await googleCalendarService.checkConflicts(startTime, endTime);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  };

  // Refresh all data
  const refresh = async () => {
    await checkCalendarConnection();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    isConnected,
    loading,
    events,
    calendarEmail,
    error,
    
    // Actions
    connectCalendar,
    disconnectCalendar,
    fetchEvents,
    getTodaysMeetings,
    getWeekMeetings,
    createEvent,
    updateEvent,
    deleteEvent,
    checkConflicts,
    refresh,
    clearError,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};