// src/utils/availabilityService.js
import googleCalendarService from './googleCalendar';

class AvailabilityService {
  constructor() {
    // Default working hours (can be customized by user)
    this.defaultWorkingHours = {
      Monday: { enabled: true, start: '09:00', end: '17:00' },
      Tuesday: { enabled: true, start: '09:00', end: '17:00' },
      Wednesday: { enabled: true, start: '09:00', end: '17:00' },
      Thursday: { enabled: true, start: '09:00', end: '17:00' },
      Friday: { enabled: true, start: '09:00', end: '17:00' },
      Saturday: { enabled: false, start: '09:00', end: '17:00' },
      Sunday: { enabled: false, start: '09:00', end: '17:00' }
    };

    this.preferences = {
      defaultDuration: 30, // minutes
      bufferTime: 5, // minutes
      timeZone: 'America/New_York',
      maxAdvanceBooking: 30, // days
      minNotice: 2 // hours
    };
  }

  // Set working hours
  setWorkingHours(workingHours) {
    this.defaultWorkingHours = { ...this.defaultWorkingHours, ...workingHours };
  }

  // Set preferences
  setPreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }

  // Get working hours for a specific day
  getWorkingHoursForDay(dayName) {
    return this.defaultWorkingHours[dayName] || { enabled: false, start: '09:00', end: '17:00' };
  }

  // Check if a specific day is a working day
  isWorkingDay(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingHours = this.getWorkingHoursForDay(dayName);
    return workingHours.enabled;
  }

  // Get working hours for a specific date
  getWorkingHoursForDate(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return this.getWorkingHoursForDay(dayName);
  }

  // Convert time string (HH:MM) to minutes since midnight
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes since midnight to time string (HH:MM)
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Generate time slots for a specific date
  async generateTimeSlotsForDate(date, slotDuration = 30) {
    try {
      console.log('Generating time slots for date:', date);

      // Check if it's a working day
      if (!this.isWorkingDay(date)) {
        console.log('Not a working day:', date);
        return [];
      }

      // Get working hours for this day
      const workingHours = this.getWorkingHoursForDate(date);
      const startMinutes = this.timeToMinutes(workingHours.start);
      const endMinutes = this.timeToMinutes(workingHours.end);

      console.log('Working hours:', { start: workingHours.start, end: workingHours.end });

      // Generate all possible time slots
      const allSlots = [];
      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        if (minutes + slotDuration <= endMinutes) {
          const slotStart = this.minutesToTime(minutes);
          const slotEnd = this.minutesToTime(minutes + slotDuration);
          
          allSlots.push({
            start: slotStart,
            end: slotEnd,
            startMinutes: minutes,
            endMinutes: minutes + slotDuration,
            available: true, // Will be updated based on calendar events
            datetime: {
              start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(minutes / 60), minutes % 60),
              end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor((minutes + slotDuration) / 60), (minutes + slotDuration) % 60)
            }
          });
        }
      }

      console.log('Generated base slots:', allSlots.length);

      // Get calendar events for this day to check for conflicts
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      let busyEvents = [];
      if (googleCalendarService.getSignedInStatus()) {
        busyEvents = await googleCalendarService.getEventsInRange(dayStart, dayEnd);
        console.log('Busy events for this day:', busyEvents);
      }

      // Mark slots as unavailable if they conflict with existing events
      const availableSlots = allSlots.map(slot => {
        const slotStart = slot.datetime.start;
        const slotEnd = slot.datetime.end;

        const hasConflict = busyEvents.some(event => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);

          // Check if slot overlaps with event (including buffer time)
          const bufferMs = this.preferences.bufferTime * 60 * 1000;
          const eventStartWithBuffer = new Date(eventStart.getTime() - bufferMs);
          const eventEndWithBuffer = new Date(eventEnd.getTime() + bufferMs);

          return (
            (slotStart >= eventStartWithBuffer && slotStart < eventEndWithBuffer) ||
            (slotEnd > eventStartWithBuffer && slotEnd <= eventEndWithBuffer) ||
            (slotStart <= eventStartWithBuffer && slotEnd >= eventEndWithBuffer)
          );
        });

        return {
          ...slot,
          available: !hasConflict,
          reason: hasConflict ? 'busy' : 'available'
        };
      });

      console.log('Available slots after conflict check:', availableSlots.filter(s => s.available).length);

      return availableSlots;
    } catch (error) {
      console.error('Error generating time slots:', error);
      return [];
    }
  }

  // Get availability for multiple days
  async getAvailabilityForDateRange(startDate, endDate, slotDuration = 30) {
    const availability = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      availability[dateKey] = await this.generateTimeSlotsForDate(new Date(currentDate), slotDuration);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availability;
  }

  // Get next available slot
  async getNextAvailableSlot(slotDuration = 30, daysAhead = 30) {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + daysAhead);

      const currentDate = new Date(today);
      
      while (currentDate <= endDate) {
        const slots = await this.generateTimeSlotsForDate(currentDate, slotDuration);
        const availableSlots = slots.filter(slot => slot.available);
        
        if (availableSlots.length > 0) {
          return {
            date: new Date(currentDate),
            slot: availableSlots[0]
          };
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return null; // No available slots found
    } catch (error) {
      console.error('Error finding next available slot:', error);
      return null;
    }
  }

  // Check if a specific time slot is available
  async isSlotAvailable(date, startTime, duration = 30) {
    try {
      const slots = await this.generateTimeSlotsForDate(date, duration);
      const targetSlot = slots.find(slot => slot.start === startTime);
      
      return targetSlot ? targetSlot.available : false;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Get busy times for a specific date (for display purposes)
  async getBusyTimesForDate(date) {
    try {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      if (!googleCalendarService.getSignedInStatus()) {
        return [];
      }

      const events = await googleCalendarService.getEventsInRange(dayStart, dayEnd);
      
      return events.map(event => ({
        start: event.start,
        end: event.end,
        title: event.title,
        id: event.id
      }));
    } catch (error) {
      console.error('Error getting busy times:', error);
      return [];
    }
  }

  // Format availability summary for display
  formatAvailabilitySummary(slots) {
    const total = slots.length;
    const available = slots.filter(s => s.available).length;
    const busy = total - available;

    return {
      total,
      available,
      busy,
      percentage: total > 0 ? Math.round((available / total) * 100) : 0
    };
  }

  // Get availability stats for a date range
  async getAvailabilityStats(startDate, endDate) {
    try {
      const stats = {
        totalSlots: 0,
        availableSlots: 0,
        busySlots: 0,
        workingDays: 0,
        nonWorkingDays: 0
      };

      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        if (this.isWorkingDay(currentDate)) {
          stats.workingDays++;
          const slots = await this.generateTimeSlotsForDate(currentDate);
          const summary = this.formatAvailabilitySummary(slots);
          
          stats.totalSlots += summary.total;
          stats.availableSlots += summary.available;
          stats.busySlots += summary.busy;
        } else {
          stats.nonWorkingDays++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return stats;
    } catch (error) {
      console.error('Error getting availability stats:', error);
      return null;
    }
  }
}

const availabilityService = new AvailabilityService();
export default availabilityService;