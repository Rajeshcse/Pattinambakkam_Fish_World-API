export const getCurrentDate = () => {
  return new Date();
};

export const formatDate = (date, locale = 'en-IN', options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

export const formatToISO = (date) => {
  return new Date(date).toISOString();
};

export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return today.toDateString() === checkDate.toDateString();
};

export const isWithinLastDays = (date, days) => {
  const now = new Date();
  const checkDate = new Date(date);
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return checkDate >= daysAgo && checkDate <= now;
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getStartOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

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
