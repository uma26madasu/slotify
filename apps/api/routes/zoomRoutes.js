const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');
const { protect } = require('../middleware/auth');

// Create a Zoom meeting
router.post('/meetings', protect, zoomController.createMeeting);

// Get a specific Zoom meeting
router.get('/meetings/:meetingId', protect, zoomController.getMeeting);

// Delete a Zoom meeting
router.delete('/meetings/:meetingId', protect, zoomController.deleteMeeting);

module.exports = router;
