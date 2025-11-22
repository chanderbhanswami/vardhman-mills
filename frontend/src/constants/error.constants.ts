/**
 * Error Constants - Vardhman Mills Frontend
 * Contains error codes, messages, and error handling configuration
 */

// Error Types
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  PAYMENT: 'payment',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  MAINTENANCE: 'maintenance',
} as const;

// HTTP Error Codes
export const HTTP_ERROR_CODES = {
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

// Generic Error Messages
export const GENERIC_ERRORS = {
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  MAINTENANCE: 'The service is currently under maintenance.',
} as const;

// Authentication Errors
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid authentication token.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  PASSWORD_WEAK: 'Password does not meet security requirements.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  PHONE_EXISTS: 'An account with this phone number already exists.',
  RESET_TOKEN_INVALID: 'Password reset link is invalid or expired.',
  OTP_INVALID: 'Invalid verification code.',
  OTP_EXPIRED: 'Verification code has expired.',
  MAX_ATTEMPTS: 'Maximum login attempts exceeded. Please try again later.',
} as const;

// Validation Errors
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter.',
  PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter.',
  PASSWORD_NO_NUMBER: 'Password must contain at least one number.',
  PASSWORD_NO_SPECIAL: 'Password must contain at least one special character.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_URL: 'Please enter a valid URL.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  MIN_LENGTH: 'Must be at least {min} characters long.',
  MAX_LENGTH: 'Must not exceed {max} characters.',
  MIN_VALUE: 'Must be at least {min}.',
  MAX_VALUE: 'Must not exceed {max}.',
} as const;

// Cart & Checkout Errors
export const CART_ERRORS = {
  ITEM_NOT_FOUND: 'Item not found in cart.',
  OUT_OF_STOCK: 'This item is currently out of stock.',
  INSUFFICIENT_STOCK: 'Not enough stock available.',
  INVALID_QUANTITY: 'Invalid quantity specified.',
  CART_EMPTY: 'Your cart is empty.',
  COUPON_INVALID: 'Invalid coupon code.',
  COUPON_EXPIRED: 'Coupon has expired.',
  COUPON_ALREADY_USED: 'Coupon has already been used.',
  SHIPPING_UNAVAILABLE: 'Shipping not available to your location.',
  CHECKOUT_FAILED: 'Checkout failed. Please try again.',
} as const;

// Payment Errors
export const PAYMENT_ERRORS = {
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  CARD_DECLINED: 'Your card was declined.',
  INSUFFICIENT_FUNDS: 'Insufficient funds.',
  EXPIRED_CARD: 'Your card has expired.',
  INVALID_CARD: 'Invalid card number.',
  INVALID_CVV: 'Invalid security code.',
  PROCESSING_ERROR: 'Payment processing error.',
  GATEWAY_ERROR: 'Payment gateway error.',
  REFUND_FAILED: 'Refund failed. Please contact support.',
} as const;

// Order Errors
export const ORDER_ERRORS = {
  ORDER_NOT_FOUND: 'Order not found.',
  CANNOT_CANCEL: 'This order cannot be cancelled.',
  CANNOT_RETURN: 'This order cannot be returned.',
  RETURN_WINDOW_EXPIRED: 'Return window has expired.',
  ALREADY_SHIPPED: 'Order has already been shipped.',
  ALREADY_DELIVERED: 'Order has already been delivered.',
  TRACKING_UNAVAILABLE: 'Tracking information is not available.',
} as const;

// Product Errors
export const PRODUCT_ERRORS = {
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_UNAVAILABLE: 'Product is currently unavailable.',
  VARIANT_NOT_FOUND: 'Selected variant is not available.',
  REVIEW_FAILED: 'Failed to submit review.',
  WISHLIST_ADD_FAILED: 'Failed to add to wishlist.',
  COMPARE_LIMIT_EXCEEDED: 'Maximum comparison limit reached.',
} as const;

// Upload Errors
export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: 'File is too large. Maximum size is {maxSize}.',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed types: {allowedTypes}.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  TOO_MANY_FILES: 'Too many files. Maximum allowed: {maxFiles}.',
  NO_FILE_SELECTED: 'No file selected.',
} as const;

// Search Errors
export const SEARCH_ERRORS = {
  NO_RESULTS: 'No results found.',
  SEARCH_FAILED: 'Search failed. Please try again.',
  INVALID_QUERY: 'Invalid search query.',
  QUERY_TOO_SHORT: 'Search query is too short.',
} as const;

// Error Severity Levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Error Actions
export const ERROR_ACTIONS = {
  RETRY: 'retry',
  REFRESH: 'refresh',
  LOGIN: 'login',
  CONTACT_SUPPORT: 'contact_support',
  GO_HOME: 'go_home',
  GO_BACK: 'go_back',
} as const;

// Default Error Configuration
export const DEFAULT_ERROR_CONFIG = {
  SHOW_TOAST: true,
  AUTO_DISMISS: true,
  DISMISS_TIMEOUT: 5000,
  ALLOW_RETRY: true,
  LOG_TO_CONSOLE: true,
  REPORT_TO_SERVER: false,
} as const;

// Error Tracking
export const ERROR_TRACKING = {
  ENABLED: process.env.NODE_ENV === 'production',
  ENDPOINT: '/api/errors/report',
  MAX_ERRORS_PER_SESSION: 50,
  BATCH_SIZE: 10,
} as const;

export type ErrorTypes = typeof ERROR_TYPES;
export type HTTPErrorCodes = typeof HTTP_ERROR_CODES;
export type ErrorSeverity = typeof ERROR_SEVERITY;
export type ErrorActions = typeof ERROR_ACTIONS;