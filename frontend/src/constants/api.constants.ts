/**
 * API Constants - Vardhman Mills Frontend
 * Contains all API endpoint configurations and constants
 */

// Base API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30 seconds

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    DELETE_ACCOUNT: '/users/delete-account',
    ADDRESSES: '/users/addresses',
    PREFERENCES: '/users/preferences',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    RECOMMENDATIONS: (id: string) => `/products/${id}/recommendations`,
    REVIEWS: (id: string) => `/products/${id}/reviews`,
    RELATED: (id: string) => `/products/${id}/related`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id: string) => `/categories/${id}`,
    TREE: '/categories/tree',
    PRODUCTS: (id: string) => `/categories/${id}/products`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
    APPLY_COUPON: '/cart/apply-coupon',
    REMOVE_COUPON: '/cart/remove-coupon',
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD_ITEM: '/wishlist/items',
    REMOVE_ITEM: (itemId: string) => `/wishlist/items/${itemId}`,
    CLEAR: '/wishlist/clear',
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
    RETURN: (id: string) => `/orders/${id}/return`,
    INVOICE: (id: string) => `/orders/${id}/invoice`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    METHODS: '/payments/methods',
    SAVE_METHOD: '/payments/methods',
    DELETE_METHOD: (id: string) => `/payments/methods/${id}`,
  },

  // Coupons
  COUPONS: {
    VALIDATE: '/coupons/validate',
    AVAILABLE: '/coupons/available',
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    LIST: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    LIKE: (id: string) => `/reviews/${id}/like`,
    REPORT: (id: string) => `/reviews/${id}/report`,
  },

  // Blog
  BLOG: {
    POSTS: '/blog/posts',
    POST_DETAILS: (slug: string) => `/blog/posts/${slug}`,
    CATEGORIES: '/blog/categories',
    TAGS: '/blog/tags',
    SEARCH: '/blog/search',
    COMMENTS: (postId: string) => `/blog/posts/${postId}/comments`,
  },

  // Search
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
    AUTOCOMPLETE: '/search/autocomplete',
    TRENDING: '/search/trending',
    POPULAR: '/search/popular',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
  },

  // Contact
  CONTACT: {
    SEND_MESSAGE: '/contact/send',
    GET_INFO: '/contact/info',
  },

  // Newsletter
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
    UNSUBSCRIBE: '/newsletter/unsubscribe',
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    MULTIPLE: '/upload/multiple',
  },

  // Analytics
  ANALYTICS: {
    TRACK_EVENT: '/analytics/track',
    PAGE_VIEW: '/analytics/page-view',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Request Headers
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred while processing your request',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Request timeout',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT: 'createdAt',
  DEFAULT_ORDER: 'desc',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER: 'user',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CART: 'cart',
  WISHLIST: 'wishlist',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
} as const;

// Cache Duration (in seconds)
export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

export type APIEndpoints = typeof API_ENDPOINTS;
export type HTTPMethods = typeof HTTP_METHODS;
export type StatusCodes = typeof STATUS_CODES;