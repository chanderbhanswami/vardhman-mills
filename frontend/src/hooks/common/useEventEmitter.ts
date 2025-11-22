import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

export type EventListener<T = unknown> = (data: T) => void;

export interface EventEmitterOptions {
  maxListeners?: number;
  captureErrors?: boolean;
  logEvents?: boolean;
  namespace?: string;
}

export interface EventSubscription {
  unsubscribe: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export interface EventEmitterStats {
  totalEvents: number;
  totalListeners: number;
  eventCounts: Record<string, number>;
  listenerCounts: Record<string, number>;
  errors: Array<{
    event: string;
    error: Error;
    timestamp: Date;
  }>;
}

class EventEmitterInstance {
  private listeners: Map<string, Set<{ listener: EventListener; paused: boolean; once: boolean }>> = new Map();
  private stats: EventEmitterStats = {
    totalEvents: 0,
    totalListeners: 0,
    eventCounts: {},
    listenerCounts: {},
    errors: [],
  };
  private maxListeners: number;
  private captureErrors: boolean;
  private logEvents: boolean;
  private namespace: string;

  constructor(options: EventEmitterOptions = {}) {
    this.maxListeners = options.maxListeners || 100;
    this.captureErrors = options.captureErrors !== false;
    this.logEvents = options.logEvents === true;
    this.namespace = options.namespace || 'default';
  }

  on<T = unknown>(event: string, listener: EventListener<T>, once = false): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      this.stats.listenerCounts[event] = 0;
    }

    const listeners = this.listeners.get(event)!;
    
