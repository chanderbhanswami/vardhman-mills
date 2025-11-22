/**
 * API Configuration
 * Centralized configuration for API settings, timeouts, retries, etc.
 */

// Environment variables with defaults
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  
  // API Versions
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // Timeouts (in milliseconds)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  UPLOAD_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT || '120000'),
  
  // Retry Configuration
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '1000'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_WINDOW: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW || '60000'),
  
  // File Upload Limits
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
  MAX_FILES: parseInt(process.env.NEXT_PUBLIC_MAX_FILES || '10'),
  ALLOWED_FILE_TYPES: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  
  // Cache Configuration
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000'), // 5 minutes
  CACHE_STALE_TIME: parseInt(process.env.NEXT_PUBLIC_CACHE_STALE_TIME || '60000'), // 1 minute
  CACHE_GC_TIME: parseInt(process.env.NEXT_PUBLIC_CACHE_GC_TIME || '600000'), // 10 minutes
  
  // Security
  CSRF_HEADER: 'X-CSRF-Token',
  AUTH_HEADER: 'Authorization',
  API_KEY_HEADER: 'X-API-Key',
  
  // Development
  DEBUG: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// API Error Codes
export const API_ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Resource Management
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  SHIPPING_NOT_AVAILABLE: 'SHIPPING_NOT_AVAILABLE',
  
  // System
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  CSV: 'text/csv',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  // User
  CURRENT_USER: 'current_user',
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  USER_ADDRESSES: 'user_addresses',
  USER_ORDERS: 'user_orders',
  
  // Products
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product_categories',
  PRODUCT_BRANDS: 'product_brands',
  FEATURED_PRODUCTS: 'featured_products',
  POPULAR_PRODUCTS: 'popular_products',
  
  // Cart & Wishlist
  CART: 'cart',
  WISHLIST: 'wishlist',
  
  // Payments
  PAYMENT_METHODS: 'payment_methods',
  
  // Global
  SETTINGS: 'settings',
  NAVIGATION: 'navigation',
  BANNERS: 'banners',
  TESTIMONIALS: 'testimonials',
  
  // Analytics
  PAGE_VIEWS: 'page_views',
  SEARCH_HISTORY: 'search_history',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  
  // App State
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  
  // Shopping
  CART_ID: 'cart_id',
  RECENT_SEARCHES: 'recent_searches',
  VIEWED_PRODUCTS: 'viewed_products',
  
  // Preferences
  NOTIFICATION_SETTINGS: 'notification_settings',
  PRIVACY_SETTINGS: 'privacy_settings',
  
  // Temporary
  FORM_DRAFT: 'form_draft',
  UPLOAD_PROGRESS: 'upload_progress',
} as const;

// Event Types
export const EVENT_TYPES = {
  // Authentication
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token_refresh',
  PROFILE_UPDATE: 'auth:profile_update',
  
  // Shopping
  PRODUCT_VIEW: 'product:view',
  PRODUCT_SEARCH: 'product:search',
  CART_ADD: 'cart:add',
  CART_UPDATE: 'cart:update',
  CART_REMOVE: 'cart:remove',
  ORDER_PLACE: 'order:place',
  ORDER_UPDATE: 'order:update',
  
  // System
  ERROR: 'system:error',
  WARNING: 'system:warning',
  INFO: 'system:info',
  
  // Real-time
  NOTIFICATION: 'notification',
  MESSAGE: 'message',
  STATUS_UPDATE: 'status_update',
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT: 'createdAt',
  ORDER: 'desc',
} as const;

// Search Defaults
export const SEARCH_DEFAULTS = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 10,
  MAX_HISTORY: 20,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  ADDRESS_MAX_LENGTH: 200,
  REVIEW_MIN_LENGTH: 10,
  REVIEW_MAX_LENGTH: 1000,
} as const;

// File Types
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'text/csv', 'application/msword'],
  SPREADSHEETS: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALL_ALLOWED: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 600 },
  LARGE: { width: 1200, height: 1200 },
  BANNER: { width: 1920, height: 600 },
  AVATAR: { width: 200, height: 200 },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Currency Settings
