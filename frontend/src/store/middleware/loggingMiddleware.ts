import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry interface
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  action: AnyAction;
  prevState?: Partial<RootState>;
  nextState?: Partial<RootState>;
  duration?: number;
  error?: Error;
}

// Configuration for logging
interface LoggingConfig {
  enabled: boolean;
  level: LogLevel;
  maxLogEntries: number;
  excludeActions: string[];
  includeStateChanges: boolean;
  collapseActions: boolean;
  logAsyncActions: boolean;
}

const defaultConfig: LoggingConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  maxLogEntries: 50,
  excludeActions: [
    'persist/PERSIST',
    'persist/REHYDRATE',
    'persist/REGISTER',
    'ui/setLoading',
    'notification/dismissExpiredNotifications',
  ],
  includeStateChanges: true,
  collapseActions: false,
  logAsyncActions: true,
};

// In-memory log storage for development
const logEntries: LogEntry[] = [];

// Logging middleware
const loggingMiddleware: Middleware<Record<string, never>, RootState> = (store) => (next) => (action) => {
  const typedAction = action as AnyAction;
  const config = defaultConfig; // In production, this could come from store state
  
  if (!config.enabled || config.excludeActions.includes(typedAction.type)) {
    return next(action);
  }

  const startTime = performance.now();
  const prevState = config.includeStateChanges ? store.getState() : undefined;

  // Execute the action
  const result = next(action);

  const endTime = performance.now();
  const duration = endTime - startTime;
  const nextState = config.includeStateChanges ? store.getState() : undefined;

  // Create log entry
  const logEntry: LogEntry = {
    timestamp: Date.now(),
    level: getLogLevel(typedAction),
    action: typedAction,
    prevState,
    nextState,
    duration,
  };

  // Log to console
  logToConsole(logEntry, config);

  // Store in memory for debugging
  addToLogHistory(logEntry, config);

  // Log async action lifecycle
  if (config.logAsyncActions && isAsyncAction(typedAction)) {
    logAsyncActionLifecycle(typedAction);
  }

  return result;
};

// Determine log level based on action type
function getLogLevel(action: AnyAction): LogLevel {
  if (action.type.endsWith('/rejected') || action.error) {
    return 'error';
  }
  
  if (action.type.endsWith('/pending')) {
    return 'info';
  }
  
  if (action.type.endsWith('/fulfilled')) {
    return 'info';
  }
  
  if (action.type.includes('error') || action.type.includes('fail')) {
    return 'error';
  }
  
  if (action.type.includes('warn')) {
    return 'warn';
  }
  
  return 'debug';
}

// Log to browser console with styling
function logToConsole(logEntry: LogEntry, config: LoggingConfig): void {
  const { action, prevState, nextState, duration, level } = logEntry;
  
  // Skip if log level is too low
  const logLevels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = logLevels.indexOf(config.level);
  const entryLevelIndex = logLevels.indexOf(level);
  
  if (entryLevelIndex < currentLevelIndex) {
    return;
  }

  // Style configuration
  const styles = {
    debug: 'color: #6B7280; font-weight: normal;',
    info: 'color: #3B82F6; font-weight: bold;',
    warn: 'color: #F59E0B; font-weight: bold;',
    error: 'color: #EF4444; font-weight: bold;',
  };

  const actionStyle = styles[level] || styles.debug;
  const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

  if (config.collapseActions) {
    // Collapsed logging
    console.groupCollapsed(
      `%c${level.toUpperCase()} [${timestamp}] ${action.type} ${duration ? `(${duration.toFixed(2)}ms)` : ''}`,
      actionStyle
    );
  } else {
    // Expanded logging
    console.log(
      `%c${level.toUpperCase()} [${timestamp}] ${action.type} ${duration ? `(${duration.toFixed(2)}ms)` : ''}`,
      actionStyle
    );
  }

  // Log action payload
  if (action.payload !== undefined) {
    console.log('📦 Payload:', action.payload);
  }

  // Log error if present
  if (action.error) {
    console.error('❌ Error:', action.error);
  }

  // Log state changes
  if (config.includeStateChanges && prevState && nextState) {
    const stateChanges = getStateChanges(prevState, nextState);
    if (Object.keys(stateChanges).length > 0) {
      console.log('🔄 State Changes:', stateChanges);
    }
  }

  // Log performance info if action was slow
  if (duration && duration > 10) {
    console.warn(`⚠️ Slow action detected: ${duration.toFixed(2)}ms`);
  }

  if (config.collapseActions) {
    console.groupEnd();
  }
}

