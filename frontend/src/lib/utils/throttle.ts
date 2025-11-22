/**
 * Throttle Utilities
 * Comprehensive throttling functions for rate limiting and performance optimization
 */

// Base throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

// Throttle with immediate execution option
export function throttleImmediate<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = true
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    
    if (!previous && !immediate) {
      previous = now;
    }
    
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = immediate ? 0 : Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

// Advanced throttle with options
export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function throttleAdvanced<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let maxTimeout: NodeJS.Timeout | null = null;
  let previous = 0;
  let lastArgs: Parameters<T> | undefined;
  
  const { leading = true, trailing = true, maxWait } = options;

  function invokeFunc(time: number, args: Parameters<T>) {
    previous = time;
    func(...args);
    if (timeout || maxTimeout) {
      timeout = maxTimeout = null;
    }
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - previous;
    const timeWaiting = wait - timeSinceLastCall;
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastCall)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - previous;
    
    return (
      previous === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastCall >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timeout = null;
    if (trailing && lastArgs) {
      invokeFunc(time, lastArgs);
    }
    lastArgs = undefined;
  }

  function leadingEdge(time: number, args: Parameters<T>) {
    previous = time;
    timeout = setTimeout(timerExpired, wait);
    
    if (maxWait !== undefined) {
      maxTimeout = setTimeout(() => {
        const time = Date.now();
        invokeFunc(time, args);
      }, maxWait);
    }
    
    if (leading) {
      invokeFunc(time, args);
    }
  }

  return function (...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;

    if (isInvoking) {
      if (timeout === null) {
        leadingEdge(time, args);
      } else if (maxWait !== undefined) {
        timeout = setTimeout(timerExpired, wait);
        invokeFunc(time, args);
      }
    } else if (timeout === null) {
      timeout = setTimeout(timerExpired, wait);
    }
  };
}

// Throttle for scroll events
export function throttleScroll<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let ticking = false;

  return function (...args: Parameters<T>) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Throttle for resize events
export function throttleResize<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait = 250
): (...args: Parameters<T>) => void {
  return throttle(func, wait);
}

// Throttle with promise support
export function throttlePromise<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let lastPromise: Promise<ReturnType<T>> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    lastArgs = args;

    if (lastPromise) {
      return lastPromise;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(async () => {
      if (lastArgs) {
        lastPromise = func(...lastArgs) as Promise<ReturnType<T>>;
        const result = await lastPromise;
        lastPromise = null;
        lastArgs = null;
        timeout = null;
        return result;
      }
    }, wait);

    // Return a promise that resolves when the throttled function executes
    return new Promise((resolve, reject) => {
      const checkExecution = () => {
        if (lastPromise) {
          lastPromise.then(resolve, reject);
        } else {
          setTimeout(checkExecution, 10);
        }
      };
      checkExecution();
    });
  };
}

// Group throttle - throttle multiple functions together
export class ThrottleGroup {
  private functions = new Map<string, (...args: unknown[]) => unknown>();
  private timers = new Map<string, NodeJS.Timeout>();
  private wait: number;

  constructor(wait: number) {
    this.wait = wait;
  }

  add<T extends (...args: unknown[]) => unknown>(key: string, func: T): void {
    this.functions.set(key, func);
  }

  execute(key: string, ...args: unknown[]): void {
    const func = this.functions.get(key);
    if (!func) return;

    if (this.timers.has(key)) {
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
    }

    const timer = setTimeout(() => {
      func(...args);
      this.timers.delete(key);
    }, this.wait);

    this.timers.set(key, timer);
  }

  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  cancelAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

// Throttle with buffer - accumulate calls and execute with all arguments
export function throttleBuffer<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  maxBufferSize = 10
): (...args: Parameters<T>) => void {
  let buffer: Parameters<T>[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    buffer.push(args);

    if (buffer.length >= maxBufferSize) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      const currentBuffer = [...buffer];
      buffer = [];
      
      currentBuffer.forEach(bufferedArgs => {
        func(...bufferedArgs);
      });
      
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        const currentBuffer = [...buffer];
        buffer = [];
        timeout = null;
        
        currentBuffer.forEach(bufferedArgs => {
          func(...bufferedArgs);
        });
      }, wait);
    }
  };
}

// Adaptive throttle - adjusts wait time based on call frequency
export function throttleAdaptive<T extends (...args: unknown[]) => unknown>(
  func: T,
  initialWait: number,
  options: {
    minWait?: number;
    maxWait?: number;
    adaptationRate?: number;
  } = {}
): (...args: Parameters<T>) => void {
  const { minWait = 10, maxWait = 1000, adaptationRate = 0.1 } = options;
  
  let currentWait = initialWait;
  let lastCallTime = 0;
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    // Adapt wait time based on call frequency
    if (timeSinceLastCall < currentWait) {
      // Calls are frequent, increase wait time
      currentWait = Math.min(maxWait, currentWait * (1 + adaptationRate));
    } else {
      // Calls are infrequent, decrease wait time
      currentWait = Math.max(minWait, currentWait * (1 - adaptationRate));
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      lastCallTime = Date.now();
      func(...args);
      timeout = null;
    }, currentWait);
  };
}

// Cancel throttle function
export function cancelThrottle(throttledFunction: { cancel?: () => void }): void {
  if (throttledFunction && typeof throttledFunction.cancel === 'function') {
    throttledFunction.cancel();
  }
}

// Utility to create a cancelable throttled function
export function createCancelableThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  const throttled = function (...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };

  throttled.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    previous = 0;
  };

  return throttled;
}

// Throttle with execution counter
export function throttleWithCounter<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { getCallCount: () => number; reset: () => void } {
  let callCount = 0;
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  const throttled = function (...args: Parameters<T>) {
    callCount++;
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };

  throttled.getCallCount = () => callCount;
  throttled.reset = () => {
    callCount = 0;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    previous = 0;
  };

  return throttled;
}

// Export commonly used throttle configurations
export const throttleConfigs = {
  // For scroll events
  scroll: (func: (...args: unknown[]) => unknown) => throttleScroll(func),
  
  // For resize events
  resize: (func: (...args: unknown[]) => unknown) => throttleResize(func, 250),
  
  // For input events
  input: (func: (...args: unknown[]) => unknown) => throttle(func, 300),
  
  // For API calls
  api: (func: (...args: unknown[]) => unknown) => throttle(func, 1000),
  
  // For mouse move events
  mouseMove: (func: (...args: unknown[]) => unknown) => throttle(func, 50),
  
  // For button clicks
  click: (func: (...args: unknown[]) => unknown) => throttle(func, 500),
  
  // For search suggestions
  search: (func: (...args: unknown[]) => unknown) => throttle(func, 200),
};

export default throttle;
