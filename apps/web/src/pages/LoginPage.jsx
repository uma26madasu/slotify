import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Alert, Badge, Modal, EmptyState } from '../components/UI';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Initialize calendar localizer
const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingApprovals: 0,
    completedMeetings: 0
  });

  // Fetch user's bookings and links
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userId = auth.currentUser?.uid;
        
        // In a real app, these would be API calls
        const mockBookings = [
          {
            id: '1',
            linkId: '1',
            ownerId: userId,
            clientName: 'John Smith',
            clientEmail: 'john@example.com',
            meetingName: 'Initial Consultation',
            startTime: new Date(Date.now() + 86400000), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 1800000), // 30 mins later
            status: 'confirmed',
            approvalStatus: 'approved',
            questions: [
              { question: 'What topics would you like to discuss?', answer: 'Product strategy' }
            ]
          },
          {
            id: '2',
            linkId: '2',
            ownerId: userId,
            clientName: 'Sarah Johnson',
            clientEmail: 'sarah@example.com',
            meetingName: 'Follow-up Session',
            startTime: new Date(Date.now() + 172800000), // 2 days from now
            endTime: new Date(Date.now() + 172800000 + 3600000), // 1 hour later
            status: 'pending',
            approvalStatus: 'pending',
            questions: [
              { question: 'What topics would you like to discuss?', answer: 'Marketing plan' }
            ]
          }
        ];

        const mockLinks = [
          {
            id: '1',
            linkId: 'abc123',
            ownerId: userId,
            meetingName: 'Initial Consultation',
            meetingLength: 30,
            requiresApproval: false,
            usageCount: 5
          },
          {
            id: '2',
            linkId: 'def456',
            ownerId: userId,
            meetingName: 'Follow-up Session',
            meetingLength: 60,
            requiresApproval: true,
            usageCount: 2
          }
        ];

        setBookings(mockBookings);
        setLinks(mockLinks);
        
        // Calculate stats
        setStats({
          totalBookings: mockBookings.length,
          pendingApprovals: mockBookings.filter(b => b.approvalStatus === 'pending').length,
          completedMeetings: mockBookings.filter(b => b.status === 'completed').length
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle booking approval/rejection
  const handleBookingAction = async (action) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const updatedBookings = bookings.map(booking => {
        if (booking.id === selectedBooking.id) {
          return {
            ...booking,
            approvalStatus: action,
            status: action === 'approved' ? 'confirmed' : 'canceled',
            [action === 'approved' ? 'approvedBy' : 'rejectedBy']: auth.currentUser.uid,
            [action === 'approved' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString()
          };
        }
        return booking;
      });
      
      setBookings(updatedBookings);
      setShowApprovalModal(false);
      setSelectedBooking(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingApprovals: updatedBookings.filter(b => b.approvalStatus === 'pending').length
      }));
      
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return booking.status !== 'completed' && new Date(booking.startTime) > now;
      case 'pending':
        return booking.approvalStatus === 'pending';
      case 'past':
        return booking.status === 'completed' || new Date(booking.startTime) < now;
      default:
        return true;
    }
  });

  // Calendar events for the calendar view
  const calendarEvents = bookings.map(booking => ({
    id: booking.id,
    title: `${booking.meetingName} with ${booking.clientName}`,
    start: new Date(booking.startTime),
    end: new Date(booking.endTime),
    status: booking.status,
    approvalStatus: booking.approvalStatus
  }));

  // Event style for calendar
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3182ce'; // Default blue for confirmed
    if (event.approvalStatus === 'pending') backgroundColor = '#ed8936'; // Orange
    if (event.status === 'completed') backgroundColor = '#38a169'; // Green
    if (event.status === 'canceled') backgroundColor = '#e53e3e'; // Red
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <MainLayout>
      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {activeTab === 'upcoming' ? 'Your upcoming meetings' : 
             activeTab === 'pending' ? 'Meetings awaiting approval' : 
             'Your past meetings'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button onClick={() => setShowCreateModal(true)}>
            Create Booking Link
          </Button>
          <Button variant="secondary" onClick={() => navigate('/availability')}>
            Set Availability
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalBookings}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Completed Meetings</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.completedMeetings}</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Pending Approval
            {stats.pendingApprovals > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Past Meetings
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Calendar View
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'calendar' ? (
        <Card className="p-4 h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => {
              const booking = bookings.find(b => b.id === event.id);
              setSelectedBooking(booking);
            }}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.meetingName} with {booking.clientName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {moment(booking.startTime).format('MMMM Do YYYY, h:mm a')} -{' '}
                        {moment(booking.endTime).format('h:mm a')}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <Badge
                          variant={
                            booking.approvalStatus === 'pending' ? 'warning' :
                            booking.status === 'confirmed' ? 'success' :
                            booking.status === 'canceled' ? 'error' : 'default'
                          }
                        >
                          {booking.approvalStatus === 'pending' ? 'Pending Approval' :
                           booking.status === 'confirmed' ? 'Confirmed' :
                           booking.status === 'canceled' ? 'Canceled' : 'Completed'}
                        </Badge>
                        {booking.approvalStatus === 'approved' && booking.approvedAt && (
                          <Badge variant="success">
                            Approved {moment(booking.approvedAt).fromNow()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          if (booking.approvalStatus === 'pending') {
                            setShowApprovalModal(true);
                          } else {
                            navigate(`/booking/${booking.id}`);
                          }
                        }}
                      >
                        {booking.approvalStatus === 'pending' ? 'Review' : 'Details'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${booking.clientEmail}`}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title={`No ${activeTab} meetings found`}
              description={`You don't have any ${activeTab} meetings scheduled yet.`}
              icon={
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          )}
        </div>
      )}

      {/* Booking Links Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Booking Links</h2>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            Create New Link
          </Button>
        </div>
        
        {links.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map(link => (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{link.meetingName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {link.meetingLength} min • {link.requiresApproval ? 'Approval Required' : 'Auto-confirm'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {link.usageCount} {link.usageCount === 1 ? 'booking' : 'bookings'}
                    </Badge>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/link/${link.linkId}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(`https://slotify.app/book/${link.linkId}`)}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No booking links created yet"
            description="Create your first booking link to start accepting meetings."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                Create Booking Link
              </Button>
            }
            icon={
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
        )}
      </div>

      {/* Create Link Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Booking Link"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Create a customized link that clients can use to book meetings with you.
          </p>
          <Button
            fullWidth
            onClick={() => {
              setShowCreateModal(false);
              navigate('/create-link');
            }}
          >
            Create Custom Link
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowCreateModal(false);
              navigate('/create-link/quick');
            }}
          >
            Quick Create
          </Button>
        </div>
      </Modal>

      {/* Approval Modal */}
      {selectedBooking && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedBooking(null);
          }}
          title="Review Booking Request"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900">Meeting Details</h4>
              <p className="mt-1 text-gray-600">
                {selectedBooking.meetingName} with {selectedBooking.clientName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {moment(selectedBooking.startTime).format('MMMM Do YYYY, h:mm a')} -{' '}
                {moment(selectedBooking.endTime).format('h:mm a')}
              </p>
            </div>
            
            {selectedBooking.questions && selectedBooking.questions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Client Responses</h4>
                <div className="mt-2 space-y-3">
                  {selectedBooking.questions.map((q, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">{q.question}</p>
                      <p className="mt-1 text-gray-600">{q.answer || 'No response'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="error"
                onClick={() => handleBookingAction('rejected')}
                disabled={isLoading}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleBookingAction('approved')}
                disabled={isLoading}
              >
                Approve
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

export default Dashboard;