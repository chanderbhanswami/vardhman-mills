import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface FetchOptions extends RequestInit {
  enabled?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  enableToasts?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  cacheTime?: number;
  staleTime?: number;
}

export interface FetchReturn<T> extends FetchState<T> {
  refetch: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

// Simple cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const getCacheKey = (url: string, options?: RequestInit): string => {
  return `${url}_${JSON.stringify(options || {})}`;
};

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  
  const now = Date.now();
  const isStale = now - entry.timestamp > entry.staleTime;
  
  if (isStale) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedData = <T>(key: string, data: T, staleTime: number): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    staleTime,
  });
};

// Cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  entries.forEach(([key, entry]) => {
    if (now - entry.timestamp > entry.staleTime + 60000) { // Extra 1 minute buffer
      cache.delete(key);
    }
  });
}, 300000); // Run every 5 minutes

export const useFetch = <T = unknown>(
  url: string | null,
  options: FetchOptions = {}
): FetchReturn<T> => {
  const {
    enabled = true,
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    enableToasts = false,
    onSuccess,
    onError,
    onSettled,
    staleTime = 60000, // 1 minute
    ...fetchOptions
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    status: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const safeSetState = useCallback((newState: Partial<FetchState<T>>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    retryCountRef.current = 0;
    safeSetState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      status: 'idle',
    });
  }, [cancel, safeSetState]);

  const fetchWithTimeout = useCallback(
    async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeoutMs);

      try {
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    []
  );

  const executeRequest = useCallback(
    async (url: string): Promise<T> => {
      const cacheKey = getCacheKey(url, fetchOptions);
      
      // Check cache first
      const cachedData = getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      const requestOptions: RequestInit = {
        ...fetchOptions,
        signal: abortControllerRef.current.signal,
      };

      const response = await fetchWithTimeout(url, requestOptions, timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data: T;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as unknown as T;
      } else {
        data = (await response.blob()) as unknown as T;
      }

      // Cache the response
      setCachedData(cacheKey, data, staleTime);
      
      return data;
    },
    [fetchOptions, fetchWithTimeout, timeout, staleTime]
  );

  const executeWithRetry = useCallback(
    async (url: string, attempt: number = 0): Promise<T> => {
      try {
        const data = await executeRequest(url);
        retryCountRef.current = 0;
        return data;
      } catch (error) {
        if (attempt < retries && !abortControllerRef.current?.signal.aborted) {
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
          return executeWithRetry(url, attempt + 1);
        }
        throw error;
      }
    },
    [executeRequest, retries, retryDelay]
  );

  const refetch = useCallback(async (): Promise<void> => {
    if (!url) return;

    cancel();
    
    safeSetState({
      isLoading: true,
      isError: false,
      isSuccess: false,
      status: 'loading',
      error: null,
    });

    try {
      const data = await executeWithRetry(url);
      
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        safeSetState({
          data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          status: 'success',
        });
        
        if (enableToasts) {
          toast.success('Data loaded successfully');
        }
        
        onSuccess?.(data);
        onSettled?.();
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        safeSetState({
          error: errorObj,
          isLoading: false,
          isError: true,
          isSuccess: false,
          status: 'error',
        });
        
        if (enableToasts) {
          toast.error(errorObj.message || 'Failed to load data');
        }
        
        onError?.(errorObj);
        onSettled?.();
      }
    }
  }, [url, cancel, safeSetState, executeWithRetry, enableToasts, onSuccess, onError, onSettled]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (enabled && url && state.status === 'idle') {
      refetch();
    }
  }, [enabled, url, refetch, state.status]);

  return {
    ...state,
    refetch,
    cancel,
    reset,
  };
};

// Simple fetch hook for basic use cases
export const useSimpleFetch = <T = unknown>(url: string | null) => {
  return useFetch<T>(url, { enabled: Boolean(url) });
};

export default useFetch;