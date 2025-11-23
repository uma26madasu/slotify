const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },

  // Role & Department
  role: {
    type: String,
    required: true,
    enum: [
      'fire_chief',
      'police_chief',
      'medical_director',
      'emergency_coordinator',
      'district_collector',
      'mayor',
      'public_health_officer',
      'disaster_management_officer',
      'utility_director',
      'transportation_director',
      'environmental_officer',
      'other'
    ]
  },
  department: {
    type: String,
    required: true,
    enum: [
      'fire',
      'police',
      'medical',
      'emergency_management',
      'administration',
      'public_health',
      'utilities',
      'transportation',
      'environmental',
      'other'
    ]
  },
  title: {
    type: String // e.g., "Fire Chief", "District Collector"
  },

  // Jurisdiction
  jurisdiction: {
    region: {
      type: String,
      required: true // e.g., "North District", "Zone A"
    },
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Alert Types this authority handles
  alertTypes: [{
    type: String,
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
  }],

  // Priority for scheduling (lower = higher priority)
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },

  // Google Calendar Integration
  googleCalendar: {
    connected: {
      type: Boolean,
      default: false
    },
    calendarId: String,
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date
  },

  // Availability preferences
  availability: {
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5] // Monday to Friday
    },
    emergencyAvailable: {
      type: Boolean,
      default: true // Available 24/7 for emergencies
    }
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
authoritySchema.index({ 'jurisdiction.region': 1, department: 1 });
authoritySchema.index({ alertTypes: 1 });
authoritySchema.index({ email: 1 });

// Update timestamp on save
authoritySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Authority', authoritySchema);
