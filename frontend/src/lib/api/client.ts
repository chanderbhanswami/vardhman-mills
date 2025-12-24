import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { ApiResponse, ApiError } from './types';

// Client Configuration
interface ClientConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
  headers: Record<string, string>;
}

const defaultConfig: ClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1',
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Debug: Log the actual base URL being used
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('ðŸ”§ API Client Config:', {
    baseURL: defaultConfig.baseURL,
    env: process.env.NEXT_PUBLIC_API_URL,
  });
}

/**
 * HTTP Client Class for API communication
 * Provides a centralized way to make HTTP requests with authentication,
 * error handling, retries, and other common features
 */
export class HttpClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(config: Partial<ClientConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config };

    this.client = axios.create(finalConfig);
    this.setupInterceptors();
    this.loadTokenFromStorage();
  }

  /**
   * Load authentication tokens from localStorage
   */
  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  /**
   * Save authentication tokens to localStorage
   */
  private saveTokenToStorage(token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  }

  /**
   * Clear authentication tokens from localStorage
   */
  private clearTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Add request timestamp for debugging
        const configWithMetadata = config as AxiosRequestConfig & { metadata?: { startTime: number } };
        configWithMetadata.metadata = { startTime: Date.now() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`ðŸš€ ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const configWithMetadata = response.config as AxiosRequestConfig & { metadata?: { startTime: number } };
        const duration = configWithMetadata.metadata?.startTime
          ? Date.now() - configWithMetadata.metadata.startTime
          : 0;

        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`âœ… ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`âŒ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle 401 Unauthorized - Token Refresh
        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshAuthToken();
            if (response.data?.token) {
              this.setToken(response.data.token, response.data.refreshToken);

              // Retry all failed requests
              this.processQueue(null);

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle different error types
        return this.handleError(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    this.clearToken();
    if (typeof window !== 'undefined') {
      // Redirect to login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    const response = await axios.post('/auth/refresh', {
      refreshToken: this.refreshToken,
    });
    return response.data;
  }

  /**
   * Handle API errors and show appropriate messages
   */
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      const errorData = error.response.data as Record<string, unknown>;
      apiError.message = (errorData.message as string) || (errorData.error as string) || apiError.message;
      apiError.code = errorData.code as string;
      apiError.errors = errorData.errors as Record<string, string[]>;
    } else if (error.request) {
      // Network error
      apiError.message = 'Network error. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Request setup error
      apiError.message = error.message || apiError.message;
      apiError.code = 'REQUEST_ERROR';
    }

    // Show toast notification for client errors (400-499)
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      toast.error(apiError.message);
    } else if (error.response?.status && error.response.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      // Network error
      toast.error('Connection failed. Please check your internet.');
    }

    return Promise.reject(apiError);
  }

  /**
   * Set authentication token
   */
  public setToken(token: string, refreshToken?: string): void {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    this.saveTokenToStorage(token, refreshToken);
  }

  /**
   * Clear authentication token
   */
  public clearToken(): void {
    this.token = null;
    this.refreshToken = null;
    this.clearTokenFromStorage();
  }

  /**
   * Get current authentication token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Generic request method
   */
  public async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Upload file(s)
   */
  public async upload<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress,
    });
  }

  /**
   * Download file
   */
  public async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    try {
      const response = await this.client({
        ...config,
        method: 'GET',
        url,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Retry request with exponential backoff
   */
  public async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    // Note: This would require implementing request cancellation tokens
    console.warn('Request cancellation not implemented yet');
  }

  /**
   * Get client configuration
   */
  public getConfig(): Partial<AxiosRequestConfig> {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      withCredentials: this.client.defaults.withCredentials,
    };
  }

  /**
   * Update base URL
   */
  public updateBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }
}

// Create and export default client instance
export const httpClient = new HttpClient();

// Export for use in other modules
export default httpClient;
