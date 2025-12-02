import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { logout } from '../slices/authSlice';

// Extend Axios types to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
  
  interface AxiosResponse {
    metadata?: {
      duration: number;
      timestamp: number;
      size: number;
    };
  }
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Middleware for handling HTTP requests
const apiMiddleware: Middleware<object, RootState> = (store) => (next) => (action: unknown) => {
  // Pass through non-API actions
  const typedAction = action as { type?: string };
  if (!typedAction.type || !typedAction.type.endsWith('/pending')) {
    return next(action);
  }

  const { auth } = store.getState();
  
  // Add auth token to requests
  if (auth.tokens?.accessToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${auth.tokens.accessToken}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      // Add request timestamp
      config.metadata = { startTime: Date.now() };
      
      // Add correlation ID for tracking
      config.headers['X-Correlation-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      
      // Log successful response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
      }

      // Add performance metrics
      response.metadata = {
        duration,
        timestamp: Date.now(),
        size: JSON.stringify(response.data).length,
      };

      return response;
    },
    (error: AxiosError) => {
      const duration = Date.now() - (error.config?.metadata?.startTime || 0);
      
      // Log error response
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url} (${duration}ms)`);

      // Handle authentication errors
      if (error.response?.status === 401) {
        // Dispatch logout action for unauthorized requests
        store.dispatch(logout());
        
        // Clear token from axios headers
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.warn(`Rate limited. Retry after: ${retryAfter} seconds`);
      }

      // Handle server errors
      if (error.response?.status && error.response.status >= 500) {
        // Could dispatch a global error action here
        console.error('Server error occurred:', error.response.data);
      }

      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.error('Network error - check connection');
      }

      return Promise.reject(error);
    }
  );

  return next(action);
};

// Export API client for use in services
export { apiClient };
export default apiMiddleware;

