// src/components/MeetingDetailsModal.jsx
import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Phone, 
  Mail, 
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  User,
  Globe,
  FileText,
  Tag
} from 'lucide-react';

const MeetingDetailsModal = ({ meeting, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !meeting) return null;

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getDuration = () => {
    if (meeting.isAllDay) return 'All day';
    const start = new Date(meeting.start);
    const end = new Date(meeting.end);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformInfo = (meeting) => {
    // Determine which platform this meeting is from
    if (meeting.platform === 'google' || meeting.htmlLink?.includes('google.com')) {
      return { platform: 'Google Calendar', color: 'text-blue-600', icon: '📅' };
    }
    if (meeting.platform === 'outlook') {
      return { platform: 'Outlook Calendar', color: 'text-blue-800', icon: '📧' };
    }
    if (meeting.platform === 'apple') {
      return { platform: 'Apple Calendar', color: 'text-gray-800', icon: '🍎' };
    }
    // Future: Add more platforms
    return { platform: 'Calendar', color: 'text-gray-600', icon: '📅' };
  };

  const startDateTime = formatDateTime(meeting.start);
  const endDateTime = formatDateTime(meeting.end);
  const duration = getDuration();
  const platformInfo = getPlatformInfo(meeting);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{platformInfo.icon}</span>
                <span className={`text-sm font-medium ${platformInfo.color}`}>
                  {platformInfo.platform}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {meeting.status || 'Confirmed'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h2>
              {meeting.description && (
                <p className="text-gray-600 text-sm line-clamp-3">{meeting.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Date & Time</h3>
                <p className="text-gray-600">{startDateTime.date}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-600">{startDateTime.time} - {endDateTime.time}</span>
                  <span className="text-sm text-gray-500">({duration})</span>
                </div>
                {meeting.isAllDay && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    All Day Event
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Location & Meeting Links */}
          {(meeting.location || meeting.hangoutLink) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                  
                  {meeting.hangoutLink && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Video className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Google Meet</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={meeting.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <span className="truncate max-w-xs">{meeting.hangoutLink}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(meeting.hangoutLink)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {meeting.location && !meeting.location.includes('meet.google.com') && (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Physical Location</span>
                      </div>
                      <p className="text-gray-600 text-sm">{meeting.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Attendees ({meeting.attendees.length + (meeting.organizer ? 1 : 0)})
                  </h3>
                  
                  {/* Organizer */}
                  {meeting.organizer && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {meeting.organizer.displayName || meeting.organizer.email}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          Organizer
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Other Attendees */}
                  <div className="space-y-2">
                    {meeting.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-900">
                          {attendee.displayName || attendee.email}
                        </span>
                        {attendee.responseStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            attendee.responseStatus === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : attendee.responseStatus === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendee.responseStatus}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {meeting.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-wrap">
                    {meeting.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting ID & Links */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">Meeting Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meeting ID:</span>
                    <span className="text-gray-900 font-mono text-xs">{meeting.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created by:</span>
                    <span className="text-gray-900">
                      {meeting.creator?.displayName || meeting.creator?.email || 'Unknown'}
                    </span>
                  </div>
                  {meeting.updated && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last updated:</span>
                      <span className="text-gray-900">
                        {new Date(meeting.updated).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {meeting.htmlLink && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">View in Calendar:</span>
                      <a
                        href={meeting.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Open <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Platform: {platformInfo.platform}
          </div>
          <div className="flex space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(meeting)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center text-sm transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit in Calendar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsModal;