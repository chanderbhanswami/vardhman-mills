/**
 * Audit Logging System for Vardhman Mills Frontend
 * Security event logging, monitoring, and compliance tracking
 */

import { encryptionService } from './encryption';

// Audit event types
export type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'
  | 'auth.password_change'
  | 'auth.password_reset'
  | 'auth.account_locked'
  | 'auth.session_expired'
  | 'security.csp_violation'
  | 'security.xss_attempt'
  | 'security.injection_attempt'
  | 'security.rate_limit_exceeded'
  | 'security.suspicious_activity'
  | 'data.access'
  | 'data.modification'
  | 'data.deletion'
  | 'data.export'
  | 'payment.initiated'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refund'
  | 'admin.user_created'
  | 'admin.user_modified'
  | 'admin.permission_changed'
  | 'admin.system_config_changed'
  | 'api.request'
  | 'api.error'
  | 'api.rate_limit'
  | 'user.profile_update'
  | 'user.preferences_changed'
  | 'error.application'
  | 'error.network'
  | 'error.validation';

// Audit event severity levels
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// Risk levels for events
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Audit event structure
export interface AuditEvent {
  id: string;
  timestamp: number;
  type: AuditEventType;
  severity: AuditSeverity;
  riskLevel: RiskLevel;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  resource?: string;
  action?: string;
  details: Record<string, unknown>;
  metadata?: {
    deviceFingerprint?: string;
    referrer?: string;
    requestId?: string;
    correlationId?: string;
  };
  outcome: 'success' | 'failure' | 'blocked' | 'warning';
  message: string;
  tags?: string[];
}

// Audit configuration
export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditSeverity;
  encryptLogs: boolean;
  maxLogSize: number; // Maximum entries in local storage
  retentionDays: number;
  endpoints: {
    remote?: string;
    fallback?: string;
  };
  rateLimiting: {
    maxEventsPerMinute: number;
    maxEventsPerHour: number;
  };
  sensitiveFields: string[];
  anonymizeUser: boolean;
}

// Audit filter options
export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  severity?: AuditSeverity[];
  riskLevel?: RiskLevel[];
  userId?: string;
  outcome?: string[];
  tags?: string[];
  searchTerm?: string;
}

// Default audit configuration
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  logLevel: 'medium',
  encryptLogs: true,
  maxLogSize: 10000,
  retentionDays: 90,
  endpoints: {},
  rateLimiting: {
    maxEventsPerMinute: 100,
    maxEventsPerHour: 1000,
  },
  sensitiveFields: [
    'password',
    'token',
    'creditCard',
    'ssn',
    'bankAccount',
    'api_key',
    'secret',
  ],
  anonymizeUser: false,
};

// Event severity mapping
const EVENT_SEVERITY_MAP: Record<AuditEventType, AuditSeverity> = {
  'auth.login': 'low',
  'auth.logout': 'low',
  'auth.failed_login': 'medium',
  'auth.password_change': 'medium',
  'auth.password_reset': 'medium',
  'auth.account_locked': 'high',
  'auth.session_expired': 'low',
  'security.csp_violation': 'medium',
  'security.xss_attempt': 'high',
  'security.injection_attempt': 'critical',
  'security.rate_limit_exceeded': 'medium',
  'security.suspicious_activity': 'high',
  'data.access': 'low',
  'data.modification': 'medium',
  'data.deletion': 'high',
  'data.export': 'medium',
  'payment.initiated': 'medium',
  'payment.completed': 'low',
  'payment.failed': 'medium',
  'payment.refund': 'medium',
  'admin.user_created': 'medium',
  'admin.user_modified': 'high',
  'admin.permission_changed': 'high',
  'admin.system_config_changed': 'critical',
  'api.request': 'low',
  'api.error': 'medium',
  'api.rate_limit': 'medium',
  'user.profile_update': 'low',
  'user.preferences_changed': 'low',
  'error.application': 'medium',
  'error.network': 'low',
  'error.validation': 'low',
};

