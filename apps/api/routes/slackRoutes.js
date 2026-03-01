const express = require('express');
const router = express.Router();
const slackController = require('../controllers/slackController');
const { protect } = require('../middleware/auth');

// OAuth installation flow (no auth required – user initiates from settings page)
router.get('/install', slackController.install);
router.get('/callback', slackController.callback);

// Protected Slack management endpoints
router.get('/status', protect, slackController.status);
router.delete('/disconnect', protect, slackController.disconnect);
router.post('/test', protect, slackController.testMessage);
router.post('/notify', protect, slackController.sendNotification);

module.exports = router;
