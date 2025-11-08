import React from 'react';

const SlotifyLogo = ({ className = '', size = 32, showText = false, textClassName = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-indigo-600"
      >
        {/* Calendar background */}
        <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" />
        
        {/* Calendar inner area */}
        <rect x="5" y="8" width="14" height="11" rx="1" fill="white" />
        
        {/* Calendar hangers */}
        <rect x="7" y="3" width="2" height="4" rx="1" fill="currentColor" />
        <rect x="15" y="3" width="2" height="4" rx="1" fill="currentColor" />
        
        {/* Calendar lines/time slot indicators */}
        <rect x="7" y="10" width="10" height="1.5" rx="0.75" fill="currentColor" />
        <rect x="7" y="14" width="6" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
      
      {/* Text (Optional) */}
      {showText && (
        <span className={`ml-2 font-bold text-indigo-600 ${textClassName}`}>
          Slotify
        </span>
      )}
    </div>
  );
};

export default SlotifyLogo;
