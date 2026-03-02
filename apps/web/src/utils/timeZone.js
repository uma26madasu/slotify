export const timeZoneUtils = {
  // Get user's timezone from browser
  getUserTimeZone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,

  // Convert a date from one timezone to another
  // Returns a new Date object representing the same instant, with a formatted string in toTimeZone
  convertTime: (date, fromTimeZone, toTimeZone) => {
    const inputDate = date instanceof Date ? date : new Date(date);

    // Format the date in the target timezone to get the wall-clock time there
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: toTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(inputDate);
    const get = (type) => parts.find(p => p.type === type)?.value;

    // Build an ISO string representing the wall-clock time in toTimeZone
    const localStr = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
    return new Date(localStr);
  },

  // Format a date in a given timezone using Intl.DateTimeFormat options
  // format can be: 'short', 'medium', 'long', or a custom Intl.DateTimeFormat options object
  formatWithTimeZone: (date, timeZone, format = 'medium') => {
    const inputDate = date instanceof Date ? date : new Date(date);

    const presets = {
      short: { timeZone, month: 'numeric', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' },
      medium: { timeZone, month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' },
      long: { timeZone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'long' },
      time: { timeZone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' },
      date: { timeZone, month: 'long', day: 'numeric', year: 'numeric' }
    };

    const options = typeof format === 'string' ? (presets[format] || presets.medium) : { timeZone, ...format };
    return new Intl.DateTimeFormat('en-US', options).format(inputDate);
  },

  // Get offset string for a timezone at a specific date (e.g. "UTC+5:30")
  getTimezoneOffset: (timeZone, date = new Date()) => {
    const inputDate = date instanceof Date ? date : new Date(date);
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
    const parts = formatter.formatToParts(inputDate);
    return parts.find(p => p.type === 'timeZoneName')?.value || timeZone;
  },

  // List of commonly used timezones grouped by region
  commonTimezones: [
    { label: 'UTC', value: 'UTC' },
    { label: 'Eastern Time (US & Canada)', value: 'America/New_York' },
    { label: 'Central Time (US & Canada)', value: 'America/Chicago' },
    { label: 'Mountain Time (US & Canada)', value: 'America/Denver' },
    { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
    { label: 'Alaska', value: 'America/Anchorage' },
    { label: 'Hawaii', value: 'Pacific/Honolulu' },
    { label: 'London', value: 'Europe/London' },
    { label: 'Paris / Berlin / Rome', value: 'Europe/Paris' },
    { label: 'Helsinki / Kyiv', value: 'Europe/Helsinki' },
    { label: 'Moscow', value: 'Europe/Moscow' },
    { label: 'Dubai', value: 'Asia/Dubai' },
    { label: 'India Standard Time', value: 'Asia/Kolkata' },
    { label: 'Bangladesh', value: 'Asia/Dhaka' },
    { label: 'Bangkok / Jakarta', value: 'Asia/Bangkok' },
    { label: 'Singapore / Kuala Lumpur', value: 'Asia/Singapore' },
    { label: 'Shanghai / Beijing', value: 'Asia/Shanghai' },
    { label: 'Tokyo / Seoul', value: 'Asia/Tokyo' },
    { label: 'Sydney', value: 'Australia/Sydney' },
    { label: 'Auckland', value: 'Pacific/Auckland' },
    { label: 'São Paulo', value: 'America/Sao_Paulo' },
    { label: 'Buenos Aires', value: 'America/Argentina/Buenos_Aires' }
  ],

  // Detect and return user timezone with a friendly label
  detectUserTimezone: () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return { value: tz, label: tz.replace(/_/g, ' ').replace(/\//g, ' / ') };
  }
};
