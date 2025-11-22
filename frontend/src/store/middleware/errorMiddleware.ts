import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { addNotification } from '../slices/notificationSlice';

// Error types for better error handling
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

interface RejectedAction extends AnyAction {
  type: string;
  payload?: {
    status?: number;
    message?: string;
    data?: unknown;
  };
  error?: {
    message?: string;
    name?: string;
    stack?: string;
  };
}

// Error middleware for global error handling
const errorMiddleware: Middleware<Record<string, never>, RootState> = (store) => (next) => (action) => {
  const typedAction = action as AnyAction;
  const result = next(action);

  // Handle rejected actions (async thunk failures)
  if (typedAction.type.endsWith('/rejected')) {
    const rejectedAction = typedAction as RejectedAction;
    
    // Extract error information
    const error: ApiError = {
      message: rejectedAction.error?.message || 'An unexpected error occurred',
      status: rejectedAction.payload?.status,
      code: rejectedAction.type.replace('/rejected', ''),
      details: rejectedAction.payload?.data as Record<string, unknown>,
    };

    // Log error for debugging
    console.error(`🚨 Redux Error [${error.code}]:`, {
      message: error.message,
      status: error.status,
      details: error.details,
      stack: rejectedAction.error?.stack,
    });

    // Handle different types of errors
    handleError(store, error, rejectedAction);
  }

  // Handle synchronous errors
  if (typedAction.type === 'error/syncError') {
    const error = typedAction.payload as ApiError;
    console.error('🚨 Synchronous Error:', error);
    handleError(store, error, typedAction);
  }

  // Handle network errors
  if (typedAction.type === 'error/networkError') {
    const error = typedAction.payload as ApiError;
    console.error('🌐 Network Error:', error);
    
    // Show network error notification
    store.dispatch(addNotification({
      id: `network-error-${Date.now()}`,
      type: 'error',
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      duration: 5000,
    }));
  }

  return result;
};

// Centralized error handling function
function handleError(store: { dispatch: (action: AnyAction) => void }, error: ApiError, action: AnyAction) {
  const { status, message, code } = error;

  // Handle authentication errors
  if (status === 401) {
    store.dispatch(addNotification({
      id: `auth-error-${Date.now()}`,
      type: 'error',
      title: 'Authentication Required',
      message: 'Please log in to continue.',
      duration: 5000,
    }));
    return;
  }

  // Handle authorization errors
  if (status === 403) {
    store.dispatch(addNotification({
      id: `auth-error-${Date.now()}`,
      type: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      duration: 5000,
    }));
    return;
  }

  // Handle validation errors
  if (status === 400 || status === 422) {
    const validationMessage = getValidationMessage(error);
    store.dispatch(addNotification({
      id: `validation-error-${Date.now()}`,
      type: 'error',
      title: 'Validation Error',
      message: validationMessage,
      duration: 6000,
    }));
    return;
  }

  // Handle not found errors
  if (status === 404) {
    store.dispatch(addNotification({
      id: `not-found-error-${Date.now()}`,
      type: 'error',
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      duration: 4000,
    }));
    return;
  }

  // Handle rate limiting
  if (status === 429) {
    store.dispatch(addNotification({
      id: `rate-limit-error-${Date.now()}`,
      type: 'warning',
      title: 'Too Many Requests',
      message: 'Please wait a moment before trying again.',
      duration: 5000,
    }));
    return;
  }

  // Handle server errors
  if (status && status >= 500) {
    store.dispatch(addNotification({
      id: `server-error-${Date.now()}`,
      type: 'error',
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      duration: 6000,
    }));
    
    // Report to error tracking service (e.g., Sentry)
    reportError(error, action);
    return;
  }

  // Handle specific action errors
  if (code) {
    const actionSpecificMessage = getActionSpecificMessage(code);
    if (actionSpecificMessage) {
      store.dispatch(addNotification({
        id: `action-error-${Date.now()}`,
        type: 'error',
        title: 'Operation Failed',
        message: actionSpecificMessage,
        duration: 5000,
      }));
      return;
    }
  }

  // Generic error handling
  store.dispatch(addNotification({
    id: `generic-error-${Date.now()}`,
    type: 'error',
    title: 'Error',
    message: message || 'An unexpected error occurred. Please try again.',
    duration: 5000,
  }));
}

// Extract validation message from error details
function getValidationMessage(error: ApiError): string {
  if (error.details && typeof error.details === 'object') {
    // Handle validation errors from backend
    const validationErrors = error.details.errors as Record<string, string[]>;
    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
    
    // Handle field-specific errors
    const fields = error.details.fields as Record<string, string>;
    if (fields) {
      const firstField = Object.keys(fields)[0];
      return `${firstField}: ${fields[firstField]}`;
    }
  }
  
  return error.message || 'Please check your input and try again.';
}

// Get action-specific error messages
function getActionSpecificMessage(code: string): string | null {
  const actionMessages: Record<string, string> = {
    'auth/login': 'Invalid email or password. Please try again.',
    'auth/register': 'Registration failed. Please check your information.',
    'auth/forgotPassword': 'Unable to send reset email. Please try again.',
    'cart/addToCart': 'Unable to add item to cart. Please try again.',
    'cart/updateQuantity': 'Unable to update cart. Please try again.',
    'product/fetchProducts': 'Unable to load products. Please refresh the page.',
    'order/createOrder': 'Unable to create order. Please try again.',
    'payment/processPayment': 'Payment processing failed. Please try again.',
    'wishlist/addToWishlist': 'Unable to add to wishlist. Please try again.',
    'user/updateProfile': 'Unable to update profile. Please try again.',
  };

  return actionMessages[code] || null;
}

// Report error to external service
function reportError(error: ApiError, action: AnyAction): void {
  // In production, you would send this to an error tracking service
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Sentry, LogRocket, Bugsnag, etc.
    // Sentry.captureException(new Error(error.message), {
    //   tags: {
    //     action: action.type,
    //     status: error.status,
    //   },
    //   extra: {
    //     error: error,
    //     action: action,
    //   },
    // });
    
    console.log('Error reported to tracking service:', { error, action });
  }
}

// Utility function to create error actions
export const createErrorAction = (type: string, error: ApiError) => ({
  type: `${type}/rejected`,
  error: {
    message: error.message,
    name: 'Error',
  },
  payload: {
    status: error.status,
    data: error.details,
  },
});

// Utility function to handle async errors
export const handleAsyncError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as Record<string, unknown>;
    const response = apiError.response as Record<string, unknown> | undefined;
    return {
      message: (apiError.message as string) || 'An error occurred',
      status: (apiError.status as number) || (response?.status as number),
      code: apiError.code as string,
      details: (response?.data as Record<string, unknown>) || (apiError.data as Record<string, unknown>),
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

export default errorMiddleware;
