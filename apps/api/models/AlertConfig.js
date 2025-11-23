const mongoose = require('mongoose');

const alertConfigSchema = new mongoose.Schema({
  // Alert Type Configuration
  alertType: {
    type: String,
    required: true,
    enum: [
      'fire',
      'flood',
      'earthquake',
      'cyclone',
      'industrial_accident',
      'chemical_spill',
      'disease_outbreak',
      'power_outage',
      'water_contamination',
      'traffic_emergency',
      'civil_unrest',
      'terrorist_threat',
      'other'
    ]
  },

  // Severity levels and their configurations
  severityConfig: {
    low: {
      autoSchedule: { type: Boolean, default: false },
      meetingDuration: { type: Number, default: 30 }, // minutes
      requiredDepartments: [String],
      notificationOnly: { type: Boolean, default: true }
    },
    medium: {
      autoSchedule: { type: Boolean, default: true },
      meetingDuration: { type: Number, default: 45 },
      requiredDepartments: [String],
      notificationOnly: { type: Boolean, default: false }
    },
    high: {
      autoSchedule: { type: Boolean, default: true },
      meetingDuration: { type: Number, default: 60 },
      requiredDepartments: [String],
      emergencyOverride: { type: Boolean, default: true }, // Ignore calendar conflicts
      notificationOnly: { type: Boolean, default: false }
    },
    critical: {
      autoSchedule: { type: Boolean, default: true },
      meetingDuration: { type: Number, default: 90 },
      requiredDepartments: [String],
      emergencyOverride: { type: Boolean, default: true },
      immediateNotification: { type: Boolean, default: true },
      notificationOnly: { type: Boolean, default: false }
    }
  },

  // Region-specific configurations
  regionConfig: [{
    region: String,
    additionalDepartments: [String], // Extra departments for this region
    primaryContactRole: String // Role of the primary contact
  }],

  // Meeting defaults
  meetingDefaults: {
    title: {
      type: String,
      default: 'Emergency Response Meeting - {alertType}'
    },
    description: {
      type: String,
      default: 'Emergency meeting scheduled by ChainSync alert system.\n\nAlert Type: {alertType}\nSeverity: {severity}\nLocation: {location}\n\nPlease join immediately.'
    },
    location: {
      type: String,
      default: 'Virtual - Google Meet'
    },
    addGoogleMeet: {
      type: Boolean,
      default: true
    }
  },

  // Escalation rules
  escalation: {
    enabled: { type: Boolean, default: true },
    escalateAfterMinutes: { type: Number, default: 15 },
    escalateTo: [String] // Roles to escalate to
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

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

// Index for efficient querying
alertConfigSchema.index({ alertType: 1 });
alertConfigSchema.index({ isActive: 1 });

module.exports = mongoose.model('AlertConfig', alertConfigSchema);
