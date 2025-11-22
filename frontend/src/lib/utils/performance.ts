/**
 * Performance utility functions
 * Debounce, throttle, and other performance optimization utilities
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function debounced(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once in specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function - caches results of expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function rafThrottled(...args: Parameters<T>) {
    if (rafId !== null) {
      return;
    }
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * Lazy load function - delays execution until needed
 */
export function lazy<T>(loader: () => Promise<T>): () => Promise<T> {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;
  
  return async () => {
    if (cached) {
      return cached;
    }
    
    if (loading) {
      return loading;
    }
    
    loading = loader();
    cached = await loading;
    loading = null;
    
    return cached;
  };
}

/**
 * Batch function calls - groups multiple calls into a single execution
 */
export function batch<T extends any[]>(
  func: (items: T) => void,
  wait: number = 100
): (item: T[number]) => void {
  let items: T[number][] = [];
  let timeout: NodeJS.Timeout | null = null;
  
  return function batched(item: T[number]) {
    items.push(item);
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(items as T);
      items = [];
    }, wait);
  };
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  label: string,
  func: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

/**
 * Create a cancelable promise
 */
export function makeCancelable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let hasCanceled = false;
  
  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => (hasCanceled ? reject({ isCanceled: true }) : resolve(value)))
      .catch(error => (hasCanceled ? reject({ isCanceled: true }) : reject(error)));
  });
  
  return {
    promise: wrappedPromise,
    cancel: () => {
      hasCanceled = true;
    }
  };
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  func: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await func();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      onRetry(attempt + 1, error);
      await sleep(delay * Math.pow(backoff, attempt));
    }
  }
  
  throw new Error('Retry failed');
}
