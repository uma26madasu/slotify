import React, { useState, useEffect } from 'react';


// Custom hook for data fetching with loading, error, and retrying capabilities
const useDataFetching = (fetchFunction, initialState = null) => {
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchFunction, retryCount]);

  return { data, isLoading, error, retry };
};

// API service for fetching data
const analyticsService = {
  getAnalytics: () => {
    // Simulate API call with random failure for demonstration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of error for demo purposes
        if (Math.random() < 0.1) {
          reject(new Error('Failed to fetch analytics data'));
        } else {
          resolve({
            projectStats: {
              totalProjects: 24,
              active: 12,
              completed: 8,
              planning: 4
            },
            taskStats: {
              totalTasks: 87,
              completed: 52,
              inProgress: 23,
              overdue: 12
            },
            teamMembers: [
              { id: 1, name: 'Alex Johnson', role: 'Project Manager', tasksCompleted: 18 },
              { id: 2, name: 'Sam Taylor', role: 'Developer', tasksCompleted: 24 },
              { id: 3, name: 'Jamie Williams', role: 'Designer', tasksCompleted: 16 }
            ],
            recentActivity: [
              { id: 1, type: 'completion', project: 'Website Redesign', time: '2 hours ago' },
              { id: 2, type: 'comment', project: 'Mobile App', time: '4 hours ago' },
              { id: 3, type: 'update', project: 'CRM Integration', time: '1 day ago' }
            ]
          });
        }
      }, 1500);
    });
  }
};

// Error UI component
const ErrorState = ({ message, onRetry }) => (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    <svg
      className="mx-auto h-12 w-12 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">Data Loading Failed</h3>
    <p className="mt-1 text-sm text-gray-500">{message || 'There was an error loading the data.'}</p>
    <div className="mt-4">
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const { data, isLoading, error, retry } = useDataFetching(analyticsService.getAnalytics);

  // If loading, show skeleton UI
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // If error, show error state with retry option
  if (error) {
    return <ErrorState message={error.message} onRetry={retry} />;
  }

  // Render the dashboard with actual data
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Projects</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{data.projectStats.totalProjects}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Active</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{data.projectStats.active}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Completed</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{data.projectStats.completed}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">Planning</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{data.projectStats.planning}</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Task Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
            <p className="mt-2 text-2xl font-bold">{data.taskStats.totalTasks}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">{data.taskStats.completed}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">{data.taskStats.inProgress}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">Overdue</h3>
            <p className="mt-2 text-2xl font-bold text-red-600">{data.taskStats.overdue}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="space-y-4">
            {data.teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{member.tasksCompleted}</p>
                  <p className="text-xs text-gray-500">Tasks Completed</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {data.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start border-b pb-4 last:border-0">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                  ${activity.type === 'completion' ? 'bg-green-100 text-green-600' : 
                    activity.type === 'comment' ? 'bg-blue-100 text-blue-600' : 
                    'bg-yellow-100 text-yellow-600'}`}
                >
                  {activity.type === 'completion' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : activity.type === 'comment' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.project}</p>
                  <p className="text-xs text-gray-500">
                    {activity.type === 'completion' ? 'Task completed' : 
                      activity.type === 'comment' ? 'New comment added' : 
                      'Project updated'} · {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;