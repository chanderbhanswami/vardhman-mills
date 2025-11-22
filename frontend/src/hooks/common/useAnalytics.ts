import { useCallback, useEffect, useRef, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

/**
 * E-commerce tracking events
 */
export interface EcommerceEvent {
  event: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout' | 'add_payment_info';
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity?: number;
    price?: number;
  }>;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled?: boolean;
  debug?: boolean;
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  sessionTimeout?: number; // minutes
  batchSize?: number;
  batchTimeout?: number; // milliseconds
  providers?: AnalyticsProvider[];
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  name: string;
  enabled: boolean;
  track: (event: AnalyticsEvent) => void | Promise<void>;
  identify?: (userId: string, properties?: Record<string, unknown>) => void | Promise<void>;
  page?: (page: string, properties?: Record<string, unknown>) => void | Promise<void>;
}

/**
 * Default analytics configuration
 */
const DEFAULT_CONFIG: Required<Omit<AnalyticsConfig, 'providers'>> & { providers: AnalyticsProvider[] } = {
  enabled: true,
  debug: false,
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: false,
  trackErrors: true,
  sessionTimeout: 30,
  batchSize: 10,
  batchTimeout: 5000,
  providers: [],
};

/**
 * Generate session ID
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Get or create session ID
 */
const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) return stored;
  
  const newSessionId = generateSessionId();
  sessionStorage.setItem('analytics_session_id', newSessionId);
  return newSessionId;
};

/**
 * Analytics tracking hook
 */
