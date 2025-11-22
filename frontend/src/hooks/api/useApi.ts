import { useState, useCallback, useEffect, useMemo } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableAuth?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
  enableLoading?: boolean;
  enableErrorToast?: boolean;
  enableSuccessToast?: boolean;
}

export interface ApiState {
  isLoading: boolean;
  error: string | null;
  data: unknown;
  lastResponse: AxiosResponse | null;
  requestCount: number;
  successCount: number;
  errorCount: number;
  cacheHits: number;
}

export interface ApiRequestOptions extends AxiosRequestConfig {
  enableCache?: boolean;
  enableLoading?: boolean;
  enableErrorToast?: boolean;
  enableSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  retries?: number;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  expiry: number;
}

const defaultConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  enableAuth: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  enableLoading: true,
  enableErrorToast: true,
  enableSuccessToast: false,
};

export const useApi = (config: Partial<ApiConfig> = {}) => {
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  const [state, setState] = useState<ApiState>({
    isLoading: false,
    error: null,
    data: null,
    lastResponse: null,
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    cacheHits: 0,
  });

  // Cache storage
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  // Create axios instance
  const axiosInstance = useMemo((): AxiosInstance => {
    const instance = axios.create({
      baseURL: finalConfig.baseURL,
      timeout: finalConfig.timeout,
      headers: finalConfig.headers,
    });

    // Request interceptor for auth
    instance.interceptors.request.use(
      (config) => {
        if (finalConfig.enableAuth && typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && finalConfig.enableAuth) {
          // Handle unauthorized - clear token and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [finalConfig]);

  // Generate cache key
  const generateCacheKey = useCallback((method: string, url: string, params?: unknown): string => {
    return `${method.toLowerCase()}_${url}_${JSON.stringify(params || {})}`;
  }, []);

  // Check cache
  const checkCache = useCallback((key: string): unknown | null => {
    if (!finalConfig.enableCache) return null;
    
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      cache.delete(key);
      setCache(new Map(cache));
      return null;
    }

    setState(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    return entry.data;
  }, [cache, finalConfig.enableCache]);

  // Set cache
  const setCacheEntry = useCallback((key: string, data: unknown): void => {
    if (!finalConfig.enableCache) return;

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (finalConfig.cacheTimeout || 300000),
    };

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, entry);
      return newCache;
    });
  }, [finalConfig.enableCache, finalConfig.cacheTimeout]);

  // Sleep utility for retries
  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  // Update loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // Update error state
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Generic request method
  const makeRequest = useCallback(async <T = unknown>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T | null> => {
    const {
      enableCache = finalConfig.enableCache,
      enableLoading = finalConfig.enableLoading,
      enableErrorToast = finalConfig.enableErrorToast,
      enableSuccessToast = finalConfig.enableSuccessToast,
      successMessage,
      errorMessage,
      retries = finalConfig.maxRetries,
      ...axiosOptions
    } = options;

    // Generate cache key for GET requests
    const cacheKey = method === 'get' ? generateCacheKey(method, url, axiosOptions.params) : '';
    
    // Check cache for GET requests
    if (method === 'get' && enableCache && cacheKey) {
      const cachedData = checkCache(cacheKey);
      if (cachedData !== null) {
        setState(prev => ({ ...prev, data: cachedData }));
        return cachedData as T;
      }
    }

    if (enableLoading) {
      setLoading(true);
    }
    setError(null);

    let lastError: AxiosError | Error | null = null;
    let attempt = 0;

    while (attempt <= (retries || 0)) {
      try {
        setState(prev => ({ ...prev, requestCount: prev.requestCount + 1 }));

        let response: AxiosResponse<T>;

        switch (method) {
          case 'get':
            response = await axiosInstance.get<T>(url, axiosOptions);
            break;
          case 'post':
            response = await axiosInstance.post<T>(url, axiosOptions.data, axiosOptions);
            break;
          case 'put':
            response = await axiosInstance.put<T>(url, axiosOptions.data, axiosOptions);
            break;
          case 'patch':
            response = await axiosInstance.patch<T>(url, axiosOptions.data, axiosOptions);
            break;
          case 'delete':
            response = await axiosInstance.delete<T>(url, axiosOptions);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const responseData = response.data;

        setState(prev => ({
          ...prev,
          data: responseData,
          lastResponse: response,
          successCount: prev.successCount + 1,
          isLoading: false,
          error: null,
        }));

        // Cache GET requests
        if (method === 'get' && enableCache && cacheKey) {
          setCacheEntry(cacheKey, responseData);
        }

        // Success toast
        if (enableSuccessToast) {
          toast.success(successMessage || 'Request successful');
        }

        return responseData;

      } catch (error) {
        lastError = error as AxiosError;
        attempt++;

        if (attempt <= (retries || 0) && finalConfig.enableRetry) {
          await sleep(finalConfig.retryDelay || 1000);
          continue;
        }

        // Handle final error
        const errorMsg = (lastError as AxiosError)?.response?.data && 
                        typeof (lastError as AxiosError).response?.data === 'object' && 
                        'message' in ((lastError as AxiosError).response?.data as object)
                        ? ((lastError as AxiosError).response?.data as { message: string }).message
                        : lastError?.message || 
                          errorMessage || 
                          'An error occurred';

        setState(prev => ({
          ...prev,
          error: errorMsg,
          errorCount: prev.errorCount + 1,
          isLoading: false,
        }));

        if (enableErrorToast) {
          toast.error(errorMsg);
        }

        throw lastError;
      }
    }

    return null;
  }, [
    finalConfig,
    axiosInstance,
    generateCacheKey,
    checkCache,
    setCacheEntry,
    sleep,
    setLoading,
    setError
  ]);

  // Convenience methods
  const get = useCallback(<T = unknown>(
    url: string, 
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<T | null> => {
    return makeRequest<T>('get', url, options);
  }, [makeRequest]);

  const post = useCallback(<T = unknown>(
    url: string, 
    data?: unknown, 
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<T | null> => {
    return makeRequest<T>('post', url, { ...options, data });
  }, [makeRequest]);

  const put = useCallback(<T = unknown>(
    url: string, 
    data?: unknown, 
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<T | null> => {
    return makeRequest<T>('put', url, { ...options, data });
  }, [makeRequest]);

  const patch = useCallback(<T = unknown>(
    url: string, 
    data?: unknown, 
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<T | null> => {
    return makeRequest<T>('patch', url, { ...options, data });
  }, [makeRequest]);

  const del = useCallback(<T = unknown>(
    url: string, 
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<T | null> => {
    return makeRequest<T>('delete', url, options);
  }, [makeRequest]);

  // Upload file
  const upload = useCallback(async <T = unknown>(
    url: string,
    file: File | FileList | FormData,
    options: Omit<ApiRequestOptions, 'data'> = {},
    onProgress?: (progress: number) => void
  ): Promise<T | null> => {
    let formData: FormData;

    if (file instanceof FormData) {
      formData = file;
    } else if (file instanceof FileList) {
      formData = new FormData();
      Array.from(file).forEach((f, index) => {
        formData.append(`file_${index}`, f);
      });
    } else {
      formData = new FormData();
      formData.append('file', file);
    }

    const uploadOptions: ApiRequestOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      } : undefined,
    };

    return makeRequest<T>('post', url, { ...uploadOptions, data: formData });
  }, [makeRequest]);

  // Download file
  const download = useCallback(async (
    url: string,
    filename?: string,
    options: Omit<ApiRequestOptions, 'data'> = {}
  ): Promise<void> => {
    try {
      const response = await axiosInstance.get(url, {
        ...options,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
      throw error;
    }
  }, [axiosInstance]);

  // Clear cache
  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const newCache = new Map(cache);
      Array.from(cache.keys()).forEach(key => {
        if (key.includes(pattern)) {
          newCache.delete(key);
        }
      });
      setCache(newCache);
    } else {
      setCache(new Map());
    }
    toast.success('Cache cleared');
  }, [cache]);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    cache.forEach((entry) => {
      if (now > entry.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
      totalSize += JSON.stringify(entry.data).length;
    });

    return {
      totalEntries: cache.size,
      validEntries,
      expiredEntries,
      totalSize,
      hitRate: state.requestCount > 0 ? (state.cacheHits / state.requestCount) * 100 : 0,
    };
  }, [cache, state.requestCount, state.cacheHits]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      lastResponse: null,
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      cacheHits: 0,
    });
  }, []);

  // Cleanup expired cache entries
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCache = new Map(cache);
      let cleaned = false;

      Array.from(cache.entries()).forEach(([key, entry]) => {
        if (now > entry.expiry) {
          newCache.delete(key);
          cleaned = true;
        }
      });

      if (cleaned) {
        setCache(newCache);
      }
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, [cache]);

  // Computed values
  const computed = useMemo(() => ({
    hasError: state.error !== null,
    hasData: state.data !== null,
    successRate: state.requestCount > 0 ? (state.successCount / state.requestCount) * 100 : 0,
    errorRate: state.requestCount > 0 ? (state.errorCount / state.requestCount) * 100 : 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }), [state]);

  return {
    // State
    ...state,
    
    // Configuration
    config: finalConfig,
    
    // HTTP methods
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilities
    upload,
    download,
    makeRequest,
    
    // Cache management
    clearCache,
    getCacheStats,
    
    // State management
    reset,
    setLoading,
    setError,
    
    // Computed values
    ...computed,
    
    // Raw axios instance for advanced usage
    axiosInstance,
  };
};

export default useApi;
