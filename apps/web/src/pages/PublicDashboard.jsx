import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/UI';

export default function PublicDashboard() {
  const navigate = useNavigate();

  // Demo meetings to showcase the app
  const demoMeetings = [
    {
      id: 1,
      title: 'Initial Consultation with John Smith',
      date: 'May 23rd 2025, 6:10 pm - 6:40 pm',
      status: 'Confirmed',
      statusColor: 'success'
    },
    {
      id: 2,
      title: 'Follow-up Session with Sarah Johnson',
      date: 'May 24th 2025, 6:10 pm - 7:10 pm',
      status: 'Pending Approval',
      statusColor: 'warning'
    }
  ];

  const stats = {
    totalBookings: 2,
    pendingApprovals: 1,
    completedMeetings: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Slotify</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Slotify
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage your schedule and meeting links in one place.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
            >
              Create Booking Link
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/signup')}
            >
              Set Availability
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Dashboard
          </h3>
          <p className="text-gray-600 mb-8">Your upcoming meetings</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Completed Meetings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedMeetings}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600">
                Upcoming
              </button>
              <button className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Pending Approval
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">1</span>
              </button>
              <button className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Past Meetings
              </button>
              <button className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Calendar View
              </button>
            </nav>
          </div>

          {/* Demo Meetings */}
          <div className="space-y-4">
            {demoMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-gray-600">{meeting.date}</p>
                    <div className="mt-3">
                      <Badge 
                        variant={meeting.statusColor}
                        rounded
                      >
                        {meeting.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/login')}
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/login')}
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">Create booking links and let clients schedule meetings at their convenience</p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability Management</h3>
            <p className="text-gray-600">Set your availability and avoid double bookings with calendar sync</p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Approvals</h3>
            <p className="text-gray-600">Review and approve meetings before they're confirmed</p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to streamline your scheduling?</h3>
          <p className="text-lg mb-6">Join thousands of professionals who trust Slotify for their meeting management</p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-indigo-600 hover:bg-gray-100"
          >
            Get Started Free
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">&copy; 2025 Slotify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}