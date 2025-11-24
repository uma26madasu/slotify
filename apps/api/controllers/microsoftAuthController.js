const axios = require('axios');

console.log('📝 Loading microsoftAuthController...');

// Import User model
let User;
try {
  User = require('../models/User');
  console.log('✅ User model imported for Microsoft auth');
} catch (error) {
  console.error('❌ Failed to import User model:', error.message);
}

// Microsoft OAuth Configuration
const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com';
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0';

// Scopes for Microsoft Calendar access
const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'Calendars.Read',
  'Calendars.ReadWrite',
  'User.Read'
];

// Get Microsoft OAuth URL
const getMicrosoftAuthUrl = (redirectUri) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: SCOPES.join(' '),
    prompt: 'consent'
  });

  return `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
};

// 1. Generate Microsoft OAuth URL
async function getMicrosoftOAuthUrl(req, res) {
  try {
    console.log('🔄 Generating Microsoft OAuth URL...');

    if (!process.env.MICROSOFT_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Microsoft Client ID not configured'
      });
    }

    const redirectUri = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/auth/microsoft/callback`
      : 'https://slotifyui.up.railway.app/auth/microsoft/callback';

    const authUrl = getMicrosoftAuthUrl(redirectUri);

    console.log('✅ Microsoft OAuth URL generated');

    res.json({
      success: true,
      url: authUrl,
      redirectUri: redirectUri
    });

  } catch (error) {
    console.error('❌ Error generating Microsoft OAuth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OAuth URL',
      error: error.message
    });
  }
}

// 2. Handle Microsoft OAuth callback
async function handleMicrosoftCallback(req, res) {
  try {
    console.log('🔄 Processing Microsoft OAuth callback...');

    const { code, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

    const redirectUri = redirect_uri || process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/auth/microsoft/callback`
      : 'https://slotifyui.up.railway.app/auth/microsoft/callback';

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');

    const tokenResponse = await axios.post(
      `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: SCOPES.join(' ')
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokens = tokenResponse.data;
    console.log('✅ Token exchange successful');

    // Get user info from Microsoft Graph
    console.log('🔄 Fetching user info from Microsoft Graph...');

    const userResponse = await axios.get(`${MICROSOFT_GRAPH_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userInfo = userResponse.data;
    console.log('✅ User info retrieved:', userInfo.mail || userInfo.userPrincipalName);

    // Save or update user in database
    console.log('🔄 Saving user to database...');

    const email = userInfo.mail || userInfo.userPrincipalName;
    const tokenExpiry = Date.now() + (tokens.expires_in * 1000);

    let user;
    try {
      user = await User.findOne({ email: email });

      if (user) {
        console.log('✅ Existing user found, updating...');
        user.microsoftId = userInfo.id;
        user.name = userInfo.displayName;
        user.microsoftAccessToken = tokens.access_token;
        user.microsoftRefreshToken = tokens.refresh_token;
        user.microsoftTokenExpiry = tokenExpiry;
        user.calendarProvider = 'microsoft';
        user.updatedAt = new Date();
        await user.save();
      } else {
        console.log('✅ Creating new user...');
        user = new User({
          microsoftId: userInfo.id,
          email: email,
          name: userInfo.displayName,
          microsoftAccessToken: tokens.access_token,
          microsoftRefreshToken: tokens.refresh_token,
          microsoftTokenExpiry: tokenExpiry,
          calendarProvider: 'microsoft'
        });
        await user.save();
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);

      if (dbError.code === 11000) {
        user = await User.findOneAndUpdate(
          { email: email },
          {
            microsoftId: userInfo.id,
            name: userInfo.displayName,
            microsoftAccessToken: tokens.access_token,
            microsoftRefreshToken: tokens.refresh_token,
            microsoftTokenExpiry: tokenExpiry,
            calendarProvider: 'microsoft',
            updatedAt: new Date()
          },
          { new: true, upsert: true }
        );
      } else {
        throw dbError;
      }
    }

    console.log('✅ User saved successfully:', user.email);

    res.json({
      success: true,
      message: `Microsoft Calendar connected successfully for ${user.email}`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        calendarProvider: 'microsoft'
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokenExpiry
      }
    });

  } catch (error) {
    console.error('❌ Microsoft OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Microsoft authentication failed',
      error: error.response?.data?.error_description || error.message
    });
  }
}

// 3. Refresh Microsoft access token
async function refreshMicrosoftToken(user) {
  try {
    console.log('🔄 Refreshing Microsoft access token...');

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

    const tokenResponse = await axios.post(
      `${MICROSOFT_AUTH_URL}/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.microsoftRefreshToken,
        grant_type: 'refresh_token',
        scope: SCOPES.join(' ')
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokens = tokenResponse.data;
    const tokenExpiry = Date.now() + (tokens.expires_in * 1000);

    // Update user tokens
    user.microsoftAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.microsoftRefreshToken = tokens.refresh_token;
    }
    user.microsoftTokenExpiry = tokenExpiry;
    await user.save();

    console.log('✅ Microsoft token refreshed');

    return tokens.access_token;
  } catch (error) {
    console.error('❌ Microsoft token refresh failed:', error.response?.data || error.message);
    throw new Error('Failed to refresh Microsoft token');
  }
}

// 4. Check Microsoft OAuth status
async function checkMicrosoftOAuthStatus(req, res) {
  try {
    const email = req.query.email || req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user || !user.microsoftAccessToken) {
      return res.json({
        connected: false,
        message: 'Microsoft Calendar not connected'
      });
    }

    const isExpired = user.microsoftTokenExpiry ? Date.now() >= user.microsoftTokenExpiry : false;

    res.json({
      connected: true,
      email: user.email,
      name: user.name,
      calendarProvider: 'microsoft',
      isExpired: isExpired
    });

  } catch (error) {
    console.error('❌ Error checking Microsoft OAuth status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OAuth status',
      error: error.message
    });
  }
}

console.log('✅ microsoftAuthController loaded successfully');

module.exports = {
  getMicrosoftOAuthUrl,
  handleMicrosoftCallback,
  refreshMicrosoftToken,
  checkMicrosoftOAuthStatus
};
