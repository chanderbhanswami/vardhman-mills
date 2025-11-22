/**
 * Constants Index - Vardhman Mills Frontend
 * Central export point for all application constants
 */

// API Constants
export {
  API_ENDPOINTS,
  STATUS_CODES,
  API_TIMEOUT,
  CACHE_KEYS,
} from './api.constants';

// App Constants
export {
  ENVIRONMENT,
  FEATURES,
  LIMITS,
  BREAKPOINTS as APP_BREAKPOINTS,
  Z_INDEX as APP_Z_INDEX,
} from './app.constants';

// Auth Constants
export {
  TOKEN_CONFIG,
  USER_ROLES,
  AUTH_ERRORS as AUTH_ERROR_MESSAGES,
  PASSWORD_REQUIREMENTS as AUTH_PASSWORD_REQUIREMENTS,
} from './auth.constants';

// Email Constants
export {
  EMAIL_CONFIG,
  EMAIL_TYPES,
  EMAIL_TEMPLATES,
  EMAIL_PREFERENCES,
  EMAIL_STATUS,
} from './email.constants';

// Error Constants
export {
  ERROR_TYPES,
  HTTP_ERROR_CODES,
  GENERIC_ERRORS,
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  CART_ERRORS,
  PAYMENT_ERRORS,
  ORDER_ERRORS,
} from './error.constants';

// Order Constants
export {
  ORDER_STATUS,
  PAYMENT_STATUS as ORDER_PAYMENT_STATUS,
  SHIPPING_STATUS,
  RETURN_STATUS,
  ORDER_TYPES,
  SHIPPING_METHODS,
  ORDER_LIMITS,
} from './order.constants';

// Payment Constants
export {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAYS,
  CURRENCIES,
  REFUND_TYPES,
  EMI_TENURES,
} from './payment.constants';

// Product Constants
export {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS,
  STOCK_STATUS,
  PRODUCT_TYPES,
  FABRIC_WEIGHTS,
  PRODUCT_COLORS,
  PRODUCT_SIZES,
  PRODUCT_FILTERS,
  IMAGE_CONFIG as PRODUCT_IMAGE_CONFIG,
} from './product.constants';

// Route Constants
export {
  ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  NAVIGATION_MENU,
  BREADCRUMB_CONFIG,
} from './routes.constants';

// SEO Constants
export {
  SITE_CONFIG,
  DEFAULT_META,
  OG_CONFIG,
  TWITTER_CONFIG,
  SCHEMA_TYPES,
} from './seo.constants';

// UI Constants
export {
  THEME_CONFIG,
  BREAKPOINTS as UI_BREAKPOINTS,
  Z_INDEX as UI_Z_INDEX,
  COMPONENT_SIZES,
  BUTTON_VARIANTS,
  TOAST_TYPES,
  MODAL_SIZES,
  LOADING_STATES,
  IMAGE_CONFIG as UI_IMAGE_CONFIG,
} from './ui.constants';

// Validation Constants
export {
  VALIDATION_PATTERNS,
  FIELD_LENGTHS,
  NUMERIC_RANGES,
  PASSWORD_REQUIREMENTS,
  VALIDATION_MESSAGES,
  CUSTOM_VALIDATION,
  FORM_VALIDATION_CONFIG,
} from './validation.constants';

// Blog Constants
export {
  BLOG_STATUS,
  BLOG_CATEGORIES,
  CONTENT_TYPES,
  BLOG_SETTINGS,
  COMMENT_STATUS,
  CONTENT_FORMATS,
  BLOG_SEO,
} from './blog.constants';

// Inventory Constants
export {
  STOCK_STATUS as INVENTORY_STOCK_STATUS,
  INVENTORY_TRACKING,
  STOCK_ALERTS,
  WAREHOUSE_LOCATIONS,
  MOVEMENT_TYPES,
  INVENTORY_STATUS,
} from './inventory.constants';

// Shipping Constants
export {
  SHIPPING_METHODS as SHIPPING_DELIVERY_METHODS,
  SHIPPING_STATUS as DELIVERY_STATUS,
  DELIVERY_TIMEFRAMES,
  SHIPPING_COSTS,
  SHIPPING_ZONES,
  PACKAGE_TYPES,
  TRACKING_EVENTS,
  SHIPPING_CARRIERS,
  ADDRESS_TYPES,
} from './shipping.constants';

// Application-wide constants
export const APPLICATION_NAME = 'Vardhman Mills';
export const APPLICATION_VERSION = '1.0.0';
export const COPYRIGHT_YEAR = new Date().getFullYear();
export const COMPANY_NAME = 'Vardhman Mills Pvt. Ltd.';

// Common utility constants
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 100;
export const ANIMATION_DURATION = 300;
export const PAGE_SIZE = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Status constants used across the application
export const COMMON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Time constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

// Number formats
export const NUMBER_FORMATS = {
  CURRENCY: {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  PERCENTAGE: {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  INTEGER: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  DECIMAL: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  },
} as const;

export type CommonStatus = typeof COMMON_STATUS;
export type PriorityLevels = typeof PRIORITY_LEVELS;