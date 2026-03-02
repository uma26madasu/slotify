const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsNotificationController');
const { protect } = require('../middleware/auth');

// Teams notification webhook management
router.post('/webhook', protect, teamsController.saveWebhook);
router.delete('/webhook', protect, teamsController.removeWebhook);

// Status and testing
router.get('/status', protect, teamsController.status);
router.post('/test', protect, teamsController.testNotification);
router.post('/send', protect, teamsController.sendNotification);

module.exports = router;
