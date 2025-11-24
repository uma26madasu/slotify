const express = require('express');
const router = express.Router();

console.log('📝 Loading Microsoft routes...');

// Import controllers
const microsoftAuthController = require('../controllers/microsoftAuthController');
const microsoftCalendarController = require('../controllers/microsoftCalendarController');

console.log('✅ Microsoft controllers imported');

// Auth routes
router.get('/auth/url', microsoftAuthController.getMicrosoftOAuthUrl);
router.post('/auth/callback', microsoftAuthController.handleMicrosoftCallback);
router.get('/auth/status', microsoftAuthController.checkMicrosoftOAuthStatus);

// Calendar routes
router.get('/calendar/events', microsoftCalendarController.getMicrosoftCalendarEvents);
router.get('/calendar/calendars', microsoftCalendarController.getMicrosoftCalendars);
router.post('/calendar/events', microsoftCalendarController.createMicrosoftEvent);
router.post('/calendar/check-conflicts', microsoftCalendarController.checkMicrosoftConflicts);

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Microsoft routes are working',
    availableEndpoints: [
      'GET /api/microsoft/auth/url - Get Microsoft OAuth URL',
      'POST /api/microsoft/auth/callback - Handle OAuth callback',
      'GET /api/microsoft/auth/status?email=... - Check connection status',
      'GET /api/microsoft/calendar/events?email=... - Get calendar events',
      'GET /api/microsoft/calendar/calendars?email=... - Get calendars',
      'POST /api/microsoft/calendar/events - Create event',
      'POST /api/microsoft/calendar/check-conflicts - Check for conflicts'
    ],
    configured: {
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common'
    },
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Microsoft routes configured successfully');

module.exports = router;
