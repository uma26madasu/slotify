import React, { useState, useEffect } from 'react';


// Simulated data fetch function for available time slots
const fetchAvailability = (date) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Randomly generate available time slots for the selected date
      const timeSlots = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        // Add some randomization to available slots
        if (Math.random() > 0.3) { // 70% chance of availability
          timeSlots.push(`${hour}:00`);
        }
        if (Math.random() > 0.5) { // 50% chance of availability
          timeSlots.push(`${hour}:30`);
        }
      }
      
      resolve(timeSlots);
    }, 1200); // 1.2 second delay
  });
};

const Scheduler = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeLoading, setIsTimeLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    // Generate the next 7 available dates (excluding weekends for this example)
    const generateDates = () => {
      const dates = [];
      const currentDate = new Date();
      let daysToAdd = 1;
      
      while (dates.length < 7) {
        const nextDate = new Date();
        nextDate.setDate(currentDate.getDate() + daysToAdd);
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        const day = nextDate.getDay();
        if (day !== 0 && day !== 6) {
          dates.push({
            date: nextDate,
            formatted: nextDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })
          });
        }
        
        daysToAdd++;
      }
      
      return dates;
    };
    
    // Simulate loading dates
    setTimeout(() => {
      setAvailableDates(generateDates());
      setIsLoading(false);
    }, 1500);
  }, []);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsTimeLoading(true);
    
    // Fetch available time slots for the selected date
    fetchAvailability(date.date)
      .then(slots => {
        setAvailableTimeSlots(slots);
        setIsTimeLoading(false);
      })
      .catch(error => {
        console.error('Error fetching time slots:', error);
        setIsTimeLoading(false);
      });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your API
    console.log('Submitting meeting request:', {
      date: selectedDate.formatted,
      time: selectedTime,
      ...formData
    });
    // Show a success message or redirect
    alert('Meeting scheduled successfully!');
  };

  if (isLoading) {
    return <SchedulerSkeleton />;
  }

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-1">Schedule a Meeting</h1>
      <p className="text-gray-600 mb-8">Select an available date and time that works for you.</p>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-3">Select a Date</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableDates.map((date, index) => (
              <button
                key={index}
                className={`py-2 px-3 rounded-md text-center transition-colors ${
                  selectedDate && selectedDate.formatted === date.formatted
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => handleDateSelect(date)}
              >
                {date.formatted}
              </button>
            ))}
          </div>
        </div>
        
        {selectedDate && (
          <div>
            <h2 className="text-lg font-medium mb-3">Select a Time</h2>
            {isTimeLoading ? (
              <TimeSlotsSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((time, index) => (
                    <button
                      key={index}
                      className={`py-3 px-4 rounded-md text-center transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {formatTime(time)}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">No time slots available for this date.</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {selectedDate && selectedTime && (
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-medium mb-2">Your Information</h2>
            
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Meeting Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        )}
        
        {selectedDate && selectedTime && (
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!formData.name || !formData.email}
            >
              Schedule Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduler;