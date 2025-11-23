const { google } = require('googleapis');
const Authority = require('../models/Authority');
const AlertConfig = require('../models/AlertConfig');
const AlertMeeting = require('../models/AlertMeeting');

console.log('📝 Loading Alert Scheduling Controller...');

// Helper: Create OAuth2 client for a user
const createOAuth2Client = (authority) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  if (authority.googleCalendar?.accessToken) {
    oauth2Client.setCredentials({
      access_token: authority.googleCalendar.accessToken,
      refresh_token: authority.googleCalendar.refreshToken
    });
  }

  return oauth2Client;
};

// Helper: Find earliest available slot
const findEarliestSlot = async (authorities, duration, emergencyOverride = false) => {
  // For emergency override, schedule immediately
  if (emergencyOverride) {
    const now = new Date();
    // Round up to next 5 minutes
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    return {
      start: now,
      end: new Date(now.getTime() + duration * 60000)
    };
  }

  // Start checking from now
  const now = new Date();
  const startSearch = new Date(now);
  startSearch.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0); // Round to next 15 min

  // Search within next 24 hours
  const endSearch = new Date(startSearch);
  endSearch.setHours(endSearch.getHours() + 24);

  // For simplicity, return the next 15-minute slot
  // In production, you'd check each authority's calendar for conflicts
  return {
    start: startSearch,
    end: new Date(startSearch.getTime() + duration * 60000)
  };
};

// Helper: Create Google Calendar event
const createCalendarEvent = async (meeting, attendees) => {
  // Use the first authority with Google Calendar connected as the organizer
  const organizer = attendees.find(a => a.googleCalendar?.connected);

  if (!organizer) {
    console.log('⚠️ No organizer with Google Calendar connected');
    return null;
  }

  try {
    const oauth2Client = createOAuth2Client(organizer);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: meeting.endTime.toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      attendees: attendees.map(a => ({
        email: a.email,
        displayName: a.name
      })),
      conferenceData: {
        createRequest: {
          requestId: `chainsync-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 5 },
          { method: 'email', minutes: 10 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    return {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri
    };
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    return null;
  }
};

/**
 * Main endpoint for ChainSync to schedule emergency meetings
 * POST /api/chainsync/schedule-meeting
 */
const scheduleMeetingFromAlert = async (req, res) => {
  try {
    console.log('🚨 Received alert from ChainSync:', req.body);

    const {
      alertId,
      alertType,
      severity,
      location,
      description,
      affectedArea,
      timestamp,
      source
    } = req.body;

    // Validate required fields
    if (!alertId || !alertType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: alertId, alertType, severity'
      });
    }

    // Get alert configuration
    let alertConfig = await AlertConfig.findOne({ alertType, isActive: true });

    // Use default config if not found
    if (!alertConfig) {
      console.log('⚠️ No config found for alert type, using defaults');
      alertConfig = {
        severityConfig: {
          low: { autoSchedule: false, meetingDuration: 30, requiredDepartments: [] },
          medium: { autoSchedule: true, meetingDuration: 45, requiredDepartments: ['emergency_management'] },
          high: { autoSchedule: true, meetingDuration: 60, requiredDepartments: ['emergency_management', 'police', 'medical'], emergencyOverride: true },
          critical: { autoSchedule: true, meetingDuration: 90, requiredDepartments: ['emergency_management', 'police', 'medical', 'fire', 'administration'], emergencyOverride: true }
        },
        meetingDefaults: {
          addGoogleMeet: true
        }
      };
    }

    const severityLower = severity.toLowerCase();
    const config = alertConfig.severityConfig[severityLower];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity level: ${severity}`
      });
    }

    // Check if auto-schedule is enabled for this severity
    if (!config.autoSchedule) {
      return res.json({
        success: true,
        message: 'Alert logged but auto-scheduling not enabled for this severity',
        action: 'notification_only',
        alertId
      });
    }

    // Find relevant authorities based on alert type, location, and required departments
    const authorityQuery = {
      isActive: true,
      $or: [
        { alertTypes: alertType },
        { department: { $in: config.requiredDepartments || [] } }
      ]
    };

    // Add region filter if location provided
    if (location?.region) {
      authorityQuery['jurisdiction.region'] = location.region;
    }

    const authorities = await Authority.find(authorityQuery).sort({ priority: 1 });

    if (authorities.length === 0) {
      console.log('⚠️ No authorities found for this alert');
      return res.status(404).json({
        success: false,
        message: 'No authorities found for this alert type and location',
        alertId
      });
    }

    console.log(`✅ Found ${authorities.length} authorities for alert`);

    // Find earliest available slot
    const duration = config.meetingDuration || 60;
    const emergencyOverride = config.emergencyOverride || false;
    const slot = await findEarliestSlot(authorities, duration, emergencyOverride);

    // Prepare meeting details
    const meetingTitle = `🚨 ${severity.toUpperCase()} ALERT: ${alertType.replace('_', ' ').toUpperCase()} - ${location?.region || 'Emergency Response'}`;
    const meetingDescription = `
CHAINSYNC EMERGENCY ALERT

Alert ID: ${alertId}
Type: ${alertType.replace('_', ' ').toUpperCase()}
Severity: ${severity.toUpperCase()}
Location: ${location?.region || 'N/A'}, ${location?.city || 'N/A'}
Affected Area: ${affectedArea || 'N/A'}

Description:
${description || 'Emergency response meeting required.'}

This meeting was automatically scheduled by ChainSync Alert System.
Please join immediately.

---
Alert Source: ${source || 'ChainSync'}
Alert Timestamp: ${timestamp || new Date().toISOString()}
    `.trim();

    // Create the meeting record
    const alertMeeting = new AlertMeeting({
      alertId,
      alertDetails: {
        type: alertType,
        severity: severityLower,
        location: {
          region: location?.region,
          city: location?.city,
          coordinates: location?.coordinates,
          address: location?.address
        },
        description,
        affectedArea,
        timestamp: timestamp || new Date(),
        source: source || 'chainsync'
      },
      meeting: {
        title: meetingTitle,
        description: meetingDescription,
        startTime: slot.start,
        endTime: slot.end,
        duration,
        location: 'Google Meet (link will be generated)'
      },
      attendees: authorities.map(auth => ({
        authorityId: auth._id,
        email: auth.email,
        name: auth.name,
        role: auth.role,
        department: auth.department,
        status: 'pending',
        notifiedAt: new Date()
      })),
      scheduling: {
        scheduledBy: 'chainsync_auto',
        emergencyOverride
      },
      status: 'scheduled'
    });

    // Try to create Google Calendar event
    const calendarEvent = await createCalendarEvent(
      {
        title: meetingTitle,
        description: meetingDescription,
        startTime: slot.start,
        endTime: slot.end
      },
      authorities
    );

    if (calendarEvent) {
      alertMeeting.meeting.googleEventId = calendarEvent.eventId;
      alertMeeting.meeting.googleMeetLink = calendarEvent.meetLink;
    }

    await alertMeeting.save();

    console.log(`✅ Meeting scheduled: ${alertMeeting._id}`);

    // Return success response
    res.json({
      success: true,
      message: 'Emergency meeting scheduled successfully',
      data: {
        meetingId: alertMeeting._id,
        alertId,
        meeting: {
          title: meetingTitle,
          startTime: slot.start,
          endTime: slot.end,
          duration,
          googleMeetLink: calendarEvent?.meetLink || 'Will be sent via email'
        },
        attendees: authorities.map(a => ({
          name: a.name,
          email: a.email,
          role: a.role,
          department: a.department
        })),
        scheduling: {
          emergencyOverride,
          scheduledAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error scheduling meeting from alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule meeting',
      error: error.message
    });
  }
};

/**
 * Get all meetings for an alert
 * GET /api/chainsync/meetings/:alertId
 */
const getMeetingsByAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const meetings = await AlertMeeting.find({ alertId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

/**
 * Get all alert meetings with filters
 * GET /api/chainsync/meetings
 */
const getAllAlertMeetings = async (req, res) => {
  try {
    const { status, severity, alertType, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query['alertDetails.severity'] = severity;
    if (alertType) query['alertDetails.type'] = alertType;

    const meetings = await AlertMeeting.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

/**
 * Update meeting status
 * PATCH /api/chainsync/meetings/:meetingId/status
 */
const updateMeetingStatus = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { status, note } = req.body;

    const meeting = await AlertMeeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    meeting.status = status;
    if (note) {
      meeting.notes.push({
        content: note,
        addedBy: 'chainsync',
        addedAt: new Date()
      });
    }

    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting status updated',
      data: meeting
    });
  } catch (error) {
    console.error('❌ Error updating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      error: error.message
    });
  }
};

// Authority Management Endpoints

/**
 * Create or update an authority
 * POST /api/chainsync/authorities
 */
const upsertAuthority = async (req, res) => {
  try {
    const authorityData = req.body;

    const authority = await Authority.findOneAndUpdate(
      { email: authorityData.email },
      authorityData,
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: authority.isNew ? 'Authority created' : 'Authority updated',
      data: authority
    });
  } catch (error) {
    console.error('❌ Error upserting authority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save authority',
      error: error.message
    });
  }
};

