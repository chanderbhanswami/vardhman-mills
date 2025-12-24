/**
 * App Constants - Vardhman Mills Frontend
 * Contains application-wide configuration and constants
 */

// Application Information
export const APP_INFO = {
  NAME: 'Vardhman Mills',
  DESCRIPTION: 'Premium Textile Manufacturing and E-commerce Platform',
  VERSION: '1.0.0',
  AUTHOR: 'Vardhman Mills Team',
  KEYWORDS: ['textiles', 'manufacturing', 'e-commerce', 'fabrics', 'clothing'],
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
  TEST: 'test',
} as const;

// Current Environment
export const CURRENT_ENV = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;
export const IS_PRODUCTION = CURRENT_ENV === ENVIRONMENT.PRODUCTION;
export const IS_DEVELOPMENT = CURRENT_ENV === ENVIRONMENT.DEVELOPMENT;

// URLs
export const URLS = {
  BASE: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  API: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1',
  CDN: process.env.NEXT_PUBLIC_CDN_URL || '',
  UPLOADS: process.env.NEXT_PUBLIC_UPLOADS_URL || '/uploads',
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/vardhmanmills',
  TWITTER: 'https://twitter.com/vardhmanmills',
  INSTAGRAM: 'https://instagram.com/vardhmanmills',
  LINKEDIN: 'https://linkedin.com/company/vardhmanmills',
  YOUTUBE: 'https://youtube.com/vardhmanmills',
  WHATSAPP: 'https://wa.me/919876543210',
} as const;

// Contact Information
export const CONTACT_INFO = {
  PHONE: '+91 98765 43210',
  EMAIL: 'info@vardhmanmills.com',
  SUPPORT_EMAIL: 'support@vardhmanmills.com',
  ADDRESS: {
    STREET: '123 Industrial Area',
    CITY: 'Mumbai',
    STATE: 'Maharashtra',
    POSTAL_CODE: '400001',
    COUNTRY: 'India',
  },
  BUSINESS_HOURS: {
    MONDAY_TO_FRIDAY: '9:00 AM - 6:00 PM IST',
    SATURDAY: '9:00 AM - 2:00 PM IST',
    SUNDAY: 'Closed',
  },
} as const;

// Feature Flags
export const FEATURES = {
  ANALYTICS: true,
  NOTIFICATIONS: true,
  DARK_MODE: true,
  PWA: true,
  OFFLINE_MODE: false,
  CHAT_SUPPORT: true,
  WISHLIST: true,
  COMPARE: true,
  REVIEWS: true,
  BLOG: true,
  NEWSLETTER: true,
  SOCIAL_LOGIN: true,
  MULTI_LANGUAGE: false,
  MULTI_CURRENCY: false,
} as const;

// Limits and Constraints
export const LIMITS = {
  MAX_CART_ITEMS: 50,
  MAX_WISHLIST_ITEMS: 100,
  MAX_COMPARE_ITEMS: 4,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_REVIEW_LENGTH: 1000,
  MAX_SEARCH_HISTORY: 10,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Date and Time Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
} as const;

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

// Language
export const LANGUAGE = {
  DEFAULT: 'en',
  SUPPORTED: ['en', 'hi'],
  FALLBACK: 'en',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  CART: 'shopping_cart',
  WISHLIST: 'wishlist',
  COMPARE: 'compare_list',
  SEARCH_HISTORY: 'search_history',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  VIEWED_PRODUCTS: 'viewed_products',
  ONBOARDING: 'onboarding_completed',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1200,
  LARGE_DESKTOP: 1440,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: {
    WIDTH: 150,
    HEIGHT: 150,
  },
  SMALL: {
    WIDTH: 300,
    HEIGHT: 300,
  },
  MEDIUM: {
    WIDTH: 600,
    HEIGHT: 600,
  },
  LARGE: {
    WIDTH: 1200,
    HEIGHT: 1200,
  },
} as const;

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 3,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 500,
} as const;

export type Environment = typeof ENVIRONMENT;
export type Features = typeof FEATURES;
export type Limits = typeof LIMITS;
