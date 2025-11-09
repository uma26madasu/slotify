import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';

// Logo component for Slotify
const SlotifyLogo = ({ className = '' }) => (
  <div className={`text-indigo-600 ${className}`}>
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" />
      <rect x="5" y="8" width="14" height="11" rx="1" fill="white" />
      <rect x="7" y="3" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="15" y="3" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="7" y="10" width="10" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="7" y="14" width="6" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  
  // Get current user on mount
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Meetings',
      path: '/meetings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Availability',
      path: '/create-window',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Booking Links',
      path: '/create-link',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
        </svg>
      )
    }
  ];
  
  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileOpen(prev => !prev);
  };
  
  // Desktop menu collapse toggle
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  // Different UI for desktop (collapsible sidebar) and mobile (drawer)
  return (
    <>
      {/* Mobile trigger button visible at top of screen */}
      <div className="lg:hidden fixed top-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-white z-30 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SlotifyLogo />
          <h1 className="text-lg font-bold text-gray-900">Slotify</h1>
        </div>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">Open menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)} 
          aria-hidden="true"
        ></div>
      )}
      
      {/* Mobile drawer */}
      <div 
        id="mobile-menu"
        className={`fixed top-0 bottom-0 left-0 right-0 z-50 w-full bg-white transform transition-transform ease-in-out duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ maxWidth: '20rem' }}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlotifyLogo />
              <h1 className="text-xl font-bold text-gray-900">Slotify</h1>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {user && (
            <div className="flex items-center px-4 py-4 border-b border-gray-200">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate" style={{ maxWidth: '200px' }}>{user.email}</p>
              </div>
            </div>
          )}
          
          <nav className="flex-1 px-2 py-4 bg-white overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileOpen(false);
                    navigate(item.path);
                  }}
                  className={`
                    group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200
                    ${isActive(item.path) 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <SlotifyLogo />
            {!isCollapsed && <h1 className="ml-2 text-xl font-bold text-gray-900">Slotify</h1>}
          </div>
          {!isCollapsed && (
            <button 
              onClick={toggleCollapse}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <span className="sr-only">Collapse sidebar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
          {isCollapsed && (
            <button 
              onClick={toggleCollapse}
              className="absolute -right-3 top-10 bg-white rounded-full shadow-md p-1 border border-gray-200 text-gray-500 hover:text-gray-600"
            >
              <span className="sr-only">Expand sidebar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {user && !isCollapsed && (
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700">{user.displayName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        {user && isCollapsed && (
          <div className="flex justify-center py-3 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
        
        <nav className="flex-1 px-2 py-4 bg-white">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={`
                  group flex items-center ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'} text-sm font-medium rounded-md transition-colors duration-200
                  ${isActive(item.path) 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                {!isCollapsed && item.name}
              </a>
            ))}
          </div>
        </nav>
        
        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleSignOut}
            className={`
              flex items-center text-gray-700 hover:text-red-600 
              ${isCollapsed ? 'p-2 justify-center' : 'px-3 py-2'} 
              rounded-md hover:bg-red-50 transition-colors duration-200
              ${isCollapsed ? 'w-auto' : 'w-full'}
            `}
            title={isCollapsed ? 'Sign out' : ''}
          >
            <svg className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="font-medium">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;