export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const FISH_CATEGORIES = {
  FISH: 'Fish',
  PRAWN: 'Prawn',
  CRAB: 'Crab',
  SQUID: 'Squid'
};

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset'
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_MINUTES: 2
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 5
  },
  ADMIN: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100
  },
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 1000
  }
};

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  MAX_FILES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

export const PRODUCT_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_PRICE: 100000,
  MAX_STOCK: 10000
};

export const USER_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6
};

export const COLLECTIONS = {
  USERS: 'users',
  FISH_PRODUCTS: 'fishproducts',
  TOKENS: 'tokens'
};

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  ORDER_CONFIRMATION: 'order_confirmation'
};

export const SORT_OPTIONS = {
  CREATED_AT_DESC: '-createdAt',
  CREATED_AT_ASC: 'createdAt',
  PRICE_ASC: 'price',
  PRICE_DESC: '-price',
  NAME_ASC: 'name',
  NAME_DESC: '-name'
};

export const AVAILABILITY_STATUS = {
  AVAILABLE: true,
  UNAVAILABLE: false
};

export const RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};
