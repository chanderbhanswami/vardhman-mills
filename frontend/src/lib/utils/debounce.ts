/**
 * Debounce and Throttle Utilities for Vardhman Mills Frontend
 * Comprehensive debouncing and throttling functions with TypeScript support
 */

// Enhanced debounce function with cancellation and immediate execution
export interface DebounceOptions {
  immediate?: boolean;
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  let maxTimeoutId: NodeJS.Timeout | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let result: ReturnType<T> | undefined;

  const { immediate = false, maxWait } = options;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func(...args) as ReturnType<T>;
    return result;
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return immediate ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): ReturnType<T> | undefined {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
    return result;
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timeoutId = undefined;

    if (lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    return result;
  }

  function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    timeoutId = undefined;
    maxTimeoutId = undefined;
  }

  function flush(): ReturnType<T> | undefined {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timeoutId !== undefined;
  }

  function debounced(...args: Parameters<T>): void {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        leadingEdge(lastCallTime);
        return;
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        maxTimeoutId = setTimeout(timerExpired, maxWait);
        return invokeFunc(lastCallTime) as void;
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

// Enhanced throttle function with trailing and leading options
export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const { leading = true } = options;
  return debounce(func, wait, {
    maxWait: wait,
    immediate: leading,
  }) as ThrottledFunction<T>;
}

// Specialized debounce functions for common use cases
export const debouncedSearch = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 300
): DebouncedFunction<T> => {
  return debounce(func, delay, { immediate: false });
};

export const debouncedResize = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 100
): DebouncedFunction<T> => {
  return debounce(func, delay, { immediate: false, maxWait: 1000 });
};

export const debouncedScroll = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 50
): ThrottledFunction<T> => {
  return throttle(func, delay, { leading: true, trailing: true });
};

export const debouncedInput = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 150
): DebouncedFunction<T> => {
  return debounce(func, delay, { immediate: false });
};

export const debouncedSave = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 1000
): DebouncedFunction<T> => {
  return debounce(func, delay, { immediate: false, maxWait: 5000 });
};

// Button click debounce to prevent double clicks
export const debouncedClick = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 500
): DebouncedFunction<T> => {
  return debounce(func, delay, { immediate: true });
};

// API call throttling
export const throttledApiCall = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay = 1000
): ThrottledFunction<T> => {
  return throttle(func, delay, { leading: true, trailing: false });
};

// Rate limiting function
export function rateLimit<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  window: number = 60000 // 1 minute default
): (...args: Parameters<T>) => boolean {
  const calls: number[] = [];

  return (...args: Parameters<T>): boolean => {
    const now = Date.now();
    
    // Remove calls outside the window
    while (calls.length > 0 && calls[0] <= now - window) {
      calls.shift();
    }

    // Check if we're under the limit
    if (calls.length < limit) {
      calls.push(now);
      func(...args);
      return true;
    }

    return false;
  };
}

// Utility functions for common patterns
export const debouncePromise = <T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  let timeoutId: NodeJS.Timeout | undefined;
  let latestResolve: ((value: Awaited<ReturnType<T>>) => void) | undefined;
  let latestReject: ((reason?: unknown) => void) | undefined;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      latestResolve = resolve;
      latestReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          latestResolve?.(result as Awaited<ReturnType<T>>);
        } catch (error) {
          latestReject?.(error);
        }
      }, wait);
    });
  };
};

// Batch processing with debounce
export function createBatchProcessor<T>(
  processor: (items: T[]) => void | Promise<void>,
  delay: number = 100,
  maxBatchSize: number = 100
): (item: T) => void {
  let batch: T[] = [];
  
  const processItems = debounce(async () => {
    if (batch.length > 0) {
      const itemsToProcess = [...batch];
      batch = [];
      await processor(itemsToProcess);
    }
  }, delay);

  return (item: T): void => {
    batch.push(item);
    
    if (batch.length >= maxBatchSize) {
      processItems.flush();
    } else {
      processItems();
    }
  };
}

// Frame-based throttling for animations
export function throttleAnimationFrame<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | undefined;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>): void => {
    lastArgs = args;
    
    if (rafId === undefined) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = undefined;
        lastArgs = undefined;
      });
    }
  };
}

// Idle callback debounce for non-critical operations
export function debounceIdleCallback<T extends (...args: unknown[]) => unknown>(
  func: T,
  options?: IdleRequestOptions
): (...args: Parameters<T>) => void {
  let idleId: number | undefined;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>): void => {
    lastArgs = args;
    
    if (idleId !== undefined) {
      cancelIdleCallback(idleId);
    }

    idleId = requestIdleCallback(() => {
      if (lastArgs) {
        func(...lastArgs);
      }
      idleId = undefined;
      lastArgs = undefined;
    }, options);
  };
}

// UI-specific debounce utilities
export const ui = {
  search: debouncedSearch,
  resize: debouncedResize,
  scroll: debouncedScroll,
  input: debouncedInput,
  save: debouncedSave,
  click: debouncedClick,
  api: throttledApiCall,
  animation: throttleAnimationFrame,
  idle: debounceIdleCallback,
} as const;

// Export everything as default object
const debounceUtils = {
  debounce,
  throttle,
  debouncedSearch,
  debouncedResize,
  debouncedScroll,
  debouncedInput,
  debouncedSave,
  debouncedClick,
  throttledApiCall,
  rateLimit,
  debouncePromise,
  createBatchProcessor,
  throttleAnimationFrame,
  debounceIdleCallback,
  ui,
};

export default debounceUtils;
