import { useCallback, useEffect, useRef } from 'react';

export interface TrackingEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  category?: string;
  label?: string;
  value?: number;
}

export interface UserIdentification {
  userId?: string;
  anonymousId?: string;
  traits?: Record<string, unknown>;
}

export interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
  search?: string;
  properties?: Record<string, unknown>;
}

export interface TrackingProvider {
  name: string;
  track: (event: TrackingEvent) => void;
  page: (data: PageViewData) => void;
  identify: (identification: UserIdentification) => void;
  alias?: (newId: string, previousId?: string) => void;
}

export interface TrackingOptions {
  providers?: TrackingProvider[];
  enableDebug?: boolean;
  enableLocalStorage?: boolean;
  bufferEvents?: boolean;
  bufferSize?: number;
  flushInterval?: number;
  onError?: (error: Error, provider: string) => void;
}

export interface PerformanceMetrics {
  pageLoadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

export interface TrackingReturn {
  track: (event: string | TrackingEvent, properties?: Record<string, unknown>) => void;
  page: (path?: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  alias: (newId: string, previousId?: string) => void;
  reset: () => void;
  addProvider: (provider: TrackingProvider) => void;
  removeProvider: (providerName: string) => void;
  getEventBuffer: () => TrackingEvent[];
  clearEventBuffer: () => void;
  trackPerformance: () => void;
}

// Default console provider for debugging
const consoleProvider: TrackingProvider = {
  name: 'console',
  track: (event) => {
    console.log('📊 Track Event:', event);
  },
  page: (data) => {
    console.log('📄 Page View:', data);
  },
  identify: (identification) => {
    console.log('👤 User Identified:', identification);
  },
  alias: (newId, previousId) => {
    console.log('🔗 User Alias:', { newId, previousId });
  },
};

// Local storage provider for offline events
const createLocalStorageProvider = (): TrackingProvider => ({
  name: 'localStorage',
  track: (event) => {
    try {
      const events = JSON.parse(localStorage.getItem('tracking_events') || '[]');
      events.push({ ...event, timestamp: Date.now() });
      localStorage.setItem('tracking_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Failed to store tracking event:', error);
    }
  },
  page: (data) => {
    try {
      const pages = JSON.parse(localStorage.getItem('tracking_pages') || '[]');
      pages.push({ ...data, timestamp: Date.now() });
      localStorage.setItem('tracking_pages', JSON.stringify(pages.slice(-50))); // Keep last 50 page views
    } catch (error) {
      console.error('Failed to store page view:', error);
    }
  },
  identify: (identification) => {
    try {
      localStorage.setItem('tracking_user', JSON.stringify({ ...identification, timestamp: Date.now() }));
    } catch (error) {
      console.error('Failed to store user identification:', error);
    }
  },
});

export const useTracking = (options: TrackingOptions = {}): TrackingReturn => {
  const {
    providers: initialProviders = [],
    enableDebug = false,
    enableLocalStorage = true,
    bufferEvents = false,
    bufferSize = 50,
    flushInterval = 5000,
    onError,
  } = options;

  const providersRef = useRef<TrackingProvider[]>([...initialProviders]);
  const eventBufferRef = useRef<TrackingEvent[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userRef = useRef<UserIdentification | null>(null);

  // Initialize default providers
  useEffect(() => {
    if (enableDebug && !providersRef.current.find(p => p.name === 'console')) {
      providersRef.current.push(consoleProvider);
    }

    if (enableLocalStorage && !providersRef.current.find(p => p.name === 'localStorage')) {
      providersRef.current.push(createLocalStorageProvider());
    }
  }, [enableDebug, enableLocalStorage]);

  // Flush event buffer periodically
  useEffect(() => {
    if (!bufferEvents) return;

    const flushEvents = () => {
      const events = [...eventBufferRef.current];
      eventBufferRef.current = [];
      
      events.forEach(event => {
        providersRef.current.forEach(provider => {
          try {
            provider.track(event);
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Provider tracking failed');
            onError?.(err, provider.name);
          }
        });
      });
    };

    flushTimerRef.current = setInterval(flushEvents, flushInterval);

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
        flushEvents(); // Flush remaining events
      }
    };
  }, [bufferEvents, flushInterval, onError]);

