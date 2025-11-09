// File Path: src/components/MeetingCreationModal.jsx
// Create this NEW file in your components folder

import React, { useState } from 'react';
import { Plus, XCircle, Calendar, Clock, Users, MapPin, Video, Phone, Building } from 'lucide-react';

const MeetingCreationModal = ({ isOpen, onClose, onCreateMeeting }) => {
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    location: 'video-call'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setMeetingData({
      ...meetingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onCreateMeeting(meetingData);
      onClose();
      // Reset form
      setMeetingData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        attendees: '',
        location: 'video-call'
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationIcon = (locationType) => {
    switch (locationType) {
      case 'video-call': return <Video className="h-4 w-4" />;
      case 'phone-call': return <Phone className="h-4 w-4" />;
      case 'in-person': return <Building className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Schedule New Meeting</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Meeting Title *
            </label>
            <input
              type="text"
              name="title"
              value={meetingData.title}
              onChange={handleInputChange}
              placeholder="e.g., Team Standup, Client Call"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={meetingData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Meeting agenda, notes, or additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={meetingData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={meetingData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={meetingData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Attendees (Optional)
            </label>
            <input
              type="text"
              name="attendees"
              value={meetingData.attendees}
              onChange={handleInputChange}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getLocationIcon(meetingData.location)}
              <span className="ml-1">Location</span>
            </label>
            <select
              name="location"
              value={meetingData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="video-call">📹 Video Call (Google Meet)</option>
              <option value="phone-call">📞 Phone Call</option>
              <option value="in-person">🏢 In Person</option>
              <option value="custom">📍 Custom Location</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Creating...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingCreationModal;