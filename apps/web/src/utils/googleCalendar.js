// src/utils/googleCalendar.js - Direct Google API Implementation
import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

class GoogleCalendarService {
  constructor() {
    this.isInitialized = false;
    this.isSignedIn = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initGapi();
    return this.initPromise;
  }

  async _initGapi() {
    try {
      console.log('Initializing Google API...', {
        CLIENT_ID: CLIENT_ID ? 'Set' : 'Missing',
        API_KEY: API_KEY ? 'Set' : 'Missing'
      });

      if (!CLIENT_ID || !API_KEY) {
        throw new Error('Missing Google API credentials');
      }

      // Load gapi
      await new Promise((resolve, reject) => {
        gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject,
          timeout: 5000,
          ontimeout: reject
        });
      });

      // Initialize gapi client
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      });

      console.log('Google API initialized successfully');
      
      // Check if already signed in
      const authInstance = gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance.isSignedIn.get();
      this.isInitialized = true;

      console.log('Initial sign-in status:', this.isSignedIn);

      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      throw error;
    }
  }

  async signIn() {
    try {
      await this.init();
      
      console.log('Attempting to sign in...');
      const authInstance = gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        console.log('Already signed in');
        this.isSignedIn = true;
        return true;
      }

      // Sign in
      await authInstance.signIn();
      this.isSignedIn = authInstance.isSignedIn.get();
      
      console.log('Sign in successful:', this.isSignedIn);
      return this.isSignedIn;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  }

  async signOut() {
    try {
      if (!this.isInitialized) {
        return true;
      }

      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isSignedIn = false;
      
      console.log('Signed out successfully');
      return true;
    } catch (error) {
      console.error('Sign out failed:', error);
      return false;
    }
  }

  getSignedInStatus() {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance.isSignedIn.get();
      return this.isSignedIn;
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  }

  async getEventsInRange(startDate, endDate, maxResults = 50) {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch events');
        return [];
      }

      console.log('Fetching events in range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        maxResults
      });

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      });

      console.log('Raw API response:', response);

      const events = response.result.items || [];
      console.log('Raw events from API:', events);

      const formattedEvents = this.formatEvents(events);
      console.log('Formatted events:', formattedEvents);

      return formattedEvents;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  // Get all events (past and future) for a comprehensive view
  async getAllEvents(daysBack = 90, daysForward = 90, maxResults = 100) {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch events');
        return [];
      }

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysBack); // 90 days ago
      
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + daysForward); // 90 days from now

      console.log('Fetching ALL events (past and future):', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysBack,
        daysForward,
        maxResults
      });

      return await this.getEventsInRange(startDate, endDate, maxResults);
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      return [];
    }
  }

  // Get past events only
  async getPastEvents(daysBack = 90, maxResults = 50) {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch past events');
        return [];
      }

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysBack);
      
      const endDate = new Date(); // Today

      console.log('Fetching past events:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysBack
      });

      return await this.getEventsInRange(startDate, endDate, maxResults);
    } catch (error) {
      console.error('Failed to fetch past events:', error);
      return [];
    }
  }

  async getUpcomingEvents(maxResults = 10) {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch upcoming events');
        return [];
      }

      console.log('Fetching upcoming events, maxResults:', maxResults);

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      });

      console.log('Upcoming events response:', response);

      const events = response.result.items || [];
      return this.formatEvents(events);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  }

  formatEvents(events) {
    if (!events || !Array.isArray(events)) {
      console.warn('Invalid events for formatting:', events);
      return [];
    }

    console.log('Formatting events:', events);

    return events.map(event => {
      const startDate = event.start.dateTime || event.start.date;
      const endDate = event.end.dateTime || event.end.date;
      const isAllDay = !event.start.dateTime;

      const formattedEvent = {
        id: event.id,
        title: event.summary || 'No Title',
        description: event.description || '',
        start: startDate,
        end: endDate,
        location: event.location || '',
        attendees: event.attendees || [],
        status: event.status || 'confirmed',
        type: this.getEventType(event),
        isAllDay: isAllDay,
        time: this.formatEventTime(event),
        organizer: event.organizer || null,
        creator: event.creator || null,
        htmlLink: event.htmlLink || '',
        hangoutLink: event.hangoutLink || '',
        // Additional detailed information
        updated: event.updated,
        created: event.created,
        recurringEventId: event.recurringEventId,
        originalStartTime: event.originalStartTime,
        transparency: event.transparency,
        visibility: event.visibility,
        iCalUID: event.iCalUID,
        sequence: event.sequence,
        guestsCanInviteOthers: event.guestsCanInviteOthers,
        guestsCanModify: event.guestsCanModify,
        guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests,
        privateCopy: event.privateCopy,
        reminders: event.reminders,
        source: event.source,
        attachments: event.attachments || [],
        conferenceData: event.conferenceData,
        // Platform identifier for multi-calendar support
        platform: 'google',
        platformSpecific: {
          googleEventId: event.id,
          googleCalendarId: 'primary',
          etag: event.etag
        }
      };

      console.log('Formatted event:', formattedEvent);
      return formattedEvent;
    });
  }

  // Get single event with full details
  async getEventDetails(eventId, calendarId = 'primary') {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch event details');
        return null;
      }

      console.log('Fetching detailed event:', { eventId, calendarId });

      const response = await gapi.client.calendar.events.get({
        calendarId: calendarId,
        eventId: eventId
      });

      console.log('Detailed event response:', response);

      const event = response.result;
      return this.formatEvents([event])[0];
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      return null;
    }
  }

  // Enhanced event fetching with more details
  async getEventsInRangeDetailed(startDate, endDate, maxResults = 50) {
    try {
      if (!this.getSignedInStatus()) {
        console.log('Not signed in, cannot fetch events');
        return [];
      }

      console.log('Fetching detailed events in range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        maxResults
      });

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime',
        // Request additional fields for detailed information
        fields: 'items(id,summary,description,start,end,location,attendees,status,organizer,creator,htmlLink,hangoutLink,updated,created,recurringEventId,originalStartTime,transparency,visibility,iCalUID,sequence,guestsCanInviteOthers,guestsCanModify,guestsCanSeeOtherGuests,privateCopy,reminders,source,attachments,conferenceData,etag),nextPageToken'
      });

      console.log('Detailed API response:', response);

      const events = response.result.items || [];
      console.log('Detailed raw events from API:', events);

      const formattedEvents = this.formatEvents(events);
      console.log('Detailed formatted events:', formattedEvents);

      return formattedEvents;
    } catch (error) {
      console.error('Failed to fetch detailed events:', error);
      return [];
    }
  }

  formatEventTime(event) {
    if (!event.start.dateTime) {
      return 'All day';
    }

    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    
    const startTime = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const endTime = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startTime} - ${endTime}`;
  }

  getEventType(event) {
    if (event.hangoutLink || (event.location && event.location.includes('meet.google.com'))) {
      return 'video';
    } else if (event.location) {
      return 'in-person';
    } else {
      return 'other';
    }
  }

  async getTodaysEvents() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return await this.getEventsInRange(startOfDay, endOfDay);
  }

  async getThisWeeksEvents() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59);
    
    return await this.getEventsInRange(startOfWeek, endOfWeek);
  }

  // Test function for debugging
  async testAPI() {
    try {
      console.log('=== TESTING GOOGLE CALENDAR API ===');
      
      // Test 1: Check initialization
      console.log('1. Checking initialization...');
      await this.init();
      console.log('Initialization successful');
      
      // Test 2: Check sign-in status
      console.log('2. Checking sign-in status...');
      const signedIn = this.getSignedInStatus();
      console.log('Signed in:', signedIn);
      
      if (!signedIn) {
        console.log('Not signed in, cannot test API calls');
        return false;
      }
      
      // Test 3: Test API call
      console.log('3. Testing API call...');
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 5
      });
      
      console.log('API call successful:', response);
      console.log('Events found:', response.result.items?.length || 0);
      
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }
}

const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;