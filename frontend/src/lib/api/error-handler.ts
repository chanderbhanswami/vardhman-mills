import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { ApiError, ApiResponse } from './types';

/**
 * Enhanced Error Handler for API requests
 * Provides standardized error handling with user-friendly messages,
 * logging, and error reporting capabilities
 */

// Error codes mapping to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'AUTH_INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
  'AUTH_TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
  'AUTH_TOKEN_INVALID': 'Invalid authentication token. Please log in again.',
  'AUTH_USER_NOT_FOUND': 'User account not found.',
  'AUTH_EMAIL_NOT_VERIFIED': 'Please verify your email address before continuing.',
  'AUTH_ACCOUNT_LOCKED': 'Your account has been temporarily locked. Please contact support.',
  'AUTH_PASSWORD_RESET_REQUIRED': 'Password reset is required. Please check your email.',

  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'VALIDATION_EMAIL_INVALID': 'Please enter a valid email address.',
  'VALIDATION_PASSWORD_WEAK': 'Password must be at least 8 characters with numbers and letters.',
  'VALIDATION_REQUIRED_FIELD': 'Please fill in all required fields.',
  'VALIDATION_DUPLICATE_EMAIL': 'An account with this email already exists.',

  // Product errors
  'PRODUCT_NOT_FOUND': 'Product not found.',
  'PRODUCT_OUT_OF_STOCK': 'This product is currently out of stock.',
  'PRODUCT_INSUFFICIENT_STOCK': 'Not enough stock available.',
  'PRODUCT_PRICE_CHANGED': 'Product price has changed. Please refresh and try again.',

  // Cart errors
  'CART_ITEM_NOT_FOUND': 'Item not found in cart.',
  'CART_EMPTY': 'Your cart is empty.',
  'CART_LIMIT_EXCEEDED': 'Maximum quantity limit exceeded.',
  'CART_INVALID_COUPON': 'Invalid or expired coupon code.',

  // Order errors
  'ORDER_NOT_FOUND': 'Order not found.',
  'ORDER_ALREADY_CANCELLED': 'This order has already been cancelled.',
  'ORDER_CANNOT_CANCEL': 'This order cannot be cancelled at this time.',
  'ORDER_PAYMENT_FAILED': 'Payment failed. Please try again or use a different payment method.',

  // Payment errors
  'PAYMENT_METHOD_INVALID': 'Invalid payment method selected.',
  'PAYMENT_INSUFFICIENT_FUNDS': 'Insufficient funds. Please try a different payment method.',
  'PAYMENT_GATEWAY_ERROR': 'Payment gateway error. Please try again.',
  'PAYMENT_CANCELLED_BY_USER': 'Payment was cancelled.',

  // Network errors
  'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
  'TIMEOUT_ERROR': 'Request timed out. Please try again.',
  'SERVER_ERROR': 'Server error. Please try again later.',

  // File upload errors
  'UPLOAD_FILE_TOO_LARGE': 'File size is too large. Please choose a smaller file.',
  'UPLOAD_INVALID_FILE_TYPE': 'Invalid file type. Please choose a different file.',
  'UPLOAD_FAILED': 'File upload failed. Please try again.',

  // General errors
  'FORBIDDEN': 'You do not have permission to perform this action.',
  'NOT_FOUND': 'The requested resource was not found.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
  'MAINTENANCE_MODE': 'Site is under maintenance. Please try again later.',
};

// HTTP status code to error type mapping
const STATUS_ERROR_MAP: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  410: 'Gone',
  422: 'Validation Error',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

/**
 * Convert Axios error to standardized API error
 */
