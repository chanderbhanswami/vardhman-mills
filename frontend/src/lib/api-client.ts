/**
 * API Client
 * 
 * Centralized API client for making HTTP requests
 * This is a wrapper around the HttpClient class for backward compatibility
 * and to provide a simple interface for API calls throughout the application
 */

import { httpClient, HttpClient } from './api/client';

/**
 * Export the HTTP client instance as apiClient for backward compatibility
 * This allows imports like: import { apiClient } from '@/lib/api-client'
 */
export const apiClient = httpClient;

/**
 * Export the HttpClient class for advanced usage
 */
export { HttpClient };

/**
 * Export default for default imports
 */
export default apiClient;
