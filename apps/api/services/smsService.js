/**
 * SMS Notification Service
 * Supports Twilio (primary) with Plivo as fallback
 * Configure via environment variables:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER  (Twilio)
 *   PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN, PLIVO_PHONE_NUMBER          (Plivo)
 *   SMS_PROVIDER = 'twilio' | 'plivo' | 'auto'  (default: 'auto')
 */

const axios = require('axios');

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'auto';

// ─── Twilio ───────────────────────────────────────────────────────────────────

const sendViaTwilio = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const response = await axios.post(url, params.toString(), {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return { provider: 'twilio', sid: response.data.sid, status: response.data.status };
};

// ─── Plivo ────────────────────────────────────────────────────────────────────

const sendViaPlivo = async (to, body) => {
  const authId = process.env.PLIVO_AUTH_ID;
  const authToken = process.env.PLIVO_AUTH_TOKEN;
  const from = process.env.PLIVO_PHONE_NUMBER;

  if (!authId || !authToken || !from) {
    throw new Error('Plivo credentials not configured (PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN, PLIVO_PHONE_NUMBER)');
  }

  const url = `https://api.plivo.com/v1/Account/${authId}/Message/`;
  const credentials = Buffer.from(`${authId}:${authToken}`).toString('base64');

  const response = await axios.post(
    url,
    { src: from, dst: to, text: body },
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return { provider: 'plivo', messageUuid: response.data.message_uuid?.[0], apiId: response.data.api_id };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an SMS message
 * @param {string} to   - E.164 phone number e.g. "+14155552671"
 * @param {string} body - Message text (max 160 chars for a single SMS)
 * @returns {Object}    - Provider response object
 */
const sendSMS = async (to, body) => {
  if (!to) throw new Error('Recipient phone number is required');
  if (!body) throw new Error('Message body is required');

  // Normalise phone number to E.164 if it looks like a plain number
  const normalised = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`;

  const provider = SMS_PROVIDER;

  if (provider === 'twilio') return sendViaTwilio(normalised, body);
  if (provider === 'plivo') return sendViaPlivo(normalised, body);

  // 'auto': try Twilio first, fall back to Plivo
  try {
    return await sendViaTwilio(normalised, body);
  } catch (twilioError) {
    console.warn('⚠️ Twilio failed, trying Plivo:', twilioError.message);
    return await sendViaPlivo(normalised, body);
  }
};

// ─── Booking notification helpers ─────────────────────────────────────────────

/**
 * Send SMS booking confirmation to a client
 */
const sendBookingConfirmationSMS = async (phoneNumber, booking) => {
  const date = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
  const time = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const videoLine = booking.videoLink ? `\nJoin: ${booking.videoLink}` : '';
  const body =
    `Slotify: Your booking is confirmed!\n` +
    `Date: ${date} at ${time}${videoLine}\n` +
    `Reply CANCEL to cancel.`;

  return sendSMS(phoneNumber, body);
};

/**
 * Send SMS booking reminder (e.g. 24h before)
 */
const sendBookingReminderSMS = async (phoneNumber, booking) => {
  const date = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
  const time = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const videoLine = booking.videoLink ? `\nJoin: ${booking.videoLink}` : '';
  const body =
    `Slotify reminder: You have a meeting tomorrow\n` +
    `Date: ${date} at ${time}${videoLine}`;

  return sendSMS(phoneNumber, body);
};

/**
 * Send SMS when a booking is rejected
 */
const sendBookingRejectionSMS = async (phoneNumber, booking, reason) => {
  const body =
    `Slotify: Your booking request could not be confirmed.\n` +
    `Reason: ${reason || 'No reason provided.'}\n` +
    `Please visit the app to book another time.`;

  return sendSMS(phoneNumber, body);
};

module.exports = {
  sendSMS,
  sendBookingConfirmationSMS,
  sendBookingReminderSMS,
  sendBookingRejectionSMS
};
