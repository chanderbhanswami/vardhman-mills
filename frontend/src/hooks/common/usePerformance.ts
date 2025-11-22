import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

export interface PerformanceMetrics {
  // Navigation timing
  navigationStart: number;
  loadComplete: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  
  // User interaction metrics
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // Custom timing metrics
  customMarks: Record<string, number>;
  customMeasures: Record<string, number>;
  
  // Resource timing
  resources: Array<{
    name: string;
    type: string;
    size: number;
    duration: number;
    startTime: number;
  }>;
  
  // Memory usage (if available)
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  
  // Connection info
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface PerformanceOptions {
  trackNavigation?: boolean;
  trackResources?: boolean;
  trackMemory?: boolean;
  trackConnection?: boolean;
  trackCustomMetrics?: boolean;
  reportingInterval?: number;
  onReport?: (metrics: PerformanceMetrics) => void;
}

export interface PerformanceBudget {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  totalPageSize?: number;
  totalRequests?: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  budgetViolations: Array<{
    metric: string;
    actual: number;
    budget: number;
    severity: 'warning' | 'error';
  }>;
  score: number; // 0-100 performance score
  recommendations: string[];
}

export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    trackNavigation = true,
    trackResources = true,
    trackMemory = true,
    trackConnection = true,
    trackCustomMetrics = true,
    reportingInterval = 5000, // 5 seconds
    onReport,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    navigationStart: 0,
    loadComplete: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    customMarks: {},
    customMeasures: {},
    resources: [],
  });

  const [isTracking, setIsTracking] = useState(false);
  const observersRef = useRef<Array<PerformanceObserver>>([]);
  const reportingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const budgetRef = useRef<PerformanceBudget>({});

  // Initialize performance tracking
  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      console.warn('Performance API not available');
      return;
    }

    setIsTracking(true);

    // Track navigation timing
    if (trackNavigation && performance.timing) {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;
      
      setMetrics(prev => ({
        ...prev,
        navigationStart,
        loadComplete: timing.loadEventEnd - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      }));
    }

    // Track paint metrics
    if ('PerformanceObserver' in window) {
      // First Paint and First Contentful Paint
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (entry.name === 'first-paint') {
            setMetrics(prev => ({ ...prev, firstPaint: entry.startTime }));
          } else if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      observersRef.current.push(paintObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, largestContentfulPaint: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observersRef.current.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            setMetrics(prev => ({ ...prev, firstInputDelay: fid }));
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      observersRef.current.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cumulativeLayoutShift: prev.cumulativeLayoutShift + clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observersRef.current.push(clsObserver);

      // Resource timing
      if (trackResources) {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const resources = entries.map((entry: PerformanceEntry & { 
            initiatorType?: string; 
            transferSize?: number; 
            responseEnd?: number; 
          }) => ({
            name: entry.name,
            type: entry.initiatorType || 'other',
            size: entry.transferSize || 0,
            duration: (entry.responseEnd || entry.startTime) - entry.startTime,
            startTime: entry.startTime,
          }));
          
          setMetrics(prev => ({
            ...prev,
            resources: [...prev.resources, ...resources],
          }));
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        observersRef.current.push(resourceObserver);
      }
    }

    // Track memory usage
    if (trackMemory && 'memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as Performance & { 
          memory?: { 
            usedJSHeapSize: number; 
            totalJSHeapSize: number; 
            jsHeapSizeLimit: number 
          } 
        }).memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memoryUsage: {
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit,
            },
          }));
        }
      };
      
      updateMemory();
      const memoryInterval = setInterval(updateMemory, reportingInterval);
      
      return () => clearInterval(memoryInterval);
    }

    // Track connection info
    if (trackConnection && 'connection' in navigator) {
      const connection = (navigator as Navigator & { 
        connection?: { 
          effectiveType: string; 
          downlink: number; 
          rtt: number 
        } 
      }).connection;
      if (connection) {
        setMetrics(prev => ({
          ...prev,
          connection: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          },
        }));
      }
    }
  }, [trackNavigation, trackResources, trackMemory, trackConnection, reportingInterval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    observersRef.current.forEach(observer => {
      observer.disconnect();
    });
    observersRef.current = [];
    
    if (reportingIntervalRef.current) {
      clearInterval(reportingIntervalRef.current);
      reportingIntervalRef.current = null;
    }
  }, []);

  // Custom performance marks
  const mark = useCallback((name: string) => {
    if (!trackCustomMetrics || typeof performance === 'undefined') return;
    
    try {
      performance.mark(name);
      const timestamp = performance.now();
      
      setMetrics(prev => ({
        ...prev,
        customMarks: {
          ...prev.customMarks,
          [name]: timestamp,
        },
      }));
    } catch (error) {
      console.warn('Failed to create performance mark:', error);
    }
  }, [trackCustomMetrics]);

  // Custom performance measures
  const measure = useCallback((name: string, startMark?: string, endMark?: string) => {
    if (!trackCustomMetrics || typeof performance === 'undefined') return;
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (measure) {
        setMetrics(prev => ({
          ...prev,
          customMeasures: {
            ...prev.customMeasures,
            [name]: measure.duration,
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to create performance measure:', error);
    }
  }, [trackCustomMetrics]);

  // Time a function execution
  const timeFunction = useCallback(<T extends (...args: unknown[]) => unknown>(
    name: string,
    fn: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        customMeasures: {
          ...prev.customMeasures,
          [name]: duration,
        },
      }));
      
      return result;
    }) as T;
  }, []);

  // Set performance budget
  const setBudget = useCallback((budget: PerformanceBudget) => {
    budgetRef.current = budget;
  }, []);

  // Generate performance report
  const generateReport = useCallback((): PerformanceReport => {
    const budget = budgetRef.current;
    const budgetViolations: PerformanceReport['budgetViolations'] = [];
    
    // Check budget violations
    if (budget.firstContentfulPaint && metrics.firstContentfulPaint > budget.firstContentfulPaint) {
      budgetViolations.push({
        metric: 'First Contentful Paint',
        actual: metrics.firstContentfulPaint,
        budget: budget.firstContentfulPaint,
        severity: metrics.firstContentfulPaint > budget.firstContentfulPaint * 1.5 ? 'error' : 'warning',
      });
    }
    
    if (budget.largestContentfulPaint && metrics.largestContentfulPaint > budget.largestContentfulPaint) {
      budgetViolations.push({
        metric: 'Largest Contentful Paint',
        actual: metrics.largestContentfulPaint,
        budget: budget.largestContentfulPaint,
        severity: metrics.largestContentfulPaint > budget.largestContentfulPaint * 1.5 ? 'error' : 'warning',
      });
    }
    
    if (budget.firstInputDelay && metrics.firstInputDelay > budget.firstInputDelay) {
      budgetViolations.push({
        metric: 'First Input Delay',
        actual: metrics.firstInputDelay,
        budget: budget.firstInputDelay,
        severity: metrics.firstInputDelay > budget.firstInputDelay * 2 ? 'error' : 'warning',
      });
    }
    
    if (budget.cumulativeLayoutShift && metrics.cumulativeLayoutShift > budget.cumulativeLayoutShift) {
      budgetViolations.push({
        metric: 'Cumulative Layout Shift',
        actual: metrics.cumulativeLayoutShift,
        budget: budget.cumulativeLayoutShift,
        severity: metrics.cumulativeLayoutShift > budget.cumulativeLayoutShift * 2 ? 'error' : 'warning',
      });
    }

    // Calculate performance score (simplified)
    let score = 100;
    
    // FCP scoring (0-1800ms is good)
    if (metrics.firstContentfulPaint > 1800) {
      score -= Math.min(20, (metrics.firstContentfulPaint - 1800) / 100);
    }
    
    // LCP scoring (0-2500ms is good)
    if (metrics.largestContentfulPaint > 2500) {
      score -= Math.min(25, (metrics.largestContentfulPaint - 2500) / 100);
    }
    
    // FID scoring (0-100ms is good)
    if (metrics.firstInputDelay > 100) {
      score -= Math.min(25, (metrics.firstInputDelay - 100) / 10);
    }
    
    // CLS scoring (0-0.1 is good)
    if (metrics.cumulativeLayoutShift > 0.1) {
      score -= Math.min(25, (metrics.cumulativeLayoutShift - 0.1) * 250);
    }
    
    score = Math.max(0, Math.round(score));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (metrics.firstContentfulPaint > 1800) {
      recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }
    
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resources');
    }
    
    if (metrics.firstInputDelay > 100) {
      recommendations.push('Reduce First Input Delay by optimizing JavaScript execution');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Minimize Cumulative Layout Shift by setting dimensions on media elements');
    }
    
    const totalResourceSize = metrics.resources.reduce((sum, resource) => sum + resource.size, 0);
    if (totalResourceSize > 1024 * 1024) { // 1MB
      recommendations.push('Consider reducing total page size by optimizing assets');
    }

    return {
      metrics,
      budgetViolations,
      score,
      recommendations,
    };
  }, [metrics]);

  // Start reporting interval
  useEffect(() => {
    if (isTracking && onReport && reportingInterval > 0) {
      reportingIntervalRef.current = setInterval(() => {
        onReport(metrics);
      }, reportingInterval);
      
      return () => {
        if (reportingIntervalRef.current) {
          clearInterval(reportingIntervalRef.current);
        }
      };
    }
  }, [isTracking, onReport, reportingInterval, metrics]);

  // Auto-start tracking
  useEffect(() => {
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  // Computed values
  const totalResourceSize = useMemo(() => {
    return metrics.resources.reduce((sum, resource) => sum + resource.size, 0);
  }, [metrics.resources]);

  const resourcesByType = useMemo(() => {
    const grouped: Record<string, typeof metrics.resources> = {};
    metrics.resources.forEach(resource => {
      if (!grouped[resource.type]) {
        grouped[resource.type] = [];
      }
      grouped[resource.type].push(resource);
    });
    return grouped;
  }, [metrics]);

  const averageResourceLoadTime = useMemo(() => {
    if (metrics.resources.length === 0) return 0;
    const totalTime = metrics.resources.reduce((sum, resource) => sum + resource.duration, 0);
    return totalTime / metrics.resources.length;
  }, [metrics.resources]);

  return {
    // State
    metrics,
    isTracking,
    
    // Actions
    startTracking,
    stopTracking,
    mark,
    measure,
    timeFunction,
    setBudget,
    generateReport,
    
    // Computed values
    totalResourceSize,
    resourcesByType,
    averageResourceLoadTime,
    
    // Utilities
    clearCustomMetrics: () => setMetrics(prev => ({
      ...prev,
      customMarks: {},
      customMeasures: {},
    })),
    
    clearResources: () => setMetrics(prev => ({
      ...prev,
      resources: [],
    })),
  };
};

// Specialized hooks for common performance patterns

// Hook for component render performance
export const useRenderPerformance = (componentName: string) => {
  const performance = usePerformance({ trackCustomMetrics: true });
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    performance.mark(`${componentName}-render-${renderCount.current}`);
  });
  
  const measureRender = useCallback((operationName: string) => {
    const markName = `${componentName}-${operationName}`;
    performance.mark(`${markName}-start`);
    
    return () => {
      performance.mark(`${markName}-end`);
      performance.measure(markName, `${markName}-start`, `${markName}-end`);
    };
  }, [performance, componentName]);
  
  return {
    ...performance,
    renderCount: renderCount.current,
    measureRender,
  };
};

// Hook for API call performance
export const useApiPerformance = () => {
  const performance = usePerformance({ trackCustomMetrics: true });
  
  const trackApiCall = useCallback((endpoint: string, method = 'GET') => {
    const callId = `api-${method}-${endpoint}-${Date.now()}`;
    performance.mark(`${callId}-start`);
    
    return {
      finish: (success = true) => {
        performance.mark(`${callId}-end`);
        performance.measure(`${callId}-${success ? 'success' : 'error'}`, `${callId}-start`, `${callId}-end`);
      },
    };
  }, [performance]);
  
  return {
    ...performance,
    trackApiCall,
  };
};

export default usePerformance;