export function createApiError(error: AxiosError | Error | unknown): ApiError {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    status: 500,
  };

  if (error instanceof AxiosError) {
    // HTTP error from axios
    apiError.status = error.response?.status || 500;
    
    if (error.response?.data) {
      const errorData = error.response.data as Record<string, unknown>;
      
      // Extract error details
      apiError.code = errorData.code as string;
      apiError.message = (errorData.message as string) || 
                        (errorData.error as string) || 
                        STATUS_ERROR_MAP[apiError.status] || 
                        'Request failed';
      apiError.errors = errorData.errors as Record<string, string[]>;
    } else if (error.request) {
      // Network error
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'Network connection failed. Please check your internet connection.';
    } else {
      // Request setup error
      apiError.code = 'REQUEST_ERROR';
      apiError.message = error.message || 'Request failed';
    }
  } else if (error instanceof Error) {
    // Standard JavaScript error
    apiError.message = error.message;
    apiError.code = error.name;
  } else if (typeof error === 'string') {
    // String error
    apiError.message = error;
  }

  return apiError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Return original message if no mapping found
  return error.message || 'An unexpected error occurred';
}

/**
 * Show error notification to user
 */
export function showErrorNotification(error: ApiError, options?: {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
  style?: Record<string, string>;
}): void {
  const message = getUserFriendlyMessage(error);
  
  toast.error(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    style: {
      background: '#ef4444',
      color: '#ffffff',
      ...options?.style,
    },
  });
}

/**
 * Show success notification to user
 */
export function showSuccessNotification(message: string, options?: {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
  style?: Record<string, string>;
}): void {
  toast.success(message, {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
    style: {
      background: '#10b981',
      color: '#ffffff',
      ...options?.style,
    },
  });
}

/**
 * Log error for debugging and monitoring
 */
export function logError(error: ApiError, context?: {
  userId?: string;
  action?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    },
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorLog);
  }

  // In production, you might want to send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // sendToErrorTrackingService(errorLog);
  }
}

/**
 * Handle API response errors consistently
 */
export function handleApiError(
  error: unknown,
  options?: {
    showNotification?: boolean;
    logError?: boolean;
    context?: Record<string, unknown>;
  }
): ApiError {
  const apiError = createApiError(error);
  
  // Show notification if requested (default: true for client errors)
  const shouldShowNotification = options?.showNotification !== false && 
                                apiError.status && 
                                apiError.status >= 400 && 
                                apiError.status < 500;
  
  if (shouldShowNotification) {
    showErrorNotification(apiError);
  }

  // Log error if requested (default: true)
  if (options?.logError !== false) {
    logError(apiError, options?.context);
  }

  return apiError;
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: ApiError, errorCode: string): boolean {
  return error.code === errorCode;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || 
         (error.code?.startsWith('AUTH_') ?? false);
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 422 || 
         (error.code?.startsWith('VALIDATION_') ?? false) ||
         !!error.errors;
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: ApiError): boolean {
  return !error.status || 
         error.code === 'NETWORK_ERROR' || 
         error.code === 'TIMEOUT_ERROR';
}

/**
 * Check if error is server related
 */
export function isServerError(error: ApiError): boolean {
  return error.status ? error.status >= 500 : false;
}

/**
 * Retry logic for failed requests
 */
export async function retryWithBackoff<T>(
  requestFn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: ApiError) => boolean;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error: ApiError) => isNetworkError(error) || isServerError(error)
  } = options || {};

  let lastError: ApiError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = createApiError(error);
      
      // Don't retry if it's the last attempt or if we shouldn't retry this error
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const formattedErrors: string[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      formattedErrors.push(`${field}: ${message}`);
    });
  });
  
  return formattedErrors;
}

/**
 * Create a standardized error message for logging
 */
export function createErrorLogMessage(
  error: ApiError,
  context?: Record<string, unknown>
): string {
  const errorDetails = {
    message: error.message,
    code: error.code,
    status: error.status,
    context,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(errorDetails, null, 2);
}

// Type guard to check if response is an error
export function isApiErrorResponse<T>(
  response: ApiResponse<T> | ApiError
): response is ApiError {
  return 'status' in response && 'message' in response;
}

const errorHandler = {
  createApiError,
  getUserFriendlyMessage,
  showErrorNotification,
  showSuccessNotification,
  logError,
  handleApiError,
  isErrorType,
  isAuthError,
  isValidationError,
  isNetworkError,
  isServerError,
  retryWithBackoff,
  formatValidationErrors,
  createErrorLogMessage,
  isApiErrorResponse,
};

export default errorHandler;