    if (listeners.size >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event "${event}"`);
    }

    const listenerObj = { listener: listener as EventListener, paused: false, once };
    listeners.add(listenerObj);
    
    this.stats.totalListeners++;
    this.stats.listenerCounts[event]++;

    return {
      unsubscribe: () => {
        listeners.delete(listenerObj);
        this.stats.totalListeners--;
        this.stats.listenerCounts[event]--;
        
        if (listeners.size === 0) {
          this.listeners.delete(event);
          delete this.stats.listenerCounts[event];
        }
      },
      pause: () => {
        listenerObj.paused = true;
      },
      resume: () => {
        listenerObj.paused = false;
      },
      get isPaused() {
        return listenerObj.paused;
      },
    };
  }

  once<T = unknown>(event: string, listener: EventListener<T>): EventSubscription {
    return this.on(event, listener, true);
  }

  off(event: string, listener?: EventListener): void {
    if (!listener) {
      // Remove all listeners for the event
      const listeners = this.listeners.get(event);
      if (listeners) {
        this.stats.totalListeners -= listeners.size;
        this.listeners.delete(event);
        delete this.stats.listenerCounts[event];
      }
      return;
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listenerObj of Array.from(listeners)) {
        if (listenerObj.listener === listener) {
          listeners.delete(listenerObj);
          this.stats.totalListeners--;
          this.stats.listenerCounts[event]--;
          
          if (listeners.size === 0) {
            this.listeners.delete(event);
            delete this.stats.listenerCounts[event];
          }
          break;
        }
      }
    }
  }

  emit<T = unknown>(event: string, data?: T): boolean {
    const listeners = this.listeners.get(event);
    
    if (this.logEvents) {
      console.log(`[${this.namespace}] Emitting event: ${event}`, data);
    }
    
    this.stats.totalEvents++;
    this.stats.eventCounts[event] = (this.stats.eventCounts[event] || 0) + 1;
    
    if (!listeners || listeners.size === 0) {
      return false;
    }

    const toRemove: Array<{ listener: EventListener; paused: boolean; once: boolean }> = [];
    
    listeners.forEach((listenerObj) => {
      if (!listenerObj.paused) {
        try {
          listenerObj.listener(data);
          
          if (listenerObj.once) {
            toRemove.push(listenerObj);
          }
        } catch (error) {
          if (this.captureErrors) {
            this.stats.errors.push({
              event,
              error: error as Error,
              timestamp: new Date(),
            });
          }
          
          console.error(`Error in listener for event "${event}":`, error);
          
          if (listenerObj.once) {
            toRemove.push(listenerObj);
          }
        }
      }
    });

    // Remove 'once' listeners after emission
    toRemove.forEach((listenerObj) => {
      listeners.delete(listenerObj);
      this.stats.totalListeners--;
      this.stats.listenerCounts[event]--;
    });

    if (listeners.size === 0) {
      this.listeners.delete(event);
      delete this.stats.listenerCounts[event];
    }

    return true;
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  removeAllListeners(event?: string): void {
    if (event) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        this.stats.totalListeners -= listeners.size;
        this.listeners.delete(event);
        delete this.stats.listenerCounts[event];
      }
    } else {
      this.stats.totalListeners = 0;
      this.stats.listenerCounts = {};
      this.listeners.clear();
    }
  }

  getStats(): EventEmitterStats {
    return { ...this.stats };
  }

  clearStats(): void {
    this.stats = {
      totalEvents: 0,
      totalListeners: this.stats.totalListeners,
      eventCounts: {},
      listenerCounts: { ...this.stats.listenerCounts },
      errors: [],
    };
  }
}

// Global event emitter instance
const globalEventEmitter = new EventEmitterInstance({ namespace: 'global' });

// Hook for using event emitter
export const useEventEmitter = (options: EventEmitterOptions = {}) => {
  const emitterRef = useRef<EventEmitterInstance | null>(null);
  const subscriptionsRef = useRef<Set<EventSubscription>>(new Set());

  // Create emitter instance
  if (!emitterRef.current) {
    emitterRef.current = new EventEmitterInstance(options);
  }

  const emitter = emitterRef.current;

  // Cleanup subscriptions on unmount
  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptions.clear();
    };
  }, []);

  const on = useCallback(<T = unknown>(
    event: string, 
    listener: EventListener<T>,
    autoCleanup = true
  ): EventSubscription => {
    const subscription = emitter.on(event, listener);
    
    if (autoCleanup) {
      subscriptionsRef.current.add(subscription);
    }
    
    return subscription;
  }, [emitter]);

  const once = useCallback(<T = unknown>(
    event: string,
    listener: EventListener<T>,
    autoCleanup = true
  ): EventSubscription => {
    const subscription = emitter.once(event, listener);
    
    if (autoCleanup) {
      subscriptionsRef.current.add(subscription);
    }
    
    return subscription;
  }, [emitter]);

  const off = useCallback((event: string, listener?: EventListener): void => {
    emitter.off(event, listener);
  }, [emitter]);

  const emit = useCallback(<T = unknown>(event: string, data?: T): boolean => {
    return emitter.emit(event, data);
  }, [emitter]);

  const removeAllListeners = useCallback((event?: string): void => {
    emitter.removeAllListeners(event);
  }, [emitter]);

  const stats = useMemo(() => emitter.getStats(), [emitter]);

  return {
    on,
    once,
    off,
    emit,
    removeAllListeners,
    listenerCount: (event: string) => emitter.listenerCount(event),
    eventNames: () => emitter.eventNames(),
    stats,
    clearStats: () => emitter.clearStats(),
  };
};

// Hook for using global event emitter
export const useGlobalEvents = () => {
  const subscriptionsRef = useRef<Set<EventSubscription>>(new Set());

  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptions.clear();
    };
  }, []);

  const on = useCallback(<T = unknown>(
    event: string,
    listener: EventListener<T>,
    autoCleanup = true
  ): EventSubscription => {
    const subscription = globalEventEmitter.on(event, listener);
    
    if (autoCleanup) {
      subscriptionsRef.current.add(subscription);
    }
    
    return subscription;
  }, []);

  const once = useCallback(<T = unknown>(
    event: string,
    listener: EventListener<T>,
    autoCleanup = true
  ): EventSubscription => {
    const subscription = globalEventEmitter.once(event, listener);
    
    if (autoCleanup) {
      subscriptionsRef.current.add(subscription);
    }
    
    return subscription;
  }, []);

  const off = useCallback((event: string, listener?: EventListener): void => {
    globalEventEmitter.off(event, listener);
  }, []);

  const emit = useCallback(<T = unknown>(event: string, data?: T): boolean => {
    return globalEventEmitter.emit(event, data);
  }, []);

  return {
    on,
    once,
    off,
    emit,
    removeAllListeners: (event?: string) => globalEventEmitter.removeAllListeners(event),
    listenerCount: (event: string) => globalEventEmitter.listenerCount(event),
    eventNames: () => globalEventEmitter.eventNames(),
    stats: globalEventEmitter.getStats(),
    clearStats: () => globalEventEmitter.clearStats(),
  };
};

// Hook for event-driven state management
export const useEventState = <T>(
  initialState: T,
  eventName: string,
  useGlobal = false
) => {
  const [state, setState] = useState<T>(initialState);
  const globalEvents = useGlobalEvents();
  const localEvents = useEventEmitter();
  const eventEmitter = useGlobal ? globalEvents : localEvents;

  useEffect(() => {
    const subscription = eventEmitter.on<T>(eventName, (newState) => {
      setState(newState);
    });

    return () => subscription.unsubscribe();
  }, [eventEmitter, eventName]);

  const updateState = useCallback((newState: T) => {
    setState(newState);
    eventEmitter.emit(eventName, newState);
  }, [eventEmitter, eventName]);

  return [state, updateState] as const;
};

// Hook for event-driven communication between components
export const useEventCommunication = <T = unknown>(
  eventName: string,
  useGlobal = true
) => {
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const globalEvents = useGlobalEvents();
  const localEvents = useEventEmitter();
  const eventEmitter = useGlobal ? globalEvents : localEvents;

  useEffect(() => {
    const subscription = eventEmitter.on<T>(eventName, (data) => {
      setLastMessage(data);
    });

    return () => subscription.unsubscribe();
  }, [eventEmitter, eventName]);

  const send = useCallback((data: T) => {
    return eventEmitter.emit(eventName, data);
  }, [eventEmitter, eventName]);

  const sendOnce = useCallback((data: T, listener: EventListener<T>) => {
    const subscription = eventEmitter.once<T>(eventName, listener);
    eventEmitter.emit(eventName, data);
    return subscription;
  }, [eventEmitter, eventName]);

  return {
    lastMessage,
    send,
    sendOnce,
    subscribe: (listener: EventListener<T>) => eventEmitter.on<T>(eventName, listener),
  };
};

// Specialized hooks for common patterns

// Toast/notification events
export const useToastEvents = () => {
  return useEventCommunication<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>('toast');
};

// Modal events
export const useModalEvents = () => {
  return useEventCommunication<{
    action: 'open' | 'close';
    modalId: string;
    props?: Record<string, unknown>;
  }>('modal');
};

// Navigation events
export const useNavigationEvents = () => {
  return useEventCommunication<{
    path: string;
    replace?: boolean;
    state?: unknown;
  }>('navigation');
};

export default useEventEmitter;