  const executeWithProviders = useCallback(
    (method: keyof TrackingProvider, ...args: unknown[]) => {
      providersRef.current.forEach(provider => {
        try {
          const providerMethod = provider[method];
          if (typeof providerMethod === 'function') {
            (providerMethod as (...args: unknown[]) => unknown)(...args);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(`Provider ${method} failed`);
          onError?.(err, provider.name);
        }
      });
    },
    [onError]
  );

  const track = useCallback(
    (event: string | TrackingEvent, properties?: Record<string, unknown>) => {
      const trackingEvent: TrackingEvent = typeof event === 'string'
        ? { name: event, properties, timestamp: Date.now() }
        : { ...event, timestamp: event.timestamp || Date.now() };

      if (bufferEvents) {
        eventBufferRef.current.push(trackingEvent);
        if (eventBufferRef.current.length >= bufferSize) {
          // Flush buffer when it reaches capacity
          const events = eventBufferRef.current.splice(0, bufferSize);
          events.forEach(evt => executeWithProviders('track', evt));
        }
      } else {
        executeWithProviders('track', trackingEvent);
      }
    },
    [bufferEvents, bufferSize, executeWithProviders]
  );

  const page = useCallback(
    (path?: string, properties?: Record<string, unknown>) => {
      const pageData: PageViewData = {
        path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        title: typeof document !== 'undefined' ? document.title : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        search: typeof window !== 'undefined' ? window.location.search : undefined,
        properties,
      };

      executeWithProviders('page', pageData);
    },
    [executeWithProviders]
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      const identification: UserIdentification = {
        userId,
        traits,
        anonymousId: userRef.current?.anonymousId,
      };

      userRef.current = identification;
      executeWithProviders('identify', identification);
    },
    [executeWithProviders]
  );

  const alias = useCallback(
    (newId: string, previousId?: string) => {
      const prevId = previousId || userRef.current?.userId;
      executeWithProviders('alias', newId, prevId);
      
      if (userRef.current) {
        userRef.current.userId = newId;
      }
    },
    [executeWithProviders]
  );

  const reset = useCallback(() => {
    userRef.current = null;
    eventBufferRef.current = [];
    
    if (enableLocalStorage && typeof localStorage !== 'undefined') {
      localStorage.removeItem('tracking_events');
      localStorage.removeItem('tracking_pages');
      localStorage.removeItem('tracking_user');
    }
  }, [enableLocalStorage]);

  const addProvider = useCallback((provider: TrackingProvider) => {
    providersRef.current = [...providersRef.current.filter(p => p.name !== provider.name), provider];
  }, []);

  const removeProvider = useCallback((providerName: string) => {
    providersRef.current = providersRef.current.filter(p => p.name !== providerName);
  }, []);

  const getEventBuffer = useCallback(() => {
    return [...eventBufferRef.current];
  }, []);

  const clearEventBuffer = useCallback(() => {
    eventBufferRef.current = [];
  }, []);

  const trackPerformance = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const metrics: PerformanceMetrics = {};
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    }

    // Paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.largestContentfulPaint = entry.startTime;
          } else if (entry.entryType === 'first-input') {
            metrics.firstInputDelay = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          } else if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
            metrics.cumulativeLayoutShift = (metrics.cumulativeLayoutShift || 0) + (entry as PerformanceEntry & { value: number }).value;
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch {
      // Observer not supported
    }

    track('performance_metrics', metrics as Record<string, unknown>);
  }, [track]);

  // Auto-track page views on route changes
  useEffect(() => {
    page();
  }, [page]);

  return {
    track,
    page,
    identify,
    alias,
    reset,
    addProvider,
    removeProvider,
    getEventBuffer,
    clearEventBuffer,
    trackPerformance,
  };
};

// Specialized tracking hooks
export const usePageTracking = () => {
  const { page } = useTracking({ enableDebug: process.env.NODE_ENV === 'development' });
  
  useEffect(() => {
    page();
  }, [page]);

  return page;
};

export const useEventTracking = (options?: TrackingOptions) => {
  const { track } = useTracking(options);
  
  const trackClick = useCallback(
    (element: string, properties?: Record<string, unknown>) => {
      track('click', { element, ...properties });
    },
    [track]
  );

  const trackFormSubmit = useCallback(
    (formName: string, properties?: Record<string, unknown>) => {
      track('form_submit', { form: formName, ...properties });
    },
    [track]
  );

  const trackError = useCallback(
    (error: Error, context?: string) => {
      track('error', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: Date.now(),
      });
    },
    [track]
  );

  return {
    track,
    trackClick,
    trackFormSubmit,
    trackError,
  };
};

export default useTracking;
