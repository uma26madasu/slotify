import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Card, Button, Badge, Modal, Alert } from '../components/UI';

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        
        // In a real app, fetch from your API
        // Simulated with setTimeout
        setTimeout(() => {
          setApprovals([
            // Mock data with various approval statuses
            {
              id: 'a1',
              clientName: 'Alex Johnson',
              clientEmail: 'alex@example.com',
              meetingName: 'Strategy Session',
              date: '2025-05-26',
              time: '10:00 AM',
              status: 'pending',
              submittedAt: '2025-05-19T15:30:00Z'
            },
            {
              id: 'a2',
              clientName: 'Emma Wilson',
              clientEmail: 'emma@example.com',
              meetingName: 'Initial Consultation',
              date: '2025-05-27',
              time: '2:00 PM',
              status: 'pending',
              submittedAt: '2025-05-19T16:45:00Z'
            },
            {
              id: 'a3',
              clientName: 'Michael Brown',
              clientEmail: 'michael@example.com',
              meetingName: 'Project Review',
              date: '2025-05-25',
              time: '3:30 PM',
              status: 'approved',
              submittedAt: '2025-05-18T10:15:00Z',
              approvedAt: '2025-05-19T08:30:00Z',
              approvedBy: 'Jane Smith'
            },
            {
              id: 'a4',
              clientName: 'Lisa Chen',
              clientEmail: 'lisa@example.com',
              meetingName: 'Sales Demo',
              date: '2025-05-24',
              time: '1:00 PM',
              status: 'rejected',
              submittedAt: '2025-05-17T14:20:00Z',
              rejectedAt: '2025-05-18T09:15:00Z',
              rejectedBy: 'Jane Smith',
              rejectionReason: 'Schedule conflict with team meeting'
            }
          ]);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError('Failed to load approval requests');
        setLoading(false);
      }
    };
    
    fetchApprovals();
  }, []);

  const handleApprove = async (approvalId) => {
    try {
      // In a real app, call your API to approve the meeting
      
      // Update state to reflect approval
      setApprovals(approvals.map(approval => 
        approval.id === approvalId 
          ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() } 
          : approval
      ));
      
      setSuccessMessage('Meeting approved successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error approving meeting:', err);
      setError('Failed to approve meeting');
    }
  };

  const handleReject = async (approvalId, reason) => {
    try {
      // In a real app, call your API to reject the meeting
      
      // Update state to reflect rejection
      setApprovals(approvals.map(approval => 
        approval.id === approvalId 
          ? { 
              ...approval, 
              status: 'rejected', 
              rejectedAt: new Date().toISOString(),
              rejectionReason: reason
            } 
          : approval
      ));
      
      // Reset rejection modal state
      setShowRejectionModal(false);
      setRejectionReason('');
      
      setSuccessMessage('Meeting rejected successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error rejecting meeting:', err);
      setError('Failed to reject meeting');
    }
  };

  // Filter approvals based on selected filter
  const filteredApprovals = approvals.filter(approval => {
    if (filter === 'all') return true;
    return approval.status === filter;
  });

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Booking Approval Requests</h1>
      
      {/* Success message */}
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          className="mb-6"
        />
      )}
      
      {/* Error message */}
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          className="mb-6"
        />
      )}
      
      {/* Filter tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Requests' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    filter === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {tab.id === 'pending' && (
                  <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-orange-100 text-orange-700">
                    {approvals.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Approvals list */}
      <Card>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredApprovals.length > 0 ? (
          <div className="space-y-4">
            {filteredApprovals.map((approval) => (
              <div
                key={approval.id}
                className={`
                  flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg
                  ${approval.status === 'pending' 
                    ? 'border-orange-100 bg-orange-50 hover:bg-orange-100' 
                    : approval.status === 'approved'
                    ? 'border-green-100 bg-green-50 hover:bg-green-100'
                    : 'border-red-100 bg-red-50 hover:bg-red-100'
                  } transition-colors cursor-pointer
                `}
                onClick={() => {
                  setSelectedApproval(approval);
                }}
              >
                <div className="flex items-start">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium
                    ${approval.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : approval.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {approval.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{approval.clientName}</p>
                    <p className="text-sm text-gray-500">{approval.clientEmail}</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <p className="font-medium text-gray-900">{approval.meetingName}</p>
                  <p className="text-sm text-gray-500">
                    {approval.date} at {approval.time}
                  </p>
                </div>
                
                <div className="mt-3 sm:mt-0 flex flex-col sm:items-end">
                  <Badge
                    variant={
                      approval.status === 'pending'
                        ? 'warning'
                        : approval.status === 'approved'
                        ? 'success'
                        : 'danger'
                    }
                    rounded
                    className="mb-2"
                  >
                    {approval.status === 'pending'
                      ? 'Pending Approval'
                      : approval.status === 'approved'
                      ? 'Approved'
                      : 'Rejected'
                    }
                  </Badge>
                  
                  {approval.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(approval.id);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApproval(approval);
                          setShowRejectionModal(true);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-base font-medium text-gray-900">No approval requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'pending'
                ? 'You have no pending approval requests.'
                : filter === 'approved'
                ? 'You have no approved requests.'
                : filter === 'rejected'
                ? 'You have no rejected requests.'
                : 'There are no approval requests in the system.'}
            </p>
          </div>
        )}
      </Card>
      
      {/* Approval detail modal */}
      {selectedApproval && (
        <Modal
          isOpen={!!selectedApproval && !showRejectionModal}
          onClose={() => setSelectedApproval(null)}
          title="Booking Request Details"
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setSelectedApproval(null)}
              >
                Close
              </Button>
              
              {selectedApproval.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleApprove(selectedApproval.id)}
                    className="ml-3"
                  >
                    Approve Request
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectionModal(true)}
                    className="ml-3"
                  >
                    Reject Request
                  </Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Client Information</h4>
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-medium
                    ${selectedApproval.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : selectedApproval.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {selectedApproval.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{selectedApproval.clientName}</p>
                    <p className="text-sm text-gray-500">{selectedApproval.clientEmail}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Meeting Details</h4>
                <p className="font-medium text-gray-900">{selectedApproval.meetingName}</p>
                <p className="text-gray-500">{selectedApproval.date} at {selectedApproval.time}</p>
                <div className="mt-2">
                  <Badge
                    variant={
                      selectedApproval.status === 'pending'
                        ? 'warning'
                        : selectedApproval.status === 'approved'
                        ? 'success'
                        : 'danger'
                    }
                    rounded
                  >
                    {selectedApproval.status === 'pending'
                      ? 'Pending Approval'
                      : selectedApproval.status === 'approved'
                      ? 'Approved'
                      : 'Rejected'
                    }
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Timeline</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="relative">
                  <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200"></div>
                  
                  <div className="relative flex items-start mb-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Booking Requested</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedApproval.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedApproval.status !== 'pending' && (
                    <div className="relative flex items-start">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                        selectedApproval.status === 'approved' ? 'bg-green-500' : 'bg-red-500'  
                      }`}>
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {selectedApproval.status === 'approved' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedApproval.status === 'approved' ? 'Booking Approved' : 'Booking Rejected'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedApproval.status === 'approved' 
                            ? new Date(selectedApproval.approvedAt).toLocaleString() 
                            : new Date(selectedApproval.rejectedAt).toLocaleString()}
                          {selectedApproval.status === 'approved' 
                            ? ` by ${selectedApproval.approvedBy}`
                            : ` by ${selectedApproval.rejectedBy}`}
                        </p>
                        {selectedApproval.status === 'rejected' && selectedApproval.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {selectedApproval.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Reject Booking Request"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowRejectionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedApproval) {
                  handleReject(selectedApproval.id, rejectionReason);
                }
              }}
              className="ml-3"
            >
              Reject Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection
            </label>
            <textarea
              id="rejectionReason"
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Please provide a reason for rejecting this booking request"
            ></textarea>
          </div>
          <p className="text-sm text-gray-500">
            This reason will be included in the notification sent to the client.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
}