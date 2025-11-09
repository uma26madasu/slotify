import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = React.useState('Dashboard');
  
  // Set page title based on current path
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      setPageTitle('Dashboard');
    } else if (path === '/meetings') {
      setPageTitle('Meetings');
    } else if (path === '/create-window') {
      setPageTitle('Create Availability Window');
    } else if (path === '/create-link') {
      setPageTitle('Create Booking Link');
    } else if (path.startsWith('/meetings/')) {
      setPageTitle('Meeting Details');
    } else if (path.startsWith('/links/')) {
      setPageTitle('Link Details');
    } else {
      // Extract the last part of the path and capitalize it
      const pathParts = path.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        setPageTitle(lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' '));
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="lg:pl-64 transition-all duration-300">
        {/* Mobile header spacing */}
        <div className="lg:hidden h-14"></div>
        
        {/* Page content */}
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          
          {/* Main content with animation */}
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;