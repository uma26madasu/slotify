const express = require('express');
const router = express.Router();

console.log('📝 Loading Google Calendar routes...');

// Import controller
const googleCalendarController = require('../controllers/googleCalendarController');

console.log('✅ Google Calendar controller imported');

// Define routes
router.get('/events', googleCalendarController.getCalendarEvents);
router.post('/events', googleCalendarController.createCalendarEvent);
router.get('/calendars', googleCalendarController.getCalendars);
router.post('/check-conflicts', googleCalendarController.checkConflicts);

// Alternative routes for compatibility
router.get('/', googleCalendarController.getCalendarEvents);

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Google Calendar routes are working',
    availableEndpoints: [
      'GET /api/calendar/events?email=user@email.com',
      'POST /api/calendar/events (body: { email, event })',
      'GET /api/calendar/calendars?email=user@email.com',
      'POST /api/calendar/check-conflicts'
    ],
    controllerMethods: Object.keys(googleCalendarController),
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Google Calendar routes configured successfully');

module.exports = router;