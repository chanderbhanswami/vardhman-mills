import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { ApiResponse, ApiError } from './types';
import { authHandler } from './auth-handler';

/**
 * Request and Response Interceptors for Axios
 * Handles authentication, error handling, logging, and other cross-cutting concerns
 */

interface RequestMetadata {
  startTime: number;
  retryCount?: number;
  requestId: string;
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Setup request interceptors
 */
export function setupRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config) => {
      // Add request metadata
      const metadata: RequestMetadata = {
        startTime: Date.now(),
        requestId: generateRequestId(),
      };
      (config as AxiosRequestConfig & { metadata?: RequestMetadata }).metadata = metadata;

      // Add authentication token
      const token = authHandler.getToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID to headers for tracing
      config.headers['X-Request-ID'] = metadata.requestId;

      // Add client info
      config.headers['X-Client-Version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
      config.headers['X-Client-Platform'] = 'web';

      // Handle different content types
      if (config.data instanceof FormData) {
        // Let browser set Content-Type with boundary for FormData
        delete config.headers['Content-Type'];
      } else if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }

      // Add API key if available
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Request ID:', metadata.requestId);
        console.log('Headers:', config.headers);
        console.log('Data:', config.data);
        console.groupEnd();
      }

      return config;
    },
    (error) => {
      console.error('Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );
}

/**
 * Setup response interceptors
 */
export function setupResponseInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // Calculate request duration
      const config = response.config as AxiosRequestConfig & { metadata?: RequestMetadata };
      const duration = config.metadata ? Date.now() - config.metadata.startTime : 0;

      // Add response metadata (extend the response data)
      if (response.data && typeof response.data === 'object') {
        const extendedData = response.data as unknown as Record<string, unknown>;
        extendedData._metadata = {
          requestId: config.metadata?.requestId,
          duration,
          timestamp: new Date().toISOString(),
        };
      }

      // Log successful response in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
        console.log('Request ID:', config.metadata?.requestId);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();
      }

      // Handle specific success scenarios
      if (response.data.success && response.data.message) {
        // Show success message for certain operations
        const method = response.config.method?.toUpperCase();
        const showSuccessToast = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');
        
        if (showSuccessToast && shouldShowSuccessMessage(response.config.url || '')) {
          toast.success(response.data.message, {
            duration: 3000,
            position: 'top-right',
          });
        }
      }

      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { 
        metadata?: RequestMetadata;
        _retry?: boolean;
        _retryCount?: number;
      };

      // Calculate request duration
      const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`❌ ${config?.method?.toUpperCase()} ${config?.url} (${duration}ms)`);
        console.log('Request ID:', config?.metadata?.requestId);
        console.log('Status:', error.response?.status);
        console.log('Error:', error.message);
        console.log('Response Data:', error.response?.data);
        console.groupEnd();
      }

      // Handle different error scenarios
      return handleResponseError(error, client);
    }
  );
}

/**
 * Handle response errors with retry logic and authentication
 */
async function handleResponseError(
  error: AxiosError,
  client: AxiosInstance
): Promise<never> {
  const config = error.config as AxiosRequestConfig & {
    _retry?: boolean;
    _retryCount?: number;
    metadata?: RequestMetadata;
  };

  if (!config) {
    return Promise.reject(createApiError(error));
  }

  const status = error.response?.status;

  // Handle 401 Unauthorized - Token refresh
  if (status === 401 && !config._retry) {
    config._retry = true;

    try {
      // Check if we have a refresh token
      if (authHandler.getRefreshToken()) {
        await authHandler.refreshAuthToken();
        
        // Update authorization header with new token
        const newToken = authHandler.getToken();
        if (newToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return client(config);
        }
      }
      
      // No refresh token or refresh failed - redirect to login
      handleAuthenticationError();
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      handleAuthenticationError();
    }
  }

  // Handle 403 Forbidden
  if (status === 403) {
    toast.error('You do not have permission to perform this action.');
  }

  // Handle 429 Rate Limiting with retry
  if (status === 429 && !config._retry) {
    const retryAfter = error.response?.headers['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;

    config._retry = true;
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, delay));
    return client(config);
  }

  // Handle network errors with retry
  if (!error.response && shouldRetryNetworkError(config)) {
    config._retryCount = (config._retryCount || 0) + 1;
    
    if (config._retryCount <= 3) {
      const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return client(config);
    }
  }

  // Handle 5xx server errors with retry
  if (status && status >= 500 && shouldRetryServerError(config)) {
    config._retryCount = (config._retryCount || 0) + 1;
    
    if (config._retryCount <= 2) {
      const delay = Math.pow(2, config._retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return client(config);
    }
  }

  // Create standardized error and show notification
  const apiError = createApiError(error);
  showErrorNotification(apiError);

  return Promise.reject(apiError);
}