// Risk level mapping
const EVENT_RISK_MAP: Record<AuditEventType, RiskLevel> = {
  'auth.login': 'low',
  'auth.logout': 'low',
  'auth.failed_login': 'medium',
  'auth.password_change': 'low',
  'auth.password_reset': 'medium',
  'auth.account_locked': 'high',
  'auth.session_expired': 'low',
  'security.csp_violation': 'medium',
  'security.xss_attempt': 'high',
  'security.injection_attempt': 'critical',
  'security.rate_limit_exceeded': 'medium',
  'security.suspicious_activity': 'critical',
  'data.access': 'low',
  'data.modification': 'medium',
  'data.deletion': 'high',
  'data.export': 'high',
  'payment.initiated': 'medium',
  'payment.completed': 'low',
  'payment.failed': 'medium',
  'payment.refund': 'medium',
  'admin.user_created': 'medium',
  'admin.user_modified': 'high',
  'admin.permission_changed': 'critical',
  'admin.system_config_changed': 'critical',
  'api.request': 'low',
  'api.error': 'low',
  'api.rate_limit': 'medium',
  'user.profile_update': 'low',
  'user.preferences_changed': 'low',
  'error.application': 'medium',
  'error.network': 'low',
  'error.validation': 'low',
};

// Audit Logger Service
export class AuditLogger {
  private static instance: AuditLogger;
  private config: AuditConfig;
  private eventQueue: AuditEvent[] = [];
  private rateLimitCounters: Map<string, { count: number; resetTime: number }> = new Map();
  private isProcessing = false;

  private constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<AuditConfig>): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger(config);
    }
    return AuditLogger.instance;
  }

  /**
   * Update audit configuration
   */
  updateConfig(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if event should be logged based on severity
   */
  private shouldLog(eventType: AuditEventType): boolean {
    if (!this.config.enabled) return false;

    const eventSeverity = EVENT_SEVERITY_MAP[eventType];
    const configLevel = this.config.logLevel;

    const severityLevels: Record<AuditSeverity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return severityLevels[eventSeverity] >= severityLevels[configLevel];
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const minuteKey = Math.floor(now / 60000).toString();
    const hourKey = Math.floor(now / 3600000).toString();

    // Check minute limit
    const minuteCounter = this.rateLimitCounters.get(`minute-${minuteKey}`) || {
      count: 0,
      resetTime: now + 60000,
    };

    if (minuteCounter.count >= this.config.rateLimiting.maxEventsPerMinute) {
      return false;
    }

    // Check hour limit
    const hourCounter = this.rateLimitCounters.get(`hour-${hourKey}`) || {
      count: 0,
      resetTime: now + 3600000,
    };

    if (hourCounter.count >= this.config.rateLimiting.maxEventsPerHour) {
      return false;
    }

    // Update counters
    this.rateLimitCounters.set(`minute-${minuteKey}`, {
      count: minuteCounter.count + 1,
      resetTime: minuteCounter.resetTime,
    });

    this.rateLimitCounters.set(`hour-${hourKey}`, {
      count: hourCounter.count + 1,
      resetTime: hourCounter.resetTime,
    });

    // Clean up expired counters
    this.rateLimitCounters.forEach((counter, key) => {
      if (counter.resetTime < now) {
        this.rateLimitCounters.delete(key);
      }
    });

    return true;
  }

  /**
   * Sanitize sensitive data
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };

    const sanitizeValue = (obj: unknown): unknown => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.map(sanitizeValue);
        }

        const sanitizedObj: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          if (this.config.sensitiveFields.some(field => 
            key.toLowerCase().includes(field.toLowerCase())
          )) {
            sanitizedObj[key] = '[REDACTED]';
          } else {
            sanitizedObj[key] = sanitizeValue(value);
          }
        }
        return sanitizedObj;
      }
      return obj;
    };

    return sanitizeValue(sanitized) as Record<string, unknown>;
  }

  /**
   * Get user context information
   */
  private getUserContext(): {
    userAgent?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    referrer?: string;
  } {
    if (typeof window === 'undefined') return {};

    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      // Note: IP address would typically come from server-side
      // Device fingerprint would be generated by encryption service
    };
  }

  /**
   * Log an audit event
   */
  async logEvent(
    type: AuditEventType,
    details: Record<string, unknown>,
    options?: {
      userId?: string;
      sessionId?: string;
      resource?: string;
      action?: string;
      outcome?: 'success' | 'failure' | 'blocked' | 'warning';
      message?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.shouldLog(type) || !this.checkRateLimit()) {
      return;
    }

    const context = this.getUserContext();
    const eventId = encryptionService.generateSecureToken(16);

    const event: AuditEvent = {
      id: eventId,
      timestamp: Date.now(),
      type,
      severity: EVENT_SEVERITY_MAP[type],
      riskLevel: EVENT_RISK_MAP[type],
      userId: this.config.anonymizeUser ? 
        await this.anonymizeUserId(options?.userId) : options?.userId,
      sessionId: options?.sessionId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      resource: options?.resource,
      action: options?.action,
      details: this.sanitizeData(details),
      metadata: {
        deviceFingerprint: context.deviceFingerprint,
        referrer: context.referrer,
        requestId: crypto.randomUUID(),
        ...options?.metadata,
      },
      outcome: options?.outcome || 'success',
      message: options?.message || `${type} event`,
      tags: options?.tags || [],
    };

    // Add to queue for processing
    this.eventQueue.push(event);

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Anonymize user ID for privacy
   */
  private async anonymizeUserId(userId?: string): Promise<string | undefined> {
    if (!userId) return undefined;
    return await encryptionService.hashData(userId, 'SHA-256');
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Store locally
      await this.storeLocally(events);

      // Send to remote endpoint if configured
      if (this.config.endpoints.remote) {
        await this.sendToRemote(events);
      }
    } catch (error) {
      console.error('Failed to process audit events:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...this.eventQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Store events locally
   */
  private async storeLocally(events: AuditEvent[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = await this.getStoredEvents();
      const allEvents = [...existingLogs, ...events];

      // Enforce retention policy
      const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
      const recentEvents = allEvents
        .filter(event => event.timestamp > cutoffTime)
        .slice(-this.config.maxLogSize);

      // Encrypt if configured
      const dataToStore = this.config.encryptLogs ? 
        await this.encryptEvents(recentEvents) : 
        JSON.stringify(recentEvents);

      localStorage.setItem('audit-logs', dataToStore);
    } catch (error) {
      console.error('Failed to store audit events locally:', error);
    }
  }

  /**
   * Encrypt events for storage
   */
  private async encryptEvents(events: AuditEvent[]): Promise<string> {
    const key = await encryptionService.generateKey();
    const encrypted = await encryptionService.encryptData(
      JSON.stringify(events),
      key
    );
    return btoa(JSON.stringify(encrypted));
  }

  /**
   * Decrypt stored events
   */
  private async decryptEvents(encryptedData: string, key: CryptoKey): Promise<AuditEvent[]> {
    const encrypted = JSON.parse(atob(encryptedData));
    const decrypted = await encryptionService.decryptData(encrypted, key);
    return JSON.parse(decrypted);
  }

  /**
   * Get stored events
   */
  async getStoredEvents(): Promise<AuditEvent[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('audit-logs');
      if (!stored) return [];

      if (this.config.encryptLogs) {
        // Note: In production, you'd need to securely manage the decryption key
        // This is a simplified implementation
        return JSON.parse(stored);
      } else {
        return JSON.parse(stored);
      }
    } catch {
      return [];
    }
  }

  /**
   * Send events to remote endpoint
   */
  private async sendToRemote(events: AuditEvent[]): Promise<void> {
    if (!this.config.endpoints.remote) return;

    try {
      const response = await fetch(this.config.endpoints.remote, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          source: 'frontend',
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send audit events to remote:', error);
      
      // Try fallback endpoint
      if (this.config.endpoints.fallback) {
        try {
          await fetch(this.config.endpoints.fallback, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events, error: String(error) }),
          });
        } catch (fallbackError) {
          console.error('Fallback endpoint also failed:', fallbackError);
        }
      }
    }
  }

  /**
   * Query audit events
   */
  async queryEvents(filter: AuditFilter = {}): Promise<AuditEvent[]> {
    const events = await this.getStoredEvents();

    return events.filter(event => {
      // Date range filter
      if (filter.startDate && event.timestamp < filter.startDate.getTime()) {
        return false;
      }
      if (filter.endDate && event.timestamp > filter.endDate.getTime()) {
        return false;
      }

      // Event type filter
      if (filter.eventTypes && !filter.eventTypes.includes(event.type)) {
        return false;
      }

      // Severity filter
      if (filter.severity && !filter.severity.includes(event.severity)) {
        return false;
      }

      // Risk level filter
      if (filter.riskLevel && !filter.riskLevel.includes(event.riskLevel)) {
        return false;
      }

      // User ID filter
      if (filter.userId && event.userId !== filter.userId) {
        return false;
      }

      // Outcome filter
      if (filter.outcome && !filter.outcome.includes(event.outcome)) {
        return false;
      }

      // Tags filter
      if (filter.tags && !filter.tags.some(tag => event.tags?.includes(tag))) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const searchableText = [
          event.message,
          event.resource,
          event.action,
          JSON.stringify(event.details),
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get audit statistics
   */
  async getStatistics(days: number = 30): Promise<{
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    eventsByRisk: Record<RiskLevel, number>;
    recentHighRiskEvents: AuditEvent[];
  }> {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const events = (await this.getStoredEvents())
      .filter(event => event.timestamp > cutoffTime);

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const eventsByRisk: Record<string, number> = {};

    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      eventsByRisk[event.riskLevel] = (eventsByRisk[event.riskLevel] || 0) + 1;
    });

    const recentHighRiskEvents = events
      .filter(event => event.riskLevel === 'high' || event.riskLevel === 'critical')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      eventsByType: eventsByType as Record<AuditEventType, number>,
      eventsBySeverity: eventsBySeverity as Record<AuditSeverity, number>,
      eventsByRisk: eventsByRisk as Record<RiskLevel, number>,
      recentHighRiskEvents,
    };
  }

  /**
   * Clear audit logs
   */
  async clearLogs(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('audit-logs');
    }
    this.eventQueue = [];
  }

  /**
   * Export audit logs
   */
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const events = await this.getStoredEvents();

    if (format === 'csv') {
      const headers = [
        'Timestamp',
        'Type',
        'Severity',
        'Risk Level',
        'User ID',
        'Resource',
        'Action',
        'Outcome',
        'Message',
      ];

      const rows = events.map(event => [
        new Date(event.timestamp).toISOString(),
        event.type,
        event.severity,
        event.riskLevel,
        event.userId || '',
        event.resource || '',
        event.action || '',
        event.outcome,
        event.message,
      ]);

      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
           .join(',')
      ).join('\n');
    }

    return JSON.stringify(events, null, 2);
  }
}

// Audit utilities
export const AuditUtils = {
  /**
   * Log authentication events
   */
  logAuth: async (
    event: 'login' | 'logout' | 'failed_login' | 'password_change' | 'password_reset',
    userId?: string,
    details: Record<string, unknown> = {}
  ): Promise<void> => {
    const logger = AuditLogger.getInstance();
    await logger.logEvent(`auth.${event}` as AuditEventType, details, { userId });
  },

  /**
   * Log security events
   */
  logSecurity: async (
    event: 'csp_violation' | 'xss_attempt' | 'injection_attempt' | 'rate_limit_exceeded' | 'suspicious_activity',
    details: Record<string, unknown> = {},
    outcome: 'blocked' | 'warning' = 'blocked'
  ): Promise<void> => {
    const logger = AuditLogger.getInstance();
    await logger.logEvent(`security.${event}` as AuditEventType, details, { outcome });
  },

  /**
   * Log payment events
   */
  logPayment: async (
    event: 'initiated' | 'completed' | 'failed' | 'refund',
    details: Record<string, unknown> = {},
    userId?: string
  ): Promise<void> => {
    const logger = AuditLogger.getInstance();
    await logger.logEvent(`payment.${event}` as AuditEventType, details, { userId });
  },

  /**
   * Log data access events
   */
  logDataAccess: async (
    event: 'access' | 'modification' | 'deletion' | 'export',
    resource: string,
    userId?: string,
    details: Record<string, unknown> = {}
  ): Promise<void> => {
    const logger = AuditLogger.getInstance();
    await logger.logEvent(`data.${event}` as AuditEventType, details, { 
      userId, 
      resource 
    });
  },

  /**
   * Log API events
   */
  logAPI: async (
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string
  ): Promise<void> => {
    const logger = AuditLogger.getInstance();
    const eventType = statusCode >= 400 ? 'api.error' : 'api.request';
    
    await logger.logEvent(eventType, {
      endpoint,
      method,
      statusCode,
      responseTime,
    }, { 
      userId,
      resource: endpoint,
      outcome: statusCode < 400 ? 'success' : 'failure',
    });
  },
};

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

export default AuditLogger;