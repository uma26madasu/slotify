import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  LogOut,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  X,
  MapPin,
  Video,
  ExternalLink,
  Loader2,
  CalendarDays,
  Sparkles,
  Menu,
  Home,
  Settings,
  User,
  Plus
} from 'lucide-react';
import SettingsPage from './pages/SettingsPage';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase/config';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventForm, setCreateEventForm] = useState({ title: '', date: '', startTime: '', endTime: '', description: '', attendees: '' });
  const [createEventError, setCreateEventError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [bookingSelectedDate, setBookingSelectedDate] = useState(null);
  const [bookingSelectedSlot, setBookingSelectedSlot] = useState(null);
  const [bookingViewDate, setBookingViewDate] = useState(new Date());

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || window.__ENV__?.VITE_API_URL || 'https://slotify-api-backend.vercel.app';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const REDIRECT_URI = window.location.origin + '/auth/google/callback';
  const MICROSOFT_REDIRECT_URI = window.location.origin + '/auth/microsoft/callback';

  // Wake up backend on component mount
  useEffect(() => {
    wakeUpBackend();
  }, []);

  // Auto-refresh calendar events every 60 seconds (real-time sync)
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      fetchCalendarEvents(user);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Check for auth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const path = window.location.pathname;

    if (errorParam) {
      setAuthError(`Google sign-in was denied: ${errorParam}`);
      window.history.replaceState({}, document.title, '/');
    } else if (code) {
      // Detect which provider based on callback path
      const isMicrosoft = path.includes('/auth/microsoft/callback');
      handleAuthCallback(code, isMicrosoft ? 'microsoft' : 'google');
    }

    const savedUser = localStorage.getItem('slotify_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if Google access token is expired
        if (userData.tokenExpiresAt && Date.now() > userData.tokenExpiresAt) {
          localStorage.removeItem('slotify_user');
          setAuthError('Your session has expired. Please sign in again to view your calendar.');
          return;
        }
        setUser(userData);
        setCurrentPage('dashboard');
        fetchCalendarEvents(userData);
      } catch (error) {
        localStorage.removeItem('slotify_user');
      }
    }
  }, []);

  const wakeUpBackend = async () => {
    setBackendStatus('waking');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('error');
        console.error(`Backend returned ${response.status} at ${API_BASE_URL}/api/test`);
      }
    } catch (error) {
      setBackendStatus('error');
      console.error(`Backend unreachable at ${API_BASE_URL}/api/test:`, error.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoadingAuth) return;
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      const normalizedUser = {
        id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        picture: result.user.photoURL,
        accessToken: credential.accessToken,
        tokenExpiresAt: Date.now() + 3500 * 1000, // Google tokens expire in 1hr; store as ~58min
        calendarProvider: 'google'
      };

      setUser(normalizedUser);
      setAuthError(null);
      localStorage.setItem('slotify_user', JSON.stringify(normalizedUser));
      setCurrentPage('dashboard');
      await fetchCalendarEvents(normalizedUser);
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase. Add it to Firebase Console → Authentication → Settings → Authorized domains.');
      } else {
        setAuthError(error.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleMicrosoftLogin = () => {
    if (!MICROSOFT_CLIENT_ID) {
      setAuthError('Microsoft Client ID is not configured. Add VITE_MICROSOFT_CLIENT_ID to your Vercel environment variables, then redeploy.');
      return;
    }

    setIsLoadingAuth(true);

    const scope = [
      'openid',
      'profile',
      'email',
      'offline_access',
      'Calendars.Read',
      'Calendars.ReadWrite',
      'User.Read'
    ].join(' ');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${MICROSOFT_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_mode=query&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const handleAuthCallback = async (code, provider = 'google') => {
    setIsLoadingAuth(true);

    try {
      // Select endpoints based on provider
      const authEndpoints = provider === 'microsoft'
        ? ['/api/microsoft/auth/callback']
        : ['/auth/google/callback', '/api/auth/google/callback'];

      const redirectUri = provider === 'microsoft' ? MICROSOFT_REDIRECT_URI : REDIRECT_URI;

      let authSuccess = false;
      let userData = null;

      for (const endpoint of authEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ code, redirect_uri: redirectUri }),
          });

          if (response.ok) {
            userData = await response.json();
            authSuccess = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (authSuccess && userData) {
        // Normalize user data structure - backend returns { user: {...}, tokens: {...} }
        const normalizedUser = {
          id: userData.user?.id || userData.id,
          email: userData.user?.email || userData.email,
          name: userData.user?.name || userData.name,
          picture: userData.user?.picture || userData.picture,
          accessToken: userData.tokens?.access_token || userData.accessToken,
          refreshToken: userData.tokens?.refresh_token || userData.refreshToken,
          tokenExpiry: userData.tokens?.expiry_date || userData.tokenExpiry,
          calendarProvider: userData.user?.calendarProvider || provider
        };

        setUser(normalizedUser);
        setAuthError(null);
        localStorage.setItem('slotify_user', JSON.stringify(normalizedUser));
        setCurrentPage('dashboard');
        await fetchCalendarEvents(normalizedUser);
        window.history.replaceState({}, document.title, '/');
      } else {
        setAuthError('Sign-in failed. Please try again.');
        window.history.replaceState({}, document.title, '/');
      }
    } catch (error) {
      setAuthError(`Authentication failed: ${error.message}`);
      window.history.replaceState({}, document.title, '/');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchCalendarEvents = async (userData) => {
    setIsLoadingEvents(true);

    try {
      // Get user email for the API request
      const userEmail = getUserEmail(userData);
      if (!userEmail) {
        console.error('No user email available for calendar sync');
        return;
      }

      // Select endpoints based on calendar provider
      const provider = userData.calendarProvider || 'google';
      const calendarEndpoints = provider === 'microsoft'
        ? ['/api/microsoft/calendar/events']
        : ['/api/calendar/events', '/calendar/events'];

      let backendSuccess = false;
      for (const endpoint of calendarEndpoints) {
        try {
          // Pass email as query parameter - backend looks up user by email
          const url = `${API_BASE_URL}${endpoint}?email=${encodeURIComponent(userEmail)}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userData.accessToken || userData.token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
          });

          if (response.ok) {
            const data = await response.json();
            setCalendarEvents(data.events || data.items || data || []);
            backendSuccess = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If backend failed and we have a Google access token, call Google Calendar API directly
      if (!backendSuccess && provider === 'google' && userData.accessToken) {
        try {
          // Fetch events from 30 days ago through 90 days from now for a complete view
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - 30);
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 90);
          const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250&timeMin=${pastDate.toISOString()}&timeMax=${futureDate.toISOString()}&singleEvents=true&orderBy=startTime`;
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${userData.accessToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setCalendarEvents(data.items || []);
            setEventsError(null);
          } else if (response.status === 401) {
            // Token expired or revoked
            setEventsError('session_expired');
            localStorage.removeItem('slotify_user');
          } else {
            setEventsError('api_error');
            console.error('Google Calendar API error:', response.status);
          }
        } catch (e) {
          setEventsError('network_error');
          console.error('Direct Google Calendar API failed:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCalendarEvents([]);
    localStorage.removeItem('slotify_user');
    setCurrentPage('home');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setCreateEventError(null);
    try {
      const userEmail = getUserEmail(user);
      if (!userEmail) {
        setCreateEventError('No user email found. Please sign in again.');
        return;
      }
      const startDateTime = new Date(`${createEventForm.date}T${createEventForm.startTime}`).toISOString();
      const endDateTime = new Date(`${createEventForm.date}T${createEventForm.endTime}`).toISOString();
      const event = {
        summary: createEventForm.title,
        description: createEventForm.description,
        start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      };
      if (createEventForm.attendees.trim()) {
        event.attendees = createEventForm.attendees.split(',').map(email => ({ email: email.trim() })).filter(a => a.email);
      }
      // Route through backend to avoid Firebase OAuth project limitations
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, event }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowCreateModal(false);
        setCreateEventForm({ title: '', date: '', startTime: '', endTime: '', description: '', attendees: '' });
        await fetchCalendarEvents(user);
      } else if (data.needsConnection || response.status === 404 || response.status === 401) {
        setCreateEventError('Google Calendar not connected. Go to Settings → Connect Google Calendar, then try again.');
      } else if (response.status === 403) {
        setCreateEventError('Calendar write permission needed. Go to Settings → Reconnect Google Calendar to grant access.');
      } else {
        setCreateEventError(data.message || 'Failed to create event. Please try again.');
      }
    } catch (error) {
      setCreateEventError('Failed to create event: ' + error.message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Helper to get user display name from various data structures
  const getUserName = (userData) => {
    if (!userData) return '';
    return userData.name || userData.user?.name || userData.displayName || userData.user?.displayName || userData.email?.split('@')[0] || '';
  };

  // Helper to get user email
  const getUserEmail = (userData) => {
    if (!userData) return '';
    return userData.email || userData.user?.email || '';
  };

  // Helper to get user picture
  const getUserPicture = (userData) => {
    if (!userData) return null;
    return userData.picture || userData.user?.picture || userData.avatar || userData.user?.avatar || null;
  };

  const formatEventTime = (event) => {
    const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
    const end = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date);

    if (event.start?.date) return 'All day';

    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return calendarEvents
      .filter(event => {
        const eventEnd = new Date(event.end?.dateTime || event.end?.date);
        // Show events that haven't ended yet (includes ongoing and upcoming events)
        return eventEnd >= now;
      })
      .slice(0, 5);
  };

  const formatSlotTime = (slot) => {
    const [h, m] = slot.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const getAvailableSlotsForDate = (date) => {
    const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    return allSlots.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      const slotStart = new Date(date); slotStart.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotStart); slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      return !calendarEvents.some(ev => {
        const es = new Date(ev.start?.dateTime || ev.start?.date);
        const ee = new Date(ev.end?.dateTime || ev.end?.date);
        return slotStart < ee && slotEnd > es;
      });
    });
  };

  // Status Badge Component
  const StatusBadge = () => {
    const statusConfig = {
      checking: { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: Loader2, text: 'Connecting...', animate: true },
      waking: { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', icon: Loader2, text: 'Starting...', animate: true },
      online: { color: 'bg-green-500/20 text-green-400 border border-green-500/30', icon: CheckCircle, text: 'Online', animate: false },
      error: { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: AlertCircle, text: 'Backend Offline', animate: false }
    };

    const config = statusConfig[backendStatus];
    const Icon = config.icon;

    if (backendStatus === 'error') {
      return (
        <a
          href={`${API_BASE_URL}/api/test`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Click to test: ${API_BASE_URL}/api/test`}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} hover:opacity-80`}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.text} ↗
        </a>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
        {config.text}
      </span>
    );
  };

  // Event Modal Component
  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Slotify</span>
            </div>

            <div className="flex items-center gap-4">
              <StatusBadge />
              {user ? (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoadingAuth}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-indigo-300 text-sm">
                <Sparkles className="w-4 h-4" />
                Smart Scheduling Made Simple
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full text-indigo-200 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                Powered by ChainSync Orchestration
              </div>
            </div>
            {authError && (
              <div className="mb-6 mx-auto max-w-md px-4 py-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Schedule meetings
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> without the back-and-forth</span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Slotify connects to your calendar and lets others book time with you automatically.
              No more endless email chains to find a meeting time.
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoadingAuth}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoadingAuth ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <button
                  onClick={handleMicrosoftLogin}
                  disabled={isLoadingAuth}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoadingAuth ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                      </svg>
                      Continue with Microsoft
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for smart scheduling
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features to save you time and eliminate scheduling headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Calendar Sync',
                description: 'Automatically syncs with Google Calendar to show your real-time availability.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Let others book meetings with you in seconds with shareable booking links.',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Shield,
                title: 'Smart Conflicts',
                description: 'Never double-book again. Slotify automatically prevents scheduling conflicts.',
                color: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Globe,
                title: 'Timezone Magic',
                description: 'Automatically detects and converts timezones for international meetings.',
                color: 'from-orange-500 to-pink-500'
              },
              {
                icon: Users,
                title: 'Team Scheduling',
                description: 'Coordinate group meetings by finding times that work for everyone.',
                color: 'from-violet-500 to-purple-500'
              },
              {
                icon: Clock,
                title: 'Buffer Times',
                description: 'Set buffer times between meetings to give yourself breathing room.',
                color: 'from-rose-500 to-pink-500'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to take control of your calendar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of professionals who save hours every week with Slotify.
          </p>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingAuth}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
          >
            Start Scheduling for Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Slotify</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Slotify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="min-h-screen bg-[#080d1a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d1424] border-r border-slate-800 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Slotify</span>
              <p className="text-xs text-cyan-400 font-medium">via ChainSync</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-1">
            {[
              { icon: Home, label: 'Dashboard', page: 'dashboard' },
              { icon: Calendar, label: 'Calendar', page: 'calendar' },
              { icon: Users, label: 'Booking', page: 'booking' },
              { icon: User, label: 'Account', page: 'account' },
              { icon: Settings, label: 'Settings', page: 'settings' }
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${currentPage === item.page
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              {getUserPicture(user) ? (
                <img src={getUserPicture(user)} alt="" className="w-10 h-10 rounded-full ring-2 ring-cyan-500/30" />
              ) : (
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{getUserName(user)}</p>
                <p className="text-xs text-slate-500 truncate">{getUserEmail(user)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {user ? `Welcome back, ${getUserName(user).split(' ')[0]}` : 'Welcome to Slotify'}
                </h1>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge />
              {user ? (
                <>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Event
                  </button>
                  <button
                    onClick={() => fetchCalendarEvents(user)}
                    disabled={isLoadingEvents}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoadingAuth}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingAuth ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Connect Google
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {!user ? (
            /* Not Logged In State */
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Calendar</h2>
              <p className="text-slate-400 mb-8">
                Sign in with Google or Microsoft to sync your calendar and start scheduling smarter.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoadingAuth}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  {isLoadingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>
                <button
                  onClick={handleMicrosoftLogin}
                  disabled={isLoadingAuth}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {isLoadingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                    </svg>
                  )}
                  Continue with Microsoft
                </button>
              </div>
            </div>
          ) : currentPage === 'settings' ? (
            <div className="max-w-7xl mx-auto">
              <SettingsPage user={user} />
            </div>
          ) : currentPage === 'calendar' ? (
            /* Calendar Page */
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">All Events</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              </div>
              {eventsError === 'session_expired' ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="font-medium text-amber-300">Session expired</p>
                  <p className="text-sm text-amber-400/70 mt-1 mb-4">Please sign out and sign in again to refresh your calendar access.</p>
                  <button onClick={handleLogout} className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-400">Sign Out & Reconnect</button>
                </div>
              ) : isLoadingEvents ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                  <p className="text-slate-400 mt-4">Loading events...</p>
                </div>
              ) : calendarEvents.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No events found</p>
                  <p className="text-slate-600 text-sm mt-1">Create your first event to get started</p>
                </div>
              ) : (
                (() => {
                  const now = new Date();
                  const upcoming = calendarEvents.filter(e => new Date(e.end?.dateTime || e.end?.date) >= now);
                  const past = calendarEvents.filter(e => new Date(e.end?.dateTime || e.end?.date) < now).reverse();
                  const renderEvent = (event, i) => {
                    const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
                    const isPast = new Date(event.end?.dateTime || event.end?.date) < now;
                    return (
                      <div key={i} onClick={() => setSelectedEvent(event)} className={`bg-slate-900 border rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-4 ${isPast ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-slate-600'}`}>
                        <div className="w-14 text-center flex-shrink-0">
                          <p className="text-xs text-slate-500 uppercase">{start.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-2xl font-bold text-white">{start.getDate()}</p>
                          <p className="text-xs text-slate-500">{start.toLocaleDateString('en-US', { month: 'short' })}</p>
                        </div>
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: isPast ? '#334155' : 'linear-gradient(to bottom, #06b6d4, #0ea5e9)' }} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isPast ? 'text-slate-500' : 'text-white'}`}>{event.summary || 'Untitled'}</p>
                          <p className="text-sm text-slate-500">{formatEventTime(event)}</p>
                          {event.attendees?.length > 0 && <p className="text-xs text-cyan-400 mt-1">{event.attendees.length} attendees</p>}
                        </div>
                        {isPast && <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded text-xs font-medium flex-shrink-0 border border-slate-700">Past</span>}
                        <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      </div>
                    );
                  };
                  return (
                    <div className="space-y-4">
                      {upcoming.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Upcoming ({upcoming.length})</p>
                          <div className="space-y-2">{upcoming.map(renderEvent)}</div>
                        </div>
                      )}
                      {past.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Past ({past.length})</p>
                          <div className="space-y-2">{past.map(renderEvent)}</div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ) : currentPage === 'booking' ? (
            /* Booking Page — interactive calendar + time slots */
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Your Booking Page</h2>
                <p className="text-slate-400 text-sm mt-1">Share your availability and let others book time with you</p>
              </div>
              {/* Booking Link */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="font-semibold text-white mb-1">Your Booking Link</h3>
                <p className="text-sm text-slate-400 mb-4">Share this link so others can see when you're available</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}?book=${encodeURIComponent(getUserEmail(user))}`}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 font-mono"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}?book=${encodeURIComponent(getUserEmail(user))}`)}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {/* Interactive Booking Calendar */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {/* Profile Header */}
                <div className="p-5 border-b border-slate-800 flex items-center gap-4">
                  {getUserPicture(user) ? (
                    <img src={getUserPicture(user)} alt="" className="w-12 h-12 rounded-full ring-2 ring-cyan-500/30" />
                  ) : (
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold text-xl">
                      {getUserName(user)[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{getUserName(user)}</p>
                    <p className="text-sm text-slate-400">30 min · Google Meet</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {/* Month Calendar */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setBookingViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      </button>
                      <span className="text-sm font-semibold text-white uppercase tracking-wide">
                        {bookingViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setBookingViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-xs text-slate-600 text-center mb-2 font-medium">
                      {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {getCalendarDays(bookingViewDate.getFullYear(), bookingViewDate.getMonth()).map((day, i) => {
                        if (!day) return <div key={i} />;
                        const today = new Date(); today.setHours(0,0,0,0);
                        const isPast = day < today;
                        const isSelected = bookingSelectedDate?.toDateString() === day.toDateString();
                        const isToday = day.toDateString() === today.toDateString();
                        return (
                          <button
                            key={i}
                            onClick={() => { if (!isPast) { setBookingSelectedDate(day); setBookingSelectedSlot(null); } }}
                            className={`aspect-square rounded-full text-sm font-medium transition-all flex items-center justify-center
                              ${isPast ? 'text-slate-700 cursor-not-allowed' : ''}
                              ${isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : ''}
                              ${isToday && !isSelected ? 'ring-2 ring-cyan-500/50 text-cyan-400' : ''}
                              ${!isPast && !isSelected ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : ''}
                            `}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Time Slots */}
                  <div className="p-5">
                    {bookingSelectedDate ? (
                      <>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                          Available Times · {bookingSelectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                          {getAvailableSlotsForDate(bookingSelectedDate).map(slot => (
                            <button
                              key={slot}
                              onClick={() => setBookingSelectedSlot(slot)}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all
                                ${bookingSelectedSlot === slot
                                  ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/25'
                                  : 'border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 bg-slate-800/50'}`}
                            >
                              {formatSlotTime(slot)}
                              {bookingSelectedSlot === slot && ' ✓'}
                            </button>
                          ))}
                          {getAvailableSlotsForDate(bookingSelectedDate).length === 0 && (
                            <p className="col-span-2 text-slate-600 text-sm py-6 text-center">No slots available — fully booked</p>
                          )}
                        </div>
                        {bookingSelectedSlot && (
                          <button
                            onClick={() => {
                              const [h, m] = bookingSelectedSlot.split(':').map(Number);
                              const endH = m >= 30 ? h + 1 : h;
                              const endM = (m + 30) % 60;
                              const date = bookingSelectedDate.toISOString().split('T')[0];
                              setCreateEventForm(f => ({ ...f, date, startTime: bookingSelectedSlot, endTime: `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}` }));
                              setShowCreateModal(true);
                            }}
                            className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 rounded-xl font-bold text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20"
                          >
                            Confirm — {bookingSelectedDate.toLocaleDateString('en-US', { weekday: 'short' })} {formatSlotTime(bookingSelectedSlot)}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <CalendarDays className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-slate-500 text-sm">Select a date to<br />see available times</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentPage === 'account' ? (
            /* Account Page */
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-8">
                  <div className="flex items-center gap-4">
                    {getUserPicture(user) ? (
                      <img src={getUserPicture(user)} alt="" className="w-20 h-20 rounded-full border-4 border-white/20" />
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{getUserName(user)}</h2>
                      <p className="text-blue-100">{getUserEmail(user)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Full Name', value: getUserName(user) },
                        { label: 'Email', value: getUserEmail(user) },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-800">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="font-medium text-white">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-3 border-b border-slate-800">
                        <span className="text-slate-400">Connected Account</span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${user.calendarProvider === 'microsoft' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                          <CheckCircle className="w-4 h-4" />
                          {user.calendarProvider === 'microsoft' ? 'Microsoft 365' : 'Google Calendar'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-slate-400">Total Events Synced</span>
                        <span className="font-medium text-white">{calendarEvents.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard Home */
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Events', value: calendarEvents.length, icon: Calendar, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
                  {
                    label: 'Today', value: calendarEvents.filter(e => {
                      const d = new Date(e.start?.dateTime || e.start?.date);
                      return d.toDateString() === new Date().toDateString();
                    }).length, icon: Clock, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20'
                  },
                  {
                    label: 'This Week', value: calendarEvents.filter(e => {
                      const d = new Date(e.start?.dateTime || e.start?.date);
                      const now = new Date(); const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
                      return d >= now && d <= weekEnd;
                    }).length, icon: CalendarDays, color: 'from-purple-500 to-violet-500', glow: 'shadow-purple-500/20'
                  },
                  { label: 'Completed', value: calendarEvents.filter(e => new Date(e.end?.dateTime || e.end?.date) < new Date()).length, icon: CheckCircle, color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors shadow-lg ${stat.glow}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connected Sources Panel */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">ChainSync Orchestration</h3>
                      <p className="text-slate-500 text-sm">Slotify is your unified scheduling hub</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">All synced</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Google', letter: 'G', color: 'from-red-500 to-orange-500', desc: `${calendarEvents.length} events` },
                    { label: 'Outlook', letter: 'O', color: 'from-blue-500 to-blue-600', desc: 'Connect to sync' },
                    { label: 'Zoom', letter: 'Z', color: 'from-blue-400 to-cyan-500', desc: 'Link generation' },
                    { label: 'Slack', letter: 'S', color: 'from-purple-500 to-violet-600', desc: 'Status updates' },
                  ].map((src, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className={`w-9 h-9 bg-gradient-to-br ${src.color} rounded-xl flex items-center justify-center text-white text-sm font-bold mb-3`}>
                        {src.letter}
                      </div>
                      <p className="text-white text-sm font-medium">{src.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{src.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-slate-900 rounded-xl border border-slate-800">
                <div className="p-6 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                    <button
                      onClick={() => setCurrentPage('calendar')}
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isLoadingEvents ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                    <p className="text-slate-400 mt-4">Syncing events...</p>
                  </div>
                ) : eventsError === 'session_expired' ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Session expired</p>
                    <p className="text-slate-400 text-sm mt-1 mb-4">Your Google access token has expired. Please sign out and sign back in.</p>
                    <button onClick={handleLogout} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400">
                      Sign Out & Reconnect
                    </button>
                  </div>
                ) : eventsError ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
                    <p className="text-slate-400">Failed to load events. Try refreshing.</p>
                  </div>
                ) : getUpcomingEvents().length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">No upcoming events</p>
                    <p className="text-slate-600 text-sm mt-1">Create one with the <span className="text-cyan-400">New Event</span> button</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {getUpcomingEvents().map((event, i) => {
                      const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedEvent(event)}
                          className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center gap-4"
                        >
                          <div className="w-14 text-center flex-shrink-0">
                            <p className="text-xs text-slate-500 uppercase">{start.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p className="text-2xl font-bold text-white">{start.getDate()}</p>
                          </div>
                          <div className="w-1 h-10 rounded-full flex-shrink-0 bg-gradient-to-b from-cyan-500 to-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{event.summary || 'Untitled'}</p>
                            <p className="text-sm text-slate-500">{formatEventTime(event)}</p>
                          </div>
                          {event.attendees?.length > 0 && (
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 3).map((_, j) => (
                                <div key={j} className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full border-2 border-[#0d1424] flex items-center justify-center text-xs text-white font-bold">
                                  {String.fromCharCode(65 + j)}
                                </div>
                              ))}
                              {event.attendees.length > 3 && (
                                <div className="w-8 h-8 bg-slate-700 rounded-full border-2 border-[#0d1424] flex items-center justify-center text-xs text-slate-400">
                                  +{event.attendees.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );

  // Loading State
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to Google...</p>
        </div>
      </div>
    );
  }

  // Modals rendered outside Dashboard to prevent remount on state change
  const modals = (
    <>
      {/* Event Detail Modal */}
      {selectedEvent && (() => {
        const evStart = selectedEvent.start?.dateTime ? new Date(selectedEvent.start.dateTime) : new Date(selectedEvent.start?.date);
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{selectedEvent.summary || 'Untitled Event'}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {evStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>{formatEventTime(selectedEvent)}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-2">{selectedEvent.attendees.length} attendees</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.attendees.slice(0, 5).map((attendee, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                            <span className={`w-2 h-2 rounded-full ${attendee.responseStatus === 'accepted' ? 'bg-green-400' : attendee.responseStatus === 'declined' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                            {attendee.displayName || attendee.email?.split('@')[0]}
                          </span>
                        ))}
                        {selectedEvent.attendees.length > 5 && <span className="text-xs text-slate-500">+{selectedEvent.attendees.length - 5} more</span>}
                      </div>
                    </div>
                  </div>
                )}
                {selectedEvent.description && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
                {selectedEvent.conferenceData?.entryPoints && (
                  <div className="pt-4">
                    <a href={selectedEvent.conferenceData.entryPoints[0]?.uri} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg font-semibold hover:bg-cyan-400 transition-colors">
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
              {selectedEvent.htmlLink && (
                <div className="px-6 py-4 bg-slate-800/50 rounded-b-2xl border-t border-slate-800">
                  <a href={selectedEvent.htmlLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                    <ExternalLink className="w-4 h-4" />
                    View in Google Calendar
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create New Event</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              {createEventError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{createEventError}</p>
                      {(createEventError.includes('Settings') || createEventError.includes('connect')) && (
                        <button
                          type="button"
                          onClick={() => { setShowCreateModal(false); setCurrentPage('settings'); }}
                          className="mt-2 underline text-cyan-400 hover:text-cyan-300 text-xs"
                        >
                          Go to Settings → Calendars
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Team Standup"
                  value={createEventForm.title}
                  onChange={e => setCreateEventForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={createEventForm.date}
                  onChange={e => setCreateEventForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={createEventForm.startTime}
                    onChange={e => setCreateEventForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={createEventForm.endTime}
                    onChange={e => setCreateEventForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Attendees (comma-separated emails)</label>
                <input
                  type="text"
                  placeholder="e.g. alice@example.com, bob@example.com"
                  value={createEventForm.attendees}
                  onChange={e => setCreateEventForm(f => ({ ...f, attendees: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional description"
                  value={createEventForm.description}
                  onChange={e => setCreateEventForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingEvent}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingEvent ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // Render appropriate page
  return currentPage === 'dashboard' || currentPage === 'calendar' || currentPage === 'settings' || currentPage === 'account' || currentPage === 'booking' ? (
    <>{<Dashboard />}{modals}</>
  ) : (
    <LandingPage />
  );
}

export default App;
