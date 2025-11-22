/**
 * Comprehensive Logger Utility for Notification System
 * Provides structured logging with levels, formatting, and storage
 * Features: File logging simulation, log filtering, JSON formatting, error tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  data?: unknown;
  stack?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enableFileLogging: boolean;
  categories: string[];
  formatters: Record<string, (entry: LogEntry) => string>;
}

class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private logStorage: LogEntry[] = [];
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemoteLogging: false,
      enableFileLogging: false,
      categories: ['notification', 'websocket', 'auth', 'api', 'ui'],
      formatters: {
        default: this.defaultFormatter,
        json: this.jsonFormatter,
        compact: this.compactFormatter
      },
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger(): void {
    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Global Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
          category: 'global'
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: event.reason,
          category: 'promise'
        });
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    options: {
      category?: string;
      component?: string;
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      sessionId: this.sessionId,
      ...options
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (level === 'error' && data instanceof Error) {
      entry.stack = data.stack;
    }

    return entry;
  }

  private defaultFormatter = (entry: LogEntry): string => {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const category = entry.category ? ` [${entry.category}]` : '';
    const component = entry.component ? ` [${entry.component}]` : '';
    const action = entry.action ? ` (${entry.action})` : '';
    
    let message = `${prefix}${category}${component}${action} ${entry.message}`;
    
    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.stack) {
      message += `\nStack: ${entry.stack}`;
    }
    
    return message;
  };

  private jsonFormatter = (entry: LogEntry): string => {
    return JSON.stringify(entry, null, 2);
  };

  private compactFormatter = (entry: LogEntry): string => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const category = entry.category ? `[${entry.category}]` : '';
    return `${time} ${entry.level.toUpperCase()} ${category} ${entry.message}`;
  };

  private formatMessage(entry: LogEntry, formatter: string = 'default'): string {
    const formatFn = this.config.formatters[formatter] || this.config.formatters.default;
    return formatFn(entry);
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const message = this.formatMessage(entry, 'compact');
    const consoleMethod = entry.level === 'debug' ? 'log' : entry.level;
    
    if (console[consoleMethod]) {
      console[consoleMethod](message);
      if (entry.data) {
        console[consoleMethod]('Data:', entry.data);
      }
    }
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.logStorage.push(entry);
    
    // Maintain max storage limit
    if (this.logStorage.length > this.config.maxStorageEntries) {
      this.logStorage = this.logStorage.slice(-this.config.maxStorageEntries);
    }

    // Store in localStorage for persistence
    try {
      const storedLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      storedLogs.push(entry);
      
      // Keep only recent logs in localStorage
      const maxLocalStorage = 100;
      const recentLogs = storedLogs.slice(-maxLocalStorage);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to store log in localStorage:', error);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFileLogging) return;
    
    // Simulate file logging (in browser environment, this would be a download or IndexedDB)
    const logLine = this.formatMessage(entry, 'default');
    console.log('FILE LOG:', logLine);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    options: {
      category?: string;
      component?: string;
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data, options);

    // Log to different outputs
    this.logToConsole(entry);
    this.storeLog(entry);
    this.sendToRemote(entry);
    this.writeToFile(entry);
  }

  // Public logging methods
  debug(message: string, data?: unknown, options?: { category?: string; component?: string; action?: string; userId?: string; metadata?: Record<string, unknown> }): void {
    this.log('debug', message, data, options);
  }

  info(message: string, data?: unknown, options?: { category?: string; component?: string; action?: string; userId?: string; metadata?: Record<string, unknown> }): void {
    this.log('info', message, data, options);
  }

  warn(message: string, data?: unknown, options?: { category?: string; component?: string; action?: string; userId?: string; metadata?: Record<string, unknown> }): void {
    this.log('warn', message, data, options);
  }

  error(message: string, data?: unknown, options?: { category?: string; component?: string; action?: string; userId?: string; metadata?: Record<string, unknown> }): void {
    this.log('error', message, data, options);
  }

  // Utility methods
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }

  getLogs(level?: LogLevel, category?: string, limit?: number): LogEntry[] {
    let filteredLogs = [...this.logStorage];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logStorage = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      console.warn('Failed to clear logs from localStorage:', error);
    }
  }

  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logStorage, null, 2);
      
      case 'csv':
        const headers = 'timestamp,level,category,component,message,data\n';
        const rows = this.logStorage.map(log => 
          `${log.timestamp},${log.level},${log.category || ''},${log.component || ''},"${log.message}","${JSON.stringify(log.data || '')}"`
        ).join('\n');
        return headers + rows;
      
      case 'txt':
        return this.logStorage.map(log => this.formatMessage(log, 'default')).join('\n\n');
      
      default:
        return JSON.stringify(this.logStorage, null, 2);
    }
  }

  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    sessionId: string;
    oldestLog?: string;
    newestLog?: string;
  } {
    const stats = {
      totalLogs: this.logStorage.length,
      logsByLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>,
      logsByCategory: {} as Record<string, number>,
      sessionId: this.sessionId,
      oldestLog: this.logStorage[0]?.timestamp,
      newestLog: this.logStorage[this.logStorage.length - 1]?.timestamp
    };

    this.logStorage.forEach(log => {
      stats.logsByLevel[log.level]++;
      if (log.category) {
        stats.logsByCategory[log.category] = (stats.logsByCategory[log.category] || 0) + 1;
      }
    });

    return stats;
  }

  // Performance monitoring
  time(label: string): void {
    console.time(label);
    this.debug(`Timer started: ${label}`, undefined, { category: 'performance', action: 'timer_start' });
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
    this.debug(`Timer ended: ${label}`, undefined, { category: 'performance', action: 'timer_end' });
  }

  // Group logging
  group(label: string): void {
    console.group(label);
    this.debug(`Group started: ${label}`, undefined, { category: 'group', action: 'group_start' });
  }

  groupEnd(): void {
    console.groupEnd();
    this.debug('Group ended', undefined, { category: 'group', action: 'group_end' });
  }

  // Assertion logging
  assert(condition: boolean, message: string, data?: unknown): void {
    if (!condition) {
      this.error(`Assertion failed: ${message}`, data, { category: 'assertion' });
    }
  }

  // Context-aware logging for components
  createComponentLogger(component: string) {
    return {
      debug: (message: string, data?: unknown, options?: Record<string, unknown>) => 
        this.debug(message, data, { ...options, component }),
      info: (message: string, data?: unknown, options?: Record<string, unknown>) => 
        this.info(message, data, { ...options, component }),
      warn: (message: string, data?: unknown, options?: Record<string, unknown>) => 
        this.warn(message, data, { ...options, component }),
      error: (message: string, data?: unknown, options?: Record<string, unknown>) => 
        this.error(message, data, { ...options, component })
    };
  }
}

// Create default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: true,
  enableStorage: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT
});

// Export logger class for custom instances
export { Logger };

// Helper functions for specific logging patterns
export const notificationLogger = logger.createComponentLogger('notification');
export const websocketLogger = logger.createComponentLogger('websocket');
export const authLogger = logger.createComponentLogger('auth');
export const apiLogger = logger.createComponentLogger('api');
export const uiLogger = logger.createComponentLogger('ui');

// Performance helpers
export const logPerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  logger.time(name);
  
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    logger.timeEnd(name);
    logger.info(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` }, { 
      category: 'performance',
      action: 'function_execution'
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Performance Error: ${name}`, { error, duration: `${duration.toFixed(2)}ms` }, {
      category: 'performance',
      action: 'function_error'
    });
    throw error;
  }
};

export const logAsyncPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  logger.time(name);
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    logger.timeEnd(name);
    logger.info(`Async Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` }, { 
      category: 'performance',
      action: 'async_execution'
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Async Performance Error: ${name}`, { error, duration: `${duration.toFixed(2)}ms` }, {
      category: 'performance',
      action: 'async_error'
    });
    throw error;
  }
};

export default logger;