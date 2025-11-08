// Enhanced Interactive Availability Component
import React, { useState, useEffect, useRef } from 'react';
import availabilityService from '../utils/availabilityService';
import googleCalendarService from '../utils/googleCalendar';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Users,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Info,
  ExternalLink,
  Copy,
  Zap,
  Ban,
  Check,
  Save,
  RotateCcw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  FastForward,
  Grid,
  List,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  Home,
  MapPin,
  Bell,
  Star,
  Trash2,
  Edit3,
  Download,
  Upload,
  Share2,
  Target,
  TrendingUp,
  Activity,
  Layers,
  MousePointer,
  Sparkles
} from 'lucide-react';

// Quick Templates Component
const AvailabilityTemplates = ({ onApplyTemplate, currentHours }) => {
  const [showTemplates, setShowTemplates] = useState(false);
  
  const templates = {
    'Standard Business': {
      Monday: { enabled: true, start: '09:00', end: '17:00' },
      Tuesday: { enabled: true, start: '09:00', end: '17:00' },
      Wednesday: { enabled: true, start: '09:00', end: '17:00' },
      Thursday: { enabled: true, start: '09:00', end: '17:00' },
      Friday: { enabled: true, start: '09:00', end: '17:00' },
      Saturday: { enabled: false, start: '09:00', end: '17:00' },
      Sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    'Flexible Remote': {
      Monday: { enabled: true, start: '08:00', end: '18:00' },
      Tuesday: { enabled: true, start: '08:00', end: '18:00' },
      Wednesday: { enabled: true, start: '08:00', end: '18:00' },
      Thursday: { enabled: true, start: '08:00', end: '18:00' },
      Friday: { enabled: true, start: '08:00', end: '16:00' },
      Saturday: { enabled: true, start: '10:00', end: '14:00' },
      Sunday: { enabled: false, start: '10:00', end: '14:00' }
    },
    'Consultant Schedule': {
      Monday: { enabled: true, start: '10:00', end: '19:00' },
      Tuesday: { enabled: true, start: '10:00', end: '19:00' },
      Wednesday: { enabled: true, start: '10:00', end: '19:00' },
      Thursday: { enabled: true, start: '10:00', end: '19:00' },
      Friday: { enabled: true, start: '09:00', end: '15:00' },
      Saturday: { enabled: false, start: '09:00', end: '15:00' },
      Sunday: { enabled: false, start: '09:00', end: '15:00' }
    },
    'Early Bird': {
      Monday: { enabled: true, start: '06:00', end: '14:00' },
      Tuesday: { enabled: true, start: '06:00', end: '14:00' },
      Wednesday: { enabled: true, start: '06:00', end: '14:00' },
      Thursday: { enabled: true, start: '06:00', end: '14:00' },
      Friday: { enabled: true, start: '06:00', end: '12:00' },
      Saturday: { enabled: false, start: '08:00', end: '12:00' },
      Sunday: { enabled: false, start: '08:00', end: '12:00' }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Quick Templates
        <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
      </button>
      
      {showTemplates && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-medium text-gray-900">Apply Template</h4>
            <p className="text-xs text-gray-500 mt-1">Choose a preset schedule</p>
          </div>
          <div className="p-2">
            {Object.entries(templates).map(([name, template]) => (
              <button
                key={name}
                onClick={() => {
                  onApplyTemplate(template);
                  setShowTemplates(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500">
                  {Object.values(template).filter(day => day.enabled).length} days/week
                </div>
              </button>
            ))}
            <hr className="my-2" />
            <button
              onClick={() => {
                onApplyTemplate(currentHours);
                setShowTemplates(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <div className="flex items-center">
                <RotateCcw className="h-3 w-3 mr-2" />
                Keep Current Schedule
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Time Slot with more interactions
const SuperInteractiveTimeSlot = ({ 
  slot, 
  date, 
  onSlotClick, 
  onSlotAction, 
  isToday, 
  isSelected,
  onSlotHover,
  onSlotSelect,
  dragMode 
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const handleSlotClick = (e) => {
    if (dragMode) {
      onSlotSelect?.(slot, date, !isSelected);
    } else {
      onSlotClick(slot, date);
    }
  };

  const handleQuickAction = (action, e) => {
    e.stopPropagation();
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 600);
    onSlotAction(action, slot, date);
  };

  const getSlotStyle = () => {
    let baseStyle = 'text-xs px-2 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden ';
    
    if (isSelected) {
      baseStyle += 'ring-2 ring-blue-500 ring-opacity-50 ';
    }
    
    if (pulseAnimation) {
      baseStyle += 'animate-pulse ';
    }
    
    if (slot.available) {
      if (isHovered) {
        baseStyle += 'bg-green-100 text-green-800 border-green-300 shadow-md transform scale-105 ';
      } else {
        baseStyle += 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:shadow-sm ';
      }
    } else {
      if (isHovered) {
        baseStyle += 'bg-red-100 text-red-800 border-red-300 shadow-md ';
      } else {
        baseStyle += 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 ';
      }
    }
    
    return baseStyle;
  };

  return (
    <div className="relative group">
      <div
        className={getSlotStyle()}
        onClick={handleSlotClick}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowQuickActions(true);
          onSlotHover?.(slot, date);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowQuickActions(false);
        }}
      >
        {/* Availability indicator */}
        <div className="flex items-center justify-between">
          <span className="font-medium">{slot.start}</span>
          <div className="flex items-center space-x-1">
            {slot.available ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {isSelected && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
        </div>
        
        {/* Priority indicator */}
        {slot.priority && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1 -translate-y-1"></div>
        )}
        
        {/* Quick actions on hover */}
        {showQuickActions && !dragMode && (
          <div className="absolute inset-x-0 -bottom-8 flex items-center justify-center space-x-1 z-10">
            {slot.available ? (
              <>
                <button
                  onClick={(e) => handleQuickAction('quick-book', e)}
                  className="p-1 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition-colors"
                  title="Quick Book"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => handleQuickAction('block', e)}
                  className="p-1 bg-gray-600 text-white rounded shadow-lg hover:bg-gray-700 transition-colors"
                  title="Block Slot"
                >
                  <Ban className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => handleQuickAction('priority', e)}
                  className="p-1 bg-yellow-600 text-white rounded shadow-lg hover:bg-yellow-700 transition-colors"
                  title="Mark Priority"
                >
                  <Star className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => handleQuickAction('view-conflict', e)}
                  className="p-1 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition-colors"
                  title="View Conflict"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => handleQuickAction('unblock', e)}
                  className="p-1 bg-green-600 text-white rounded shadow-lg hover:bg-green-700 transition-colors"
                  title="Unblock"
                >
                  <Check className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Selection mode indicator */}
        {dragMode && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <MousePointer className="h-3 w-3 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// Availability Heatmap Component
const AvailabilityHeatmap = ({ availabilityData, onTimeSlotClick }) => {
  const timeSlots = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getHeatmapColor = (availability) => {
    if (availability >= 80) return 'bg-green-500';
    if (availability >= 60) return 'bg-green-400';
    if (availability >= 40) return 'bg-yellow-400';
    if (availability >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-purple-600" />
          Availability Heatmap
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-1">
        <div></div>
        {timeSlots.map(time => (
          <div key={time} className="text-xs text-center text-gray-500 py-1">
            {time}
          </div>
        ))}
        
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="text-xs text-gray-500 flex items-center justify-end pr-2">
              {day}
            </div>
            {timeSlots.map(time => {
              const availability = Math.floor(Math.random() * 100); // Mock data
              return (
                <button
                  key={`${day}-${time}`}
                  onClick={() => onTimeSlotClick?.(day, time)}
                  className={`aspect-square rounded ${getHeatmapColor(availability)} hover:opacity-80 transition-opacity`}
                  title={`${day} ${time}: ${availability}% available`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Bulk Operations Panel
const BulkOperationsPanel = ({ 
  selectedSlots, 
  onBulkAction, 
  onClearSelection,
  dragMode,
  onToggleDragMode 
}) => {
  if (selectedSlots.length === 0 && !dragMode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleDragMode}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              dragMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            {dragMode ? 'Exit Selection' : 'Multi-Select'}
          </button>
          
          {selectedSlots.length > 0 && (
            <span className="text-sm text-blue-700">
              {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        
        {selectedSlots.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onBulkAction('block')}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <Ban className="h-4 w-4 mr-2" />
              Block Selected
            </button>
            <button
              onClick={() => onBulkAction('unblock')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              Unblock Selected
            </button>
            <button
              onClick={() => onBulkAction('priority')}
              className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
            >
              <Star className="h-4 w-4 mr-2" />
              Mark Priority
            </button>
            <button
              onClick={onClearSelection}
              className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Smart Suggestions Component
const SmartSuggestions = ({ suggestions, onApplySuggestion, onDismiss }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <suggestion.icon className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {suggestion.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                <div className="text-xs text-gray-500">
                  Expected improvement: <span className="font-medium text-green-600">{suggestion.improvement}</span>
                </div>
              </div>
              <button
                onClick={() => onApplySuggestion(suggestion)}
                className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Enhanced Availability Settings Component
const EnhancedAvailabilitySettings = ({ calendarConnected }) => {
  const [workingHours, setWorkingHours] = useState(availabilityService.defaultWorkingHours);
  const [preferences, setPreferences] = useState(availabilityService.preferences);
  const [currentWeekAvailability, setCurrentWeekAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'heatmap'
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [dragMode, setDragMode] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showAvailable: true,
    showBusy: true,
    timeRange: 'all'
  });
  
  // Smart suggestions state
  const [suggestions, setSuggestions] = useState([
    {
      icon: TrendingUp,
      title: "Optimize Peak Hours",
      description: "Your busiest requests are between 2-4 PM. Consider adding more slots during this time.",
      impact: "High Impact",
      improvement: "+23% booking rate",
      action: 'optimize-peak'
    },
    {
      icon: Coffee,
      title: "Add Buffer Time",
      description: "You have back-to-back meetings. Adding 15-minute buffers could reduce stress.",
      impact: "Medium Impact", 
      improvement: "+15% satisfaction",
      action: 'add-buffer'
    }
  ]);

  // Real-time sync state
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'error'
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const syncIntervalRef = useRef(null);

  useEffect(() => {
    if (calendarConnected && autoSync) {
      loadCurrentWeekAvailability();
      
      // Set up auto-sync every 30 seconds
      syncIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadCurrentWeekAvailability(true); // Silent sync
        }
      }, 30000);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [calendarConnected, autoSync, workingHours, preferences]);

  const loadCurrentWeekAvailability = async (silentSync = false) => {
    if (!silentSync) setLoading(true);
    if (!silentSync) setSyncStatus('syncing');
    
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      availabilityService.setWorkingHours(workingHours);
      availabilityService.setPreferences(preferences);

      const weekAvailability = await loadAvailabilityWithConflicts(startOfWeek, endOfWeek);
      setCurrentWeekAvailability(weekAvailability);
      setSyncStatus('idle');
      setLastSyncTime(new Date());
      
    } catch (error) {
      console.error('Error loading availability:', error);
      setSyncStatus('error');
    } finally {
      if (!silentSync) setLoading(false);
    }
  };

  const loadAvailabilityWithConflicts = async (startDate, endDate) => {
    const availability = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const slots = await availabilityService.generateTimeSlotsForDate(
        new Date(currentDate), 
        preferences.defaultDuration
      );

      let busyEvents = [];
      if (googleCalendarService.getSignedInStatus()) {
        const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
        busyEvents = await googleCalendarService.getEventsInRange(dayStart, dayEnd);
      }

      const enhancedSlots = slots.map(slot => {
        if (!slot.available) {
          const conflictingEvent = busyEvents.find(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const slotStart = slot.datetime.start;
            const slotEnd = slot.datetime.end;
            return (
              (slotStart >= eventStart && slotStart < eventEnd) ||
              (slotEnd > eventStart && slotEnd <= eventEnd) ||
              (slotStart <= eventStart && slotEnd >= eventEnd)
            );
          });
          return { ...slot, conflictingEvent };
        }
        return slot;
      });

      availability[dateKey] = enhancedSlots;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availability;
  };

  // Enhanced slot interactions
  const handleSlotSelect = (slot, date, selected) => {
    const slotId = `${date.toISOString().split('T')[0]}-${slot.start}`;
    
    if (selected) {
      setSelectedSlots(prev => [...prev, { slot, date, id: slotId }]);
    } else {
      setSelectedSlots(prev => prev.filter(s => s.id !== slotId));
    }
  };

  const handleBulkAction = async (action) => {
    try {
      setLoading(true);
      
      for (const { slot, date } of selectedSlots) {
        await handleSlotAction(action, slot, date);
      }
      
      setSelectedSlots([]);
      await loadCurrentWeekAvailability();
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotAction = async (action, slot, date) => {
    try {
      console.log(`Performing ${action} on slot:`, slot, date);
      
      switch (action) {
        case 'quick-book':
          // Open quick booking modal
          alert(`Quick booking for ${slot.start} on ${date.toDateString()}`);
          break;
        case 'block':
          alert(`Blocking slot ${slot.start} on ${date.toDateString()}`);
          break;
        case 'unblock':
          alert(`Unblocking slot ${slot.start} on ${date.toDateString()}`);
          break;
        case 'priority':
          alert(`Marking ${slot.start} as priority on ${date.toDateString()}`);
          break;
        case 'view-conflict':
          alert(`Viewing conflict for ${slot.start} on ${date.toDateString()}`);
          break;
      }
      
      await loadCurrentWeekAvailability();
    } catch (error) {
      console.error('Slot action error:', error);
    }
  };

  const handleApplyTemplate = (template) => {
    setWorkingHours(template);
  };

  const handleApplySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'optimize-peak':
        // Implement peak hour optimization
        console.log('Optimizing peak hours');
        break;
      case 'add-buffer':
        setPreferences(prev => ({ ...prev, bufferTime: 15 }));
        break;
    }
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.action !== suggestion.action));
  };

  const getAvailabilityForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return currentWeekAvailability[dateKey] || [];
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-7 w-7 mr-3 text-purple-600" />
            Smart Availability Manager
          </h2>
          <p className="text-gray-600 mt-1">Intelligently manage your time with advanced scheduling tools</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Sync Status */}
          <div className="flex items-center space-x-2 text-sm">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <span className="text-gray-600">
              {syncStatus === 'syncing' ? 'Syncing...' : 
               syncStatus === 'error' ? 'Sync failed' :
               `Last sync: ${lastSyncTime.toLocaleTimeString()}`}
            </span>
          </div>
          
          {/* Auto-sync toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600">Auto-sync</span>
          </label>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`p-2 rounded-md ${viewMode === 'heatmap' ? 'bg-white shadow-sm' : ''}`}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => loadCurrentWeekAvailability()}
            disabled={loading}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Refresh'}  
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      {/* Smart Suggestions */}
      <SmartSuggestions
        suggestions={suggestions}
        onApplySuggestion={handleApplySuggestion}
        onDismiss={() => setSuggestions([])}
      />

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedSlots={selectedSlots}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedSlots([])}
        dragMode={dragMode}
        onToggleDragMode={() => setDragMode(!dragMode)}
      />

      {/* Calendar Connection Alert */}
      {!calendarConnected && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Enhanced features available with calendar connection</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Connect your Google Calendar to unlock real-time sync, conflict detection, and smart suggestions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Based on View Mode */}
      {viewMode === 'heatmap' ? (
        <AvailabilityHeatmap
          availabilityData={currentWeekAvailability}
          onTimeSlotClick={(day, time) => console.log('Heatmap click:', day, time)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Working Hours Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                <AvailabilityTemplates
                  onApplyTemplate={handleApplyTemplate}
                  currentHours={workingHours}
                />
              </div>
              
              <div className="space-y-4">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={hours.enabled}
                        onChange={(e) => setWorkingHours(prev => ({
                          ...prev,
                          [day]: { ...prev[day], enabled: e.target.checked }
                        }))}
                        className="mr-3 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      />
                      <span className="text-sm font-medium text-gray-700 w-20">{day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="time" 
                        value={hours.start}
                        onChange={(e) => setWorkingHours(prev => ({
                          ...prev,
                          [day]: { ...prev[day], start: e.target.value }
                        }))}
                        disabled={!hours.enabled}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
                      />
                      <span className="text-gray-500">to</span>
                      <input 
                        type="time" 
                        value={hours.end}
                        onChange={(e) => setWorkingHours(prev => ({
                          ...prev,
                          [day]: { ...prev[day], end: e.target.value }
                        }))}
                        disabled={!hours.enabled}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Preferences */}
            {showAdvanced && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Duration</label>
                    <select 
                      value={preferences.defaultDuration}
                      onChange={(e) => setPreferences(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time</label>
                    <select 
                      value={preferences.bufferTime}
                      onChange={(e) => setPreferences(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>No buffer</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Weekly Availability */}
          <div className="lg:col-span-2">
            {calendarConnected && Object.keys(currentWeekAvailability).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Interactive Weekly Availability
                  </h3>
                  <div className="flex items-center space-x-3">
                    {/* Filter Controls */}
                    <div className="flex items-center space-x-2 text-sm">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterOptions.showAvailable}
                          onChange={(e) => setFilterOptions(prev => ({ 
                            ...prev, 
                            showAvailable: e.target.checked 
                          }))}
                          className="mr-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-green-600">Available</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterOptions.showBusy}
                          onChange={(e) => setFilterOptions(prev => ({ 
                            ...prev, 
                            showBusy: e.target.checked 
                          }))}
                          className="mr-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-red-600">Busy</span>
                      </label>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      💡 {dragMode ? 'Click slots to select multiple' : 'Hover for quick actions'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weekDays.map((date, index) => {
                    const slots = getAvailabilityForDate(date);
                    const availableSlots = slots.filter(s => s.available && filterOptions.showAvailable);
                    const busySlots = slots.filter(s => !s.available && filterOptions.showBusy);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    return (
                      <div key={index} className={`border rounded-lg p-3 ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="text-center mb-3">
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                            {dayName}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                            {date.getDate()}
                          </div>
                        </div>
                        
                        {slots.length === 0 ? (
                          <div className="text-center text-xs text-gray-500 py-4">
                            No working hours
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {availableSlots.length}
                              </span>
                              <span className="text-red-600 flex items-center">
                                <XCircle className="h-3 w-3 mr-1" />
                                {busySlots.length}
                              </span>
                            </div>
                            
                            {/* Available Slots */}
                            <div className="space-y-1">
                              {availableSlots.slice(0, 4).map((slot, slotIndex) => {
                                const slotId = `${date.toISOString().split('T')[0]}-${slot.start}`;
                                const isSelected = selectedSlots.some(s => s.id === slotId);
                                
                                return (
                                  <SuperInteractiveTimeSlot
                                    key={slotIndex}
                                    slot={slot}
                                    date={date}
                                    onSlotClick={handleSlotAction}
                                    onSlotAction={handleSlotAction}
                                    onSlotHover={setHoveredSlot}
                                    onSlotSelect={handleSlotSelect}
                                    isToday={isToday}
                                    isSelected={isSelected}
                                    dragMode={dragMode}
                                  />
                                );
                              })}
                              {availableSlots.length > 4 && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                  +{availableSlots.length - 4} more available
                                </div>
                              )}
                            </div>
                            
                            {/* Busy Slots */}
                            {busySlots.length > 0 && (
                              <div className="space-y-1 mt-2">
                                {busySlots.slice(0, 2).map((slot, slotIndex) => {
                                  const slotId = `${date.toISOString().split('T')[0]}-${slot.start}`;
                                  const isSelected = selectedSlots.some(s => s.id === slotId);
                                  
                                  return (
                                    <SuperInteractiveTimeSlot
                                      key={slotIndex}
                                      slot={slot}
                                      date={date}
                                      onSlotClick={handleSlotAction}
                                      onSlotAction={handleSlotAction}
                                      onSlotHover={setHoveredSlot}
                                      onSlotSelect={handleSlotSelect}
                                      isToday={isToday}
                                      isSelected={isSelected}
                                      dragMode={dragMode}
                                    />
                                  );
                                })}
                                {busySlots.length > 2 && (
                                  <div className="text-xs text-gray-500 text-center py-1">
                                    +{busySlots.length - 2} more busy
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      Available slots (interactive)
                    </div>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      Busy/Blocked slots
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Real-time sync with Google Calendar
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAvailabilitySettings;