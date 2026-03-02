/**
 * Microsoft Teams Notification Service
 *
 * Supports two modes:
 *  1. Incoming Webhook (Teams channel connector) – configure TEAMS_WEBHOOK_URL
 *  2. Microsoft Graph API chat messages        – uses existing user MS access token
 *
 * Environment variables:
 *   TEAMS_WEBHOOK_URL – incoming webhook URL for a Teams channel
 */

const axios = require('axios');

const GRAPH_URL = 'https://graph.microsoft.com/v1.0';

// ─── Incoming Webhook ─────────────────────────────────────────────────────────

/**
 * Send a message to a Teams channel via Incoming Webhook
 * @param {string|Object} message – plain text or an Adaptive Card payload
 * @param {string} [webhookUrl]   – override the env-level webhook URL
 */
const sendViaWebhook = async (message, webhookUrl) => {
  const url = webhookUrl || process.env.TEAMS_WEBHOOK_URL;
  if (!url) throw new Error('Teams webhook URL not configured (TEAMS_WEBHOOK_URL)');

  const payload = typeof message === 'string'
    ? {
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            body: [{ type: 'TextBlock', text: message, wrap: true }]
          }
        }]
      }
    : message;

  await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  return { provider: 'teams_webhook', ok: true };
};

// ─── Graph API chat message ───────────────────────────────────────────────────

/**
 * Send a chat message to a Teams channel using Microsoft Graph
 * Requires a delegated access token with ChannelMessage.Send permission
 * @param {string} accessToken – user's MS Graph access token
 * @param {string} teamId      – Teams team ID
 * @param {string} channelId   – Teams channel ID
 * @param {string} content     – HTML content of the message
 */
const sendGraphMessage = async (accessToken, teamId, channelId, content) => {
  if (!accessToken || !teamId || !channelId) {
    throw new Error('accessToken, teamId, and channelId are required for Graph messaging');
  }

  const response = await axios.post(
    `${GRAPH_URL}/teams/${teamId}/channels/${channelId}/messages`,
    {
      body: { contentType: 'html', content }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return { provider: 'teams_graph', messageId: response.data.id };
};

// ─── Adaptive Card builder ────────────────────────────────────────────────────

/**
 * Build a Teams Adaptive Card payload for a booking notification
 */
const buildBookingAdaptiveCard = (booking, type = 'new') => {
  const date = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  const time = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const titles = {
    new: '📅 New Booking Request',
    confirmed: '✅ Booking Confirmed',
    cancelled: '❌ Booking Cancelled',
    reminder: '🔔 Booking Reminder'
  };

  const bodyFacts = [
    { title: 'Client', value: booking.clientName || 'N/A' },
    { title: 'Email', value: booking.clientEmail || 'N/A' },
    { title: 'Date', value: date },
    { title: 'Time', value: time }
  ];

  if (booking.videoLink) {
    bodyFacts.push({ title: 'Video Link', value: booking.videoLink });
  }

  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Large',
              weight: 'Bolder',
              text: titles[type] || titles.new
            },
            {
              type: 'FactSet',
              facts: bodyFacts
            }
          ],
          actions: type === 'new' && process.env.FRONTEND_URL
            ? [
                {
                  type: 'Action.OpenUrl',
                  title: 'Review in Slotify',
                  url: `${process.env.FRONTEND_URL}/approvals`
                }
              ]
            : []
        }
      }
    ]
  };

  return card;
};

// ─── Booking notification helpers ─────────────────────────────────────────────

const notifyNewBooking = async (booking, webhookUrl) => {
  const card = buildBookingAdaptiveCard(booking, 'new');
  return sendViaWebhook(card, webhookUrl);
};

const notifyBookingConfirmed = async (booking, webhookUrl) => {
  const card = buildBookingAdaptiveCard(booking, 'confirmed');
  return sendViaWebhook(card, webhookUrl);
};

const notifyBookingCancelled = async (booking, reason, webhookUrl) => {
  const card = buildBookingAdaptiveCard({ ...booking, cancelReason: reason }, 'cancelled');
  return sendViaWebhook(card, webhookUrl);
};

const notifyBookingReminder = async (booking, webhookUrl) => {
  const card = buildBookingAdaptiveCard(booking, 'reminder');
  return sendViaWebhook(card, webhookUrl);
};

module.exports = {
  sendViaWebhook,
  sendGraphMessage,
  buildBookingAdaptiveCard,
  notifyNewBooking,
  notifyBookingConfirmed,
  notifyBookingCancelled,
  notifyBookingReminder
};
