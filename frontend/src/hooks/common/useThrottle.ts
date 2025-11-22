import { useCallback, useRef, useEffect, useMemo, useState } from 'react';

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
  abortValue?: unknown;
  onThrottled?: (args: unknown[]) => void;
  onExecuted?: (args: unknown[], result?: unknown) => void;
}

export interface ThrottleState {
  isThrottled: boolean;
  isPending: boolean;
  lastExecuted: number | null;
  executionCount: number;
  throttledCount: number;
  averageInterval: number;
}

export interface ThrottleReturn<T extends (...args: never[]) => unknown> {
  throttledFn: T;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
  state: ThrottleState;
  reset: () => void;
  updateDelay: (newDelay: number) => void;
}

export const useThrottle = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
  options: ThrottleOptions = {}
): ThrottleReturn<T> => {
  const { 
    leading = true, 
    trailing = true, 
    maxWait,
    abortValue,
    onThrottled,
    onExecuted 
  } = options;
  
  const [currentDelay, setCurrentDelay] = useState(delay);
  
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingArgs = useRef<Parameters<T> | null>(null);
  const executionCount = useRef(0);
  const throttledCount = useRef(0);
  const executionTimes = useRef<number[]>([]);
  const lastExecuted = useRef<number | null>(null);
  const isThrottledRef = useRef(false);
  const isPendingRef = useRef(false);

  const execute = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    lastRun.current = now;
    lastExecuted.current = now;
    executionCount.current += 1;
    executionTimes.current.push(now);
    isThrottledRef.current = false;
    isPendingRef.current = false;
    
    // Keep only last 10 execution times for average calculation
    if (executionTimes.current.length > 10) {
      executionTimes.current = executionTimes.current.slice(-10);
    }
    
    try {
      const result = callback(...args);
      onExecuted?.(args, result);
      return result;
    } catch (error) {
      onExecuted?.(args, error);
      throw error;
    }
  }, [callback, onExecuted]);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // Initialize last run time if this is the first call
      if (lastRun.current === 0) {
        lastRun.current = now;
        if (leading) {
          return execute(...args);
        }
      }
      
      const timeSinceLastRun = now - lastRun.current;
      const remaining = currentDelay - timeSinceLastRun;
      
      // Clear any existing timeouts if we're going to execute immediately
      const shouldExecuteNow = remaining <= 0 || remaining > currentDelay;
      
      if (shouldExecuteNow) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
        
        return execute(...args);
      }
      
      // Handle throttling
      isThrottledRef.current = true;
      throttledCount.current += 1;
      onThrottled?.(args);
      
      if (trailing && !timeoutRef.current) {
        pendingArgs.current = args;
        isPendingRef.current = true;
        
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (pendingArgs.current) {
            const argsToExecute = pendingArgs.current;
            pendingArgs.current = null;
            execute(...argsToExecute);
          }
        }, remaining);
      }
      
      // Handle maxWait option
      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          maxTimeoutRef.current = null;
          if (pendingArgs.current) {
            const argsToExecute = pendingArgs.current;
            pendingArgs.current = null;
            execute(...argsToExecute);
          }
        }, maxWait);
      }
      
      return abortValue as ReturnType<T>;
    },
    [currentDelay, leading, trailing, execute, onThrottled, maxWait, abortValue]
  ) as T;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    pendingArgs.current = null;
    isThrottledRef.current = false;
    isPendingRef.current = false;
  }, []);

  const flush = useCallback((): ReturnType<T> | undefined => {
    if (timeoutRef.current && pendingArgs.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = null;
      }
      
      const argsToExecute = pendingArgs.current;
      pendingArgs.current = null;
      return execute(...argsToExecute) as ReturnType<T>;
    }
    return undefined;
  }, [execute]);

  const pending = useCallback(() => {
    return timeoutRef.current !== null || maxTimeoutRef.current !== null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    lastRun.current = 0;
    lastExecuted.current = null;
    executionCount.current = 0;
    throttledCount.current = 0;
    executionTimes.current = [];
  }, [cancel]);

  const updateDelay = useCallback((newDelay: number) => {
    setCurrentDelay(newDelay);
  }, []);



  const state = useMemo((): ThrottleState => {
    const times = executionTimes.current;
    let averageInterval = 0;
    
    if (times.length > 1) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    return {
      isThrottled: isThrottledRef.current,
      isPending: isPendingRef.current,
      lastExecuted: lastExecuted.current,
      executionCount: executionCount.current,
      throttledCount: throttledCount.current,
      averageInterval,
    };
  }, []);

  useEffect(() => {
    setCurrentDelay(delay);
  }, [delay]);

  // Options are managed through props, no useEffect needed

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    throttledFn,
    cancel,
    flush,
    pending,
    state,
    reset,
    updateDelay,
  };
};

