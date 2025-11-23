const mongoose = require('mongoose');

const alertMeetingSchema = new mongoose.Schema({
  // ChainSync Alert Reference
  alertId: {
    type: String,
    required: true,
    index: true
  },

  // Alert Details (from ChainSync)
  alertDetails: {
    type: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    location: {
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      address: String
    },
    description: String,
    affectedArea: String,
    timestamp: Date,
    source: String // sensor, prediction, manual
  },

  // Meeting Details
  meeting: {
    title: String,
    description: String,
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: Number, // minutes
    location: String,
    googleMeetLink: String,
    googleEventId: String,
    calendarId: String
  },

  // Attendees
  attendees: [{
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authority'
    },
    email: String,
    name: String,
    role: String,
    department: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending'
    },
    notifiedAt: Date,
    respondedAt: Date
  }],

  // Scheduling Info
  scheduling: {
    scheduledAt: {
      type: Date,
      default: Date.now
    },
    scheduledBy: {
      type: String,
      default: 'chainsync_auto'
    },
    emergencyOverride: {
      type: Boolean,
      default: false
    },
    conflictsIgnored: [{
      authorityEmail: String,
      conflictingEvent: String
    }]
  },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },

  // Escalation tracking
  escalation: {
    escalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedTo: [String],
    reason: String
  },

  // Notes and updates
  notes: [{
    content: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
alertMeetingSchema.index({ 'alertDetails.severity': 1 });
alertMeetingSchema.index({ 'meeting.startTime': 1 });
alertMeetingSchema.index({ status: 1 });
alertMeetingSchema.index({ createdAt: -1 });

// Update timestamp
alertMeetingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AlertMeeting', alertMeetingSchema);
