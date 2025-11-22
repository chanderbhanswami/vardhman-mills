'use client';

import React from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'react-hot-toast';

// Error type for better type safety
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Query configuration
const queryConfig = {
  defaultOptions: {
    queries: {
      // Time before considering the data stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Time before removing unused data from cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry failed requests
      retry: (failureCount: number, error: unknown) => {
        // Don't retry for client errors (4xx)
        const apiError = error as ApiError;
        const status = apiError?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on mount
      refetchOnMount: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Error handling
      throwOnError: false,
      
      // Network mode
      networkMode: 'online' as const,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount: number, error: unknown) => {
        // Don't retry for client errors (4xx)
        const apiError = error as ApiError;
        const status = apiError?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Network mode
      networkMode: 'online' as const,
    }
  }
};

// Query cache configuration
const queryCache = new QueryCache({
  onError: (error: unknown, query) => {
    // Log error
    console.error('Query error:', {
      error,
      queryKey: query.queryKey,
      queryHash: query.queryHash,
    });
    
    // Show user-friendly error message
    const apiError = error as ApiError;
    if (apiError?.response?.status === 401) {
      toast.error('Your session has expired. Please log in again.');
    } else if (apiError?.response?.status === 403) {
      toast.error('You do not have permission to access this resource.');
    } else if (apiError?.response?.status === 404) {
      toast.error('The requested resource was not found.');
    } else if (apiError?.response?.status && apiError.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (apiError?.message?.toLowerCase().includes('network')) {
      toast.error('Network error. Please check your connection.');
    } else {
      // Don't show generic errors for background queries
      const isBackgroundQuery = query.meta?.errorNotification === false;
      if (!isBackgroundQuery) {
        toast.error('Something went wrong. Please try again.');
      }
    }
  },
  
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query success:', {
        data,
        queryKey: query.queryKey,
        queryHash: query.queryHash,
      });
    }
  }
});

// Mutation cache configuration
const mutationCache = new MutationCache({
  onError: (error: unknown, _variables, _context, mutation) => {
    // Log error
    console.error('Mutation error:', {
      error,
      mutationKey: mutation.options.mutationKey,
    });
    
    // Show user-friendly error message
    const apiError = error as ApiError;
    if (apiError?.response?.status === 401) {
      toast.error('Your session has expired. Please log in again.');
    } else if (apiError?.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (apiError?.response?.status === 409) {
      toast.error('This action conflicts with existing data.');
    } else if (apiError?.response?.status === 422) {
      toast.error('Invalid data provided. Please check your input.');
    } else if (apiError?.response?.status && apiError.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (apiError?.message?.toLowerCase().includes('network')) {
      toast.error('Network error. Please check your connection.');
    } else {
      // Check if the mutation has custom error handling
      const hasCustomErrorHandling = mutation.meta?.errorNotification === false;
      if (!hasCustomErrorHandling) {
        const errorMessage = apiError?.message || 'Something went wrong. Please try again.';
        toast.error(errorMessage);
      }
    }
  },
  
  onSuccess: (data, _variables, _context, mutation) => {
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation success:', {
        data,
        mutationKey: mutation.options.mutationKey,
      });
    }
    
    // Show success notification if configured
    const successMessage = mutation.meta?.successMessage;
    if (successMessage) {
      toast.success(typeof successMessage === 'string' ? successMessage : 'Operation completed successfully');
    }
  }
});

// Create query client instance
let queryClient: QueryClient | undefined;

const createQueryClient = () => {
  return new QueryClient({
    ...queryConfig,
    queryCache,
    mutationCache,
  });
};

const getQueryClient = () => {
  // Server-side: always create a new query client
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  
  // Client-side: create query client if it doesn't exist
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  
  return queryClient;
};

