const nodemailer = require('nodemailer');
const { User } = require('../models');
const { sendBookingConfirmationSMS, sendBookingRejectionSMS } = require('./smsService');
const {
  notifyNewBooking: slackNewBooking,
  notifyBookingConfirmed: slackConfirmed,
  notifyBookingCancelled: slackCancelled
} = require('./slackService');
const {
  notifyNewBooking: teamsNewBooking,
  notifyBookingConfirmed: teamsConfirmed,
  notifyBookingCancelled: teamsCancelled
} = require('./teamsNotificationService');

// Configure email transport (replace with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fire-and-forget a non-critical side-channel notification.
 * Errors are logged but never bubble up to callers.
 */
const trySend = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    console.warn(`⚠️ ${label} notification failed (non-fatal):`, err.message);
  }
};

// ─── Approval Request ─────────────────────────────────────────────────────────

exports.sendApprovalRequest = async (booking, approverIds) => {
  try {
    // Get approver details
    const approvers = await User.find({
      _id: { $in: approverIds }
    }).select('name email phoneNumber slackIntegration teamsIntegration');

    // Format date and time for email
    const bookingDate = new Date(booking.startTime).toLocaleDateString();
    const bookingTime = new Date(booking.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    for (const approver of approvers) {
      // Email
      await trySend('Email approval', () => transporter.sendMail({
        from: `"Slotify" <${process.env.EMAIL_USER}>`,
        to: approver.email,
        subject: `Booking Approval Required: ${booking.clientName}`,
        html: `
          <h3>New Booking Requires Your Approval</h3>
          <p>A new booking has been submitted that requires your approval:</p>
          <ul>
            <li><strong>Client:</strong> ${booking.clientName} (${booking.clientEmail})</li>
            <li><strong>Date:</strong> ${bookingDate}</li>
            <li><strong>Time:</strong> ${bookingTime}</li>
          </ul>
          <p>Please log in to your dashboard to approve or reject this booking.</p>
          <a href="${process.env.FRONTEND_URL}/approvals" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Review Booking
          </a>
        `
      }));

      // Slack (if approver has Slack connected)
      if (approver.slackIntegration?.webhookUrl) {
        await trySend('Slack approval', () =>
          slackNewBooking(booking, null, approver.slackIntegration.webhookUrl)
        );
      }

      // Teams (if approver has Teams webhook connected)
      if (approver.teamsIntegration?.webhookUrl) {
        await trySend('Teams approval', () =>
          teamsNewBooking(booking, approver.teamsIntegration.webhookUrl)
        );
      }
    }

    // Global Slack / Teams webhook (org-level)
    if (process.env.SLACK_WEBHOOK_URL) {
      await trySend('Global Slack approval', () => slackNewBooking(booking));
    }
    if (process.env.TEAMS_WEBHOOK_URL) {
      await trySend('Global Teams approval', () => teamsNewBooking(booking));
    }

    return true;
  } catch (error) {
    console.error('Error sending approval request notifications:', error);
    throw error;
  }
};

// ─── Approval Confirmation ────────────────────────────────────────────────────

exports.sendApprovalConfirmation = async (booking) => {
  try {
    const bookingDate = new Date(booking.startTime).toLocaleDateString();
    const bookingTime = new Date(booking.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Email to client
    await trySend('Email confirmation', () => transporter.sendMail({
      from: `"Slotify" <${process.env.EMAIL_USER}>`,
      to: booking.clientEmail,
      subject: 'Your booking has been approved!',
      html: `
        <h3>Your Booking is Confirmed!</h3>
        <p>Good news! Your booking has been approved:</p>
        <ul>
          <li><strong>Date:</strong> ${bookingDate}</li>
          <li><strong>Time:</strong> ${bookingTime}</li>
          ${booking.videoLink ? `<li><strong>Video Link:</strong> <a href="${booking.videoLink}">${booking.videoLink}</a></li>` : ''}
        </ul>
        <p>We look forward to meeting with you!</p>
        <p>If you need to cancel or reschedule, please use the link in your original booking confirmation.</p>
      `
    }));

    // SMS to client (if phone number is in the booking)
    if (booking.clientPhone) {
      await trySend('SMS confirmation', () =>
        sendBookingConfirmationSMS(booking.clientPhone, booking)
      );
    }

    // Global Slack / Teams channels
    if (process.env.SLACK_WEBHOOK_URL) {
      await trySend('Slack confirmation', () => slackConfirmed(booking));
    }
    if (process.env.TEAMS_WEBHOOK_URL) {
      await trySend('Teams confirmation', () => teamsConfirmed(booking));
    }

    return true;
  } catch (error) {
    console.error('Error sending approval confirmation notifications:', error);
    throw error;
  }
};

// ─── Rejection Notification ───────────────────────────────────────────────────

exports.sendRejectionNotification = async (booking, reason) => {
  try {
    const bookingDate = new Date(booking.startTime).toLocaleDateString();
    const bookingTime = new Date(booking.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Email to client
    await trySend('Email rejection', () => transporter.sendMail({
      from: `"Slotify" <${process.env.EMAIL_USER}>`,
      to: booking.clientEmail,
      subject: 'Update on your booking request',
      html: `
        <h3>Your Booking Could Not Be Confirmed</h3>
        <p>We're sorry, but we couldn't confirm your booking request for:</p>
        <ul>
          <li><strong>Date:</strong> ${bookingDate}</li>
          <li><strong>Time:</strong> ${bookingTime}</li>
        </ul>
        <p><strong>Reason:</strong> ${reason || 'No reason provided.'}</p>
        <p>Please feel free to choose another time that works for you:</p>
        <a href="${process.env.FRONTEND_URL}/book/${booking.linkId}" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Book Another Time
        </a>
      `
    }));

    // SMS to client (if phone number available)
    if (booking.clientPhone) {
      await trySend('SMS rejection', () =>
        sendBookingRejectionSMS(booking.clientPhone, booking, reason)
      );
    }

    // Global Slack / Teams channels
    if (process.env.SLACK_WEBHOOK_URL) {
      await trySend('Slack rejection', () => slackCancelled(booking, reason));
    }
    if (process.env.TEAMS_WEBHOOK_URL) {
      await trySend('Teams rejection', () => teamsCancelled(booking, reason));
    }

    return true;
  } catch (error) {
    console.error('Error sending rejection notifications:', error);
    throw error;
  }
};
