import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Alert, Badge, Modal, Toggle } from '../components/UI';

export default function CreateLink() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: basic details, 2: questions, 3: preview & create
  
  // Form fields
  const [meetingName, setMeetingName] = useState('');
  const [description, setDescription] = useState('');
  const [meetingLength, setMeetingLength] = useState(30);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(14);
  const [usageLimit, setUsageLimit] = useState(0); // 0 means unlimited
  const [expirationDate, setExpirationDate] = useState('');
  const [questions, setQuestions] = useState([
    { id: `q${Date.now()}`, label: 'What topics would you like to discuss?' }
  ]);
  
  // Approval workflow
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [teamMembers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' }
  ]);
  
  // UI states
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Calendar integration states
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState(['primary']);
  const [checkCalendarConflicts, setCheckCalendarConflicts] = useState(true);
  const [createCalendarEvents, setCreateCalendarEvents] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // Example URL 
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Available meeting lengths
  const meetingLengthOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];
  
  // Check if user has connected Google Calendar
  useEffect(() => {
    const checkCalendarConnection = async () => {
      try {
        const hasCalendarTokens = localStorage.getItem('googleCalendarTokens') !== null;
        setIsCalendarConnected(hasCalendarTokens);
        
        if (hasCalendarTokens) {
          setCalendars([
            { id: 'primary', name: 'Main Calendar', primary: true },
            { id: 'work', name: 'Work Calendar', primary: false },
            { id: 'personal', name: 'Personal Events', primary: false }
          ]);
        }
      } catch (err) {
        console.error('Error checking calendar connection:', err);
      }
    };
    
    checkCalendarConnection();
  }, []);
  
  // Generate preview URL when meetingName changes
  useEffect(() => {
    if (meetingName) {
      const slug = meetingName
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
      setPreviewUrl(`https://slotify.app/book/${auth.currentUser?.uid?.slice(0, 8) || 'user'}/${slug}`);
    } else {
      setPreviewUrl('');
    }
  }, [meetingName]);
  
  // Toggle calendar selection
  const toggleCalendarSelection = (calendarId) => {
    setSelectedCalendarIds(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  };
  
  // Add a new custom question
  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, { id: `q${Date.now()}`, label: newQuestion }]);
      setNewQuestion('');
    }
  };

  // Remove a question
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update a question
  const updateQuestion = (id, newLabel) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, label: newLabel } : q));
  };

  // Calculate tomorrow's date in YYYY-MM-DD format for min date input
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      localStorage.setItem('googleCalendarTokens', 'dummy-token');
      setIsCalendarConnected(true);
      
      setCalendars([
        { id: 'primary', name: 'Main Calendar', primary: true },
        { id: 'work', name: 'Work Calendar', primary: false },
        { id: 'personal', name: 'Personal Events', primary: false }
      ]);
      
      setSuccessMessage('Google Calendar connected successfully!');
    } catch (err) {
      console.error('Error connecting to Google Calendar:', err);
      setError('Failed to connect Google Calendar. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get current user ID from Firebase auth
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Validate form
      if (!meetingName) {
        throw new Error('Meeting name is required');
      }
      
      if (requiresApproval && approvers.length === 0) {
        throw new Error('Please select at least one approver when approval is required');
      }
      
      // If calendar integration is enabled, check if we need to verify calendar conflicts
      if (isCalendarConnected && checkCalendarConflicts) {
        await checkForCalendarConflicts();
      }
      
      // Simulate API call to create the booking link
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random link ID for demo purposes
      const linkId = Math.random().toString(36).substring(2, 10);
      
      // Prepare link data
      const linkData = {
        meetingName,
        description,
        meetingLength,
        maxAdvanceDays,
        usageLimit,
        expirationDate,
        questions,
        linkId,
        linkUrl: previewUrl,
        calendarIntegration: isCalendarConnected && createCalendarEvents,
        selectedCalendarIds: isCalendarConnected ? selectedCalendarIds : [],
        checkCalendarConflicts,
        createCalendarEvents
      };
      
      // Add approval data if needed
      if (requiresApproval && approvers.length > 0) {
        linkData.requiresApproval = true;
        linkData.approvers = approvers;
      }
      
      // Success!
      setSuccessData(linkData);
      
      // Skip to success view
      setStep(4);
      
    } catch (err) {
      console.error('Error creating scheduling link:', err);
      setError(err.message || 'Failed to create scheduling link');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate checking for calendar conflicts
  const checkForCalendarConflicts = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccessMessage('Link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        setError('Failed to copy link to clipboard');
      });
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (step === 1 && !meetingName) {
      setError('Please provide a meeting name');
      return;
    }
    
    if (step === 1 && requiresApproval && approvers.length === 0) {
      setError('Please select at least one approver');
      return;
    }
    
    window.scrollTo(0, 0);
    setStep(prevStep => prevStep + 1);
    setError('');
  };

  const goToPreviousStep = () => {
    window.scrollTo(0, 0);
    setStep(prevStep => prevStep - 1);
    setError('');
  };

  // Render success view after link creation
  if (step === 4 && successData) {
    return (
      <MainLayout>
        <Card className="text-center max-w-md mx-auto">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Link Created!</h2>
          <p className="text-gray-600 mb-6">
            Share this link with your clients to allow them to book meetings with you.
          </p>
          
          <div 
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg mb-8 cursor-pointer"
            onClick={() => setShowUrlModal(true)}
          >
            <div className="truncate text-indigo-600 text-sm w-4/5 text-left">
              {successData.linkUrl}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(successData.linkUrl);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {successMessage && (
            <div className="mb-6 p-2 bg-green-50 text-green-600 text-sm rounded-md animate-slideInUp">
              {successMessage}
            </div>
          )}
          
          {successData.calendarIntegration && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg text-left">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">Calendar Integration Active</span>
              </div>
              <p className="text-xs text-blue-700 ml-7 mt-1">
                Bookings will automatically create events in your Google Calendar
              </p>
            </div>
          )}
          
          {successData.requiresApproval && (
            <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-lg text-left">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium text-purple-800">Approval Workflow Active</span>
              </div>
              <p className="text-xs text-purple-700 ml-7 mt-1">
                Bookings will require approval from selected approvers
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                setMeetingName('');
                setDescription('');
                setMeetingLength(30);
                setMaxAdvanceDays(14);
                setUsageLimit(0);
                setExpirationDate('');
                setQuestions([{ id: `q${Date.now()}`, label: 'What topics would you like to discuss?' }]);
                setRequiresApproval(false);
                setApprovers([]);
                setStep(1);
                setSuccessData(null);
              }}
              className="w-full sm:w-auto"
            >
              Create Another Link
            </Button>
          </div>
        </Card>
        
        <Modal
          isOpen={showUrlModal}
          onClose={() => setShowUrlModal(false)}
          title="Your Booking Link"
          size="lg"
        >
          <div className="space-y-6">
            <div className="break-all bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 font-mono">{successData.linkUrl}</p>
            </div>
            
            <div className="text-gray-600">
              <p className="mb-2">You can share this link in several ways:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send it via email to clients</li>
                <li>Add it to your email signature</li>
                <li>Share it on your social media profiles</li>
                <li>Add it to your website or landing page</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => copyToClipboard(successData.linkUrl)}
                className="mr-3"
              >
                Copy Link
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowUrlModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex flex-col items-center space-y-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="text-xs font-medium">Meeting Details</span>
          </div>
          <div className={`h-1 w-full mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="text-xs font-medium">Questions</span>
          </div>
          <div className={`h-1 w-full mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center space-y-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="text-xs font-medium">Review & Create</span>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
          className="mb-6"
        />
      )}
      
      {/* Form Content Based on Step */}
      <Card>
        {/* Step 1: Basic Meeting Details */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Meeting Details</h2>
            
            <form className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="meetingName" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Name *
                  </label>
                  <input
                    id="meetingName"
                    type="text"
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Initial Consultation, Strategy Session"
                    required
                  />
                  {previewUrl && (
                    <p className="mt-1 text-xs text-gray-500">
                      Link preview: {previewUrl}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what this meeting is about"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="meetingLength" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Length *
                    </label>
                    <select
                      id="meetingLength"
                      value={meetingLength}
                      onChange={(e) => setMeetingLength(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {meetingLengthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="maxAdvanceDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Days in Advance *
                    </label>
                    <input
                      id="maxAdvanceDays"
                      type="number"
                      value={maxAdvanceDays}
                      onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      How far in advance can people book meetings
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit (0 for unlimited)
                    </label>
                    <input
                      id="usageLimit"
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum number of bookings allowed with this link
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      min={getTomorrowDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Date when this link will no longer be usable
                    </p>
                  </div>
                </div>
                
                {/* Calendar Integration Section */}
                {isCalendarConnected ? (
                  <div className="border-t border-gray-200 pt-4 mt-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Calendar Integration</h3>
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => setShowCalendarModal(true)}
                      >
                        Configure Calendars
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Check calendar conflicts</p>
                          <p className="text-xs text-gray-500">
                            Prevent double bookings by checking your calendar
                          </p>
                        </div>
                        <Toggle
                          enabled={checkCalendarConflicts}
                          onChange={setCheckCalendarConflicts}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Create calendar events</p>
                          <p className="text-xs text-gray-500">
                            Automatically create events when bookings are made
                          </p>
                        </div>
                        <Toggle
                          enabled={createCalendarEvents}
                          onChange={setCreateCalendarEvents}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 mt-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">Calendar Integration (Optional)</span>
                      </div>
                      <p className="text-xs text-blue-700 ml-7 mt-1">
                        Connect your Google Calendar to prevent double bookings and automatically create events
                      </p>
                      <div className="mt-3 ml-7">
                        <Button
                          size="sm"
                          onClick={connectGoogleCalendar}
                        >
                          Connect Google Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Approval Settings Section */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Approval Settings</h3>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Require Approval</p>
                      <p className="text-xs text-gray-500">
                        Bookings will require approval before being confirmed
                      </p>
                    </div>
                    <Toggle
                      enabled={requiresApproval}
                      onChange={setRequiresApproval}
                    />
                  </div>
                  
                  {requiresApproval && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Approvers
                      </label>
                      <div className="space-y-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {teamMembers.map(member => (
                          <div key={member.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`approver-${member.id}`}
                              checked={approvers.includes(member.id)}
                              onChange={() => {
                                if (approvers.includes(member.id)) {
                                  setApprovers(approvers.filter(id => id !== member.id));
                                } else {
                                  setApprovers([...approvers, member.id]);
                                }
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`approver-${member.id}`} className="ml-3 text-sm text-gray-700">
                              {member.name} {member.email && `(${member.email})`}
                            </label>
                          </div>
                        ))}
                      </div>
                      {requiresApproval && approvers.length === 0 && (
                        <p className="mt-1 text-xs text-red-500">Please select at least one approver</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={goToNextStep}
                  className="w-full sm:w-auto"
                >
                  Continue to Questions
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 2: Questions */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Questions</h2>
            
            <p className="text-gray-600 mb-6">
              Add questions that your clients will answer when booking a meeting. This helps you prepare and makes meetings more productive.
            </p>
            
            <div className="mb-8">
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="relative p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <Badge color="gray" className="mr-2">Question {index + 1}</Badge>
                          {index === 0 && <Badge color="blue">Required</Badge>}
                        </div>
                        <input
                          type="text"
                          value={question.label}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your question"
                        />
                      </div>
                      
                      {index > 0 && (
                        <button 
                          onClick={() => removeQuestion(question.id)}
                          className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove question"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg rounded-r-none shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a new question..."
                    onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                  />
                  <Button
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="rounded-l-none"
                  >
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              <Button
                onClick={goToNextStep}
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Preview & Create */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Create</h2>
            
            <div className="mb-8 space-y-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Meeting Details</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Meeting Name</p>
                      <p className="text-sm text-gray-900">{meetingName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Meeting Length</p>
                      <p className="text-sm text-gray-900">
                        {meetingLengthOptions.find(opt => opt.value === meetingLength)?.label || `${meetingLength} minutes`}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Max Days in Advance</p>
                      <p className="text-sm text-gray-900">{maxAdvanceDays} days</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Usage Limit</p>
                      <p className="text-sm text-gray-900">{usageLimit === 0 ? 'Unlimited' : usageLimit}</p>
                    </div>
                    
                    {expirationDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expiration Date</p>
                        <p className="text-sm text-gray-900">{new Date(expirationDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-900">{description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Booking Questions</h3>
                </div>
                <div className="p-4">
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-500">No questions added.</p>
                  ) : (
                    <ul className="space-y-2">
                      {questions.map((question, index) => (
                        <li key={question.id} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-600 text-xs font-medium mr-2 mt-0.5">{index + 1}</span>
                          <span className="text-sm text-gray-900">{question.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {isCalendarConnected && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Calendar Integration</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-900">Check for calendar conflicts</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${checkCalendarConflicts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {checkCalendarConflicts ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-900">Create calendar events</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${createCalendarEvents ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {createCalendarEvents ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      {selectedCalendarIds.length > 0 && createCalendarEvents && (
                        <div className="pt-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Selected Calendars:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCalendarIds.map(calId => {
                              const calendar = calendars.find(cal => cal.id === calId);
                              return (
                                <span key={calId} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                  {calendar?.name || calId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {requiresApproval && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Approval Settings</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-900">Requires Approval</p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Enabled
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Approvers:</p>
                        <div className="flex flex-wrap gap-2">
                          {approvers.map(approverId => {
                            const approver = teamMembers.find(m => m.id === approverId);
                            return (
                              <span key={approverId} className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                                {approver?.name || approverId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Booking Link Preview</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    This is the link your clients will use to book meetings with you:
                  </p>
                  <div className="flex items-center p-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="text-sm font-mono text-indigo-600 truncate">
                      {previewUrl}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Booking Link
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Calendar Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Configure Calendars"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500 mb-4">
            Select the calendars you want to use for booking availability and event creation.
          </div>
          
          <div className="space-y-3">
            {calendars.map(calendar => (
              <div key={calendar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`calendar-${calendar.id}`}
                    checked={selectedCalendarIds.includes(calendar.id)}
                    onChange={() => toggleCalendarSelection(calendar.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`calendar-${calendar.id}`} className="ml-2 text-sm font-medium text-gray-700">
                    {calendar.name}
                    {calendar.primary && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Primary
                      </span>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowCalendarModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}