import { useMutation, useQueryClient, MutationFunction } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Declare global gtag interface for window object
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export interface OptimisticUpdate<TData, TVariables = unknown> {
  queryKey: (string | number | Record<string, unknown>)[];
  updater: (oldData: TData | undefined, variables: TVariables) => TData;
  rollback?: (oldData: TData | undefined, variables: TVariables, context?: OptimisticContext<TData>) => TData | undefined;
}

export interface OptimisticContext<TData> {
  previousData?: TData;
  snapshotTime: number;
  operationId: string;
  relatedQueries?: string[][];
}

export interface OptimisticMutationOptions<TData, TError, TVariables, TContext> {
  mutationFn: MutationFunction<TData, TVariables>;
  optimisticUpdates?: OptimisticUpdate<unknown, TVariables>[];
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void;
  enableToasts?: boolean;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string | ((error: TError, variables: TVariables) => string);
  retryCount?: number;
  invalidateQueries?: (string | number | Record<string, unknown>)[][];
  enableAnalytics?: boolean;
  analyticsEvent?: string;
}

export const useOptimisticMutations = () => {
  const queryClient = useQueryClient();
  const operationIdRef = useRef(0);

  // Generate unique operation ID
  const generateOperationId = useCallback(() => {
    operationIdRef.current += 1;
    return `op_${operationIdRef.current}_${Date.now()}`;
  }, []);

  // Apply optimistic updates
  const applyOptimisticUpdates = useCallback(
    <TVariables>(updates: OptimisticUpdate<unknown, TVariables>[], variables: TVariables) => {
      const contexts: Map<string, OptimisticContext<unknown>> = new Map();
      const operationId = generateOperationId();

      for (const update of updates) {
        const queryKeyString = JSON.stringify(update.queryKey);
        
        // Cancel any outgoing refetches
        queryClient.cancelQueries({ queryKey: update.queryKey });
        
        // Snapshot the previous value
        const previousData = queryClient.getQueryData(update.queryKey);
        
        // Create context
        const context: OptimisticContext<unknown> = {
          previousData,
          snapshotTime: Date.now(),
          operationId,
          relatedQueries: updates.map(u => u.queryKey.map(String)),
        };
        
        contexts.set(queryKeyString, context);
        
        // Apply optimistic update
        try {
          const optimisticData = update.updater(previousData, variables);
          queryClient.setQueryData(update.queryKey, optimisticData);
        } catch (error) {
          console.warn('Failed to apply optimistic update:', error);
          // Restore original data if update fails
          queryClient.setQueryData(update.queryKey, previousData);
        }
      }

      return contexts;
    },
    [queryClient, generateOperationId]
  );

  // Rollback optimistic updates
  const rollbackOptimisticUpdates = useCallback(
    <TVariables>(updates: OptimisticUpdate<unknown, TVariables>[], variables: TVariables, contexts: Map<string, OptimisticContext<unknown>>) => {
      for (const update of updates) {
        const queryKeyString = JSON.stringify(update.queryKey);
        const context = contexts.get(queryKeyString);
        
        if (context) {
          try {
            if (update.rollback) {
              // Use custom rollback function
              const rolledBackData = update.rollback(context.previousData, variables, context);
              queryClient.setQueryData(update.queryKey, rolledBackData);
            } else {
              // Default rollback: restore previous data
              queryClient.setQueryData(update.queryKey, context.previousData);
            }
          } catch (error) {
            console.warn('Failed to rollback optimistic update:', error);
            // Force restore original data
            queryClient.setQueryData(update.queryKey, context.previousData);
          }
        }
      }
    },
    [queryClient]
  );

  // Invalidate related queries
  const invalidateRelatedQueries = useCallback(
    (queryKeys: (string | number | Record<string, unknown>)[][]) => {
      for (const queryKey of queryKeys) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    [queryClient]
  );

  // Track analytics
  const trackAnalytics = useCallback(
    (event: string, data: Record<string, unknown>) => {
      try {
        // Analytics tracking (can be replaced with actual analytics service)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', event, data);
        }
        console.log('Analytics:', event, data);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    },
    []
  );

  // Utility functions
  const getQueryData = useCallback(
    <T>(queryKey: (string | number | Record<string, unknown>)[]): T | undefined => {
      return queryClient.getQueryData<T>(queryKey);
    },
    [queryClient]
  );

  const setQueryData = useCallback(
    <T>(queryKey: (string | number | Record<string, unknown>)[], data: T) => {
      queryClient.setQueryData(queryKey, data);
    },
    [queryClient]
  );

  const prefetchQuery = useCallback(
    (queryKey: (string | number | Record<string, unknown>)[], queryFn: () => Promise<unknown>) => {
      return queryClient.prefetchQuery({ queryKey, queryFn });
    },
    [queryClient]
  );

  return {
    // Core functions
    applyOptimisticUpdates,
    rollbackOptimisticUpdates,
    invalidateRelatedQueries,
    trackAnalytics,
    
    // Query utilities
    getQueryData,
    setQueryData,
    prefetchQuery,
    
    // Query client access
    queryClient,
  };
};

// Hook for creating optimistic mutation
export const useOptimisticMutation = <TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: OptimisticMutationOptions<TData, TError, TVariables, TContext>
) => {
  const {
    applyOptimisticUpdates,
    rollbackOptimisticUpdates,
    invalidateRelatedQueries,
    trackAnalytics,
    queryClient,
  } = useOptimisticMutations();

  const {
    mutationFn,
    optimisticUpdates = [],
    onSuccess,
    onError,
    onSettled,
    enableToasts = true,
    successMessage,
    errorMessage,
    retryCount = 2,
    invalidateQueries = [],
    enableAnalytics = false,
    analyticsEvent,
  } = options;

  return useMutation<TData, TError, TVariables, Map<string, OptimisticContext<unknown>>>({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Apply optimistic updates if any
      if (optimisticUpdates.length > 0) {
        return applyOptimisticUpdates(optimisticUpdates, variables);
      }
      return new Map();
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      if (invalidateQueries.length > 0) {
        invalidateRelatedQueries(invalidateQueries);
      }

      // Show success toast
      if (enableToasts && successMessage) {
        const message = typeof successMessage === 'function' 
          ? successMessage(data, variables)
          : successMessage;
        toast.success(message, { duration: 3000, icon: '✅' });
      }

      // Track analytics
      if (enableAnalytics && analyticsEvent) {
        trackAnalytics(analyticsEvent, {
          action: 'success',
          variables: typeof variables === 'object' ? variables : { value: variables },
          timestamp: Date.now(),
        });
      }

      // Call custom success handler
      onSuccess?.(data, variables, context as TContext);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (optimisticUpdates.length > 0 && context) {
        rollbackOptimisticUpdates(optimisticUpdates, variables, context);
      }

      // Show error toast
      if (enableToasts) {
        const message = errorMessage 
          ? (typeof errorMessage === 'function' ? errorMessage(error, variables) : errorMessage)
          : 'An error occurred. Please try again.';
        toast.error(message, { duration: 4000, icon: '❌' });
      }

      // Track analytics
      if (enableAnalytics && analyticsEvent) {
        trackAnalytics(`${analyticsEvent}_error`, {
          action: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          variables: typeof variables === 'object' ? variables : { value: variables },
          timestamp: Date.now(),
        });
      }

      // Call custom error handler
      onError?.(error, variables, context as TContext);
    },
    onSettled: (data, error, variables, context) => {
      // Force refetch critical queries after settlement
      if (optimisticUpdates.length > 0) {
        const criticalQueries = optimisticUpdates.map(update => update.queryKey);
        for (const queryKey of criticalQueries) {
          queryClient.invalidateQueries({ queryKey });
        }
      }

      // Call custom settled handler
      onSettled?.(data, error, variables, context as TContext);
    },
    retry: retryCount,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useOptimisticMutations;
