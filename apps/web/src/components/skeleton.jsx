// src/components/Skeleton.jsx
import React from 'react';

// Base skeleton that can be customized for various uses
export const Skeleton = ({ className = '', ...props }) => (
  <div 
    className={`animate-pulse bg-gray-200 rounded ${className}`} 
    {...props}
  />
);

// Text line skeleton
export const TextSkeleton = ({ width = 'full', height = '4' }) => (
  <Skeleton className={`h-${height} w-${width} mb-2`} />
);

// Circle skeleton for avatars or icons
export const CircleSkeleton = ({ size = '10' }) => (
  <Skeleton className={`h-${size} w-${size} rounded-full`} />
);

// Button skeleton
export const ButtonSkeleton = ({ width = 'full', height = '10' }) => (
  <Skeleton className={`h-${height} w-${width} rounded-md`} />
);

// Card skeleton
export const CardSkeleton = ({ height = '32' }) => (
  <Skeleton className={`h-${height} w-full rounded-md`} />
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr>
    {Array(columns).fill().map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <Skeleton className="h-4 w-3/4" />
      </td>
    ))}
  </tr>
);

// Meeting card skeleton
export const MeetingCardSkeleton = () => (
  <div className="border rounded-md p-4">
    <div className="flex justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-24 ml-auto" />
        <Skeleton className="h-4 w-32 ml-auto" />
      </div>
    </div>
  </div>
);

// Dashboard window skeleton
export const WindowSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-16" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-24" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-24" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-16" /></th>
        </tr>
      </thead>
      <tbody>
        {Array(3).fill().map((_, i) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-3 px-3"><Skeleton className="h-4 w-24" /></td>
            <td className="py-3 px-3"><Skeleton className="h-4 w-16" /></td>
            <td className="py-3 px-3"><Skeleton className="h-4 w-16" /></td>
            <td className="py-3 px-3 flex space-x-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-14" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Links table skeleton
export const LinksTableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-32" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-20" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-28" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-16" /></th>
          <th className="py-2 px-3 text-left"><Skeleton className="h-4 w-16" /></th>
        </tr>
      </thead>
      <tbody>
        {Array(3).fill().map((_, i) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-3 px-3"><Skeleton className="h-4 w-40" /></td>
            <td className="py-3 px-3"><Skeleton className="h-4 w-16" /></td>
            <td className="py-3 px-3"><Skeleton className="h-4 w-32" /></td>
            <td className="py-3 px-3"><Skeleton className="h-4 w-20" /></td>
            <td className="py-3 px-3 flex space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-12" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Calendar time slots skeleton
export const TimeSlotsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    {Array(8).fill().map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-md" />
    ))}
  </div>
);

// Calendar date selection skeleton
export const DateSelectionSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    {Array(4).fill().map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-md" />
    ))}
  </div>
);

// Form skeleton
export const FormFieldSkeleton = () => (
  <div className="space-y-1">
    <Skeleton className="h-4 w-24 mb-1" />
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <section className="bg-white p-6 rounded-lg shadow animate-pulse">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CircleSkeleton size="10" />
              <div className="ml-3">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CircleSkeleton size="10" />
              <div className="ml-3">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </section>
    
    <section className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <WindowSkeleton />
    </section>
    
    <section className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <LinksTableSkeleton />
    </section>
    
    <section className="bg-white p-6 rounded-lg shadow">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        {Array(2).fill().map((_, i) => (
          <MeetingCardSkeleton key={i} />
        ))}
      </div>
    </section>
  </div>
);

// Meeting viewer skeleton
export const MeetingViewerSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex space-x-4 mb-6">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-28" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-32" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array(3).fill().map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Public scheduler skeleton
export const SchedulerSkeleton = () => (
  <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-md p-6">
    <Skeleton className="h-8 w-56 mb-1" />
    <Skeleton className="h-5 w-32 mb-8" />
    
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <DateSelectionSkeleton />
      </div>
      
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <TimeSlotsSkeleton />
      </div>
      
      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-40 mb-2" />
        
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      
      <div className="pt-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  </div>
);

export default Skeleton;