import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Alert, Badge, Modal, Toggle } from '../components/UI';

// New imports for calendar integration
import { getGoogleAuthUrl } from '../services/calendar/googleCalendar';

export default function CreateWindow() {
  const navigate = useNavigate();
  const [windows, setWindows] = useState([
    // Sample existing windows (would be fetched from API in a real app)
    {
      id: 'w1',
      dayOfWeek: 'Monday',
      startHour: '09:00',
      endHour: '17:00'
    },
    {
      id: 'w2',
      dayOfWeek: 'Wednesday',
      startHour: '13:00',
      endHour: '18:00'
    }
  ]);
  
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');
  const [name, setName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'

  // Calendar integration states
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [syncWithCalendar, setSyncWithCalendar] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const dayOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Check if user has connected Google Calendar
  useEffect(() => {
    const checkCalendarConnection = async () => {
      try {
        // In a real app, this would check if the user has a valid Google Calendar connection
        // For demo purposes, we'll simulate a check by adding a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate checking localStorage for tokens (in a real app, you'd check your API/backend)
        const hasCalendarTokens = localStorage.getItem('googleCalendarTokens') !== null;
        setIsCalendarConnected(hasCalendarTokens);
        
        // If connected, fetch available calendars (simulated)
        if (hasCalendarTokens) {
          setCalendars([
            { id: 'primary', name: 'Main Calendar' },
            { id: 'work', name: 'Work Calendar' },
            { id: 'personal', name: 'Personal Events' }
          ]);
        }
      } catch (err) {
        console.error('Error checking calendar connection:', err);
      }
    };
    
    checkCalendarConnection();
  }, []);

  // Generate time options in 15-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        options.push(`${hourFormatted}:${minuteFormatted}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Validate time selection
  const validateTimes = () => {
    if (startHour >= endHour) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  // Connect Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      // Get the Google OAuth URL
      const authUrl = await getGoogleAuthUrl();
      
      // Redirect to Google auth page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error starting Google Auth flow:', err);
      setError('Failed to start Google Calendar authorization. Please try again.');
    }
  };

  // Create availability window and sync with Google Calendar if enabled
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    // Validate times
    if (!validateTimes()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Get current user ID from Firebase auth
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Create new window object
      const newWindow = {
        id: `w${Date.now()}`, // Generate a temporary ID
        dayOfWeek,
        startHour,
        endHour,
        name: name || undefined
      };
      
      // If calendar sync is enabled and user has connected Google Calendar
      if (syncWithCalendar && isCalendarConnected) {
        await syncWindowWithCalendar(newWindow);
      }
      
      // Update local state with new window
      setWindows([...windows, newWindow]);
      
      // Show success message
      setSuccess('Availability window created successfully!');
      
      // Reset form
      setName('');
      
      // Switch to manage tab
      setActiveTab('manage');
      
    } catch (err) {
      console.error('Error creating availability window:', err);
      setError(err.message || 'Failed to create availability window');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync window with Google Calendar
  const syncWindowWithCalendar = async (window) => {
    try {
      // In a real app, this would create a recurring event in Google Calendar
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Created recurring event in Google Calendar for ${window.dayOfWeek} from ${window.startHour} to ${window.endHour}`);
      return true;
    } catch (err) {
      console.error('Error syncing with Google Calendar:', err);
      throw new Error('Failed to sync with Google Calendar. The window was saved but calendar sync failed.');
    }
  };

  const handleDelete = async (windowId) => {
    if (window.confirm('Are you sure you want to delete this availability window?')) {
      try {
        setIsSubmitting(true);
        
        // Get the window to delete
        const windowToDelete = windows.find(w => w.id === windowId);
        
        // If window was synced with calendar, remove the calendar event too
        if (syncWithCalendar && isCalendarConnected && windowToDelete) {
          // In a real app, this would delete the recurring event from Google Calendar
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Deleted recurring event in Google Calendar for ${windowToDelete.dayOfWeek}`);
        }
        
        // Filter out the deleted window
        setWindows(windows.filter(window => window.id !== windowId));
        
        setSuccess('Availability window deleted successfully');
      } catch (err) {
        setError('Failed to delete availability window');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Format time for display (24h to 12h)
  const formatTime = (time24h) => {
    const [hour, minute] = time24h.split(':');
    const hour12 = (parseInt(hour) % 12) || 12;
    const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <MainLayout>
      {/* Tabs for Create/Manage */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Create Availability
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === 'manage'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Manage Availability
            </button>
          </nav>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}
      
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          className="mb-6"
        />
      )}

      {/* Calendar Connection Banner - Show if not connected */}
      {!isCalendarConnected && (
        <Card className="mb-6 bg-blue-50 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-md font-semibold text-blue-800">Connect Google Calendar</h3>
              <p className="mt-1 text-sm text-blue-700">
                Connect your Google Calendar to automatically sync availability windows and prevent double bookings.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={connectGoogleCalendar}
                variant="primary"
                size="sm"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" fill="#4285F4"/>
                  <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" fill="#4285F4"/>
                  <path d="M12 4.8V0C5.383 0 0 5.383 0 12h4.8c0-3.977 3.223-7.2 7.2-7.2z" fill="#34A853"/>
                  <path d="M19.2 12H24c0-6.617-5.383-12-12-12v4.8c3.977 0 7.2 3.223 7.2 7.2z" fill="#FBBC05"/>
                  <path d="M12 19.2c-3.977 0-7.2-3.223-7.2-7.2H0c0 6.617 5.383 12 12 12v-4.8z" fill="#EA4335"/>
                </svg>
                Connect Google Calendar
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Create Availability Form */}
      {activeTab === 'create' && (
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Set Your Weekly Availability</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Window Name (Optional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Working Hours, Evening Availability"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  id="startHour"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {timeOptions.map((time) => (
                    <option key={`start-${time}`} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="endHour" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <select
                  id="endHour"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {timeOptions.map((time) => (
                    <option key={`end-${time}`} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Sync Option - Only show if connected */}
            {isCalendarConnected && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Calendar Sync Options</h3>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowCalendarModal(true)}
                  >
                    Manage Calendars
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sync with Google Calendar</p>
                    <p className="text-xs text-gray-500">
                      Create recurring events in your calendar to block this time each week
                    </p>
                  </div>
                  <Toggle
                    enabled={syncWithCalendar}
                    onChange={setSyncWithCalendar}
                  />
                </div>
                
                {syncWithCalendar && (
                  <div className="mt-3">
                    <label htmlFor="calendarId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Calendar
                    </label>
                    <select
                      id="calendarId"
                      value={selectedCalendarId}
                      onChange={(e) => setSelectedCalendarId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            
            {/* Preview Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Availability Preview</h3>
              <div className="flex items-center">
                <Badge variant="primary" rounded>{dayOfWeek}</Badge>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-700">{formatTime(startHour)} - {formatTime(endHour)}</span>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-700">
                  {(() => {
                    const start = new Date(`1970-01-01T${startHour}:00`);
                    const end = new Date(`1970-01-01T${endHour}:00`);
                    const diff = (end - start) / (1000 * 60 * 60); // hours
                    return `${diff} ${diff === 1 ? 'hour' : 'hours'}`;
                  })()}
                </span>
              </div>
              {isCalendarConnected && syncWithCalendar && (
                <div className="mt-2 text-xs text-indigo-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Will be synced with{" "}
                  {calendars.find(c => c.id === selectedCalendarId)?.name || "Google Calendar"}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Availability Window
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Manage Existing Windows */}
      {activeTab === 'manage' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Availability Windows</h2>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setActiveTab('create')}
            >
              Add New
            </Button>
          </div>
          
          {windows.length > 0 ? (
            <div className="space-y-4">
              {windows.map((window) => (
                <div 
                  key={window.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center">
                      <Badge variant="primary" rounded>{window.dayOfWeek}</Badge>
                      {window.name && (
                        <>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="font-medium text-gray-900">{window.name}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-700 mt-1">
                      {formatTime(window.startHour)} - {formatTime(window.endHour)}
                    </p>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Pre-fill form with this window's data
                        setDayOfWeek(window.dayOfWeek);
                        setStartHour(window.startHour);
                        setEndHour(window.endHour);
                        setName(window.name || '');
                        setActiveTab('create');
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(window.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-base font-medium text-gray-900">No availability windows</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't set any availability windows yet.
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('create')}
                >
                  Create Your First Window
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      
      {/* Help Information */}
      <div className="mt-6">
        <Card className="bg-indigo-50 border border-indigo-100">
          <h3 className="text-sm font-medium text-indigo-800 mb-2">About Availability Windows</h3>
          <p className="text-sm text-indigo-700">
            Availability windows define when you're available for meetings on a weekly basis. 
            Create multiple windows to set different hours for different days.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-xs font-medium text-indigo-800 uppercase mb-1">Recurring Schedule</h4>
              <p className="text-xs text-gray-600">
                Windows repeat weekly until you change or delete them
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-xs font-medium text-indigo-800 uppercase mb-1">Calendar Blocking</h4>
              <p className="text-xs text-gray-600">
                Meetings are only scheduled during your available windows
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-xs font-medium text-indigo-800 uppercase mb-1">Conflict Prevention</h4>
              <p className="text-xs text-gray-600">
                Slots are automatically blocked when you have existing meetings
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar Selection Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Manage Calendar Integration"
        size="lg"
      >
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Connected Calendars</h3>
            {calendars.length > 0 ? (
              <div className="space-y-3">
                {calendars.map(calendar => (
                  <div key={calendar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{calendar.name}</p>
                        <p className="text-xs text-gray-500">Google Calendar</p>
                      </div>
                    </div>
                    <Toggle
                      enabled={true}
                      onChange={() => {}}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No calendars connected yet.</p>
            )}
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={connectGoogleCalendar}
              >
                Add Another Calendar
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">Calendar Sync Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="autoSync" className="text-sm text-gray-700">
                  Automatically sync new availability windows
                </label>
                <Toggle
                  enabled={syncWithCalendar}
                  onChange={setSyncWithCalendar}
                  id="autoSync"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="blockConflicts" className="text-sm text-gray-700">
                  Block time slots with existing calendar events
                </label>
                <Toggle
                  enabled={true}
                  onChange={() => {}}
                  id="blockConflicts"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => setShowCalendarModal(false)}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}