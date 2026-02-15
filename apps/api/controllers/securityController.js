const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { logAudit } = require('../utils/auditLogger');

// 1. Setup 2FA - Generate Secret & QR Code
exports.setupTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('+twoFactorSecret +tempTwoFactorSecret');

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate unique secret for this user (if not already set or restarting setup)
        const secret = authenticator.generateSecret();

        // Save temporarily until verified
        user.tempTwoFactorSecret = secret;
        await user.save();

        // Generate QR Code URL
        const otpauth = authenticator.keyuri(user.email, 'Slotify', secret);
        const imageUrl = await qrcode.toDataURL(otpauth);

        res.json({
            secret: secret,
            qrCode: imageUrl
        });

        // Audit log
        logAudit({
            userId: user._id,
            action: 'TWO_FACTOR_SETUP_INIT',
            req
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error setting up 2FA' });
    }
};

// 2. Verify & Enable 2FA
exports.verifyTwoFactor = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.userId).select('+tempTwoFactorSecret');

        if (!user || !user.tempTwoFactorSecret) {
            return res.status(400).json({ message: '2FA setup not initiated' });
        }

        const isValid = authenticator.verify({ token, secret: user.tempTwoFactorSecret });

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Enable 2FA
        user.twoFactorSecret = user.tempTwoFactorSecret;
        user.isTwoFactorEnabled = true;
        user.tempTwoFactorSecret = undefined; // Clear temp secret

        // Generate backup codes (simple random strings for now)
        // In production, encrypt these or hash them
        const codes = Array.from({ length: 5 }, () => Math.random().toString(36).substr(2, 8).toUpperCase());
        user.backupCodes = codes;

        await user.save();

        res.json({
            message: '2FA enabled successfully',
            backupCodes: codes
        });

        logAudit({
            userId: user._id,
            action: 'TWO_FACTOR_ENABLE',
            req
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error verifying 2FA' });
    }
};

// 3. Disable 2FA
exports.disableTwoFactor = async (req, res) => {
    try {
        const { password } = req.body; // In a real app, verify password first!
        // Since we use Google OAuth primarily, we might ask for a fresh Google Token or just trust the session for now (MVP)

        const user = await User.findById(req.user.userId);
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.backupCodes = [];
        await user.save();

        res.json({ message: '2FA disabled' });

        logAudit({
            userId: user._id,
            action: 'TWO_FACTOR_DISABLE',
            req
        });

    } catch (err) {
        res.status(500).json({ message: 'Error disabling 2FA' });
    }
};

// 4. Export User Data (GDPR)
exports.exportUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        // Fetch related data
        const bookings = await require('../models/Booking').find({ user: user._id });
        const auditLogs = await AuditLog.find({ userId: user._id });

        const exportData = {
            profile: user.toJSON(),
            activity: bookings,
            securityLogs: auditLogs,
            exportedAt: new Date()
        };

        res.json(exportData);

        logAudit({
            userId: user._id,
            action: 'DATA_EXPORT',
            req
        });

    } catch (err) {
        res.status(500).json({ message: 'Error exporting data' });
    }
};

// 5. Delete User Data (Right to be Forgotten)
exports.deleteUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        // Soft delete or anonymize
        user.email = `deleted_${user._id}@deleted.slotify.com`;
        user.name = 'Deleted User';
        user.googleId = undefined;
        user.tokens = undefined;
        user.isActive = false;
        await user.save();

        // Optionally delete bookings or anonymize them

        res.json({ message: 'Account deleted/anonymized' });

        logAudit({
            userId: user._id, // This user ID still exists on the record
            action: 'DATA_DELETION_REQUEST',
            req
        });

    } catch (err) {
        res.status(500).json({ message: 'Error deleting account' });
    }
};

// 6. Update Consent
exports.updateConsent = async (req, res) => {
    try {
        const { type, status } = req.body; // type: 'marketing' | 'dataProcessing' | 'hipaaAcknowledgment'

        const user = await User.findById(req.user.userId);

        if (user.consents && user.consents[type]) {
            user.consents[type] = {
                given: status,
                timestamp: new Date()
            };
            await user.save();

            res.json({ message: 'Consent updated' });

            logAudit({
                userId: user._id,
                action: status ? 'CONSENT_GIVEN' : 'CONSENT_REVOKED',
                details: { type },
                req
            });
        } else {
            res.status(400).json({ message: 'Invalid consent type' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Error updating consent' });
    }
};