// Simple throttled callback hook
export const useThrottledCallback = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
  options?: ThrottleOptions
) => {
  const { throttledFn } = useThrottle(callback, delay, options);
  return throttledFn;
};

// Throttled state update hook
export const useThrottledState = <T>(
  initialValue: T,
  delay: number,
  options?: ThrottleOptions
): [T, T, (value: T) => void, ThrottleReturn<(value: T) => void>] => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [actualValue, setActualValue] = useState(initialValue);
  
  const updateValue = useCallback((value: T) => {
    setActualValue(value);
  }, []);
  
  const throttleReturn = useThrottle(
    (value: T) => setDisplayValue(value),
    delay,
    options
  );
  
  const setThrottledValue = useCallback((value: T) => {
    updateValue(value);
    throttleReturn.throttledFn(value);
  }, [updateValue, throttleReturn]);
  
  return [displayValue, actualValue, setThrottledValue, throttleReturn];
};

// Throttled effect hook
export const useThrottledEffect = (
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number,
  options?: ThrottleOptions
) => {
  const throttleReturn = useThrottle(effect, delay, options);
  
  useEffect(() => {
    throttleReturn.throttledFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, throttleReturn.throttledFn]);
  
  return throttleReturn;
};

// Throttled scroll handler
export const useThrottledScroll = (
  callback: (event: Event) => void,
  delay: number = 100,
  options?: ThrottleOptions
) => {
  const throttleReturn = useThrottle(callback, delay, options);
  
  useEffect(() => {
    const handleScroll = throttleReturn.throttledFn;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      throttleReturn.cancel();
    };
  }, [throttleReturn]);
  
  return throttleReturn;
};

// Throttled resize handler
export const useThrottledResize = (
  callback: (event: Event) => void,
  delay: number = 200,
  options?: ThrottleOptions
) => {
  const throttleReturn = useThrottle(callback, delay, options);
  
  useEffect(() => {
    const handleResize = throttleReturn.throttledFn;
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      throttleReturn.cancel();
    };
  }, [throttleReturn]);
  
  return throttleReturn;
};

// Throttled input change handler
export const useThrottledInput = <T extends HTMLInputElement | HTMLTextAreaElement>(
  callback: (value: string, event: React.ChangeEvent<T>) => void,
  delay: number = 300,
  options?: ThrottleOptions
) => {
  const throttleReturn = useThrottle(
    (value: string, event: React.ChangeEvent<T>) => callback(value, event),
    delay,
    options
  );
  
  const handleChange = useCallback((event: React.ChangeEvent<T>) => {
    throttleReturn.throttledFn(event.target.value, event);
  }, [throttleReturn]);
  
  return {
    ...throttleReturn,
    handleChange,
  };
};

// Throttled API call handler
export const useThrottledApi = <TArgs extends unknown[], TResult>(
  apiCall: (...args: TArgs) => Promise<TResult>,
  delay: number = 1000,
  options?: ThrottleOptions
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);
  
  const wrappedApiCall = useCallback(async (...args: TArgs) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('API call failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);
  
  const throttleReturn = useThrottle(wrappedApiCall, delay, options);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
    throttleReturn.reset();
  }, [throttleReturn]);
  
  return {
    ...throttleReturn,
    isLoading,
    error,
    data,
    reset: reset,
    call: throttleReturn.throttledFn,
  };
};

export default useThrottle;
