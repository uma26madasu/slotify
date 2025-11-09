import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Modal } from '../components';
import googleCalendarService from '../services/calendar/googleCalendar';

/**
 * A component that checks for conflicts when scheduling meetings
 * with Google Calendar.
 */
const CalendarConflictChecker = ({ 
  meetingStart, 
  meetingEnd, 
  onConflictDetected, 
  onNoConflicts,
  isEnabled = true,
  autoCheck = false
}) => {
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Auto-check for conflicts when props change
  useEffect(() => {
    if (autoCheck && isEnabled && meetingStart && meetingEnd && googleCalendarService.isConnected()) {
      checkForConflicts();
    }
  }, [meetingStart, meetingEnd, autoCheck, isEnabled]);

  /**
   * Check for calendar conflicts
   */
  const checkForConflicts = async () => {
    if (!meetingStart || !meetingEnd) {
      return;
    }

    if (!googleCalendarService.isConnected()) {
      if (onNoConflicts) onNoConflicts();
      return;
    }

    try {
      setChecking(true);

      // Get all calendar IDs
      const calendars = await googleCalendarService.getCalendarList();
      const calendarIds = calendars.map(cal => cal.id);

      // Get busy periods from calendars during meeting time
      const busyPeriods = await googleCalendarService.getAvailability(
        calendarIds,
        new Date(meetingStart).toISOString(),
        new Date(meetingEnd).toISOString()
      );

      setHasChecked(true);
      setConflicts(busyPeriods);

      if (busyPeriods.length > 0) {
        setShowConflictModal(true);
        if (onConflictDetected) onConflictDetected(busyPeriods);
      } else {
        if (onNoConflicts) onNoConflicts();
      }
    } catch (error) {
      console.error('Error checking for conflicts:', error);
    } finally {
      setChecking(false);
    }
  };

  // If not enabled or no calendar connection, return null or info badge
  if (!isEnabled) {
    return null;
  }

  if (!googleCalendarService.isConnected()) {
    return (
      <div className="mt-2">
        <Badge variant="info" size="sm">Calendar conflict checking not available</Badge>
      </div>
    );
  }

  // If conflicts have been checked and none found
  if (hasChecked && conflicts.length === 0) {
    return (
      <div className="mt-2">
        <Badge variant="success" size="sm">No calendar conflicts found</Badge>
      </div>
    );
  }

  // Conflict checking button or status
  return (
    <>
      <div className="mt-2">
        {!hasChecked ? (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={checkForConflicts} 
            isLoading={checking}
            disabled={checking || !meetingStart || !meetingEnd}
          >
            Check Calendar Conflicts
          </Button>
        ) : conflicts.length > 0 ? (
          <Badge 
            variant="danger" 
            size="sm" 
            className="cursor-pointer" 
            onClick={() => setShowConflictModal(true)}
          >
            {conflicts.length} Calendar {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
          </Badge>
        ) : null}
      </div>

      {/* Conflict Details Modal */}
      <Modal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        title="Calendar Conflicts Detected"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-red-600">
            This meeting conflicts with events in your Google Calendar:
          </p>

          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-3">
              {conflicts.map((conflict, index) => (
                <li key={index} className="p-3 bg-red-50 rounded-lg">
                  <p className="font-medium">Conflict with calendar: {conflict.calendarId}</p>
                  <p className="text-sm text-gray-700">
                    {new Date(conflict.start).toLocaleString()} - {new Date(conflict.end).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowConflictModal(false)}
            >
              Ignore Conflicts
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowConflictModal(false);
                // This would typically navigate to a page to change the time
              }}
            >
              Change Meeting Time
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

CalendarConflictChecker.propTypes = {
  meetingStart: PropTypes.string,
  meetingEnd: PropTypes.string,
  onConflictDetected: PropTypes.func,
  onNoConflicts: PropTypes.func,
  isEnabled: PropTypes.bool,
  autoCheck: PropTypes.bool
};

export default CalendarConflictChecker;