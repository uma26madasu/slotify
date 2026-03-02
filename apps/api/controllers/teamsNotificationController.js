/**
 * Teams Notification Controller
 * Endpoints for managing Teams notification settings and sending messages
 */

const User = require('../models/User');
const {
  sendViaWebhook,
  sendGraphMessage,
  notifyNewBooking
} = require('../services/teamsNotificationService');
const { logAudit } = require('../utils/auditLogger');

/**
 * POST /api/teams-notify/webhook
 * Save or update the Teams incoming webhook URL for the user
 */
exports.saveWebhook = async (req, res) => {
  try {
    const { webhookUrl, channelName } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ success: false, message: 'webhookUrl is required' });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      'teamsIntegration.webhookUrl': webhookUrl,
      'teamsIntegration.channelName': channelName || 'General',
      'teamsIntegration.connectedAt': new Date()
    });

    logAudit({
      userId: req.user.userId,
      action: 'CALENDAR_SYNC',
      details: { provider: 'teams_notifications', channelName },
      req
    });

    res.json({ success: true, message: 'Teams webhook saved successfully' });
  } catch (err) {
    console.error('❌ Error saving Teams webhook:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save Teams webhook' });
  }
};

/**
 * DELETE /api/teams-notify/webhook
 * Remove Teams notification configuration for the user
 */
exports.removeWebhook = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { teamsIntegration: '' }
    });

    logAudit({ userId: req.user.userId, action: 'CALENDAR_DISCONNECT', details: { provider: 'teams_notifications' }, req });
    res.json({ success: true, message: 'Teams notifications disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove Teams webhook' });
  }
};

/**
 * GET /api/teams-notify/status
 * Return Teams notification connection status for the current user
 */
exports.status = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('teamsIntegration');
    const connected = !!(user?.teamsIntegration?.webhookUrl);

    res.json({
      success: true,
      connected,
      ...(connected && {
        channelName: user.teamsIntegration.channelName,
        connectedAt: user.teamsIntegration.connectedAt
      })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch Teams status' });
  }
};

/**
 * POST /api/teams-notify/test
 * Send a test notification to the user's connected Teams channel
 */
exports.testNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('teamsIntegration');

    if (!user?.teamsIntegration?.webhookUrl) {
      return res.status(400).json({ success: false, message: 'Teams webhook not configured' });
    }

    await sendViaWebhook(
      '👋 Slotify is connected to your Microsoft Teams channel! Booking notifications will appear here.',
      user.teamsIntegration.webhookUrl
    );

    res.json({ success: true, message: 'Test notification sent to Teams' });
  } catch (err) {
    console.error('❌ Teams test notification error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send Teams test notification', error: err.message });
  }
};

/**
 * POST /api/teams-notify/send
 * Send a custom notification to the user's Teams channel
 */
exports.sendNotification = async (req, res) => {
  try {
    const { message, webhookUrl } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const user = await User.findById(req.user.userId).select('teamsIntegration');
    const url = webhookUrl || user?.teamsIntegration?.webhookUrl || process.env.TEAMS_WEBHOOK_URL;

    if (!url) {
      return res.status(400).json({ success: false, message: 'No Teams webhook URL configured' });
    }

    const result = await sendViaWebhook(message, url);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Teams notification error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send Teams notification', error: err.message });
  }
};

console.log('✅ Teams Notification Controller loaded');
