/**
 * ToastContainer Component
 * Manages multiple toast notifications with positioning, queuing, and advanced features
 * Features: Multiple positions, stacking, grouping, queuing, persistence, animations
 */
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps, ToastPosition, ToastAnimation, ToastStyle } from './Toast';
import { uiLogger } from '@/lib/utils/logger';

// Types
export interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
  gutter?: number;
  offset?: { x: number; y: number };
  animation?: ToastAnimation;
  style?: ToastStyle;
  enableStacking?: boolean;
  enableGrouping?: boolean;
  enableQueue?: boolean;
  queueLimit?: number;
  enablePersistence?: boolean;
  enableGlobalPause?: boolean;
  enableDuplicateDetection?: boolean;
  duplicateCheckFields?: Array<keyof ToastProps>;
  autoCleanup?: boolean;
  cleanupInterval?: number;
  enableA11y?: boolean;
  enableKeyboardNavigation?: boolean;
  enableSwipeGestures?: boolean;
  className?: string;
  containerClassName?: string;
  // Event handlers
  onToastAdd?: (toast: ToastProps) => void;
  onToastRemove?: (toast: ToastProps) => void;
  onToastClick?: (toast: ToastProps) => void;
  onToastAction?: (toast: ToastProps, action: string) => void;
  onQueueFull?: (toast: ToastProps) => void;
  onContainerEmpty?: () => void;
  // Filtering and sorting
  filter?: (toast: ToastProps) => boolean;
  sort?: (a: ToastProps, b: ToastProps) => number;
  // Theming
  theme?: 'light' | 'dark' | 'auto';
  // Portal configuration
  portalTarget?: Element | null;
  enablePortal?: boolean;
}

export interface ToastGroup {
  id: string;
  toasts: ToastProps[];
  lastUpdated: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  collapsed: boolean;
}

export interface ToastContainerState {
  toasts: ToastProps[];
  groups: Map<string, ToastGroup>;
  queue: ToastProps[];
  isPaused: boolean;
  focusedIndex: number;
  lastInteraction: Date;
  statistics: {
    totalShown: number;
    totalDismissed: number;
    totalClicked: number;
    totalQueued: number;
    averageDisplayTime: number;
  };
}

// Position configurations
const positionConfigs: Record<ToastPosition, { 
  container: string; 
  alignment: string; 
  direction: 'up' | 'down' | 'center';
}> = {
  'top-left': {
    container: 'top-4 left-4',
    alignment: 'flex-col items-start',
    direction: 'down'
  },
  'top-center': {
    container: 'top-4 left-1/2 transform -translate-x-1/2',
    alignment: 'flex-col items-center',
    direction: 'down'
  },
  'top-right': {
    container: 'top-4 right-4',
    alignment: 'flex-col items-end',
    direction: 'down'
  },
  'bottom-left': {
    container: 'bottom-4 left-4',
    alignment: 'flex-col-reverse items-start',
    direction: 'up'
  },
  'bottom-center': {
    container: 'bottom-4 left-1/2 transform -translate-x-1/2',
    alignment: 'flex-col-reverse items-center',
    direction: 'up'
  },
  'bottom-right': {
    container: 'bottom-4 right-4',
    alignment: 'flex-col-reverse items-end',
    direction: 'up'
  },
  'center': {
    container: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    alignment: 'flex-col items-center',
    direction: 'center'
  }
};

// Priority weights for sorting
const priorityWeights = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1
};

// Helper functions
const getHighestPriority = (priorities: Array<'low' | 'normal' | 'high' | 'urgent'>): 'low' | 'normal' | 'high' | 'urgent' => {
  const weights = priorities.map(p => priorityWeights[p]);
  const maxWeight = Math.max(...weights);
  return Object.entries(priorityWeights).find(([, weight]) => weight === maxWeight)?.[0] as 'low' | 'normal' | 'high' | 'urgent' || 'normal';
};

const calculateAverageDisplayTime = (stats: ToastContainerState['statistics'], newDuration: number): number => {
  const totalTime = stats.averageDisplayTime * stats.totalDismissed + newDuration;
  return totalTime / (stats.totalDismissed + 1);
};

