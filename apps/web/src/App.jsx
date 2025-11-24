import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
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
  User
} from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || window.__ENV__?.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback';
  const MICROSOFT_REDIRECT_URI = window.location.origin + '/auth/microsoft/callback';

  // Wake up backend on component mount
  useEffect(() => {
    wakeUpBackend();
  }, []);

  // Check for auth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const path = window.location.pathname;

    if (code) {
      // Detect which provider based on callback path
      const isMicrosoft = path.includes('/auth/microsoft/callback');
      handleAuthCallback(code, isMicrosoft ? 'microsoft' : 'google');
    }

    const savedUser = localStorage.getItem('slotify_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
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

      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Client ID not configured. Please check your environment variables.');
      return;
    }

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

    window.location.href = authUrl;
  };

  const handleMicrosoftLogin = () => {
    if (!MICROSOFT_CLIENT_ID) {
      alert('Microsoft Client ID not configured. Please check your environment variables.');
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
        localStorage.setItem('slotify_user', JSON.stringify(normalizedUser));
        setCurrentPage('dashboard');
        await fetchCalendarEvents(normalizedUser);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      alert(`Authentication failed: ${error.message}`);
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
            break;
          }
        } catch (e) {
          continue;
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
    setCurrentPage('dashboard');
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

    return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const getUpcomingEvents = () => {
    return calendarEvents
      .filter(event => new Date(event.start?.dateTime || event.start?.date) >= new Date())
      .slice(0, 5);
  };

  // Status Badge Component
  const StatusBadge = () => {
    const statusConfig = {
      checking: { color: 'bg-yellow-100 text-yellow-800', icon: Loader2, text: 'Connecting...', animate: true },
      waking: { color: 'bg-blue-100 text-blue-800', icon: Loader2, text: 'Starting...', animate: true },
      online: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Online', animate: false },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Offline', animate: false }
    };

    const config = statusConfig[backendStatus];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
        {config.text}
      </span>
    );
  };

  // Event Modal Component
  const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto animate-slideInUp" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{event.summary || 'Untitled Event'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>{formatEventTime(event)}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <span>{event.location}</span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">{event.attendees.length} attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.slice(0, 5).map((attendee, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        <span className={`w-2 h-2 rounded-full ${
                          attendee.responseStatus === 'accepted' ? 'bg-green-500' :
                          attendee.responseStatus === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        {attendee.displayName || attendee.email?.split('@')[0]}
                      </span>
                    ))}
                    {event.attendees.length > 5 && (
                      <span className="text-xs text-gray-500">+{event.attendees.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {event.description && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.conferenceData?.entryPoints && (
              <div className="pt-4">
                <a
                  href={event.conferenceData.entryPoints[0]?.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </a>
              </div>
            )}
          </div>

          {event.htmlLink && (
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="w-4 h-4" />
                View in Google Calendar
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

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
                  disabled={backendStatus !== 'online' || isLoadingAuth}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-indigo-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Smart Scheduling Made Simple
            </div>

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
                  disabled={backendStatus !== 'online' || isLoadingAuth}
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
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <button
                  onClick={handleMicrosoftLogin}
                  disabled={backendStatus !== 'online' || isLoadingAuth}
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
                        <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                      </svg>
                      Continue with Microsoft
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setCurrentPage('dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                View Demo
                <ArrowRight className="w-5 h-5" />
              </button>
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
            disabled={backendStatus !== 'online' || isLoadingAuth}
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Slotify</span>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-1">
            {[
              { icon: Home, label: 'Dashboard', page: 'dashboard' },
              { icon: Calendar, label: 'Calendar', page: 'calendar' },
              { icon: User, label: 'Account', page: 'account' },
              { icon: Settings, label: 'Settings', page: 'settings' }
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === item.page
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              {getUserPicture(user) ? (
                <img src={getUserPicture(user)} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{getUserName(user)}</p>
                <p className="text-xs text-gray-500 truncate">{getUserEmail(user)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user ? `Welcome back, ${getUserName(user).split(' ')[0]}` : 'Welcome to Slotify'}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge />
              {user ? (
                <button
                  onClick={() => fetchCalendarEvents(user)}
                  disabled={isLoadingEvents}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={backendStatus !== 'online' || isLoadingAuth}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingAuth ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Calendar</h2>
              <p className="text-gray-600 mb-8">
                Sign in with Google or Microsoft to sync your calendar and start scheduling smarter.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={backendStatus !== 'online' || isLoadingAuth}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>
                <button
                  onClick={handleMicrosoftLogin}
                  disabled={backendStatus !== 'online' || isLoadingAuth}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                    </svg>
                  )}
                  Continue with Microsoft
                </button>
              </div>
            </div>
          ) : currentPage === 'account' ? (
            /* Account Page */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Account Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
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
                      <p className="text-indigo-100">{getUserEmail(user)}</p>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Full Name</span>
                        <span className="font-medium text-gray-900">{getUserName(user)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-gray-900">{getUserEmail(user)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Connected Account</span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          user.calendarProvider === 'microsoft'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          {user.calendarProvider === 'microsoft' ? 'Microsoft 365' : 'Google Calendar'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600">Total Events Synced</span>
                        <span className="font-medium text-gray-900">{calendarEvents.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Logged In State */
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Events', value: calendarEvents.length, icon: Calendar, color: 'bg-blue-500' },
                  { label: 'Today', value: calendarEvents.filter(e => {
                    const d = new Date(e.start?.dateTime || e.start?.date);
                    const today = new Date();
                    return d.toDateString() === today.toDateString();
                  }).length, icon: Clock, color: 'bg-emerald-500' },
                  { label: 'This Week', value: calendarEvents.filter(e => {
                    const d = new Date(e.start?.dateTime || e.start?.date);
                    const now = new Date();
                    const weekEnd = new Date(now);
                    weekEnd.setDate(now.getDate() + 7);
                    return d >= now && d <= weekEnd;
                  }).length, icon: CalendarDays, color: 'bg-purple-500' },
                  { label: 'With Attendees', value: calendarEvents.filter(e => e.attendees?.length > 0).length, icon: Users, color: 'bg-orange-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                    <button
                      onClick={() => setCurrentPage('calendar')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isLoadingEvents ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-gray-500 mt-4">Loading events...</p>
                  </div>
                ) : getUpcomingEvents().length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {getUpcomingEvents().map((event, i) => {
                      const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date);

                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedEvent(event)}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4"
                        >
                          <div className="w-14 text-center">
                            <p className="text-xs text-gray-500 uppercase">{start.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p className="text-2xl font-bold text-gray-900">{start.getDate()}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{event.summary || 'Untitled'}</p>
                            <p className="text-sm text-gray-500">{formatEventTime(event)}</p>
                          </div>
                          {event.attendees?.length > 0 && (
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 3).map((_, j) => (
                                <div key={j} className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white" />
                              ))}
                              {event.attendees.length > 3 && (
                                <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-500">
                                  +{event.attendees.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
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

      {/* Event Modal */}
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
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

  // Render appropriate page
  return currentPage === 'dashboard' || currentPage === 'calendar' || currentPage === 'settings' || currentPage === 'account' ? (
    <Dashboard />
  ) : (
    <LandingPage />
  );
}

export default App;