// Query Provider Component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Create query client instance
  const client = React.useMemo(() => getQueryClient(), []);
  
  return (
    <QueryClientProvider client={client}>
      {children}
      
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

// Hook to get query client
export const useQueryClient = () => {
  const client = getQueryClient();
  return client;
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateQueryData = React.useCallback(
    (
      queryKey: string[],
      updater: (oldData: unknown) => unknown,
      options?: {
        exact?: boolean;
        predicate?: (query: unknown) => boolean;
      }
    ) => {
      queryClient.setQueryData(queryKey, updater);
      
      // Optionally invalidate related queries
      if (options?.exact) {
        queryClient.invalidateQueries({ queryKey, exact: true });
      } else if (options?.predicate) {
        queryClient.invalidateQueries({ predicate: options.predicate });
      }
    },
    [queryClient]
  );
  
  const invalidateQueries = React.useCallback(
    (queryKey: string[], options?: { exact?: boolean }) => {
      queryClient.invalidateQueries({
        queryKey,
        exact: options?.exact
      });
    },
    [queryClient]
  );
  
  const removeQueries = React.useCallback(
    (queryKey: string[], options?: { exact?: boolean }) => {
      queryClient.removeQueries({
        queryKey,
        exact: options?.exact
      });
    },
    [queryClient]
  );
  
  const prefetchQuery = React.useCallback(
    async (queryKey: string[], queryFn: () => Promise<unknown>, options?: { staleTime?: number }) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime || 5 * 60 * 1000 // 5 minutes default
      });
    },
    [queryClient]
  );
  
  return {
    updateQueryData,
    invalidateQueries,
    removeQueries,
    prefetchQuery,
    queryClient
  };
};

// Custom hook for cache management
export const useCacheManager = () => {
  const queryClient = useQueryClient();
  
  const clearCache = React.useCallback(() => {
    queryClient.clear();
    toast.success('Cache cleared successfully');
  }, [queryClient]);
  
  const getCache = React.useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(query => query.getObserversCount() > 0).length,
      staleQueries: queries.filter(query => query.isStale()).length,
      invalidQueries: queries.filter(query => query.state.isInvalidated).length,
      errorQueries: queries.filter(query => query.state.error).length,
    };
  }, [queryClient]);
  
  const getCacheSize = React.useCallback(() => {
    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      let totalSize = 0;
      
      queries.forEach(query => {
        const data = query.state.data;
        if (data) {
          // Rough estimation of data size
          totalSize += JSON.stringify(data).length;
        }
      });
      
      return {
        queries: queries.length,
        estimatedSizeBytes: totalSize,
        estimatedSizeKB: Math.round(totalSize / 1024),
        estimatedSizeMB: Math.round(totalSize / (1024 * 1024))
      };
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return null;
    }
  }, [queryClient]);
  
  const forceFetchQuery = React.useCallback(
    async (queryKey: string[]) => {
      await queryClient.refetchQueries({
        queryKey,
        type: 'active'
      });
    },
    [queryClient]
  );
  
  return {
    clearCache,
    getCache,
    getCacheSize,
    forceFetchQuery
  };
};

// Performance monitoring hook
export const useQueryPerformance = () => {
  const [performanceData, setPerformanceData] = React.useState<{
    slowQueries: Array<{ queryKey: string; duration: number }>;
    errorQueries: Array<{ queryKey: string; error: string }>;
    averageQueryTime: number;
  }>({
    slowQueries: [],
    errorQueries: [],
    averageQueryTime: 0
  });
  
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const slowQueries: Array<{ queryKey: string; duration: number }> = [];
    const errorQueries: Array<{ queryKey: string; error: string }> = [];
    let totalDuration = 0;
    let successfulQueries = 0;
    
    queries.forEach(query => {
      const state = query.state;
      const queryKey = query.queryKey.join(' > ');
      
      if (state.error) {
        errorQueries.push({
          queryKey,
          error: state.error.message || 'Unknown error'
        });
      }
      
      if (state.dataUpdatedAt && state.dataUpdatedAt > 0) {
        const duration = Date.now() - state.dataUpdatedAt;
        totalDuration += duration;
        successfulQueries++;
        
        // Consider queries taking more than 2 seconds as slow
        if (duration > 2000) {
          slowQueries.push({ queryKey, duration });
        }
      }
    });
    
    setPerformanceData({
      slowQueries: slowQueries.slice(0, 10), // Top 10 slow queries
      errorQueries: errorQueries.slice(0, 10), // Top 10 error queries
      averageQueryTime: successfulQueries > 0 ? totalDuration / successfulQueries : 0
    });
  }, [queryClient]);
  
  return performanceData;
};

export default QueryProvider;
