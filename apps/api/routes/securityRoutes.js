const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware

// 2FA Routes
router.post('/2fa/setup', protect, securityController.setupTwoFactor);
router.post('/2fa/verify', protect, securityController.verifyTwoFactor);
router.post('/2fa/disable', protect, securityController.disableTwoFactor);

// Compliance Routes (GDPR/HIPAA)
router.get('/data/export', protect, securityController.exportUserData);
router.post('/data/delete', protect, securityController.deleteUserData);
router.put('/consent', protect, securityController.updateConsent);

module.exports = router;
