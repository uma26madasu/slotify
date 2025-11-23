const express = require('express');
const router = express.Router();

console.log('📝 Loading ChainSync routes...');

const alertSchedulingController = require('../controllers/alertSchedulingController');

// ============================================
// CHAINSYNC INTEGRATION API ENDPOINTS
// ============================================

// Health check for ChainSync
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Slotify ChainSync Integration',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      scheduleMeeting: 'POST /api/chainsync/schedule-meeting',
      getMeetings: 'GET /api/chainsync/meetings',
      getMeetingByAlert: 'GET /api/chainsync/meetings/:alertId',
      updateMeetingStatus: 'PATCH /api/chainsync/meetings/:meetingId/status',
      authorities: 'GET/POST /api/chainsync/authorities',
      config: 'GET/POST /api/chainsync/config'
    }
  });
});

// ============================================
// MEETING SCHEDULING (Main ChainSync endpoint)
// ============================================

/**
 * Schedule a meeting from ChainSync alert
 *
 * POST /api/chainsync/schedule-meeting
 *
 * Request Body:
 * {
 *   "alertId": "CHAIN-2024-001",
 *   "alertType": "fire",
 *   "severity": "high",
 *   "location": {
 *     "region": "North District",
 *     "city": "Mumbai",
 *     "coordinates": { "latitude": 19.076, "longitude": 72.8777 }
 *   },
 *   "description": "Large fire detected in industrial area",
 *   "affectedArea": "Industrial Zone B",
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "source": "sensor"
 * }
 */
router.post('/schedule-meeting', alertSchedulingController.scheduleMeetingFromAlert);

// ============================================
// MEETING MANAGEMENT
// ============================================

// Get all alert meetings with filters
router.get('/meetings', alertSchedulingController.getAllAlertMeetings);

// Get meetings for specific alert
router.get('/meetings/:alertId', alertSchedulingController.getMeetingsByAlert);

// Update meeting status
router.patch('/meetings/:meetingId/status', alertSchedulingController.updateMeetingStatus);

// ============================================
// AUTHORITY MANAGEMENT
// ============================================

/**
 * Create/Update authority
 *
 * POST /api/chainsync/authorities
 *
 * Request Body:
 * {
 *   "name": "John Smith",
 *   "email": "john.smith@fire.gov",
 *   "phone": "+91-9876543210",
 *   "role": "fire_chief",
 *   "department": "fire",
 *   "title": "Chief Fire Officer",
 *   "jurisdiction": {
 *     "region": "North District",
 *     "city": "Mumbai",
 *     "state": "Maharashtra",
 *     "country": "India"
 *   },
 *   "alertTypes": ["fire", "industrial_accident", "chemical_spill"],
 *   "priority": 1,
 *   "availability": {
 *     "emergencyAvailable": true
 *   }
 * }
 */
router.post('/authorities', alertSchedulingController.upsertAuthority);

// Get authorities with filters
router.get('/authorities', alertSchedulingController.getAuthorities);

// Delete/deactivate authority
router.delete('/authorities/:id', alertSchedulingController.deleteAuthority);

// ============================================
// ALERT CONFIGURATION
// ============================================

/**
 * Create/Update alert configuration
 *
 * POST /api/chainsync/config
 *
 * Request Body:
 * {
 *   "alertType": "fire",
 *   "severityConfig": {
 *     "high": {
 *       "autoSchedule": true,
 *       "meetingDuration": 60,
 *       "requiredDepartments": ["fire", "medical", "police"],
 *       "emergencyOverride": true
 *     }
 *   }
 * }
 */
router.post('/config', alertSchedulingController.upsertAlertConfig);

// Get all alert configurations
router.get('/config', alertSchedulingController.getAlertConfigs);

console.log('✅ ChainSync routes loaded');

module.exports = router;
