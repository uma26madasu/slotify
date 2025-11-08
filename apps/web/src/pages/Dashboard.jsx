// src/pages/Dashboard.jsx - COMPLETE ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, RefreshCw, Link, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import googleCalendarService from '../services/calendar/googleCalendar';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // States
  const [loading, setLoading] = useState(true);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    todayMeetings: 0,
    weekMeetings: 0,
    totalSlots: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [connectedEmail, setConnectedEmail] = useState(null);

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle post-OAuth success
  const handlePostOAuthSuccess = async () => {
    const urlParams = new URLSearchParams(location.search);
    const email = urlParams.get('email');
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    
    if (email && message?.includes('connected successfully')) {
      // Store user email for future API calls
      localStorage.setItem('connectedEmail', email);
      setConnectedEmail(email);
      
      // Update connection status
      setIsCalendarConnected(true);
      
      // Show success notification
      showNotification(`✅ ${decodeURIComponent(message)}`, 'success');
      
      // Immediately fetch events for the connected account
      await fetchEventsWithEmail(email);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (message) {
      showNotification(decodeURIComponent(message), type || 'info');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (location.state?.message) {
      showNotification(location.state.message, location.state.type || 'info');
      window.history.replaceState({}, document.title);
    }
  };

  // Check for URL params messages and handle OAuth success
  useEffect(() => {
    handlePostOAuthSuccess();
  }, [location.search]);

  // Initialize dashboard
  useEffect(() => {
    if (currentUser) {
      checkCalendarConnection();
    } else {
      setLoading(false);
      setIsCalendarConnected(false);
    }
  }, [currentUser]);

  // Check calendar connection status
  const checkCalendarConnection = async () => {
    setLoading(true);
    try {
      // First check if we have stored email
      const storedEmail = localStorage.getItem('connectedEmail');
      if (storedEmail) {
        setConnectedEmail(storedEmail);
        
        // Verify connection with backend
        const response = await fetch(`https://procalender-backend.onrender.com/api/auth/google/status?email=${encodeURIComponent(storedEmail)}`);
        const data = await response.json();
        
        if (data.connected) {
          setIsCalendarConnected(true);
          await fetchEventsWithEmail(storedEmail);
        } else {
          // Clear invalid stored email
          localStorage.removeItem('connectedEmail');
          setConnectedEmail(null);
          setIsCalendarConnected(false);
        }
      } else {
        // Fallback to service check
        const status = await googleCalendarService.checkConnectionStatus();
        setIsCalendarConnected(status.connected);
        
        if (status.connected) {
          await fetchAndSetEvents();
        } else {
          setEvents([]);
          setStats({ todayMeetings: 0, weekMeetings: 0, totalSlots: 0 });
        }
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setIsCalendarConnected(false);
      setEvents([]);
      showNotification('Failed to check calendar connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced event fetching with specific email
  const fetchEventsWithEmail = async (userEmail = null) => {
    setRefreshing(true);
    try {
      const email = userEmail || connectedEmail || localStorage.getItem('connectedEmail') || currentUser?.email;
      
      if (!email) {
        throw new Error('No email available for calendar sync');
      }

      // Get events for the next year with email parameter
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      // Try direct API call first
      const response = await fetch(`https://procalender-backend.onrender.com/api/calendar/events?email=${encodeURIComponent(email)}&startDate=${start.toISOString()}&endDate=${end.toISOString()}&maxResults=100`, {
        headers: {
          'Authorization': `Bearer ${email}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.events) {
        setEvents(data.events);
        updateStats(data.events);
        console.log(`✅ Fetched ${data.events.length} events for ${email}`);
      } else {
        // Fallback to service method
        const fetchedEvents = await googleCalendarService.getEvents({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          maxResults: 100,
          email: email
        });
        
        setEvents(fetchedEvents);
        updateStats(fetchedEvents);
      }

    } catch (error) {
      console.error('Error fetching events:', error);
      
      if (error.message === 'RECONNECT_REQUIRED' || error.message.includes('unauthorized')) {
        showNotification('Google Calendar connection expired. Please reconnect.', 'error');
        setIsCalendarConnected(false);
        localStorage.removeItem('connectedEmail');
        setConnectedEmail(null);
      } else {
        showNotification('Failed to fetch events: ' + error.message, 'error');
      }
      
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch events and update stats (fallback method)
  const fetchAndSetEvents = async () => {
    setRefreshing(true);
    try {
      // Get events for the next year
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      const fetchedEvents = await googleCalendarService.getEvents({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        maxResults: 100
      });

      setEvents(fetchedEvents);
      updateStats(fetchedEvents);

    } catch (error) {
      console.error('Error fetching events:', error);
      
      if (error.message === 'RECONNECT_REQUIRED') {
        showNotification('Google Calendar connection expired. Please reconnect.', 'error');
        setIsCalendarConnected(false);
      } else {
        showNotification('Failed to fetch events', 'error');
      }
      
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Update statistics based on events
  const updateStats = (eventsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const todayMeetings = eventsList.filter(event => {
      const eventStart = new Date(event.start?.dateTime || event.start?.date);
      return eventStart >= today && eventStart <= endOfDay;
    }).length;

    const weekMeetings = eventsList.filter(event => {
      const eventStart = new Date(event.start?.dateTime || event.start?.date);
      return eventStart >= startOfWeek && eventStart <= endOfWeek;
    }).length;

    setStats({
      todayMeetings,
      weekMeetings,
      totalSlots: eventsList.length // Total events as available slots
    });
  };

  // Connect Google Calendar - ENHANCED VERSION
  const handleConnectCalendar = async () => {
    try {
      setLoading(true);
      showNotification('Connecting to Google Calendar...', 'info');
      
      // Get Firebase auth token
      const currentUser = useAuth().currentUser;
      let authHeaders = {
        'Content-Type': 'application/json'
      };
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          authHeaders.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error('Error getting Firebase ID token:', error);
        }
      }
      
      // Direct backend call
      const response = await fetch('https://procalender-backend.onrender.com/api/auth/google/url', {
        method: 'GET',
        headers: authHeaders,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        console.log('✅ Redirecting to Google OAuth...');
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get OAuth URL from backend');
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      showNotification('Failed to connect Google Calendar. Please try again.', 'error');
      setLoading(false);
    }
  };

  // Disconnect Google Calendar
  const handleDisconnectCalendar = async () => {
    try {
      setLoading(true);
      
      // Clear local storage
      localStorage.removeItem('connectedEmail');
      setConnectedEmail(null);
      
      // Try service disconnect
      const success = await googleCalendarService.disconnect();
      
      // Also try direct API call if we have email
      if (connectedEmail) {
        try {
          await fetch(`https://procalender-backend.onrender.com/api/auth/google/disconnect?email=${encodeURIComponent(connectedEmail)}`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('Error with direct disconnect:', error);
        }
      }
      
      setIsCalendarConnected(false);
      setEvents([]);
      setStats({ todayMeetings: 0, weekMeetings: 0, totalSlots: 0 });
      showNotification('Google Calendar disconnected successfully', 'success');
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      showNotification('An error occurred during disconnection', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh events
  const handleRefreshEvents = () => {
    if (connectedEmail || localStorage.getItem('connectedEmail')) {
      fetchEventsWithEmail();
    } else {
      fetchAndSetEvents();
    }
  };

  // Format helper functions
  const formatEventDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Debug function for testing (available in browser console)
  React.useEffect(() => {
    window.testCalendarConnection = async () => {
      const email = connectedEmail || localStorage.getItem('connectedEmail') || 'umamadasu@gmail.com';
      
      try {
        console.log(`🧪 Testing connection for: ${email}`);
        
        // Test auth status
        const authResponse = await fetch(`https://procalender-backend.onrender.com/api/auth/google/status?email=${encodeURIComponent(email)}`);
        const authData = await authResponse.json();
        console.log('🔐 Auth Status:', authData);
        
        // Test events fetch
        const eventsResponse = await fetch(`https://procalender-backend.onrender.com/api/calendar/events?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${email}`,
            'Content-Type': 'application/json'
          }
        });
        const eventsData = await eventsResponse.json();
        console.log('📅 Events Data:', eventsData);
        
        return { auth: authData, events: eventsData };
      } catch (error) {
        console.error('❌ Test failed:', error);
        return { error: error.message };
      }
    };

    // Make current state available for debugging
    window.dashboardState = {
      loading,
      isCalendarConnected,
      connectedEmail,
      eventsCount: events.length,
      stats
    };
  }, [loading, isCalendarConnected, connectedEmail, events.length, stats]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Dashboard</h2>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Connection Status Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-indigo-600" />
            Google Calendar Connection
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-lg font-medium flex items-center ${
                isCalendarConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Checking status...
                  </>
                ) : isCalendarConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" /> Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" /> Not Connected
                  </>
                )}
              </span>
              {connectedEmail && (
                <p className="text-sm text-gray-600 mt-1">
                  📧 {connectedEmail}
                </p>
              )}
            </div>
            <div>
              {isCalendarConnected ? (
                <button
                  onClick={handleDisconnectCalendar}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150"
                  disabled={loading || refreshing}
                >
                  Disconnect Calendar
                </button>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
                  disabled={loading || refreshing}
                >
                  Connect Calendar
                </button>
              )}
            </div>
          </div>
          {isCalendarConnected && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Your calendar is connected! Events are shown below.</p>
              <button
                onClick={handleRefreshEvents}
                className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 flex items-center"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> 
                Refresh Events
              </button>
            </div>
          )}
        </div>

        {/* Meeting Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-blue-800">Today's Meetings</h4>
            <p className="text-3xl font-bold text-blue-600">{stats.todayMeetings}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-green-800">This Week's Meetings</h4>
            <p className="text-3xl font-bold text-green-600">{stats.weekMeetings}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-yellow-800">Total Events</h4>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalSlots}</p>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-indigo-600" /> 
            Upcoming Calendar Events
            {events.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {events.length} events
              </span>
            )}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-600 text-center p-8">
              {isCalendarConnected ? 'No upcoming events found.' : 'Connect your calendar to see events.'}
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {event.summary || 'No Title'}
                      </h4>
                      {event.location && (
                        <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                      )}
                      <div className="mt-2 text-gray-600">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatEventDate(event.start?.dateTime || event.start?.date)}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {formatEventTime(event.start?.dateTime || event.start?.date)} - 
                            {formatEventTime(event.end?.dateTime || event.end?.date)}
                          </span>
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{event.attendees.length} attendee(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-600 hover:text-blue-700"
                        title="Open in Google Calendar"
                      >
                        <Link className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <details>
              <summary className="cursor-pointer text-gray-600">Debug Info (Dev Only)</summary>
              <pre className="mt-2 text-gray-500">
                {JSON.stringify({
                  loading,
                  isCalendarConnected,
                  connectedEmail,
                  eventsCount: events.length,
                  stats,
                  hasStoredEmail: !!localStorage.getItem('connectedEmail')
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;