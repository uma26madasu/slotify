import React, { useState, useEffect } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState([]);

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://procalender-backend.onrender.com';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback';

  // Add debug message
  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Wake up backend on component mount
  useEffect(() => {
    wakeUpBackend();
  }, []);

  // Check for auth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      addDebug('🔑 OAuth code received, processing...');
      handleAuthCallback(code);
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('procalendar_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        addDebug(`👤 Found saved user: ${userData.name || userData.email}`);
        // Load calendar events if user is logged in
        fetchCalendarEvents(userData);
      } catch (error) {
        addDebug('❌ Error parsing saved user data');
        localStorage.removeItem('procalendar_user');
      }
    }
  }, []);

  // Wake up the backend (Render free tier sleeps after 15 minutes)
  const wakeUpBackend = async () => {
    addDebug('🔄 Checking backend status...');
    setBackendStatus('waking');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Try the root endpoint first (as shown in your backend response)
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'Success') {
          setBackendStatus('online');
          addDebug(`✅ Backend online: ${data.message}`);
        } else {
          setBackendStatus('online');
          addDebug('✅ Backend is responding');
        }
      } else {
        setBackendStatus('error');
        addDebug(`⚠️ Backend responded but with error: ${response.status}`);
        // Still try alternative endpoints
        await tryAlternativeEndpoints();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        addDebug('⏱️ Backend wake-up timeout, trying alternatives...');
        setBackendStatus('timeout');
        await tryAlternativeEndpoints();
      } else {
        addDebug(`❌ Backend connection error: ${error.message}`);
        await tryAlternativeEndpoints();
      }
    }
  };

  // Try alternative endpoints to wake up backend
  const tryAlternativeEndpoints = async () => {
    const endpoints = ['/', '/api/status', '/health', '/api/health'];
    
    for (const endpoint of endpoints) {
      try {
        addDebug(`🔄 Trying ${API_BASE_URL}${endpoint}...`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            if (data.status === 'Success' || data.message) {
              setBackendStatus('online');
              addDebug(`✅ Backend online via ${endpoint}: ${data.message || 'API ready'}`);
              return;
            }
          } catch {
            // Not JSON, but response was OK
            setBackendStatus('online');
            addDebug(`✅ Backend responding via ${endpoint}`);
            return;
          }
        }
      } catch (error) {
        addDebug(`❌ ${endpoint} failed: ${error.message}`);
        continue;
      }
    }
    
    addDebug('😴 All endpoints failed. Backend may be starting up...');
    setBackendStatus('error');
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      addDebug('❌ Google Client ID not configured');
      alert('Google Client ID not configured. Please check your environment variables.');
      return;
    }

    if (backendStatus !== 'online') {
      addDebug('⚠️ Backend not ready, attempting to wake up first...');
      wakeUpBackend();
      setTimeout(() => {
        if (backendStatus === 'online') {
          handleGoogleLogin();
        } else {
          alert('⚠️ Backend is starting up. Please wait a moment and try again.');
        }
      }, 3000);
      return;
    }

    addDebug('🔄 Starting Google OAuth flow...');
    setIsLoadingAuth(true);
    
    const scope = [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    addDebug('↗️ Redirecting to Google OAuth...');
    window.location.href = authUrl;
  };

  // Handle auth callback - send code to backend
  const handleAuthCallback = async (code) => {
    setIsLoadingAuth(true);
    addDebug('🔄 Processing OAuth callback with backend...');
    
    try {
      // Ensure backend is awake before processing
      if (backendStatus !== 'online') {
        addDebug('🔄 Ensuring backend is ready for OAuth...');
        await wakeUpBackend();
        // Give it a moment to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Try multiple auth endpoints
      const authEndpoints = [
        '/auth/google/callback',
        '/api/auth/google/callback', 
        '/api/auth/callback',
        '/google/callback'
      ];
      
      let authSuccess = false;
      let userData = null;
      
      for (const endpoint of authEndpoints) {
        try {
          addDebug(`🔄 Trying auth endpoint: ${endpoint}`);
          
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              code: code,
              redirect_uri: REDIRECT_URI
            }),
          });

          if (response.ok) {
            userData = await response.json();
            addDebug(`✅ Auth successful via ${endpoint}: ${userData.name || userData.email}`);
            authSuccess = true;
            break;
          } else {
            const errorText = await response.text();
            addDebug(`❌ Auth failed via ${endpoint}: ${response.status} - ${errorText}`);
          }
        } catch (endpointError) {
          addDebug(`❌ ${endpoint} error: ${endpointError.message}`);
          continue;
        }
      }

      if (!authSuccess) {
        throw new Error('All auth endpoints failed. Please check backend configuration.');
      }
      
      setUser(userData);
      localStorage.setItem('procalendar_user', JSON.stringify(userData));
      setCurrentPage('dashboard');
      
      // Fetch calendar events immediately
      await fetchCalendarEvents(userData);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } catch (error) {
      addDebug(`❌ OAuth processing failed: ${error.message}`);
      alert(`❌ Authentication failed: ${error.message}\n\nTip: Your backend is online but may need auth endpoint configuration.`);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Fetch calendar events from backend
  const fetchCalendarEvents = async (userData) => {
    setIsLoadingEvents(true);
    addDebug('🔄 Fetching calendar events from backend...');
    
    try {
      // Ensure backend is ready
      if (backendStatus !== 'online') {
        addDebug('🔄 Ensuring backend is awake...');
        await wakeUpBackend();
      }
      
      // Try multiple calendar endpoints
      const calendarEndpoints = [
        '/api/calendar/events',
        '/calendar/events',
        '/api/events',
        '/events',
        '/api/calendar'
      ];
      
      let eventsLoaded = false;
      let events = [];
      
      for (const endpoint of calendarEndpoints) {
        try {
          addDebug(`🔄 Trying calendar endpoint: ${endpoint}`);
          
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userData.accessToken || userData.token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
          });

          if (response.ok) {
            const data = await response.json();
            events = data.events || data.items || data || [];
            addDebug(`✅ Loaded ${events.length} events via ${endpoint}`);
            eventsLoaded = true;
            break;
          } else {
            addDebug(`❌ ${endpoint} failed: ${response.status}`);
          }
        } catch (endpointError) {
          addDebug(`❌ ${endpoint} error: ${endpointError.message}`);
          continue;
        }
      }

      if (!eventsLoaded) {
        throw new Error('All calendar endpoints failed');
      }
      
      setCalendarEvents(events);
      
    } catch (error) {
      addDebug(`❌ Backend calendar fetch failed: ${error.message}`);
      
      // Try direct Google Calendar API as last resort
      if (userData.accessToken && userData.accessToken.startsWith('ya29.')) {
        addDebug('🔄 Trying direct Google Calendar API...');
        await fetchCalendarEventsDirect(userData.accessToken);
      } else {
        addDebug('❌ No valid access token for direct API call');
        addDebug('💡 Tip: Backend is online but calendar endpoints may need configuration');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Direct Google Calendar API call (fallback only)
  const fetchCalendarEventsDirect = async (accessToken) => {
    try {
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin}&` +
        `timeMax=${timeMax}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API failed: ${response.status}`);
      }

      const data = await response.json();
      setCalendarEvents(data.items || []);
      addDebug(`✅ Loaded ${data.items?.length || 0} events from direct Google API`);
      
    } catch (error) {
      addDebug(`❌ Direct Google Calendar API failed: ${error.message}`);
      throw error;
    }
  };

  // Refresh calendar events
  const refreshEvents = () => {
    if (user) {
      addDebug('🔄 Refreshing calendar events...');
      fetchCalendarEvents(user);
    }
  };

  // Force wake backend
  const forceWakeBackend = () => {
    addDebug('🔄 Force waking backend...');
    wakeUpBackend();
  };

  // Handle logout
  const handleLogout = () => {
    addDebug('👋 User logged out');
    setUser(null);
    setCalendarEvents([]);
    localStorage.removeItem('procalendar_user');
    setCurrentPage('dashboard');
  };

  // Format date for display
  const formatEventTime = (event) => {
    const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
    const end = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date);
    
    if (event.start?.date) {
      return 'All day';
    }
    
    return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      const eventDate = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
      return eventDate.getDate() === date && eventDate.getMonth() === new Date().getMonth();
    });
  };

  // Backend status indicator
  const BackendStatus = () => {
    const statusColors = {
      checking: '#ffc107',
      waking: '#17a2b8', 
      online: '#28a745',
      sleeping: '#6c757d',
      timeout: '#fd7e14',
      offline: '#dc3545',
      error: '#dc3545'
    };

    const statusMessages = {
      checking: '🔄 Checking backend...',
      waking: '⏰ Waking up backend...',
      online: '✅ Backend online',
      sleeping: '😴 Backend sleeping',
      timeout: '⏱️ Backend timeout',
      offline: '❌ Backend offline',
      error: '⚠️ Backend error'
    };

    return (
      <div style={{
        padding: '10px 15px',
        backgroundColor: statusColors[backendStatus],
        color: 'white',
        borderRadius: '5px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>{statusMessages[backendStatus]}</span>
        {(backendStatus === 'sleeping' || backendStatus === 'offline') && (
          <button 
            onClick={forceWakeBackend}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Wake Up
          </button>
        )}
      </div>
    );
  };

  // Event detail modal
  const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
    const end = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }} onClick={onClose}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{event.summary || 'Untitled Event'}</h2>
            <button onClick={onClose} style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer' 
            }}>×</button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>📅 Date:</strong> {start.toLocaleDateString()}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>🕐 Time:</strong> {formatEventTime(event)}
          </div>

          {event.location && (
            <div style={{ marginBottom: '15px' }}>
              <strong>📍 Location:</strong> {event.location}
            </div>
          )}

          {event.description && (
            <div style={{ marginBottom: '15px' }}>
              <strong>📝 Description:</strong>
              <div style={{ 
                marginTop: '5px', 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '5px',
                whiteSpace: 'pre-wrap'
              }}>
                {event.description}
              </div>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <strong>👥 Attendees ({event.attendees.length}):</strong>
              <div style={{ marginTop: '10px' }}>
                {event.attendees.map((attendee, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px'
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: attendee.responseStatus === 'accepted' ? '#28a745' : 
                                    attendee.responseStatus === 'declined' ? '#dc3545' : '#ffc107',
                      marginRight: '8px'
                    }}></span>
                    <span>{attendee.displayName || attendee.email}</span>
                    {attendee.organizer && <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '12px', 
                      color: '#666',
                      backgroundColor: '#e9ecef',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>Organizer</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.conferenceData?.entryPoints && (
            <div style={{ marginBottom: '15px' }}>
              <strong>💻 Meeting Links:</strong>
              <div style={{ marginTop: '10px' }}>
                {event.conferenceData.entryPoints.map((entry, index) => (
                  <a 
                    key={index}
                    href={entry.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '5px',
                      marginRight: '10px',
                      marginBottom: '5px'
                    }}
                  >
                    🔗 {entry.entryPointType === 'video' ? 'Join Video Call' : 'Join Meeting'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {event.htmlLink && (
            <div style={{ marginTop: '20px' }}>
              <a 
                href={event.htmlLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'none'
                }}
              >
                📅 View in Google Calendar →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug panel
  const DebugPanel = () => (
    <details style={{ marginTop: '20px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 Debug Log</summary>
      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        fontSize: '12px',
        maxHeight: '200px',
        overflowY: 'auto',
        fontFamily: 'monospace'
      }}>
        {debugInfo.map((info, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>{info}</div>
        ))}
      </div>
    </details>
  );

  // Simple page navigation
  const renderPage = () => {
    if (isLoadingAuth) {
      return (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <h2>Connecting to Google...</h2>
          <p>Please wait while we set up your account.</p>
          <BackendStatus />
        </div>
      );
    }

    switch(currentPage) {
      case 'login':
        if (user) {
          return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>👋 Welcome back, {user.name}!</h1>
              <div style={{ 
                maxWidth: '400px', 
                margin: '20px auto',
                padding: '30px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    marginBottom: '20px'
                  }}
                />
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Status:</strong> ✅ Google Calendar Connected</p>
                <p><strong>Events Loaded:</strong> {calendarEvents.length} events this month</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <BackendStatus />
                </div>
                
                <button 
                  onClick={refreshEvents}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                  disabled={isLoadingEvents}
                >
                  {isLoadingEvents ? '🔄 Refreshing...' : '🔄 Refresh Calendar'}
                </button>
                
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  🚪 Sign Out
                </button>

                <DebugPanel />
              </div>
            </div>
          );
        }

        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🔑 Login to ProCalendar</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>
              Connect your Google account to access your calendar and schedule meetings
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <BackendStatus />
            </div>
            
            <div style={{ 
              maxWidth: '400px', 
              margin: '20px auto',
              padding: '30px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <button 
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: backendStatus === 'online' ? '#4285f4' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: backendStatus === 'online' ? 'pointer' : 'not-allowed',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={handleGoogleLogin}
                disabled={!GOOGLE_CLIENT_ID || backendStatus !== 'online'}
              >
                🔐 Continue with Google
              </button>
              
              {backendStatus !== 'online' && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                  ⚠️ Please wait for backend to wake up before logging in
                </p>
              )}
              
              {!GOOGLE_CLIENT_ID && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                  ⚠️ Google OAuth not configured
                </p>
              )}
            </div>

            <DebugPanel />
          </div>
        );
      
      case 'calendar':
        return (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1>📅 Calendar View</h1>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={refreshEvents}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '15px'
                    }}
                    disabled={isLoadingEvents}
                  >
                    {isLoadingEvents ? '🔄' : '🔄 Refresh'}
                  </button>
                  <img 
                    src={user.picture} 
                    alt="Profile" 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      marginRight: '10px'
                    }}
                  />
                  <span>{user.name}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <BackendStatus />
            </div>
            
            {!user && (
              <div style={{ 
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                ⚠️ Please <button 
                  onClick={() => setCurrentPage('login')}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#007bff', 
                    textDecoration: 'underline',
                    cursor: 'pointer' 
                  }}
                >
                  sign in
                </button> to access your Google Calendar
              </div>
            )}

            {user && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ 
                  backgroundColor: calendarEvents.length > 0 ? '#d4edda' : '#fff3cd',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  📊 {calendarEvents.length} events loaded for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '2px',
              marginTop: '30px',
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px'
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ 
                  padding: '15px', 
                  backgroundColor: '#007bff', 
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  borderRadius: '5px'
                }}>
                  {day}
                </div>
              ))}
              {Array.from({length: 35}, (_, i) => {
                const date = i + 1;
                const dayEvents = user ? getEventsForDate(date) : [];
                
                return (
                  <div key={i} style={{ 
                    padding: '8px', 
                    backgroundColor: 'white',
                    minHeight: '100px',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    position: 'relative',
                    cursor: dayEvents.length > 0 ? 'pointer' : 'default'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '5px',
                      color: date <= 31 ? '#333' : '#ccc'
                    }}>
                      {date <= 31 ? date : ''}
                    </div>
                    
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div 
                        key={eventIndex} 
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          marginBottom: '2px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => setSelectedEvent(event)}
                        title={event.summary}
                      >
                        {event.summary || 'Untitled'}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div style={{
                        fontSize: '10px',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <EventModal 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />

            <DebugPanel />
          </div>
        );
      
      default: // dashboard
        return (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '2.5em', margin: 0 }}>
                📅 ProCalendar Dashboard
              </h1>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={user.picture} 
                    alt="Profile" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      marginRight: '10px'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {calendarEvents.length} events loaded ✅
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <BackendStatus />
            </div>
            
            <p style={{ fontSize: '1.2em', marginBottom: '40px', color: '#666' }}>
              Welcome to your professional calendar management system!
            </p>
            
            {!user && (
              <div style={{ 
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '30px'
              }}>
                🎯 <strong>Get Started:</strong> <button 
                  onClick={() => setCurrentPage('login')}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#007bff', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Connect your Google account
                </button> to access your calendar and start scheduling!
              </div>
            )}

            {user && calendarEvents.length > 0 && (
              <div style={{ 
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <h3>🗓️ Upcoming Events</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {calendarEvents
                    .filter(event => new Date(event.start?.dateTime || event.start?.date) >= new Date())
                    .slice(0, 5)
                    .map((event, index) => (
                    <div 
                      key={index} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        border: '1px solid #dee2e6'
                      }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{event.summary || 'Untitled Event'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {formatEventTime(event)} • {new Date(event.start?.dateTime || event.start?.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#007bff' }}>View Details →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }}>
              <div style={{
                padding: '30px',
                backgroundColor: user ? '#007bff' : '#6c757d',
                color: 'white',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                opacity: user ? 1 : 0.7
              }}
              onClick={() => setCurrentPage('calendar')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>📅 Calendar</h3>
                <p style={{ margin: 0 }}>
                  {user ? `View ${calendarEvents.length} events` : 'Connect Google to view calendar'}
                </p>
              </div>
              
              <div style={{
                padding: '30px',
                backgroundColor: user ? '#28a745' : '#17a2b8',
                color: 'white',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => setCurrentPage('login')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>
                  {user ? '👤 Account' : '🔑 Login'}
                </h3>
                <p style={{ margin: 0 }}>
                  {user ? 'Manage your account settings' : 'Connect your Google account'}
                </p>
              </div>
              
              <div style={{
                padding: '30px',
                backgroundColor: '#17a2b8',
                color: 'white',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={user ? refreshEvents : forceWakeBackend}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5em' }}>🔄 Sync</h3>
                <p style={{ margin: 0 }}>
                  {user ? 'Refresh calendar data' : 'Wake up backend'}
                </p>
              </div>
            </div>

            <EventModal 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />

            <DebugPanel />
          </div>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation Header */}
      <nav style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '15px 30px',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentPage('dashboard')}
            style={{ 
              background: 'none',
              border: 'none',
              color: 'white', 
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📅 ProCalendar
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              style={{
                background: currentPage === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                margin: '0 5px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              🏠 Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('calendar')}
              style={{
                background: currentPage === 'calendar' ? 'rgba(255,255,255,0.2)' : 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                margin: '0 5px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              📅 Calendar
            </button>
            <button 
              onClick={() => setCurrentPage('login')}
              style={{
                background: currentPage === 'login' ? 'rgba(255,255,255,0.2)' : 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                margin: '0 5px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              {user ? '👤 Account' : '🔑 Login'}
            </button>
            
            {user && (
              <img 
                src={user.picture} 
                alt="Profile" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  marginLeft: '10px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              />
            )}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div style={{ 
        background: 'white', 
        margin: '20px', 
        borderRadius: '15px',
        minHeight: 'calc(100vh - 100px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {renderPage()}
      </div>
      
      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }}>
        ProCalendar v2.1 - {user ? `${calendarEvents.length} real events synced 📊` : 'Backend waking up... 😴'} | Backend: {backendStatus}
      </div>
    </div>
  );
}

export default App;