import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import googleCalendarService, { getCalendarStats } from '../services/calendar/googleCalendar';
import { Card, Alert, Spinner, Button, Badge } from '../components';
import { formatDistanceToNow } from 'date-fns';

/**
 * Component to display and manage calendar conflicts
 */
function CalendarConflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState({});

  useEffect(() => {
    // Load initial conflicts
    fetchConflicts();
    
    // Set up event listener for new conflicts
    const handleNewConflict = (data) => {
      toast.warning(`Calendar conflict detected: "${data.meeting.title}" overlaps with other events`);
      fetchConflicts(); // Refresh the conflicts list
    };
    
    // Register event listener
    googleCalendarService.addEventListener('conflict-detected', handleNewConflict);
    
    // Clean up
    return () => {
      googleCalendarService.removeEventListener('conflict-detected', handleNewConflict);
    };
  }, []);
  
  /**
   * Fetch all conflicts from API
   */
  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar-conflicts');
      const data = await response.json();
      setConflicts(data);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      toast.error('Failed to load calendar conflicts');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Resolve a conflict by updating the meeting time
   */
  const resolveConflict = async (conflictId, action) => {
    try {
      setResolving(prev => ({ ...prev, [conflictId]: true }));
      
      const response = await fetch(`/api/calendar-conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve conflict');
      }
      
      // Remove resolved conflict from list
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
      
      toast.success('Calendar conflict resolved successfully');
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve calendar conflict');
    } finally {
      setResolving(prev => ({ ...prev, [conflictId]: false }));
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
        <p className="ml-3 text-gray-600">Loading calendar conflicts...</p>
      </div>
    );
  }
  
  if (conflicts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Calendar Conflicts</h3>
        <p className="text-gray-600">All your meetings are properly scheduled without overlapping events.</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Calendar Conflicts</h2>
        <Button variant="secondary" size="sm" onClick={fetchConflicts}>
          Refresh
        </Button>
      </div>
      
      <Alert
        type="warning"
        message="The following meetings conflict with events in your Google Calendar. Please resolve these conflicts to avoid double bookings."
        className="mb-4"
      />
      
      <div className="space-y-4">
        {conflicts.map(conflict => (
          <Card key={conflict.id} className="overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{conflict.meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    With {conflict.meeting.clientName} on{' '}
                    {new Date(conflict.meeting.start).toLocaleDateString()} at{' '}
                    {new Date(conflict.meeting.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant="danger">Conflict</Badge>
              </div>
            </div>
            
            <div className="p-5 bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Conflicting Google Calendar Events:</h4>
              <ul className="space-y-2">
                {conflict.conflictingEvents.map((event, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mt-2 mr-2"></span>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start).toLocaleDateString()} at{' '}
                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' to '}
                        {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <Button
                variant="danger"
                onClick={() => resolveConflict(conflict.id, 'cancel')}
                isLoading={resolving[conflict.id]}
                disabled={resolving[conflict.id]}
              >
                Cancel Meeting
              </Button>
              <Button
                variant="primary"
                onClick={() => resolveConflict(conflict.id, 'reschedule')}
                isLoading={resolving[conflict.id]}
                disabled={resolving[conflict.id]}
              >
                Reschedule
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Component to display calendar sync status
 */
function CalendarSyncStatus() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load initial stats
    loadCalendarStats();
    
    // Set up event listener for calendar updates
    const handleCalendarUpdate = () => {
      loadCalendarStats();
    };
    
    // Register event listener
    googleCalendarService.addEventListener('calendar-updated', handleCalendarUpdate);
    
    // Set up refresh interval
    const interval = setInterval(loadCalendarStats, 15 * 60 * 1000); // Refresh every 15 minutes
    
    // Clean up
    return () => {
      clearInterval(interval);
      googleCalendarService.removeEventListener('calendar-updated', handleCalendarUpdate);
    };
  }, []);
  
  /**
   * Load calendar statistics
   */
  const loadCalendarStats = async () => {
    if (!googleCalendarService.isConnected()) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const calendarStats = await getCalendarStats();
      setStats(calendarStats);
      setError(null);
    } catch (error) {
      console.error('Error loading calendar stats:', error);
      setError('Failed to load calendar statistics');
    } finally {
      setLoading(false);
    }
  };
  
  if (!googleCalendarService.isConnected()) {
    return null;
  }
  
  if (loading && !stats) {
    return (
      <Card className="p-4">
        <div className="flex items-center">
          <Spinner size="sm" />
          <p className="ml-2 text-gray-600">Loading calendar status...</p>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-4 border-l-4 border-red-500">
        <div className="flex items-center text-red-700">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      </Card>
    );
  }
  
  if (!stats) return null;
  
  return (
    <Card className="p-4 border-l-4 border-green-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">Google Calendar Sync</h3>
          <p className="text-sm text-gray-600">
            Synced with {stats.connectedCalendars} calendar(s), {stats.upcomingEvents} upcoming events
          </p>
        </div>
        
        {stats.lastSynced && (
          <p className="text-xs text-gray-500">
            Last synced {formatDistanceToNow(new Date(stats.lastSynced), { addSuffix: true })}
          </p>
        )}
      </div>
    </Card>
  );
}

// Export components
export { CalendarConflicts, CalendarSyncStatus };