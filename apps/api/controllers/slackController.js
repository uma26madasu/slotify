/**
 * Slack Controller
 * Handles Slack OAuth installation and notification dispatch endpoints
 */

const axios = require('axios');
const User = require('../models/User');
const { sendSlackMessage, notifyNewBooking } = require('../services/slackService');
const { logAudit } = require('../utils/auditLogger');

const SLACK_API = 'https://slack.com/api';

// ─── OAuth Installation ───────────────────────────────────────────────────────

/**
 * GET /api/slack/install
 * Redirect user to Slack OAuth authorization page
 */
exports.install = (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ success: false, message: 'Slack client ID not configured' });
  }

  const scopes = [
    'chat:write',
    'chat:write.public',
    'incoming-webhook',
    'channels:read'
  ].join(',');

  const redirectUri = encodeURIComponent(
    `${process.env.API_BASE_URL || process.env.BACKEND_URL}/api/slack/callback`
  );

  const slackAuthUrl =
    `https://slack.com/oauth/v2/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(slackAuthUrl);
};

/**
 * GET /api/slack/callback
 * Handle Slack OAuth callback and store tokens for the current user
 */
exports.callback = async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?slack=error&reason=${error}`);
  }

  if (!code) {
    return res.status(400).json({ success: false, message: 'Missing authorization code' });
  }

  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = `${process.env.API_BASE_URL || process.env.BACKEND_URL}/api/slack/callback`;

    const response = await axios.post(
      `${SLACK_API}/oauth.v2.access`,
      new URLSearchParams({ code, redirect_uri: redirectUri }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data.ok) {
      throw new Error(response.data.error || 'Slack OAuth failed');
    }

    const { access_token, incoming_webhook, team, authed_user } = response.data;

    // If a logged-in user initiated the flow, save their Slack config
    if (req.user) {
      await User.findByIdAndUpdate(req.user.userId, {
        'slackIntegration.accessToken': access_token,
        'slackIntegration.teamId': team?.id,
        'slackIntegration.teamName': team?.name,
        'slackIntegration.webhookUrl': incoming_webhook?.url,
        'slackIntegration.webhookChannel': incoming_webhook?.channel,
        'slackIntegration.connectedAt': new Date()
      });

      logAudit({ userId: req.user.userId, action: 'CALENDAR_SYNC', details: { provider: 'slack', teamId: team?.id }, req });
    }

    res.redirect(`${process.env.FRONTEND_URL}/settings?slack=connected&team=${encodeURIComponent(team?.name || '')}`);
  } catch (err) {
    console.error('❌ Slack OAuth callback error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?slack=error`);
  }
};

/**
 * DELETE /api/slack/disconnect
 * Remove Slack integration for the current user
 */
exports.disconnect = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { slackIntegration: '' }
    });

    logAudit({ userId: req.user.userId, action: 'CALENDAR_DISCONNECT', details: { provider: 'slack' }, req });

    res.json({ success: true, message: 'Slack integration disconnected' });
  } catch (err) {
    console.error('❌ Error disconnecting Slack:', err.message);
    res.status(500).json({ success: false, message: 'Failed to disconnect Slack' });
  }
};

/**
 * GET /api/slack/status
 * Check if Slack is connected for the current user
 */
exports.status = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('slackIntegration');
    const connected = !!(user?.slackIntegration?.accessToken);

    res.json({
      success: true,
      connected,
      ...(connected && {
        teamName: user.slackIntegration.teamName,
        channel: user.slackIntegration.webhookChannel,
        connectedAt: user.slackIntegration.connectedAt
      })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch Slack status' });
  }
};

/**
 * POST /api/slack/test
 * Send a test message to the connected Slack workspace
 */
exports.testMessage = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('slackIntegration');

    if (!user?.slackIntegration?.webhookUrl) {
      return res.status(400).json({ success: false, message: 'Slack not connected' });
    }

    const { sendViaWebhook } = require('../services/slackService');
    await sendViaWebhook(
      { text: '👋 Slotify is connected to your Slack workspace! Booking notifications will appear here.' },
      user.slackIntegration.webhookUrl
    );

    res.json({ success: true, message: 'Test message sent to Slack' });
  } catch (err) {
    console.error('❌ Slack test message error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send test message', error: err.message });
  }
};

/**
 * POST /api/slack/notify
 * Send a custom notification to a Slack channel (internal/admin use)
 */
exports.sendNotification = async (req, res) => {
  try {
    const { channel, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const result = await sendSlackMessage(channel, message);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Slack notification error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send Slack notification', error: err.message });
  }
};

console.log('✅ Slack Controller loaded');