/**
 * Get authorities with filters
 * GET /api/chainsync/authorities
 */
const getAuthorities = async (req, res) => {
  try {
    const { region, department, role, alertType } = req.query;

    const query = { isActive: true };
    if (region) query['jurisdiction.region'] = region;
    if (department) query.department = department;
    if (role) query.role = role;
    if (alertType) query.alertTypes = alertType;

    const authorities = await Authority.find(query).sort({ priority: 1 });

    res.json({
      success: true,
      count: authorities.length,
      data: authorities
    });
  } catch (error) {
    console.error('❌ Error fetching authorities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch authorities',
      error: error.message
    });
  }
};

/**
 * Delete an authority
 * DELETE /api/chainsync/authorities/:id
 */
const deleteAuthority = async (req, res) => {
  try {
    const { id } = req.params;

    await Authority.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Authority deactivated'
    });
  } catch (error) {
    console.error('❌ Error deleting authority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete authority',
      error: error.message
    });
  }
};

// Alert Config Management

/**
 * Create or update alert configuration
 * POST /api/chainsync/config
 */
const upsertAlertConfig = async (req, res) => {
  try {
    const configData = req.body;

    const config = await AlertConfig.findOneAndUpdate(
      { alertType: configData.alertType },
      configData,
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Alert configuration saved',
      data: config
    });
  } catch (error) {
    console.error('❌ Error saving config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save configuration',
      error: error.message
    });
  }
};

/**
 * Get alert configurations
 * GET /api/chainsync/config
 */
const getAlertConfigs = async (req, res) => {
  try {
    const configs = await AlertConfig.find({ isActive: true });

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('❌ Error fetching configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configurations',
      error: error.message
    });
  }
};

console.log('✅ Alert Scheduling Controller loaded');

module.exports = {
  scheduleMeetingFromAlert,
  getMeetingsByAlert,
  getAllAlertMeetings,
  updateMeetingStatus,
  upsertAuthority,
  getAuthorities,
  deleteAuthority,
  upsertAlertConfig,
  getAlertConfigs
};
