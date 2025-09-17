// Format duration from seconds to readable format
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Format date/time with timezone
export const formatDateTime = (isoString, showTime = true, timezone = 'Asia/Kolkata') => {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: timezone,
  };
  
  if (showTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.timeZoneName = 'short';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Format recurrence display
export const formatRecurrence = (recurrence, daysOfWeek = []) => {
  if (recurrence === 'daily') return 'Daily';
  if (recurrence === 'none') return 'None';
  if (recurrence === 'custom' && daysOfWeek.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek.map(day => dayNames[day]).join(', ');
  }
  return recurrence || 'None';
};

// Get status badge colors
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    live: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};