export const useAnalytics = (config: AnalyticsConfig = {}) => {
  const settings = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const sessionId = useRef<string>(getSessionId());
  const userId = useRef<string | null>(null);
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef<number>(Date.now());

  // Log debug messages
  const log = useCallback((...args: unknown[]) => {
    if (settings.debug) {
      console.log('[Analytics]', ...args);
    }
  }, [settings.debug]);

  // Process event queue
  const processQueue = useCallback(() => {
    if (eventQueue.current.length === 0 || !settings.enabled) return;
    
    const events = [...eventQueue.current];
    eventQueue.current = [];
    
    log('Processing batch:', events);
    
    settings.providers.forEach(provider => {
      if (provider.enabled) {
        events.forEach(event => {
          try {
            provider.track(event);
          } catch (error) {
            console.error(`Analytics provider ${provider.name} failed:`, error);
          }
        });
      }
    });
  }, [settings.enabled, settings.providers, log]);

  // Add event to queue
  const queueEvent = useCallback((event: AnalyticsEvent) => {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: sessionId.current,
      userId: userId.current || undefined,
    };
    
    eventQueue.current.push(enrichedEvent);
    log('Event queued:', enrichedEvent);
    
    // Process immediately if batch size reached
    if (eventQueue.current.length >= settings.batchSize) {
      processQueue();
    } else {
      // Set batch timer if not already set
      if (!batchTimer.current) {
        batchTimer.current = setTimeout(() => {
          processQueue();
          batchTimer.current = null;
        }, settings.batchTimeout);
      }
    }
  }, [settings.batchSize, settings.batchTimeout, processQueue, log]);

  // Track event
  const track = useCallback((name: string, parameters?: Record<string, unknown>) => {
    if (!settings.enabled) return;
    
    lastActivity.current = Date.now();
    queueEvent({ name, parameters });
  }, [settings.enabled, queueEvent]);

  // Track page view
  const trackPageView = useCallback((page?: string, properties?: Record<string, unknown>) => {
    if (!settings.enabled || !settings.trackPageViews) return;
    
    const pagePath = page || pathname || '/';
    const pageProperties = {
      page: pagePath,
      search: searchParams?.toString() || '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...properties,
    };
    
    log('Page view:', pagePath, pageProperties);
    
    // Track with providers that support page tracking
    settings.providers.forEach(provider => {
      if (provider.enabled && provider.page) {
        try {
          provider.page(pagePath, pageProperties);
        } catch (error) {
          console.error(`Page tracking failed for ${provider.name}:`, error);
        }
      }
    });
    
    // Also track as regular event
    track('page_view', pageProperties);
  }, [settings.enabled, settings.trackPageViews, settings.providers, pathname, searchParams, track, log]);

  // Track user interaction
  const trackInteraction = useCallback((element: string, action: string, properties?: Record<string, unknown>) => {
    if (!settings.trackUserInteractions) return;
    
    track('user_interaction', {
      element,
      action,
      ...properties,
    });
  }, [settings.trackUserInteractions, track]);

  // Track e-commerce events
  const trackEcommerce = useCallback((ecommerceEvent: EcommerceEvent) => {
    track('ecommerce', { ...ecommerceEvent });
  }, [track]);

  // Track error
  const trackError = useCallback((error: Error, context?: Record<string, unknown>) => {
    if (!settings.trackErrors) return;
    
    track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      page: pathname,
      ...context,
    });
  }, [settings.trackErrors, track, pathname]);

  // Track performance metrics
  const trackPerformance = useCallback((metrics: Record<string, number>) => {
    if (!settings.trackPerformance) return;
    
    track('performance', {
      page: pathname,
      ...metrics,
    });
  }, [settings.trackPerformance, track, pathname]);

  // Identify user
  const identify = useCallback((id: string, properties?: Record<string, unknown>) => {
    if (!settings.enabled) return;
    
    userId.current = id;
    log('User identified:', id, properties);
    
    settings.providers.forEach(provider => {
      if (provider.enabled && provider.identify) {
        try {
          provider.identify(id, properties);
        } catch (error) {
          console.error(`User identification failed for ${provider.name}:`, error);
        }
      }
    });
    
    track('user_identified', { userId: id, ...properties });
  }, [settings.enabled, settings.providers, track, log]);

  // Reset session
  const resetSession = useCallback(() => {
    sessionId.current = generateSessionId();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analytics_session_id', sessionId.current);
    }
    log('Session reset:', sessionId.current);
  }, [log]);

  // Flush queue
  const flush = useCallback(() => {
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
      batchTimer.current = null;
    }
    processQueue();
  }, [processQueue]);

  // Track page views on route changes
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Session timeout check
  useEffect(() => {
    if (!settings.enabled) return;
    
    const checkSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity.current;
      const sessionTimeoutMs = settings.sessionTimeout * 60 * 1000;
      
      if (timeSinceLastActivity > sessionTimeoutMs) {
        resetSession();
        lastActivity.current = now;
      }
    };
    
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings.enabled, settings.sessionTimeout, resetSession]);

  // Auto-flush on page unload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleUnload = () => {
      flush();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      flush();
    };
  }, [flush]);

  // Error tracking setup
  useEffect(() => {
    if (!settings.trackErrors || typeof window === 'undefined') return;
    
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)), {
        type: 'unhandled_promise_rejection',
      });
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [settings.trackErrors, trackError]);

  return {
    // Core tracking
    track,
    trackPageView,
    trackInteraction,
    trackEcommerce,
    trackError,
    trackPerformance,
    
    // User management
    identify,
    
    // Session management
    resetSession,
    sessionId: sessionId.current,
    userId: userId.current,
    
    // Queue management
    flush,
    queueSize: eventQueue.current.length,
    
    // Configuration
    isEnabled: settings.enabled,
  };
};

/**
 * Hook for simple event tracking
 */
export const useTrackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  const { track } = useAnalytics();
  
  return useCallback(() => {
    track(eventName, parameters);
  }, [track, eventName, parameters]);
};

/**
 * Hook for tracking clicks
 */
export const useTrackClick = (element: string, properties?: Record<string, unknown>) => {
  const { trackInteraction } = useAnalytics();
  
  return useCallback(() => {
    trackInteraction(element, 'click', properties);
  }, [trackInteraction, element, properties]);
};

export default useAnalytics;