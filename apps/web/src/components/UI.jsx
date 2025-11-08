import React from 'react';

// Button Component with improved styling and variants
export const Button = ({ 
  children, 
  onClick, 
  isLoading = false, 
  variant = "primary", 
  className = "",
  type = "button",
  disabled = false,
  fullWidth = false,
  size = "md",
  icon = null
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all rounded-md";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };
  
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-sm",
    secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-indigo-500 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 shadow-sm",
    info: "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500 shadow-sm",
    light: "bg-gray-50 hover:bg-gray-100 text-gray-800 focus:ring-gray-300 shadow-sm",
    dark: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500 shadow-sm",
    link: "bg-transparent hover:underline text-indigo-600 hover:text-indigo-800 p-0 shadow-none focus:ring-0"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// Improved Input Component with floating label
export const Input = ({ 
  label, 
  id, 
  type = "text", 
  value, 
  onChange, 
  error,
  success,
  placeholder = " ",
  required = false,
  className = "",
  icon = null,
  helpText = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`block px-3 ${icon ? 'pl-10' : 'pl-3'} py-2.5 w-full text-gray-900 bg-white rounded-lg border ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
          success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
          'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } appearance-none focus:outline-none focus:ring-1 transition-colors`}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute text-sm ${
          error ? 'text-red-500' : 
          success ? 'text-green-500' : 
          'text-gray-500'
        } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 peer-focus:${
          error ? 'text-red-500' : 
          success ? 'text-green-500' : 
          'text-indigo-500'
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  id,
  value,
  onChange,
  options,
  error,
  success,
  required = false,
  placeholder = "Select an option",
  className = "",
  helpText = "",
  ...props
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`block w-full pl-3 pr-10 py-2.5 text-base border ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
            success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
            'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          } focus:outline-none focus:ring-1 rounded-lg shadow-sm transition-colors`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Card Component
export const Card = ({ 
  children, 
  className = "", 
  hover = false,
  padding = "p-6",
  bordered = true,
  onClick = null
}) => {
  return (
    <div 
      className={`bg-white rounded-xl ${bordered ? 'border border-gray-100' : ''} shadow-sm ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1' : ''} ${padding} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({
  children,
  variant = "primary",
  size = "md",
  rounded = false,
  className = ""
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  };
  
  const variantClasses = {
    primary: "bg-indigo-100 text-indigo-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    light: "bg-gray-50 text-gray-600",
    dark: "bg-gray-800 text-white"
  };
  
  return (
    <span className={`inline-flex items-center font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}>
      {children}
    </span>
  );
};

// Empty State Component with improved visuals
export const EmptyState = ({ 
  title, 
  description, 
  actionText, 
  onAction, 
  icon = null,
  className = ""
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    {icon && (
      <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>
    {actionText && onAction && (
      <Button
        onClick={onAction}
        variant="primary"
        size="md"
      >
        {actionText}
      </Button>
    )}
  </div>
);

// Improved Sidebar Component
export const Sidebar = ({ user, signOut, activePath, isMobile = false, onClose = null }) => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Meetings',
      path: '/meetings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Availability',
      path: '/create-window',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Booking Links',
      path: '/create-link',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
        </svg>
      )
    }
  ];
  
  return (
    <aside className={`fixed inset-y-0 left-0 bg-white shadow-md max-h-screen ${isMobile ? 'w-full z-50' : 'w-64 z-30'}`}>
      {isMobile && (
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow">
          <div className="p-4 flex items-center justify-center border-b">
            <div className="flex items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="ml-2 text-xl font-bold text-indigo-600">Slotify</h1>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center px-4 py-4 border-b border-gray-100">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.displayName || user.email || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <a 
                    href={item.path} 
                    className={`flex items-center ${
                      activePath === item.path 
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-4' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 pl-5'
                    } rounded-md py-3 transition-all duration-200`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t">
          <button 
            onClick={signOut} 
            className="flex w-full items-center text-gray-700 hover:text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// Improved Main Layout Component
export const MainLayout = ({ children, user, activePath }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-20 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div className="bg-indigo-600 text-white p-1.5 rounded-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="ml-2 text-lg font-bold text-indigo-600">Slotify</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} signOut={handleSignOut} activePath={activePath} />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <Sidebar 
          user={user} 
          signOut={handleSignOut} 
          activePath={activePath} 
          isMobile={true} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-200 lg:pt-6 pb-12">
        {/* Mobile padding fix */}
        <div className="lg:hidden h-16"></div>
        
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
};

// Toast Notification Component with improved animations
export const Toast = ({ 
  message, 
  type = 'success', 
  onClose,
  duration = 3000,
  position = 'top-right'
}) => {
  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };
  
  const textColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };
  
  const icons = {
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  const positions = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };
  
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  return (
    <div className={`${positions[position]} w-80 px-4 py-3 rounded-lg border ${backgrounds[type]} shadow-lg animate-slideInUp`}>
      <div className="flex items-center">
        <div className={textColors[type]}>
          {icons[type]}
        </div>
        <div className="ml-3 mr-8">
          <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Dialog/Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h3
                className="text-lg font-medium leading-6 text-gray-900"
                id="modal-headline"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-150 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2">{children}</div>
          </div>
          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alert Component
export const Alert = ({
  title,
  message,
  type = "info",
  onClose = null,
  className = ""
}) => {
  const typeClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };
  
  const icons = {
    info: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return (
    <div className={`rounded-md border p-4 ${typeClasses[type]} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {message && <div className="text-sm mt-1">{message}</div>}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'info' ? 'focus:ring-blue-500' :
                  type === 'success' ? 'focus:ring-green-500' :
                  type === 'warning' ? 'focus:ring-yellow-500' :
                  'focus:ring-red-500'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Avatar Component
export const Avatar = ({
  name = "",
  src = "",
  size = "md",
  className = ""
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-20 w-20 text-2xl"
  };
  
  const colors = [
    "bg-blue-200 text-blue-800", 
    "bg-green-200 text-green-800",
    "bg-purple-200 text-purple-800",
    "bg-yellow-200 text-yellow-800",
    "bg-pink-200 text-pink-800",
    "bg-indigo-200 text-indigo-800"
  ];
  
  // Generate a consistent color based on the name
  const colorIndex = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  const colorClass = colors[colorIndex];
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium ${src ? "" : colorClass} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

// Radio Button Component
export const Radio = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

// Tabs Component
export const Tabs = ({ 
  tabs, 
  activeTab, 
  onChange,
  className = ""
}) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Toggle/Switch Component
export const Toggle = ({
  enabled,
  onChange,
  label = "",
  size = "md",
  disabled = false,
  className = ""
}) => {
  const sizeClasses = {
    sm: {
      toggle: "h-4 w-7",
      dot: "h-3 w-3",
      translate: "translate-x-3"
    },
    md: {
      toggle: "h-5 w-10",
      dot: "h-4 w-4",
      translate: "translate-x-5"
    },
    lg: {
      toggle: "h-6 w-12",
      dot: "h-5 w-5",
      translate: "translate-x-6"
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        className={`
          ${sizeClasses[size].toggle} 
          ${enabled ? 'bg-indigo-600' : 'bg-gray-200'} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent 
          transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-indigo-500
        `}
        disabled={disabled}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            ${sizeClasses[size].dot}
            ${enabled ? sizeClasses[size].translate : 'translate-x-0'} 
            pointer-events-none inline-block rounded-full bg-white shadow transform 
            ring-0 transition ease-in-out duration-200
          `}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm text-gray-700">{label}</span>
      )}
    </div>
  );
};

// Export all components
export default {
  Button,
  Input,
  Select,
  Card,
  Badge,
  EmptyState,
  Sidebar,
  MainLayout,
  Toast,
  Modal,
  Alert,
  Avatar,
  Checkbox,
  Radio,
  Tabs,
  Toggle
};