import { useState, useEffect, useCallback, useRef } from 'react';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebounceReturn<T> {
  debouncedValue: T;
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
}

// Basic debounced value hook
export const useDebounce = <T>(
  value: T,
  delay: number,
  options: DebounceOptions = {}
): T => {
  const { leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(leading ? value : value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef(true);

  useEffect(() => {
    const handler = () => {
      setDebouncedValue(value);
    };

    // Leading edge execution
    if (leading && leadingRef.current) {
      handler();
      leadingRef.current = false;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Trailing edge execution
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        handler();
        leadingRef.current = true;
      }, delay);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
};

// Advanced debounced callback hook
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
): T & { cancel: () => void; flush: () => void; isPending: () => boolean } => {
  const { leading = false, trailing = true, maxWait } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef(true);
  const argsRef = useRef<Parameters<T> | undefined>(undefined);
  const lastCallTimeRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    leadingRef.current = true;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      cancel();
      callback(...argsRef.current);
    }
  }, [callback, cancel]);

  const isPending = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const currentTime = Date.now();
      argsRef.current = args;
      lastCallTimeRef.current = currentTime;

      const invokeCallback = () => {
        callback(...args);
        leadingRef.current = true;
      };

      // Leading edge execution
      if (leading && leadingRef.current) {
        invokeCallback();
        leadingRef.current = false;
        
        // Set maxWait timeout if specified
        if (maxWait && trailing) {
          maxTimeoutRef.current = setTimeout(() => {
            if (!leadingRef.current) {
              invokeCallback();
            }
          }, maxWait);
        }
        
        return;
      }

      // Clear existing timeouts
      cancel();

      // Set trailing timeout
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          invokeCallback();
          timeoutRef.current = null;
        }, delay);
      }

      // Set maxWait timeout
      if (maxWait) {
        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            flush();
          }
        }, maxWait);
      }
    },
    [callback, delay, leading, trailing, maxWait, cancel, flush]
  ) as T;

  // Attach utility methods
  const enhancedCallback = debouncedCallback as T & {
    cancel: () => void;
    flush: () => void;
    isPending: () => boolean;
  };
  
  enhancedCallback.cancel = cancel;
  enhancedCallback.flush = flush;
  enhancedCallback.isPending = isPending;

  return enhancedCallback;
};

// Advanced debounced value with controls
export const useDebouncedValue = <T>(
  value: T,
  delay: number,
  options: DebounceOptions = {}
): DebounceReturn<T> => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { leading = false, trailing = true, maxWait } = options;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(value);
  }, [value, cancel]);

  const isPending = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  useEffect(() => {
    // Leading execution
    if (leading) {
      setDebouncedValue(value);
    }

    // Cancel previous timeout
    cancel();

    // Set new timeout for trailing execution
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        timeoutRef.current = null;
      }, delay);
    }

    // Set maxWait timeout
    if (maxWait) {
      const maxTimeout = setTimeout(() => {
        setDebouncedValue(value);
        cancel();
      }, maxWait);

      return () => {
        clearTimeout(maxTimeout);
        cancel();
      };
    }

    return cancel;
  }, [value, delay, leading, trailing, maxWait, cancel]);

  return {
    debouncedValue,
    cancel,
    flush,
    isPending,
  };
};

export default useDebounce;