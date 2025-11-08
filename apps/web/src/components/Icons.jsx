import React from 'react';

export const LogoIcon = ({ className = "h-8 w-8", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill={color}>
    <rect x="10" y="20" width="80" height="70" rx="5" fill="#3b82f6"/>
    <rect x="15" y="25" width="70" height="60" rx="3" fill="white"/>
    <rect x="20" y="10" width="10" height="20" rx="2" fill="#3b82f6"/>
    <rect x="70" y="10" width="10" height="20" rx="2" fill="#3b82f6"/>
    <path d="M30 40 H70 V42 H30 V40 Z" fill="#3b82f6"/>
    <path d="M30 50 H50 V52 H30 V50 Z" fill="#3b82f6"/>
    <path d="M30 60 H60 V62 H30 V60 Z" fill="#3b82f6"/>
  </svg>
);

export const CalendarIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const LinkIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export const ClockIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const UserIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const GroupIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const ChevronDownIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const CopyIcon = ({ className = "h-6 w-6", color = "currentColor" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export const GoogleIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);