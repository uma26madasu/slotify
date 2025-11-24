const axios = require('axios');
const User = require('../models/User');
const { refreshMicrosoftToken } = require('./microsoftAuthController');

console.log('📝 Loading microsoftCalendarController...');

const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0';

// Helper to get valid access token (refresh if needed)
const getValidAccessToken = async (user) => {
  const now = Date.now();
  const tokenExpiry = user.microsoftTokenExpiry;

  if (tokenExpiry && now >= tokenExpiry - 60000) { // Refresh 1 min before expiry
    console.log('🔄 Token expired, refreshing...');
    return await refreshMicrosoftToken(user);
  }

  return user.microsoftAccessToken;
};

// Get calendar events from Microsoft
const getMicrosoftCalendarEvents = async (req, res) => {
  try {
    console.log('🔄 Fetching Microsoft calendar events...');

    const email = req.query.email || req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.microsoftAccessToken) {
      return res.status(401).json({
        success: false,
        message: 'Microsoft Calendar not connected'
      });
    }

    const accessToken = await getValidAccessToken(user);

    // Calculate time range (next 30 days)
    const startDateTime = new Date().toISOString();
    const endDateTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch events from Microsoft Graph
    const response = await axios.get(`${MICROSOFT_GRAPH_URL}/me/calendarView`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'outlook.timezone="UTC"'
      },
      params: {
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        $top: 50,
        $orderby: 'start/dateTime',
        $select: 'id,subject,body,start,end,location,attendees,organizer,webLink,onlineMeeting,isOnlineMeeting'
      }
    });

    const events = response.data.value || [];
    console.log(`✅ Found ${events.length} Microsoft calendar events`);

    // Transform to match Google Calendar format for frontend compatibility
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.subject || 'No Title',
      description: event.body?.content || '',
      start: {
        dateTime: event.start.dateTime,
        timeZone: event.start.timeZone
      },
      end: {
        dateTime: event.end.dateTime,
        timeZone: event.end.timeZone
      },
      location: event.location?.displayName || '',
      attendees: (event.attendees || []).map(a => ({
        email: a.emailAddress.address,
        displayName: a.emailAddress.name,
        responseStatus: a.status?.response || 'needsAction'
      })),
      organizer: event.organizer ? {
        email: event.organizer.emailAddress.address,
        displayName: event.organizer.emailAddress.name
      } : null,
      htmlLink: event.webLink,
      conferenceData: event.isOnlineMeeting && event.onlineMeeting ? {
        entryPoints: [{
          uri: event.onlineMeeting.joinUrl,
          entryPointType: 'video'
        }]
      } : null,
      source: 'microsoft'
    }));

    res.json({
      success: true,
      message: `Found ${events.length} events`,
      events: formattedEvents,
      user: {
        email: user.email,
        name: user.name
      },
      source: 'microsoft'
    });

  } catch (error) {
    console.error('❌ Error fetching Microsoft calendar events:', error.response?.data || error.message);

    let statusCode = 500;
    let errorMessage = 'Failed to fetch calendar events';

    if (error.response?.status === 401) {
      statusCode = 401;
      errorMessage = 'Microsoft authentication expired. Please reconnect.';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.response?.data?.error?.message || error.message
    });
  }
};

// Get available calendars from Microsoft
const getMicrosoftCalendars = async (req, res) => {
  try {
    console.log('🔄 Fetching Microsoft calendars...');

    const email = req.query.email || req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user || !user.microsoftAccessToken) {
      return res.status(401).json({
        success: false,
        message: 'Microsoft Calendar not connected'
      });
    }

    const accessToken = await getValidAccessToken(user);

    const response = await axios.get(`${MICROSOFT_GRAPH_URL}/me/calendars`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const calendars = response.data.value || [];
    console.log(`✅ Found ${calendars.length} Microsoft calendars`);

    res.json({
      success: true,
      calendars: calendars.map(cal => ({
        id: cal.id,
        summary: cal.name,
        description: '',
        primary: cal.isDefaultCalendar,
        canEdit: cal.canEdit
      })),
      source: 'microsoft'
    });

  } catch (error) {
    console.error('❌ Error fetching Microsoft calendars:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendars',
      error: error.message
    });
  }
};

// Create event on Microsoft Calendar
const createMicrosoftEvent = async (req, res) => {
  try {
    console.log('🔄 Creating Microsoft calendar event...');

    const { email, event } = req.body;

    if (!email || !event) {
      return res.status(400).json({
        success: false,
        message: 'Email and event data are required'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user || !user.microsoftAccessToken) {
      return res.status(401).json({
        success: false,
        message: 'Microsoft Calendar not connected'
      });
    }

    const accessToken = await getValidAccessToken(user);

    // Transform event to Microsoft format
    const microsoftEvent = {
      subject: event.summary || event.title,
      body: {
        contentType: 'HTML',
        content: event.description || ''
      },
      start: {
        dateTime: event.start.dateTime || event.startTime,
        timeZone: event.start.timeZone || 'UTC'
      },
      end: {
        dateTime: event.end.dateTime || event.endTime,
        timeZone: event.end.timeZone || 'UTC'
      },
      location: event.location ? {
        displayName: event.location
      } : undefined,
      attendees: (event.attendees || []).map(a => ({
        emailAddress: {
          address: a.email,
          name: a.displayName || a.email
        },
        type: 'required'
      }))
    };

    // Add Teams meeting if requested
    if (event.createVideoConference) {
      microsoftEvent.isOnlineMeeting = true;
      microsoftEvent.onlineMeetingProvider = 'teamsForBusiness';
    }

    const response = await axios.post(
      `${MICROSOFT_GRAPH_URL}/me/calendar/events`,
      microsoftEvent,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Microsoft calendar event created:', response.data.id);

    res.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: response.data.id,
        summary: response.data.subject,
        htmlLink: response.data.webLink,
        meetingLink: response.data.onlineMeeting?.joinUrl
      },
      source: 'microsoft'
    });

  } catch (error) {
    console.error('❌ Error creating Microsoft event:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

// Check for conflicts on Microsoft Calendar
const checkMicrosoftConflicts = async (req, res) => {
  try {
    console.log('🔄 Checking Microsoft calendar conflicts...');

    const { email, startTime, endTime } = req.body;

    if (!email || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Email, startTime, and endTime are required'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user || !user.microsoftAccessToken) {
      return res.status(401).json({
        success: false,
        message: 'Microsoft Calendar not connected'
      });
    }

    const accessToken = await getValidAccessToken(user);

    const response = await axios.get(`${MICROSOFT_GRAPH_URL}/me/calendarView`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        startDateTime: startTime,
        endDateTime: endTime,
        $select: 'id,subject,start,end'
      }
    });

    const conflicts = response.data.value || [];
    console.log(`✅ Found ${conflicts.length} potential conflicts`);

    res.json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map(event => ({
        id: event.id,
        summary: event.subject,
        start: event.start,
        end: event.end
      })),
      source: 'microsoft'
    });

  } catch (error) {
    console.error('❌ Error checking Microsoft conflicts:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check conflicts',
      error: error.message
    });
  }
};

console.log('✅ microsoftCalendarController loaded successfully');

module.exports = {
  getMicrosoftCalendarEvents,
  getMicrosoftCalendars,
  createMicrosoftEvent,
  checkMicrosoftConflicts
};