/**
 * Handle authentication errors
 */
function handleAuthenticationError(): void {
  // Clear auth state
  authHandler.logout();

  // Redirect to login page (avoid redirect loops)
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    
    if (!authPaths.includes(currentPath)) {
      const redirectUrl = encodeURIComponent(currentPath + window.location.search);
      window.location.href = `/login?redirect=${redirectUrl}`;
    }
  }
}

/**
 * Create API error from Axios error
 */
function createApiError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    status: error.response?.status || 500,
  };

  if (error.response?.data) {
    const errorData = error.response.data as Record<string, unknown>;
    apiError.message = (errorData.message as string) || 
                      (errorData.error as string) || 
                      'Request failed';
    apiError.code = errorData.code as string;
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

  return apiError;
}

/**
 * Show error notification to user
 */
function showErrorNotification(error: ApiError): void {
  // Don't show notifications for certain error types
  const silentErrors = ['AUTH_TOKEN_EXPIRED', 'AUTH_TOKEN_INVALID'];
  if (error.code && silentErrors.includes(error.code)) {
    return;
  }

  // Don't show notifications for network errors (user likely knows)
  if (error.code === 'NETWORK_ERROR') {
    return;
  }

  // Show appropriate error message
  let message = error.message;
  
  // Customize messages for common errors
  if (error.status === 404) {
    message = 'The requested resource was not found.';
  } else if (error.status === 500) {
    message = 'Server error. Please try again later.';
  } else if (error.status === 503) {
    message = 'Service temporarily unavailable. Please try again later.';
  }

  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#ffffff',
    },
  });
}

/**
 * Check if we should show success message for this endpoint
 */
function shouldShowSuccessMessage(url: string): boolean {
  const successMessageEndpoints = [
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/update-password',
    '/users/me',
    '/contact',
    '/newsletter/subscribe',
  ];

  return successMessageEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Check if we should retry network errors
 */
function shouldRetryNetworkError(config: AxiosRequestConfig): boolean {
  // Only retry GET requests for network errors
  return config.method?.toUpperCase() === 'GET';
}

/**
 * Check if we should retry server errors
 */
function shouldRetryServerError(config: AxiosRequestConfig): boolean {
  // Retry GET and POST requests for server errors
  const method = config.method?.toUpperCase();
  return method === 'GET' || method === 'POST';
}

/**
 * Setup all interceptors for an Axios instance
 */
export function setupInterceptors(client: AxiosInstance): void {
  setupRequestInterceptors(client);
  setupResponseInterceptors(client);
}

/**
 * Remove all interceptors from an Axios instance
 */
export function removeInterceptors(client: AxiosInstance): void {
  client.interceptors.request.clear();
  client.interceptors.response.clear();
}

/**
 * Setup development interceptors for debugging
 */
export function setupDevelopmentInterceptors(client: AxiosInstance): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Request timing interceptor
  client.interceptors.request.use(
    (config) => {
      const configWithTiming = config as AxiosRequestConfig & { startTime?: number };
      configWithTiming.startTime = Date.now();
      return config;
    }
  );

  // Response timing interceptor
  client.interceptors.response.use(
    (response) => {
      const configWithTiming = response.config as AxiosRequestConfig & { startTime?: number };
      const duration = configWithTiming.startTime ? Date.now() - configWithTiming.startTime : 0;
      console.log(`⏱️ Request completed in ${duration}ms`);
      return response;
    },
    (error) => {
      if (error.config) {
        const configWithTiming = error.config as AxiosRequestConfig & { startTime?: number };
        const duration = configWithTiming.startTime ? Date.now() - configWithTiming.startTime : 0;
        console.log(`⏱️ Request failed after ${duration}ms`);
      }
      return Promise.reject(error);
    }
  );
}

const interceptorUtils = {
  setupInterceptors,
  setupRequestInterceptors,
  setupResponseInterceptors,
  removeInterceptors,
  setupDevelopmentInterceptors,
};

export default interceptorUtils;
