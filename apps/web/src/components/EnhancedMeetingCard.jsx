

import React, { useState } from 'react';
import { 
  Clock, Users, Video, MapPin, Eye, Edit, Trash2, 
  CheckCircle, AlertCircle, XCircle, Phone, Building,
  ExternalLink, Copy, Calendar, MoreVertical
} from 'lucide-react';

const EnhancedMeetingCard = ({ meeting, onViewDetails, onEdit, onDelete }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-green-600" />;
      case 'phone': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'in-person': return <Building className="h-4 w-4 text-purple-600" />;
      default: return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleJoinMeeting = () => {
    if (meeting.hangoutLink) {
      window.open(meeting.hangoutLink, '_blank');
    } else {
      alert('No meeting link available');
    }
  };

  const handleCopyLink = () => {
    if (meeting.hangoutLink) {
      navigator.clipboard.writeText(meeting.hangoutLink);
      alert('Meeting link copied to clipboard!');
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Meeting Title & Platform */}
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{meeting.title}</h3>
            {meeting.platform && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                {meeting.platform === 'google' ? '📅 Google' : meeting.platform}
              </span>
            )}
          </div>
          
          {/* Description */}
          {meeting.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{meeting.description}</p>
          )}
          
          {/* Meeting Details */}
          <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-600">
            {/* Time */}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-medium">{meeting.time}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDateTime(meeting.start)}</span>
            </div>
            
            {/* Attendees with Tooltip */}
            <div 
              className="flex items-center relative cursor-pointer"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Users className="h-4 w-4 mr-1" />
              <span className="hover:text-blue-600 transition-colors font-medium">
                {(meeting.attendees?.length || 0) + (meeting.organizer ? 1 : 0)} attendees
              </span>
              
              {/* Attendees Tooltip */}
              {showTooltip && (meeting.attendees?.length > 0 || meeting.organizer) && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 z-20 shadow-lg">
                  <div className="font-medium mb-2 text-blue-300">👥 Meeting Attendees:</div>
                  
                  {/* Organizer */}
                  {meeting.organizer && (
                    <div className="flex items-center mb-2 p-1 bg-gray-800 rounded">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="font-medium text-green-300">
                          {meeting.organizer.displayName || meeting.organizer.email}
                        </div>
                        <div className="text-gray-400 text-xs">Organizer</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Attendees */}
                  {meeting.attendees?.map((attendee, index) => (
                    <div key={index} className="flex items-center mb-1 p-1 rounded">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        attendee.responseStatus === 'accepted' ? 'bg-green-400' :
                        attendee.responseStatus === 'declined' ? 'bg-red-400' :
                        attendee.responseStatus === 'tentative' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {attendee.displayName || attendee.email}
                        </div>
                        <div className="text-gray-400 text-xs capitalize">
                          {attendee.responseStatus || 'pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span>🟢 Accepted</span>
                      <span>🟡 Tentative</span>
                      <span>🔴 Declined</span>
                      <span>⚪ Pending</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Type */}
            <div className="flex items-center">
              {getLocationIcon(meeting.type)}
              <span className="ml-1 capitalize">{meeting.type}</span>
            </div>
          </div>
          
          {/* Status and Actions Row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                {getStatusIcon(meeting.status)}
                <span className="ml-1 capitalize">{meeting.status}</span>
              </span>
              
              {/* Location Text */}
              {meeting.location && !meeting.hangoutLink && meeting.location !== 'video-call' && (
                <span className="text-xs text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {meeting.location.length > 30 ? meeting.location.substring(0, 30) + '...' : meeting.location}
                </span>
              )}
            </div>
            
            {/* Quick Actions for Video Meetings */}
            {meeting.hangoutLink && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleJoinMeeting}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Join
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Copy meeting link"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {/* Dropdown Menu */}
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button 
                onClick={() => {
                  onViewDetails(meeting);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button 
                onClick={() => {
                  onEdit(meeting);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Meeting
              </button>
              <hr className="my-1" />
              <button 
                onClick={() => {
                  onDelete(meeting);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Meeting
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default EnhancedMeetingCard;