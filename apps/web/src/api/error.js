// src/api/error.js
// This file defines our API error types and utilities

// Define error types for better handling
export const ErrorTypes = {
  NETWORK: 'network_error',
  SERVER: 'server_error',
  AUTH: 'authentication_error',
  VALIDATION: 'validation_error',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  PERMISSION: 'permission_error',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown_error',
  CALENDAR: 'calendar_error',
  BOOKING: 'booking_error',
  CONFLICT: 'conflict_error'
};

// Create a custom error class for API errors
export class APIError extends Error {
  constructor(type, message, statusCode = null, data = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
  
  // Add a method to get user-friendly error messages
  getUserMessage() {
    const defaultMessages = {
      [ErrorTypes.NETWORK]: 'There seems to be a problem with your internet connection. Please check your connection and try again.',
      [ErrorTypes.SERVER]: 'We\'re experiencing technical difficulties. Please try again later.',
      [ErrorTypes.AUTH]: 'Your session may have expired. Please sign in again.',
      [ErrorTypes.VALIDATION]: 'Some information appears to be invalid. Please check your inputs and try again.',
      [ErrorTypes.RESOURCE_NOT_FOUND]: 'The requested resource could not be found.',
      [ErrorTypes.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorTypes.RATE_LIMIT]: 'You\'ve made too many requests. Please try again later.',
      [ErrorTypes.TIMEOUT]: 'The request took too long to complete. Please try again.',
      [ErrorTypes.CALENDAR]: 'There was a problem with the calendar integration. Please check your calendar settings.',
      [ErrorTypes.BOOKING]: 'There was a problem with the booking. This time slot may no longer be available.',
      [ErrorTypes.CONFLICT]: 'There is a conflict with an existing booking or setting.',
      [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };
    
    return this.message || defaultMessages[this.type] || defaultMessages[ErrorTypes.UNKNOWN];
  }
  
  // Add a method to get technical details
  getTechnicalDetails() {
    return {
      type: this.type,
      timestamp: this.timestamp,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data
    };
  }
}

// Helper function to categorize HTTP status codes
export const categorizeHTTPError = (status) => {
  if (!status) return ErrorTypes.NETWORK;
  
  if (status === 401 || status === 403) return ErrorTypes.AUTH;
  if (status === 404) return ErrorTypes.RESOURCE_NOT_FOUND;
  if (status === 422) return ErrorTypes.VALIDATION;
  if (status === 429) return ErrorTypes.RATE_LIMIT;
  if (status === 409) return ErrorTypes.CONFLICT;
  if (status >= 500) return ErrorTypes.SERVER;
  
  return ErrorTypes.UNKNOWN;
};

// Function to parse error responses from the API
export const parseAPIErrorResponse = async (response) => {
  try {
    // Try to parse the error as JSON
    const errorData = await response.json();
    
    // Determine the error type based on status code
    const errorType = categorizeHTTPError(response.status);
    
    // Get the error message from the response or use a default
    const errorMessage = errorData.message || errorData.error || `Request failed with status: ${response.status}`;
    
    return new APIError(errorType, errorMessage, response.status, errorData);
  } catch (err) {
    // If we can't parse the error as JSON, create a generic error
    return new APIError(
      categorizeHTTPError(response.status),
      `Request failed with status: ${response.status}`,
      response.status
    );
  }
};

// Function to handle network or unexpected errors
export const handleUnexpectedError = (error) => {
  if (error.name === 'AbortError') {
    return new APIError(ErrorTypes.TIMEOUT, 'The request was cancelled due to timeout', null);
  }
  
  if (error.message && error.message.includes('NetworkError')) {
    return new APIError(ErrorTypes.NETWORK, 'Network error. Please check your internet connection', null);
  }
  
  return new APIError(ErrorTypes.UNKNOWN, error.message || 'An unexpected error occurred', null);
};