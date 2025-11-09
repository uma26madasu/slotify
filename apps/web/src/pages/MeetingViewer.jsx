import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Badge, Modal, Alert } from '../components/UI';
import googleCalendarService from '../services/calendar/googleCalendar';

export default function MeetingViewer() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter tabs
  const filterTabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'all', label: 'All Meetings' }
  ];

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if Google Calendar is connected
        if (!googleCalendarService.isConnected()) {
          setError('Google Calendar is not connected. Please connect your calendar in settings.');
          setLoading(false);
          return;
        }

        // Get calendar list
        const calendars = await googleCalendarService.getCalendarList();
        
        // Find primary calendar
        const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];
        
        if (!primaryCalendar) {
          setError('No primary calendar found.');
          setLoading(false);
          return;
        }

        // Get events from the primary calendar
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        const events = await googleCalendarService.getEvents(primaryCalendar.id, {
          timeMin: thirtyDaysAgo.toISOString(),
          timeMax: thirtyDaysFromNow.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        });

        // Transform Google Calendar events to meeting format
        const transformedMeetings = events.map(event => {
          // Extract attendee info
          const attendees = event.attendees || [];
          const organizer = event.organizer || {};
          
          // Try to determine client info from attendees (first non-organizer attendee)
          const client = attendees.find(att => att.email !== organizer.email) || {
            email: organizer.email,
            displayName: organizer.displayName || 'Unknown'
          };

          // Determine status based on event status and time
          let status = 'confirmed';
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);
          
          if (event.status === 'cancelled') {
            status = 'canceled';
          } else if (eventEnd < now) {
            status = 'completed';
          } else if (event.status === 'tentative') {
            status = 'pending';
          }

          return {
            id: event.id,
            clientName: client.displayName || client.email?.split('@')[0] || 'Unknown Client',
            clientEmail: client.email || 'no-email@example.com',
            startTime: event.start.dateTime || event.start.date,
            endTime: event.end.dateTime || event.end.date,
            meetingName: event.summary || 'Untitled Meeting',
            status: status,
            linkId: event.id, // Using event ID as link ID
            description: event.description || '',
            location: event.location || '',
            meetLink: event.hangoutLink || '',
            // Parse questions from description if they exist in a specific format
            questions: parseQuestionsFromDescription(event.description),
            // Store the original event for reference
            originalEvent: event
          };
        });

        setMeetings(transformedMeetings);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings from Google Calendar. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMeetings();

    // Set up event listeners for calendar updates
    const handleCalendarUpdate = () => {
      fetchMeetings();
    };

    googleCalendarService.addEventListener('calendar-updated', handleCalendarUpdate);

    // Cleanup
    return () => {
      googleCalendarService.removeEventListener('calendar-updated', handleCalendarUpdate);
    };
  }, []);

  // Helper function to parse questions from description
  const parseQuestionsFromDescription = (description) => {
    if (!description) return [];
    
    // This is a simple parser - you can customize based on your format
    // Example format: "Q: What topics? A: Retirement planning"
    const questions = [];
    const lines = description.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Q:') || line.startsWith('Question:')) {
        const question = line.replace(/^(Q:|Question:)\s*/i, '');
        let answer = '';
        
        // Look for answer in next lines
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('A:') || nextLine.startsWith('Answer:')) {
            answer = nextLine.replace(/^(A:|Answer:)\s*/i, '');
            i = j; // Skip to after the answer
            break;
          } else if (nextLine.startsWith('Q:') || nextLine.startsWith('Question:')) {
            break; // Next question found
          }
        }
        
        if (question) {
          questions.push({ question, answer });
        }
      }
    }
    
    return questions;
  };

  const updateMeetingStatus = async (meetingId, newStatus, reason = '') => {
    try {
      setCancelLoading(true);
      setApprovalLoading(true);
      
      // Find the meeting and its calendar info
      const meeting = meetings.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Get the primary calendar
      const calendars = await googleCalendarService.getCalendarList();
      const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];

      if (newStatus === 'canceled') {
        // Delete the event from Google Calendar
        await googleCalendarService.deleteEvent(primaryCalendar.id, meetingId);
      } else if (newStatus === 'confirmed') {
        // Update event status in Google Calendar
        const updatedEvent = {
          ...meeting.originalEvent,
          status: 'confirmed'
        };
        await googleCalendarService.updateEvent(primaryCalendar.id, meetingId, updatedEvent);
      }
      
      // Update the meeting in the local state
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId ? { 
          ...meeting, 
          status: newStatus,
          ...(reason && { rejectionReason: reason })
        } : meeting
      ));
      
      // Close modals and show success message
      setShowCancelModal(false);
      setShowRejectionModal(false);
      if (selectedMeeting && selectedMeeting.id === meetingId) {
        setSelectedMeeting({ 
          ...selectedMeeting, 
          status: newStatus,
          ...(reason && { rejectionReason: reason })
        });
      }
      
      let action = '';
      if (newStatus === 'canceled') action = 'canceled';
      else if (newStatus === 'confirmed') action = 'approved';
      else if (newStatus === 'rejected') action = 'rejected';
      else action = 'updated';
      
      setSuccessMessage(`Meeting ${action} successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error(`Error updating meeting status:`, err);
      setError(`Failed to update meeting status. Please try again.`);
    } finally {
      setCancelLoading(false);
      setApprovalLoading(false);
      setRejectionReason('');
    }
  };

  const handleCancelMeeting = () => {
    if (selectedMeeting) {
      setShowCancelModal(true);
    }
  };

  const confirmCancelMeeting = async () => {
    await updateMeetingStatus(selectedMeeting.id, 'canceled');
  };

  const handleCompleteMeeting = async () => {
    if (selectedMeeting) {
      await updateMeetingStatus(selectedMeeting.id, 'completed');
    }
  };

  const handleApproveMeeting = async (meetingId) => {
    await updateMeetingStatus(meetingId, 'confirmed');
  };

  const handleRejectMeeting = async (meetingId, reason) => {
    await updateMeetingStatus(meetingId, 'rejected', reason);
  };

  // Filter meetings based on selected filter
  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return meetingDate > now && !['canceled', 'rejected'].includes(meeting.status);
    } else if (filter === 'past') {
      return meetingDate < now || ['completed', 'canceled', 'rejected'].includes(meeting.status);
    }
    return true; // 'all' filter
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Check if a meeting is today
  const isToday = (dateString) => {
    const today = new Date();
    const meetingDate = new Date(dateString);
    return (
      meetingDate.getDate() === today.getDate() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getFullYear() === today.getFullYear()
    );
  };

  // View meeting details
  const viewMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
  };

  // Close meeting details modal
  const closeMeetingDetails = () => {
    setSelectedMeeting(null);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      confirmed: 'success',
      completed: 'secondary',
      canceled: 'danger',
      pending: 'warning',
      rejected: 'danger'
    };
    
    const labels = {
      confirmed: 'Confirmed',
      completed: 'Completed',
      canceled: 'Canceled',
      pending: 'Pending Approval',
      rejected: 'Rejected'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} rounded>
        {labels[status] || status}
      </Badge>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
          
          <Card>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    filter === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          className="mb-6"
        />
      )}
      
      {/* Error message */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Meetings List */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {filter === 'upcoming' ? 'Upcoming Meetings' : 
           filter === 'past' ? 'Past Meetings' : 'All Meetings'}
        </h3>
        
        {filteredMeetings.length > 0 ? (
          <div className="space-y-6">
            {filteredMeetings.map((meeting) => (
              <div 
                key={meeting.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => viewMeetingDetails(meeting)}
              >
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                    {meeting.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{meeting.clientName}</p>
                    <p className="text-sm text-gray-500">{meeting.clientEmail}</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-0 flex flex-col sm:items-center">
                  <p className="font-medium text-gray-900">{meeting.meetingName}</p>
                  <p className="text-sm text-gray-500">
                    {isToday(meeting.startTime) ? 'Today' : formatDate(meeting.startTime)}, {formatTime(meeting.startTime)}
                  </p>
                </div>
                
                <div className="mt-3 sm:mt-0 flex items-center">
                  <StatusBadge status={meeting.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewMeetingDetails(meeting);
                    }}
                    className="ml-4 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-base font-medium text-gray-900">No meetings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'upcoming' 
                ? 'You have no upcoming meetings scheduled.' 
                : filter === 'past' 
                ? 'You have no past meetings.' 
                : 'You have no meetings scheduled.'}
            </p>
            <div className="mt-6">
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/create-link'}
              >
                Create Booking Link
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={!!selectedMeeting}
          onClose={closeMeetingDetails}
          title={selectedMeeting.meetingName}
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={closeMeetingDetails}
              >
                Close
              </Button>
              
              {selectedMeeting.status === 'confirmed' && (
                <>
                  <Button
                    variant="success"
                    onClick={handleCompleteMeeting}
                    className="ml-3"
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleCancelMeeting}
                    className="ml-3"
                  >
                    Cancel Meeting
                  </Button>
                </>
              )}
              
              {selectedMeeting.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleApproveMeeting(selectedMeeting.id)}
                    isLoading={approvalLoading}
                    className="ml-3"
                  >
                    Approve Meeting
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectionModal(true)}
                    className="ml-3"
                  >
                    Reject Meeting
                  </Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Client Information</h4>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                    {selectedMeeting.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{selectedMeeting.clientName}</p>
                    <p className="text-sm text-gray-500">{selectedMeeting.clientEmail}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Meeting Details</h4>
                <p className="font-medium text-gray-900">
                  {isToday(selectedMeeting.startTime) ? 'Today' : formatDate(selectedMeeting.startTime)}
                </p>
                <p className="text-gray-500">
                  {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedMeeting.status} />
                </div>
              </div>
            </div>
            
            {selectedMeeting.location && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Location</h4>
                <p className="text-gray-700">{selectedMeeting.location}</p>
              </div>
            )}
            
            {selectedMeeting.meetLink && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Meeting Link</h4>
                <a 
                  href={selectedMeeting.meetLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  Join Google Meet
                </a>
              </div>
            )}
            
            {selectedMeeting.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMeeting.description}</p>
              </div>
            )}
            
            {selectedMeeting.rejectionReason && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{selectedMeeting.rejectionReason}</p>
              </div>
            )}
            
            {selectedMeeting.questions && selectedMeeting.questions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Questionnaire Responses</h4>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {selectedMeeting.questions.map((q, index) => (
                    <div key={index} className="border-l-2 border-indigo-200 pl-4">
                      <p className="text-sm font-medium text-gray-700">{q.question}</p>
                      <p className="text-sm text-gray-600 mt-1">{q.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Calendar Actions</h4>
              <div className="space-x-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={async () => {
                    // Refresh from Google Calendar
                    try {
                      const calendars = await googleCalendarService.getCalendarList();
                      const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];
                      const event = await googleCalendarService.getEvents(primaryCalendar.id, {
                        timeMin: selectedMeeting.startTime,
                        timeMax: selectedMeeting.endTime,
                        q: selectedMeeting.id
                      });
                      setSuccessMessage('Meeting refreshed from Google Calendar');
                    } catch (err) {
                      setError('Failed to refresh meeting');
                    }
                  }}
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Refresh from Calendar
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Meeting Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Meeting"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
            >
              Keep Meeting
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancelMeeting}
              isLoading={cancelLoading}
              className="ml-3"
            >
              {cancelLoading ? 'Canceling...' : 'Yes, Cancel Meeting'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            <div className="flex">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Are you sure you want to cancel this meeting?</p>
            </div>
          </div>
          
          {selectedMeeting && (
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Meeting:</span> {selectedMeeting.meetingName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Client:</span> {selectedMeeting.clientName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Date & Time:</span> {formatDate(selectedMeeting.startTime)}, {formatTime(selectedMeeting.startTime)}
              </p>
            </div>
          )}
          
          <p className="text-gray-500 text-sm">
            Canceling this meeting will remove it from your Google Calendar.
          </p>
        </div>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Reject Meeting"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowRejectionModal(false)}
              disabled={approvalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRejectMeeting(selectedMeeting.id, rejectionReason)}
              isLoading={approvalLoading}
              className="ml-3"
            >
              {approvalLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
            <div className="flex">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Are you sure you want to reject this meeting request?</p>
            </div>
          </div>
          
          {selectedMeeting && (
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Meeting:</span> {selectedMeeting.meetingName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Client:</span> {selectedMeeting.clientName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Date & Time:</span> {formatDate(selectedMeeting.startTime)}, {formatTime(selectedMeeting.startTime)}
              </p>
            </div>
          )}
          
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (optional)
            </label>
            <textarea
              id="rejectionReason"
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Provide a reason for rejecting this meeting..."
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              This reason will be included in the notification to the client.
            </p>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}