// Get state changes between two states
function getStateChanges(prevState: Partial<RootState>, nextState: Partial<RootState>): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  
  // Compare top-level state slices
  Object.keys(nextState).forEach(key => {
    const prevValue = prevState[key as keyof RootState];
    const nextValue = nextState[key as keyof RootState];
    
    if (prevValue !== nextValue) {
      changes[key] = {
        from: prevValue,
        to: nextValue,
      };
    }
  });
  
  return changes;
}

// Add log entry to history
function addToLogHistory(logEntry: LogEntry, config: LoggingConfig): void {
  logEntries.push(logEntry);
  
  // Limit log history size
  if (logEntries.length > config.maxLogEntries) {
    logEntries.shift();
  }
}

// Check if action is async (thunk)
function isAsyncAction(action: AnyAction): boolean {
  return (
    action.type.endsWith('/pending') ||
    action.type.endsWith('/fulfilled') ||
    action.type.endsWith('/rejected')
  );
}

// Log async action lifecycle
function logAsyncActionLifecycle(action: AnyAction): void {
  const baseType = action.type.replace(/(\/pending|\/fulfilled|\/rejected)$/, '');
  
  if (action.type.endsWith('/pending')) {
    console.log(`🚀 Starting async action: ${baseType}`);
  } else if (action.type.endsWith('/fulfilled')) {
    console.log(`✅ Completed async action: ${baseType}`);
  } else if (action.type.endsWith('/rejected')) {
    console.error(`❌ Failed async action: ${baseType}`, action.error);
  }
}

// Utility functions for external access
export const getLogHistory = (): LogEntry[] => [...logEntries];

export const clearLogHistory = (): void => {
  logEntries.length = 0;
};

export const exportLogs = (): string => {
  return JSON.stringify(logEntries, null, 2);
};

export const filterLogs = (predicate: (entry: LogEntry) => boolean): LogEntry[] => {
  return logEntries.filter(predicate);
};

export const getLogsByLevel = (level: LogLevel): LogEntry[] => {
  return logEntries.filter(entry => entry.level === level);
};

export const getLogsForAction = (actionType: string): LogEntry[] => {
  return logEntries.filter(entry => entry.action.type === actionType);
};

export const getPerformanceStats = (): {
  averageDuration: number;
  slowestAction: { type: string; duration: number } | null;
  totalActions: number;
} => {
  const actionsWithDuration = logEntries.filter(entry => entry.duration !== undefined);
  
  if (actionsWithDuration.length === 0) {
    return {
      averageDuration: 0,
      slowestAction: null,
      totalActions: 0,
    };
  }
  
  const totalDuration = actionsWithDuration.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const averageDuration = totalDuration / actionsWithDuration.length;
  
  const slowestEntry = actionsWithDuration.reduce((slowest, entry) => {
    return (entry.duration || 0) > (slowest.duration || 0) ? entry : slowest;
  });
  
  return {
    averageDuration,
    slowestAction: {
      type: slowestEntry.action.type,
      duration: slowestEntry.duration || 0,
    },
    totalActions: logEntries.length,
  };
};

// Development helper to access logs from browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).__REDUX_LOGS__ = {
    getHistory: getLogHistory,
    clear: clearLogHistory,
    export: exportLogs,
    filter: filterLogs,
    getByLevel: getLogsByLevel,
    getByAction: getLogsForAction,
    getPerformanceStats,
  };
}

export default loggingMiddleware;
