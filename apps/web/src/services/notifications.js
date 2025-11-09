// src/services/notifications.js
export const notificationService = {
  // Send notification to approvers when new booking needs approval
  sendApprovalRequest: async (booking, approvers) => {
    // Implementation would call your backend API
    console.log(`Sending approval request for booking ${booking.id} to approvers:`, approvers);
  },
  
  // Send notification to client when booking is approved
  sendApprovalConfirmation: async (booking) => {
    // Implementation would call your backend API
    console.log(`Sending approval confirmation for booking ${booking.id} to ${booking.clientEmail}`);
  },
  
  // Send notification to client when booking is rejected
  sendRejectionNotification: async (booking, reason) => {
    // Implementation would call your backend API
    console.log(`Sending rejection notification for booking ${booking.id} to ${booking.clientEmail}. Reason: ${reason}`);
  }
};