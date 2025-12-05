/**
 * String Helper Utilities
 * Common string manipulation and validation functions
 */

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - Input string
 * @returns {string} Title cased string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Generate slug from string
 * @param {string} str - Input string
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Sanitize string by removing HTML tags
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Truncate string to specified length
 * @param {string} str - Input string
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

/**
 * Check if string is valid email
 * @param {string} email - Email string to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is valid phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 */
export const generateRandomString = (length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate OTP (One Time Password)
 * @param {number} length - Length of OTP
 * @returns {string} Numeric OTP
 */
export const generateOTP = (length = 6) => {
  return generateRandomString(length, '0123456789');
};

/**
 * Mask sensitive data (email, phone)
 * @param {string} str - String to mask
 * @param {string} type - Type of masking ('email' or 'phone')
 * @returns {string} Masked string
 */
export const maskSensitiveData = (str, type = 'email') => {
  if (!str || typeof str !== 'string') return '';
  
  if (type === 'email') {
    const [username, domain] = str.split('@');
    if (!username || !domain) return str;
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(0, username.length - 2)) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }
  
  if (type === 'phone') {
    if (str.length < 4) return str;
    return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
  }
  
  return str;
};