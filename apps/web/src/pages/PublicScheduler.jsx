import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Alert, Badge, Modal } from '../components/UI';

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
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [questions, setQuestions] = useState([
    { id: `q${Date.now()}`, label: 'What topics would you like to discuss?' }
  ]);
  
  // UI states
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random link ID for demo purposes
      const linkId = Math.random().toString(36).substring(2, 10);
      
      // Success! In a real app, the API would return the created link data
      setSuccessData({
        linkId,
        linkUrl: previewUrl,
        requiresApproval // Include in success data
      });
      
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
    // Validate current step
    if (step === 1 && !meetingName) {
      setError('Please provide a meeting name');
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
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">Booking Flow:</p>
            <p className="text-sm text-gray-600">
              {successData.requiresApproval 
                ? 'Bookings will require your approval before confirmation'
                : 'Bookings will be automatically confirmed'}
            </p>
          </div>
          
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
                // Reset form and start over
                setMeetingName('');
                setDescription('');
                setMeetingLength(30);
                setMaxAdvanceDays(14);
                setUsageLimit(0);
                setExpirationDate('');
                setRequiresApproval(false);
                setQuestions([{ id: `q${Date.now()}`, label: 'What topics would you like to discuss?' }]);
                setStep(1);
                setSuccessData(null);
              }}
              className="w-full sm:w-auto"
            >
              Create Another Link
            </Button>
          </div>
        </Card>
        
        {/* URL Modal */}
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

                {/* Approval Requirement Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label htmlFor="requiresApproval" className="block text-sm font-medium text-gray-700">
                      Require approval for bookings
                    </label>
                    <p className="text-xs text-gray-500">
                      When enabled, bookings will need your manual approval before confirmation
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="requiresApproval"
                      checked={requiresApproval}
                      onChange={() => setRequiresApproval(!requiresApproval)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="requiresApproval"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${requiresApproval ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${requiresApproval ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 2: Custom Questions */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Questions</h2>
            <p className="text-gray-600 mb-6">
              Add questions that will be asked when someone books a meeting with you.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start space-x-2">
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question {index + 1}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={question.label}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your question"
                        />
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg px-3 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Another Question
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter a new question"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newQuestion.trim()) {
                        e.preventDefault();
                        addQuestion();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Question Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Ask specific questions to get more useful information</li>
                  <li>Avoid questions that are too complex or time-consuming</li>
                  <li>Consider what information you need before the meeting</li>
                  <li>Limited to 5 questions to respect your client's time</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Review and Create */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Create Link</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meeting Name</p>
                    <p className="text-gray-900">{meetingName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meeting Length</p>
                    <p className="text-gray-900">
                      {meetingLengthOptions.find(opt => opt.value === meetingLength)?.label || `${meetingLength} minutes`}
                    </p>
                  </div>
                  
                  {description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-gray-900">{description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Max Days in Advance</p>
                    <p className="text-gray-900">{maxAdvanceDays} days</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Usage Limit</p>
                    <p className="text-gray-900">{usageLimit === 0 ? 'Unlimited' : usageLimit}</p>
                  </div>
                  
                  {expirationDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expiration Date</p>
                      <p className="text-gray-900">{new Date(expirationDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approval Required</p>
                    <p className="text-gray-900">{requiresApproval ? 'Yes - Bookings will need manual approval' : 'No - Bookings will be automatically confirmed'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Questions</h3>
                
                {questions.length > 0 ? (
                  <ul className="space-y-3">
                    {questions.map((question, index) => (
                      <li key={question.id} className="flex items-center">
                        <Badge variant="secondary" size="sm" className="mr-3">{index + 1}</Badge>
                        <span className="text-gray-900">{question.label}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No custom questions added.</p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Link Preview</h3>
                <p className="text-gray-500 mb-4">Your booking link will look like this:</p>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-indigo-600 break-all font-mono text-sm">
                  {previewUrl || 'https://slotify.app/book/your-unique-link'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Booking Link'}
            </Button>
          )}
        </div>
      </Card>
    </MainLayout>
  );
}