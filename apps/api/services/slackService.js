/**
 * Slack Notification Service
 *
 * Supports two modes:
 *  1. Incoming Webhook  – simplest, configure SLACK_WEBHOOK_URL
 *  2. Bot Token (OAuth) – richer, requires SLACK_BOT_TOKEN
 *
 * Environment variables:
 *   SLACK_WEBHOOK_URL   – incoming webhook URL for a specific channel
 *   SLACK_BOT_TOKEN     – Bot User OAuth Token (xoxb-…)
 *   SLACK_DEFAULT_CHANNEL – default channel id/name for bot messages (e.g. "#bookings")
 */

const axios = require('axios');

const SLACK_API = 'https://slack.com/api';

// ─── Incoming Webhook ─────────────────────────────────────────────────────────

/**
 * Send a message via Slack Incoming Webhook
 * @param {string|Object} message – plain text or a full Slack Block Kit payload
 * @param {string} [webhookUrl]   – override the env-level webhook URL
 */
const sendViaWebhook = async (message, webhookUrl) => {
  const url = webhookUrl || process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error('Slack webhook URL not configured (SLACK_WEBHOOK_URL)');

  const payload = typeof message === 'string' ? { text: message } : message;
  const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });

  if (response.data !== 'ok' && response.data?.ok === false) {
    throw new Error(`Slack webhook error: ${response.data?.error || response.data}`);
  }

  return { provider: 'slack_webhook', ok: true };
};

// ─── Bot Token (Web API) ──────────────────────────────────────────────────────

/**
 * Send a message using the Slack Web API (requires bot token)
 * @param {string} channel   – channel ID or name
 * @param {string|Object} message – plain text or blocks payload
 */
const sendViaBot = async (channel, message) => {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('Slack bot token not configured (SLACK_BOT_TOKEN)');

  const payload = {
    channel,
    ...(typeof message === 'string' ? { text: message } : message)
  };

  const response = await axios.post(`${SLACK_API}/chat.postMessage`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.data.ok) {
    throw new Error(`Slack API error: ${response.data.error}`);
  }

  return { provider: 'slack_bot', ts: response.data.ts, channel: response.data.channel };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a Slack notification.
 * Prefers Bot token if SLACK_BOT_TOKEN is set, falls back to webhook.
 * @param {string} channel  – target channel (ignored when using webhook-only)
 * @param {string|Object} message
 */
const sendSlackMessage = async (channel, message) => {
  if (process.env.SLACK_BOT_TOKEN) {
    return sendViaBot(channel || process.env.SLACK_DEFAULT_CHANNEL || '#general', message);
  }
  return sendViaWebhook(message);
};

// ─── Booking notification blocks ─────────────────────────────────────────────

/**
 * Build a Slack Block Kit message for a new booking request
 */
const buildNewBookingBlocks = (booking) => {
  const date = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  const time = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const videoField = booking.videoLink
    ? `\n*Video Link:* <${booking.videoLink}|Join Meeting>`
    : '';

  return {
    text: `New booking request from ${booking.clientName}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📅 New Booking Request', emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Client:*\n${booking.clientName}` },
          { type: 'mrkdwn', text: `*Email:*\n${booking.clientEmail}` },
          { type: 'mrkdwn', text: `*Date:*\n${date}` },
          { type: 'mrkdwn', text: `*Time:*\n${time}${videoField}` }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve' },
            style: 'primary',
            url: `${process.env.FRONTEND_URL}/approvals`
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger',
            url: `${process.env.FRONTEND_URL}/approvals`
          }
        ]
      }
    ]
  };
};

/**
 * Notify a Slack channel of a new booking that needs approval
 */
const notifyNewBooking = async (booking, channel) => {
  const payload = buildNewBookingBlocks(booking);
  return sendSlackMessage(channel, payload);
};

/**
 * Notify a Slack channel when a booking is confirmed
 */
const notifyBookingConfirmed = async (booking, channel) => {
  const date = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
  const time = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const videoLine = booking.videoLink ? ` | <${booking.videoLink}|Join>` : '';

  const message = {
    text: `✅ Booking confirmed for ${booking.clientName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `✅ *Booking Confirmed*\n*Client:* ${booking.clientName} (${booking.clientEmail})\n*When:* ${date} at ${time}${videoLine}`
        }
      }
    ]
  };

  return sendSlackMessage(channel, message);
};

/**
 * Notify a Slack channel when a booking is cancelled/rejected
 */
const notifyBookingCancelled = async (booking, reason, channel) => {
  const message = {
    text: `❌ Booking cancelled for ${booking.clientName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Booking Cancelled*\n*Client:* ${booking.clientName}\n*Reason:* ${reason || 'Not specified'}`
        }
      }
    ]
  };

  return sendSlackMessage(channel, message);
};

module.exports = {
  sendSlackMessage,
  sendViaWebhook,
  sendViaBot,
  notifyNewBooking,
  notifyBookingConfirmed,
  notifyBookingCancelled
};
