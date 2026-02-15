const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'CONSENT_GIVEN',
      'CONSENT_REVOKED',
      'TWO_FACTOR_ENABLE',
      'TWO_FACTOR_DISABLE',
      'DATA_EXPORT',
      'DATA_DELETION_REQUEST',
      'TEAM_CREATE',
      'TEAM_UPDATE',
      'TEAM_DELETE',
      'RESOURCE_BOOKING',
      'RESOURCE_CANCELLATION',
      'CALENDAR_SYNC',
      'CALENDAR_DISCONNECT'
    ]
  },
  resourceId: {
    type: String,
    required: false
  },
  resourceType: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: '365d' // Auto-expire logs after 1 year for compliance/storage management, adjustable
  }
}, {
  timestamps: true
});

// Index for querying logs by user or acton
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
