/**
 * Date Helper Utilities
 * Common date manipulation and formatting functions
 */

/**
 * Get current timestamp
 * @returns {Date} Current date object
 */
export const getCurrentDate = () => {
  return new Date();
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'en-IN', options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {string} ISO date string
 */
export const formatToISO = (date) => {
  return new Date(date).toISOString();
};

/**
 * Get date difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return today.toDateString() === checkDate.toDateString();
};

/**
 * Check if date is within last N days
 * @param {Date} date - Date to check
 * @param {number} days - Number of days to check
 * @returns {boolean} True if date is within last N days
 */
export const isWithinLastDays = (date, days) => {
  const now = new Date();
  const checkDate = new Date(date);
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return checkDate >= daysAgo && checkDate <= now;
};

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date with added days
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get start of day
 * @param {Date} date - Input date
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day
 * @param {Date} date - Input date
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get time ago string
 * @param {Date} date - Date to compare
 * @returns {string} Human readable time ago
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;

  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Get date range for filtering
 * @param {string} period - Period ('today', 'week', 'month', 'year')
 * @returns {Object} Object with start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case 'today':
      start = getStartOfDay(now);
      end = getEndOfDay(now);
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    case 'month':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    case 'year':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    default:
      start = getStartOfDay(now);
      end = getEndOfDay(now);
  }

  return { start, end };
};
