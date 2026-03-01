const axios = require('axios');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

console.log('📝 Loading Zoom Controller...');

const ZOOM_API_BASE = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

// Get Zoom access token using Server-to-Server OAuth
const getZoomAccessToken = async () => {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`,
    null,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
};

/**
 * Create a Zoom meeting and return the join URL
 * @param {Object} meetingDetails - { topic, startTime, duration, timezone, agenda }
 * @returns {Object} - { meetingId, joinUrl, startUrl, password }
 */
const createZoomMeeting = async (meetingDetails) => {
  const accessToken = await getZoomAccessToken();

  const meetingPayload = {
    topic: meetingDetails.topic || 'Slotify Meeting',
    type: 2, // Scheduled meeting
    start_time: meetingDetails.startTime,
    duration: meetingDetails.duration || 60,
    timezone: meetingDetails.timezone || 'UTC',
    agenda: meetingDetails.agenda || '',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: false,
      waiting_room: true,
      audio: 'both',
      auto_recording: 'none'
    }
  };

  const response = await axios.post(
    `${ZOOM_API_BASE}/users/me/meetings`,
    meetingPayload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    meetingId: response.data.id,
    joinUrl: response.data.join_url,
    startUrl: response.data.start_url,
    password: response.data.password,
    hostEmail: response.data.host_email
  };
};

/**
 * POST /api/zoom/meetings
 * Create a Zoom meeting for a booking
 */
exports.createMeeting = async (req, res) => {
  try {
    const { topic, startTime, duration, timezone, agenda } = req.body;

    if (!startTime) {
      return res.status(400).json({ success: false, message: 'startTime is required' });
    }

    const meeting = await createZoomMeeting({ topic, startTime, duration, timezone, agenda });

    if (req.user) {
      logAudit({ userId: req.user.userId, action: 'CALENDAR_SYNC', details: { provider: 'zoom', meetingId: meeting.meetingId }, req });
    }

    res.json({
      success: true,
      message: 'Zoom meeting created successfully',
      data: meeting
    });
  } catch (error) {
    console.error('❌ Error creating Zoom meeting:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create Zoom meeting',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * GET /api/zoom/meetings/:meetingId
 * Get details for a specific Zoom meeting
 */
exports.getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const accessToken = await getZoomAccessToken();

    const response = await axios.get(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({
      success: true,
      data: {
        meetingId: response.data.id,
        topic: response.data.topic,
        joinUrl: response.data.join_url,
        startTime: response.data.start_time,
        duration: response.data.duration,
        status: response.data.status
      }
    });
  } catch (error) {
    console.error('❌ Error fetching Zoom meeting:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Zoom meeting',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * DELETE /api/zoom/meetings/:meetingId
 * Delete a Zoom meeting
 */
exports.deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const accessToken = await getZoomAccessToken();

    await axios.delete(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({ success: true, message: 'Zoom meeting deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting Zoom meeting:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Zoom meeting',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * POST /api/zoom/meetings/booking
 * Auto-create a Zoom meeting for a booking and return the join link
 * Used internally by bookingController when videoConference = 'zoom'
 */
exports.createMeetingForBooking = createZoomMeeting;

console.log('✅ Zoom Controller loaded');

module.exports = {
  ...exports,
  createMeetingForBooking: createZoomMeeting
};
