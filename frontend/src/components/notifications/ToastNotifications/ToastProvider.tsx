/**
 * ToastProvider Component
 * Provides global toast context and management throughout the application
 * Features: Context management, global toast methods, configuration, themes
 */
'use client';

import React, { createContext, useContext, useCallback, useRef, ReactNode, useState, useEffect } from 'react';
import ToastContainer, { ToastContainerProps } from './ToastContainer';
import { ToastProps, ToastType } from './Toast';
import { uiLogger } from '@/lib/utils/logger';

// Types
export interface ToastContextValue {
  // Basic toast methods
  toast: (props: Omit<ToastProps, 'id'>) => string;
  success: (message: string, options?: Partial<ToastProps>) => string;
  error: (message: string, options?: Partial<ToastProps>) => string;
  warning: (message: string, options?: Partial<ToastProps>) => string;
  info: (message: string, options?: Partial<ToastProps>) => string;
  loading: (message: string, options?: Partial<ToastProps>) => string;
  
  // Advanced methods
  update: (id: string, updates: Partial<ToastProps>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  
  // Utility methods
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: Partial<ToastProps>
  ) => Promise<T>;
  
  // Batch operations
  batch: (toasts: Array<Omit<ToastProps, 'id'>>) => string[];
  
  // Configuration
  setDefaults: (defaults: Partial<ToastProps>) => void;
  getDefaults: () => Partial<ToastProps>;
  
  // Statistics and state
  getStats: () => ToastStats;
  getActiveToasts: () => ToastProps[];
  getQueuedToasts: () => ToastProps[];
  
  // Presets
  createPreset: (name: string, preset: Partial<ToastProps>) => void;
  usePreset: (name: string, overrides?: Partial<ToastProps>) => Partial<ToastProps>;
  deletePreset: (name: string) => void;
  getPresets: () => Record<string, Partial<ToastProps>>;
}

export interface ToastStats {
  totalShown: number;
  totalDismissed: number;
  totalClicked: number;
  totalQueued: number;
  activeCount: number;
  queuedCount: number;
  averageDisplayTime: number;
  topTypes: Array<{ type: ToastType; count: number }>;
  uptime: number;
}

export interface ToastProviderProps extends Partial<ToastContainerProps> {
  children: ReactNode;
  defaults?: Partial<ToastProps>;
  presets?: Record<string, Partial<ToastProps>>;
  enableAnalytics?: boolean;
  analyticsConfig?: {
    trackClicks?: boolean;
    trackDismissals?: boolean;
    trackDuration?: boolean;
    trackUserInteractions?: boolean;
  };
  enableDebug?: boolean;
  onStatsUpdate?: (stats: ToastStats) => void;
}

// Default configurations
const defaultToastProps: Partial<ToastProps> = {
  type: 'info',
  duration: 5000,
  dismissible: true,
  showProgress: true,
  animation: 'slide',
  position: 'top-right',
  style: 'filled',
  priority: 'normal'
};

const defaultPresets: Record<string, Partial<ToastProps>> = {
  success: {
    type: 'success',
    duration: 4000,
    icon: '✓',
    sound: 'success'
  },
  error: {
    type: 'error',
    duration: 0, // Don't auto-dismiss errors
    icon: '✕',
    sound: 'error',
    priority: 'high'
  },
  warning: {
    type: 'warning',
    duration: 6000,
    icon: '⚠',
    sound: 'warning'
  },
  info: {
    type: 'info',
    duration: 5000,
    icon: 'ℹ',
    sound: 'info'
  },
  loading: {
    type: 'loading',
    duration: 0, // Loading toasts don't auto-dismiss
    icon: '⟳',
    dismissible: false,
    showProgress: false
  },
  urgent: {
    priority: 'urgent',
    duration: 0,
    style: 'filled',
    sound: 'urgent',
    vibration: [200, 100, 200]
  },
  silent: {
    sound: false,
    vibration: false
  },
  minimal: {
    style: 'minimal',
    showProgress: false,
    duration: 3000
  }
};

// Context
const ToastContext = createContext<ToastContextValue | null>(null);

// Provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaults = {},
  presets = {},
  enableAnalytics = true,
  analyticsConfig = {
    trackClicks: true,
    trackDismissals: true,
    trackDuration: true,
    trackUserInteractions: true
  },
  enableDebug = false,
  onStatsUpdate,
  ...containerProps
}) => {
  // State management
  const [toastDefaults, setToastDefaults] = useState<Partial<ToastProps>>({
    ...defaultToastProps,
    ...defaults
  });
  
  const [toastPresets, setToastPresets] = useState<Record<string, Partial<ToastProps>>>({
    ...defaultPresets,
    ...presets
  });
  
  const [stats, setStats] = useState<ToastStats>({
    totalShown: 0,
    totalDismissed: 0,
    totalClicked: 0,
    totalQueued: 0,
    activeCount: 0,
    queuedCount: 0,
    averageDisplayTime: 0,
    topTypes: [],
    uptime: Date.now()
  });

  // Refs for tracking
  const toastsRef = useRef<Map<string, ToastProps>>(new Map());
  const queueRef = useRef<ToastProps[]>([]);
  const containerRef = useRef<{
    addToast: (toast: ToastProps) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
  } | null>(null);
  const displayTimesRef = useRef<Map<string, number>>(new Map());
  const typeCountsRef = useRef<Map<ToastType, number>>(new Map());

  // Generate unique ID
  const generateId = useCallback((): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Update statistics
  const updateStats = useCallback(() => {
    const newStats: ToastStats = {
      totalShown: stats.totalShown,
      totalDismissed: stats.totalDismissed,
      totalClicked: stats.totalClicked,
      totalQueued: stats.totalQueued,
      activeCount: toastsRef.current.size,
      queuedCount: queueRef.current.length,
      averageDisplayTime: stats.averageDisplayTime,
      topTypes: Array.from(typeCountsRef.current.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      uptime: Date.now() - stats.uptime
    };

    setStats(newStats);
    onStatsUpdate?.(newStats);
  }, [stats, onStatsUpdate]);

  // Analytics tracking
  const trackEvent = useCallback((event: string, data: Partial<ToastProps>) => {
    if (!enableAnalytics) return;

    if (enableDebug) {
      uiLogger.info(`Toast Analytics: ${event}`, data);
    }

    switch (event) {
      case 'toast-shown':
        if (analyticsConfig.trackClicks) {
          setStats(prev => ({ ...prev, totalShown: prev.totalShown + 1 }));
          if (data.type) {
            typeCountsRef.current.set(
              data.type,
              (typeCountsRef.current.get(data.type) || 0) + 1
            );
          }
        }
        break;
      case 'toast-clicked':
        if (analyticsConfig.trackClicks) {
          setStats(prev => ({ ...prev, totalClicked: prev.totalClicked + 1 }));
        }
        break;
      case 'toast-dismissed':
        if (analyticsConfig.trackDismissals) {
          setStats(prev => ({ ...prev, totalDismissed: prev.totalDismissed + 1 }));
        }
        break;
      case 'toast-queued':
        setStats(prev => ({ ...prev, totalQueued: prev.totalQueued + 1 }));
        break;
    }

    updateStats();
  }, [enableAnalytics, enableDebug, analyticsConfig, updateStats]);

  // Core toast method
  const toast = useCallback((props: Omit<ToastProps, 'id'>): string => {
    const id = generateId();
    const toastProps: ToastProps = {
      ...toastDefaults,
      ...props,
      id,
      onDismiss: (toastId: string) => {
        const displayTime = displayTimesRef.current.get(toastId);
        if (displayTime && analyticsConfig.trackDuration) {
          const duration = Date.now() - displayTime;
          setStats(prev => ({
            ...prev,
            averageDisplayTime: (prev.averageDisplayTime * prev.totalDismissed + duration) / (prev.totalDismissed + 1)
          }));
        }
        
        toastsRef.current.delete(toastId);
        displayTimesRef.current.delete(toastId);
        trackEvent('toast-dismissed', { id: toastId });
        props.onDismiss?.(toastId);
      },
      onClick: (toastId: string) => {
        trackEvent('toast-clicked', { id: toastId });
        props.onClick?.(toastId);
      }
    };

    // Track display time
    displayTimesRef.current.set(id, Date.now());
    toastsRef.current.set(id, toastProps);

    // Add to container
    containerRef.current?.addToast(toastProps);
    
    trackEvent('toast-shown', { 
      id, 
      type: toastProps.type, 
      duration: toastProps.duration,
      priority: toastProps.priority 
    });

    if (enableDebug) {
      uiLogger.info('Toast created', { id, type: toastProps.type, message: toastProps.message?.substring(0, 50) });
    }

    return id;
  }, [toastDefaults, generateId, trackEvent, enableDebug, analyticsConfig]);

  // Convenience methods
  const success = useCallback((message: string, options: Partial<ToastProps> = {}): string => {
    return toast({
      ...toastPresets.success,
      ...options,
      message,
      type: 'success'
    });
  }, [toast, toastPresets]);

  const error = useCallback((message: string, options: Partial<ToastProps> = {}): string => {
    return toast({
      ...toastPresets.error,
      ...options,
      message,
      type: 'error'
    });
  }, [toast, toastPresets]);

  const warning = useCallback((message: string, options: Partial<ToastProps> = {}): string => {
    return toast({
      ...toastPresets.warning,
      ...options,
      message,
      type: 'warning'
    });
  }, [toast, toastPresets]);

  const info = useCallback((message: string, options: Partial<ToastProps> = {}): string => {
    return toast({
      ...toastPresets.info,
      ...options,
      message,
      type: 'info'
    });
  }, [toast, toastPresets]);

  const loading = useCallback((message: string, options: Partial<ToastProps> = {}): string => {
    return toast({
      ...toastPresets.loading,
      ...options,
      message,
      type: 'loading'
    });
  }, [toast, toastPresets]);

  // Update toast
  const update = useCallback((id: string, updates: Partial<ToastProps>) => {
    const existingToast = toastsRef.current.get(id);
    if (existingToast) {
      const updatedToast = { ...existingToast, ...updates };
      toastsRef.current.set(id, updatedToast);
      
      // Remove and re-add to trigger update
      containerRef.current?.removeToast(id);
      setTimeout(() => {
        containerRef.current?.addToast(updatedToast);
      }, 0);
    }
  }, []);

  // Dismiss specific toast
  const dismiss = useCallback((id: string) => {
    containerRef.current?.removeToast(id);
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    containerRef.current?.clearAll();
    toastsRef.current.clear();
    displayTimesRef.current.clear();
  }, []);

  // Promise helper
  const promise = useCallback(async <T,>(
    promiseToResolve: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options: Partial<ToastProps> = {}
  ): Promise<T> => {
    const loadingId = loading(messages.loading, options);

    try {
      const data = await promiseToResolve;
      dismiss(loadingId);
      
      const successMessage = typeof messages.success === 'function' 
        ? messages.success(data) 
        : messages.success;
      
      success(successMessage, options);
      return data;
    } catch (err) {
      dismiss(loadingId);
      
      const errorMessage = typeof messages.error === 'function' 
        ? messages.error(err as Error) 
        : messages.error;
      
      error(errorMessage, options);
      throw err;
    }
  }, [loading, dismiss, success, error]);

  // Batch operations
  const batch = useCallback((toasts: Array<Omit<ToastProps, 'id'>>): string[] => {
    return toasts.map(toastProps => toast(toastProps));
  }, [toast]);

  // Configuration methods
  const setDefaults = useCallback((defaults: Partial<ToastProps>) => {
    setToastDefaults(prev => ({ ...prev, ...defaults }));
  }, []);

  const getDefaults = useCallback((): Partial<ToastProps> => {
    return { ...toastDefaults };
  }, [toastDefaults]);

  // Preset management
  const createPreset = useCallback((name: string, preset: Partial<ToastProps>) => {
    setToastPresets(prev => ({ ...prev, [name]: preset }));
  }, []);

  const usePreset = useCallback((name: string, overrides: Partial<ToastProps> = {}): Partial<ToastProps> => {
    const preset = toastPresets[name] || {};
    return { ...preset, ...overrides };
  }, [toastPresets]);

  const deletePreset = useCallback((name: string) => {
    setToastPresets(prev => {
      const newPresets = { ...prev };
      delete newPresets[name];
      return newPresets;
    });
  }, []);

  const getPresets = useCallback((): Record<string, Partial<ToastProps>> => {
    return { ...toastPresets };
  }, [toastPresets]);

  // State getters
  const getStats = useCallback((): ToastStats => {
    return { ...stats };
  }, [stats]);

  const getActiveToasts = useCallback((): ToastProps[] => {
    return Array.from(toastsRef.current.values());
  }, []);

  const getQueuedToasts = useCallback((): ToastProps[] => {
    return [...queueRef.current];
  }, []);

  // Context value
  const contextValue: ToastContextValue = {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    dismissAll,
    promise,
    batch,
    setDefaults,
    getDefaults,
    getStats,
    getActiveToasts,
    getQueuedToasts,
    createPreset,
    usePreset,
    deletePreset,
    getPresets
  };

  // Container event handlers
  const handleToastAdd = useCallback((toast: ToastProps) => {
    trackEvent('toast-shown', toast);
  }, [trackEvent]);

  const handleToastRemove = useCallback((toast: ToastProps) => {
    trackEvent('toast-dismissed', toast);
  }, [trackEvent]);

  const handleToastClick = useCallback((toast: ToastProps) => {
    trackEvent('toast-clicked', toast);
  }, [trackEvent]);

  const handleQueueFull = useCallback((toast: ToastProps) => {
    trackEvent('toast-queued', toast);
    queueRef.current.push(toast);
  }, [trackEvent]);

  // Cleanup on unmount
  useEffect(() => {
    // Capture current values at effect creation time
    const toasts = toastsRef.current;
    const displayTimes = displayTimesRef.current;
    const queue = queueRef.current;
    
    return () => {
      toasts.clear();
      displayTimes.clear();
      queue.length = 0;
    };
  }, []);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        {...containerProps}
        onToastAdd={handleToastAdd}
        onToastRemove={handleToastRemove}
        onToastClick={handleToastClick}
        onQueueFull={handleQueueFull}
      />
    </ToastContext.Provider>
  );
};

// Hook for using toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// HOC for toast functionality
export const withToast = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    const toast = useToast();
    return <Component {...props} toast={toast} />;
  };
  
  WrappedComponent.displayName = `withToast(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Utility functions for external use
export const createToastInstance = (defaults: Partial<ToastProps> = {}) => {
  let toastDefaults = { ...defaultToastProps, ...defaults };
  
  return {
    setDefaults: (newDefaults: Partial<ToastProps>) => {
      toastDefaults = { ...toastDefaults, ...newDefaults };
    },
    getDefaults: () => ({ ...toastDefaults }),
    create: (props: Omit<ToastProps, 'id'>) => ({
      ...toastDefaults,
      ...props,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })
  };
};

// Export default
export default ToastProvider;