// Custom hook for toast container management
const useToastContainer = (props: ToastContainerProps) => {
  const [state, setState] = useState<ToastContainerState>({
    toasts: [],
    groups: new Map(),
    queue: [],
    isPaused: false,
    focusedIndex: -1,
    lastInteraction: new Date(),
    statistics: {
      totalShown: 0,
      totalDismissed: 0,
      totalClicked: 0,
      totalQueued: 0,
      averageDisplayTime: 0
    }
  });

  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimesRef = useRef<Map<string, number>>(new Map());

  const performCleanup = useCallback(() => {
    setState(prev => {
      const cutoff = new Date(Date.now() - (props.cleanupInterval || 60000));
      const toastsToKeep = prev.toasts.filter(toast => {
        const displayTime = displayTimesRef.current.get(toast.id);
        return !displayTime || new Date(displayTime) > cutoff;
      });

      // Clean up display times
      prev.toasts.forEach(toast => {
        if (!toastsToKeep.find(t => t.id === toast.id)) {
          displayTimesRef.current.delete(toast.id);
        }
      });

      return {
        ...prev,
        toasts: toastsToKeep
      };
    });
  }, [props.cleanupInterval]);

  // Auto cleanup
  useEffect(() => {
    if (props.autoCleanup && props.cleanupInterval) {
      cleanupIntervalRef.current = setInterval(() => {
        performCleanup();
      }, props.cleanupInterval);

      return () => {
        if (cleanupIntervalRef.current) {
          clearInterval(cleanupIntervalRef.current);
        }
      };
    }
  }, [props.autoCleanup, props.cleanupInterval, performCleanup]);

  // Persistence
  useEffect(() => {
    if (props.enablePersistence) {
      try {
        const saved = localStorage.getItem('toast-container-statistics');
        if (saved) {
          const savedStats = JSON.parse(saved);
          setState(prev => ({
            ...prev,
            statistics: { ...prev.statistics, ...savedStats }
          }));
        }
      } catch (error) {
        uiLogger.warn('Failed to load persisted toast statistics', error);
      }
    }
  }, [props.enablePersistence]);

  // Save state on changes
  useEffect(() => {
    if (props.enablePersistence) {
      try {
        localStorage.setItem('toast-container-statistics', JSON.stringify(state.statistics));
      } catch (error) {
        uiLogger.warn('Failed to persist toast statistics', error);
      }
    }
  }, [state.statistics, props.enablePersistence]);

  const isDuplicate = useCallback((newToast: ToastProps): boolean => {
    if (!props.enableDuplicateDetection) return false;

    const fieldsToCheck = props.duplicateCheckFields || ['message', 'type', 'title'];
    
    return state.toasts.some(existingToast => {
      return fieldsToCheck.every(field => existingToast[field] === newToast[field]);
    });
  }, [state.toasts, props.enableDuplicateDetection, props.duplicateCheckFields]);

  const removeToast = useCallback((id: string) => {
    setState(prev => {
      const toastIndex = prev.toasts.findIndex(t => t.id === id);
      if (toastIndex === -1) return prev;

      const removedToast = prev.toasts[toastIndex];
      const newToasts = prev.toasts.filter(t => t.id !== id);
      
      // Calculate display time
      const displayTime = displayTimesRef.current.get(id);
      const duration = displayTime ? Date.now() - displayTime : 0;
      displayTimesRef.current.delete(id);

      // Update groups
      const newGroups = new Map(prev.groups);
      if (removedToast.group) {
        const group = newGroups.get(removedToast.group);
        if (group) {
          group.toasts = group.toasts.filter(t => t.id !== id);
          if (group.toasts.length === 0) {
            newGroups.delete(removedToast.group);
          } else {
            group.lastUpdated = new Date();
            newGroups.set(removedToast.group, group);
          }
        }
      }

      // Process queue
      let newQueue = prev.queue;
      let toastFromQueue = null;
      if (props.enableQueue && prev.queue.length > 0) {
        [toastFromQueue, ...newQueue] = prev.queue;
      }

      const newState = {
        ...prev,
        toasts: newToasts,
        groups: newGroups,
        queue: newQueue,
        focusedIndex: prev.focusedIndex >= newToasts.length ? -1 : prev.focusedIndex,
        statistics: {
          ...prev.statistics,
          totalDismissed: prev.statistics.totalDismissed + 1,
          averageDisplayTime: calculateAverageDisplayTime(prev.statistics, duration)
        }
      };

      // Add queued toast if available
      if (toastFromQueue) {
        return {
          ...newState,
          toasts: [...newState.toasts, toastFromQueue]
        };
      }

      return newState;
    });

    const removedToast = state.toasts.find(t => t.id === id);
    if (removedToast) {
      props.onToastRemove?.(removedToast);
      uiLogger.info('Toast removed', { id, duration: displayTimesRef.current.get(id) });
    }

    // Check if container is empty
    if (state.toasts.length === 1 && state.queue.length === 0) {
      props.onContainerEmpty?.();
    }
  }, [state.toasts, state.queue, props]);

  const handleToastClick = useCallback((id: string) => {
    const toast = state.toasts.find(t => t.id === id);
    if (toast) {
      setState(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalClicked: prev.statistics.totalClicked + 1
        },
        lastInteraction: new Date()
      }));
      props.onToastClick?.(toast);
    }
  }, [state.toasts, props]);

  const handleToastAction = useCallback((id: string, action: string) => {
    const toast = state.toasts.find(t => t.id === id);
    if (toast) {
      setState(prev => ({
        ...prev,
        lastInteraction: new Date()
      }));
      props.onToastAction?.(toast, action);
    }
  }, [state.toasts, props]);

  const addToast = useCallback((toast: ToastProps) => {
    // Check for duplicates
    if (isDuplicate(toast)) {
      uiLogger.info('Duplicate toast blocked', { id: toast.id });
      return;
    }

    // Apply filter if provided
    if (props.filter && !props.filter(toast)) {
      uiLogger.info('Toast filtered out', { id: toast.id });
      return;
    }

    const toastToAdd = {
      ...toast,
      onDismiss: (id: string) => removeToast(id),
      onClick: (id: string) => handleToastClick(id),
      onAction: (id: string, action: string) => handleToastAction(id, action)
    };

    setState(prev => {
      // Check if we need to queue
      if (props.enableQueue && prev.toasts.length >= (props.maxToasts || 5)) {
        // Check queue limit
        if (props.queueLimit && prev.queue.length >= props.queueLimit) {
          props.onQueueFull?.(toastToAdd);
          return prev;
        }

        return {
          ...prev,
          queue: [...prev.queue, toastToAdd],
          statistics: {
            ...prev.statistics,
            totalQueued: prev.statistics.totalQueued + 1
          }
        };
      }

      // Track display time
      displayTimesRef.current.set(toast.id, Date.now());

      // Handle grouping
      const newGroups = new Map(prev.groups);
      if (toast.group && props.enableGrouping) {
        const existingGroup = newGroups.get(toast.group);
        if (existingGroup) {
          existingGroup.toasts.push(toastToAdd);
          existingGroup.lastUpdated = new Date();
          if (toast.priority) {
            existingGroup.priority = getHighestPriority([existingGroup.priority, toast.priority]);
          }
        } else {
          newGroups.set(toast.group, {
            id: toast.group,
            toasts: [toastToAdd],
            lastUpdated: new Date(),
            priority: toast.priority || 'normal',
            collapsed: false
          });
        }
      }

      // Sort toasts if sort function provided
      const newToasts = [...prev.toasts, toastToAdd];
      if (props.sort) {
        newToasts.sort(props.sort);
      }

      return {
        ...prev,
        toasts: newToasts,
        groups: newGroups,
        statistics: {
          ...prev.statistics,
          totalShown: prev.statistics.totalShown + 1
        }
      };
    });

    props.onToastAdd?.(toastToAdd);
    uiLogger.info('Toast added', { id: toast.id, type: toast.type, message: toast.message?.substring(0, 50) });
  }, [props, isDuplicate, removeToast, handleToastClick, handleToastAction]);

  const clearAll = useCallback(() => {
    setState(prev => {
      // Clear display times
      prev.toasts.forEach(toast => {
        displayTimesRef.current.delete(toast.id);
      });
      
      return {
        ...prev,
        toasts: [],
        queue: [],
        groups: new Map(),
        focusedIndex: -1
      };
    });
    
    props.onContainerEmpty?.();
    uiLogger.info('All toasts cleared');
  }, [props]);

  const pauseAll = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeAll = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setState(prev => {
      const newGroups = new Map(prev.groups);
      const group = newGroups.get(groupId);
      if (group) {
        group.collapsed = !group.collapsed;
        newGroups.set(groupId, group);
      }
      return { ...prev, groups: newGroups };
    });
  }, []);

  return {
    state,
    addToast,
    removeToast,
    clearAll,
    pauseAll,
    resumeAll,
    toggleGroup
  };
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  animation = 'slide',
  style = 'filled',
  enableStacking = true,
  enableGrouping = false,
  enableQueue = true,
  queueLimit = 10,
  enablePersistence = true,
  enableGlobalPause = false,
  enableDuplicateDetection = true,
  duplicateCheckFields = ['message', 'type'],
  autoCleanup = true,
  cleanupInterval = 60000, // 1 minute
  enableA11y = true,
  enableKeyboardNavigation = true,
  className = '',
  containerClassName = '',
  theme = 'auto',
  portalTarget,
  enablePortal = true,
  ...eventHandlers
}) => {
  const {
    state,
    removeToast,
    clearAll,
    pauseAll,
    resumeAll,
    toggleGroup
  } = useToastContainer({ 
    position, 
    maxToasts, 
    enableQueue, 
    queueLimit, 
    enablePersistence,
    enableDuplicateDetection,
    duplicateCheckFields,
    autoCleanup,
    cleanupInterval,
    ...eventHandlers 
  });

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation || !enableA11y) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (state.toasts.length === 0) return;

      switch (event.key) {
        case 'Escape':
          if (state.focusedIndex >= 0) {
            removeToast(state.toasts[state.focusedIndex].id);
          } else {
            clearAll();
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          // Focus navigation logic would go here
          break;
        case 'Enter':
        case ' ':
          if (state.focusedIndex >= 0) {
            const toast = state.toasts[state.focusedIndex];
            toast.onClick?.(toast.id);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, enableA11y, state.toasts, state.focusedIndex, removeToast, clearAll]);

  // Global pause/resume on page visibility
  useEffect(() => {
    if (!enableGlobalPause) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAll();
      } else {
        resumeAll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableGlobalPause, pauseAll, resumeAll]);

  // Get filtered and sorted toasts
  const displayToasts = useMemo(() => {
    let toasts = [...state.toasts];
    
    // Apply grouping
    if (enableGrouping) {
      toasts = toasts.filter(toast => {
        if (!toast.group) return true;
        const group = state.groups.get(toast.group);
        return !group?.collapsed;
      });
    }

    // Apply stacking limit
    if (enableStacking && maxToasts > 0) {
      toasts = toasts.slice(0, maxToasts);
    }

    return toasts;
  }, [state.toasts, state.groups, enableGrouping, enableStacking, maxToasts]);

  // Position configuration
  const positionConfig = positionConfigs[position];

  // Theme classes
  const themeClasses = {
    light: '',
    dark: 'dark',
    auto: ''
  };

  const containerClasses = `
    fixed z-50 pointer-events-none
    ${positionConfig.container}
    ${positionConfig.alignment}
    ${themeClasses[theme]}
    ${containerClassName}
  `.trim();

  const renderToasts = () => (
    <div 
      ref={containerRef}
      className={containerClasses}
      {...(enableA11y && {
        role: 'region',
        'aria-label': 'Notifications',
        'aria-live': 'polite'
      })}
    >
      {displayToasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`pointer-events-auto ${enableStacking && index < displayToasts.length - 1 ? 'mb-2' : ''}`}
        >
          <Toast
            {...toast}
            animation={animation}
            style={style}
            position={position}
            className={`${className} ${toast.className || ''}`}
          />
        </div>
      ))}
      
      {/* Group indicators */}
      {enableGrouping && Array.from(state.groups.entries()).map(([groupId, group]) => {
        if (!group.collapsed) return null;
        
        return (
          <div
            key={`group-${groupId}`}
            className="pointer-events-auto bg-gray-800 text-white p-2 rounded cursor-pointer"
            onClick={() => toggleGroup(groupId)}
          >
            <div className="text-sm font-medium">
              {group.toasts.length} notifications from {groupId}
            </div>
            <div className="text-xs opacity-75">
              Click to expand
            </div>
          </div>
        );
      })}
      
      {/* Queue indicator */}
      {enableQueue && state.queue.length > 0 && (
        <div className="pointer-events-auto bg-blue-500 text-white p-2 rounded text-sm">
          {state.queue.length} notification{state.queue.length === 1 ? '' : 's'} queued
        </div>
      )}
    </div>
  );

  // Don't render anything if not mounted (for portal)
  if (!mounted) {
    return null;
  }

  // Render with portal if enabled
  if (enablePortal) {
    const target = portalTarget || (typeof document !== 'undefined' ? document.body : null);
    if (!target) return null;
    return createPortal(renderToasts(), target);
  }

  // Render normally
  return renderToasts();
};

export default ToastContainer;

// Hook for external usage
export const useToast = () => {
  const [container, setContainer] = useState<{
    addToast: (toast: ToastProps) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
  } | null>(null);

  const registerContainer = useCallback((containerMethods: typeof container) => {
    setContainer(containerMethods);
  }, []);

  return {
    addToast: container?.addToast || (() => {}),
    removeToast: container?.removeToast || (() => {}),
    clearAll: container?.clearAll || (() => {}),
    registerContainer
  };
};