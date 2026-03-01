/**
 * Integrations Service
 * Client-side API wrappers for Zoom, SMS, Slack, and Teams notification endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

// ─── Zoom ─────────────────────────────────────────────────────────────────────

export const zoomService = {
  /**
   * Create a Zoom meeting
   * @param {string} token - JWT auth token
   * @param {{ topic, startTime, duration, timezone, agenda }} details
   */
  createMeeting: async (token, details) => {
    const res = await fetch(`${API_URL}/zoom/meetings`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(details)
    });
    if (!res.ok) throw new Error('Failed to create Zoom meeting');
    return res.json();
  },

  getMeeting: async (token, meetingId) => {
    const res = await fetch(`${API_URL}/zoom/meetings/${meetingId}`, {
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch Zoom meeting');
    return res.json();
  },

  deleteMeeting: async (token, meetingId) => {
    const res = await fetch(`${API_URL}/zoom/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete Zoom meeting');
    return res.json();
  }
};

// ─── Slack ────────────────────────────────────────────────────────────────────

export const slackService = {
  /** Redirect user to Slack OAuth installation page */
  install: () => {
    window.location.href = `${API_URL}/slack/install`;
  },

  /** Get Slack connection status */
  getStatus: async (token) => {
    const res = await fetch(`${API_URL}/slack/status`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch Slack status');
    return res.json();
  },

  /** Disconnect Slack integration */
  disconnect: async (token) => {
    const res = await fetch(`${API_URL}/slack/disconnect`, {
      method: 'DELETE',
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to disconnect Slack');
    return res.json();
  },

  /** Send a test message to the connected Slack channel */
  sendTest: async (token) => {
    const res = await fetch(`${API_URL}/slack/test`, {
      method: 'POST',
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to send Slack test message');
    return res.json();
  }
};

// ─── Teams Notifications ──────────────────────────────────────────────────────

export const teamsNotificationService = {
  /** Save a Teams incoming webhook URL */
  saveWebhook: async (token, webhookUrl, channelName) => {
    const res = await fetch(`${API_URL}/teams-notify/webhook`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ webhookUrl, channelName })
    });
    if (!res.ok) throw new Error('Failed to save Teams webhook');
    return res.json();
  },

  /** Remove Teams webhook configuration */
  removeWebhook: async (token) => {
    const res = await fetch(`${API_URL}/teams-notify/webhook`, {
      method: 'DELETE',
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to remove Teams webhook');
    return res.json();
  },

  /** Get Teams notification connection status */
  getStatus: async (token) => {
    const res = await fetch(`${API_URL}/teams-notify/status`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch Teams notification status');
    return res.json();
  },

  /** Send a test notification to the connected Teams channel */
  sendTest: async (token) => {
    const res = await fetch(`${API_URL}/teams-notify/test`, {
      method: 'POST',
      headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to send Teams test notification');
    return res.json();
  }
};