export const CURRENCY_SETTINGS = {
  DEFAULT: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
  PRECISION: 2,
  SUPPORTED: ['INR', 'USD', 'EUR'] as const,
} as const;

// Theme Settings
export const THEME_SETTINGS = {
  DEFAULT: 'light',
  MODES: ['light', 'dark', 'auto'] as const,
  STORAGE_KEY: 'theme',
} as const;

// Language Settings
export const LANGUAGE_SETTINGS = {
  DEFAULT: 'en',
  SUPPORTED: ['en', 'hi'] as const,
  STORAGE_KEY: 'language',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Toast Settings
export const TOAST_SETTINGS = {
  DURATION: 5000,
  MAX_TOASTS: 5,
  POSITION: 'top-right',
} as const;

// Modal Settings
export const MODAL_SETTINGS = {
  BACKDROP_CLICK_CLOSE: true,
  ESCAPE_KEY_CLOSE: true,
  ANIMATION_DURATION: 200,
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  ORDER_UPDATE: 'order_update',
  STOCK_UPDATE: 'stock_update',
  PRICE_UPDATE: 'price_update',
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click',
  SEARCH: 'search',
  PURCHASE: 'purchase',
  ADD_TO_CART: 'add_to_cart',
  SIGNUP: 'signup',
  LOGIN: 'login',
} as const;

// SEO Settings
export const SEO_SETTINGS = {
  DEFAULT_TITLE: 'Vardhman Mills - Quality Textiles',
  TITLE_SEPARATOR: ' | ',
  DEFAULT_DESCRIPTION: 'Discover premium quality textiles and fabrics at Vardhman Mills.',
  DEFAULT_KEYWORDS: 'textiles, fabrics, mills, quality, cotton, polyester',
  DEFAULT_IMAGE: '/images/og-image.jpg',
  TWITTER_HANDLE: '@vardhmanmills',
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/vardhmanmills',
  TWITTER: 'https://twitter.com/vardhmanmills',
  INSTAGRAM: 'https://instagram.com/vardhmanmills',
  LINKEDIN: 'https://linkedin.com/company/vardhmanmills',
  YOUTUBE: 'https://youtube.com/vardhmanmills',
} as const;

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'info@vardhmanmills.com',
  PHONE: '+91-12345-67890',
  ADDRESS: '123 Industrial Area, Mumbai, Maharashtra, India',
  SUPPORT_EMAIL: 'support@vardhmanmills.com',
  SALES_EMAIL: 'sales@vardhmanmills.com',
} as const;

// Business Hours
export const BUSINESS_HOURS = {
  MONDAY: { open: '09:00', close: '18:00' },
  TUESDAY: { open: '09:00', close: '18:00' },
  WEDNESDAY: { open: '09:00', close: '18:00' },
  THURSDAY: { open: '09:00', close: '18:00' },
  FRIDAY: { open: '09:00', close: '18:00' },
  SATURDAY: { open: '10:00', close: '16:00' },
  SUNDAY: { open: null, close: null }, // Closed
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  ENABLE_WISHLIST: process.env.NEXT_PUBLIC_ENABLE_WISHLIST !== 'false',
  ENABLE_REVIEWS: process.env.NEXT_PUBLIC_ENABLE_REVIEWS !== 'false',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
} as const;

// Export all configurations
const config = {
  API_CONFIG,
  HTTP_STATUS,
  API_ERROR_CODES,
  HTTP_METHODS,
  CONTENT_TYPES,
  CACHE_KEYS,
  STORAGE_KEYS,
  EVENT_TYPES,
  PAGINATION_DEFAULTS,
  SEARCH_DEFAULTS,
  VALIDATION_RULES,
  FILE_TYPES,
  IMAGE_SIZES,
  DATE_FORMATS,
  CURRENCY_SETTINGS,
  THEME_SETTINGS,
  LANGUAGE_SETTINGS,
  NOTIFICATION_TYPES,
  TOAST_SETTINGS,
  MODAL_SETTINGS,
  LOADING_STATES,
  WS_EVENTS,
  ANALYTICS_EVENTS,
  SEO_SETTINGS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  BUSINESS_HOURS,
  FEATURE_FLAGS,
};

export default config;