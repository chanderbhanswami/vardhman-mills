import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export interface AsyncOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  enableToasts?: boolean;
  throwOnError?: boolean;
  retries?: number;
  retryDelay?: number;
}

export interface AsyncReturn<T> extends AsyncState<T> {
  execute: (asyncFunction?: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
  cancel: () => void;
}

export const useAsync = <T = unknown>(
  asyncFunction?: () => Promise<T>,
  options: AsyncOptions = {}
): AsyncReturn<T> => {
  const {
    onSuccess,
    onError,
    onSettled,
    enableToasts = false,
    throwOnError = false,
    retries = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
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

  const safeSetState = useCallback((newState: Partial<AsyncState<T>>) => {
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
      isIdle: true,
    });
  }, [cancel, safeSetState]);

  const executeWithRetry = useCallback(
    async (fn: () => Promise<T>, attempt: number = 0): Promise<T> => {
      try {
        const result = await fn();
        retryCountRef.current = 0;
        return result;
      } catch (error) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          return executeWithRetry(fn, attempt + 1);
        }
        throw error;
      }
    },
    [retries, retryDelay]
  );

  const execute = useCallback(
    async (fn?: () => Promise<T>): Promise<T | undefined> => {
      const functionToExecute = fn || asyncFunction;
      
      if (!functionToExecute) {
        const error = new Error('No async function provided');
        safeSetState({ error, isError: true, isIdle: false });
        if (enableToasts) {
          toast.error('No function to execute');
        }
        if (throwOnError) throw error;
        return undefined;
      }

      // Cancel previous request
      cancel();
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      safeSetState({
        isLoading: true,
        isError: false,
        isSuccess: false,
        isIdle: false,
        error: null,
      });

      try {
        const result = await executeWithRetry(functionToExecute);
        
        if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
          safeSetState({
            data: result,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          
          if (enableToasts) {
            toast.success('Operation completed successfully');
          }
          
          onSuccess?.(result);
          onSettled?.();
        }
        
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
          safeSetState({
            error: errorObj,
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          
          if (enableToasts) {
            toast.error(errorObj.message || 'Operation failed');
          }
          
          onError?.(errorObj);
          onSettled?.();
        }
        
        if (throwOnError && mountedRef.current) {
          throw errorObj;
        }
        
        return undefined;
      }
    },
    [asyncFunction, cancel, safeSetState, executeWithRetry, enableToasts, throwOnError, onSuccess, onError, onSettled]
  );

  // Auto-execute if asyncFunction is provided
  useEffect(() => {
    if (asyncFunction && state.isIdle) {
      execute();
    }
  }, [asyncFunction, execute, state.isIdle]);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
};

export default useAsync;