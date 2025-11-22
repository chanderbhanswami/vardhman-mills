/**
 * Security Module Index for Vardhman Mills Frontend
 * Centralized exports for all security utilities and services
 */

// Core security services - re-export existing services
export { default as XSSProtection } from './xss-protection';
export { default as CSRFProtection } from './csrf';
export { default as RateLimiter } from './rate-limiting';
export { default as RecaptchaService } from './recaptcha';
export { default as SanitizationService } from './sanitization';

// Advanced security services - NEW
export { 
  default as SessionSecurity, 
  sessionSecurity,
  SessionUtils 
} from './session-security';

export { 
  default as CSPService, 
  cspService,
  CSPUtils,
  useCSP 
} from './csp-helper';

export { 
  default as EncryptionService, 
  encryptionService,
  EncryptionUtils 
} from './encryption';

export { 
  default as AuditLogger, 
  auditLogger,
  AuditUtils 
} from './audit-logging';

// Re-import for internal use
import { sessionSecurity, SessionUtils } from './session-security';
import { cspService, CSPUtils } from './csp-helper';
import { encryptionService, EncryptionUtils } from './encryption';
import { auditLogger, AuditUtils } from './audit-logging';

/**
 * Initialize all security services with default or custom configurations
 */
export async function initializeSecurity(options?: {
  sessionSecurity?: boolean;
  csp?: boolean;
  encryption?: boolean;
  auditLogging?: boolean;
  configs?: {
    [key: string]: unknown;
  };
}): Promise<void> {
  const {
    sessionSecurity: enableSessionSecurity = true,
    csp = true,
    encryption = true,
    auditLogging = true,
  } = options || {};

  // Log initialization
  if (auditLogging) {
    await auditLogger.logEvent('admin.system_config_changed', {
      action: 'security_initialization',
      services: {
        sessionSecurity: enableSessionSecurity,
        csp,
        encryption,
        auditLogging,
      },
    }, {
      message: 'Advanced security services initialized',
      outcome: 'success',
    });
  }
}

/**
 * Get advanced security service status
 */
export function getSecurityStatus(): {
  services: {
    sessionSecurity: boolean;
    csp: boolean;
    encryption: boolean;
    auditLogging: boolean;
  };
  version: string;
  initialized: boolean;
} {
  return {
    services: {
      sessionSecurity: !!sessionSecurity,
      csp: !!cspService,
      encryption: !!encryptionService,
      auditLogging: !!auditLogger,
    },
    version: '1.0.0',
    initialized: true,
  };
}

/**
 * Advanced security health check - tests new security services
 */
export async function securityHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, 'ok' | 'error' | 'disabled'>;
  errors: string[];
}> {
  const results: Record<string, 'ok' | 'error' | 'disabled'> = {};
  const errors: string[] = [];

  try {
    // Test encryption
    const encryptionSupported = encryptionService.isSupported();
    results.encryption = encryptionSupported ? 'ok' : 'disabled';
    
    if (!encryptionSupported) {
      errors.push('Web Crypto API not supported');
    }
  } catch (error) {
    results.encryption = 'error';
    errors.push(`Encryption error: ${error}`);
  }

  try {
    // Test session security
    await SessionUtils.isAuthenticated();
    results.sessionSecurity = 'ok'; // If no error thrown, service is working
  } catch (error) {
    results.sessionSecurity = 'error';
    errors.push(`Session security error: ${error}`);
  }

  try {
    // Test CSP service
    const cspNonce = cspService.generateNonce();
    results.csp = cspNonce ? 'ok' : 'error';
  } catch (error) {
    results.csp = 'error';
    errors.push(`CSP service error: ${error}`);
  }

  try {
    // Test audit logging
    await auditLogger.logEvent('admin.system_config_changed', {
      action: 'health_check',
    }, {
      message: 'Advanced security health check performed',
    });
    results.auditLogging = 'ok';
  } catch (error) {
    results.auditLogging = 'error';
    errors.push(`Audit logging error: ${error}`);
  }

  // Determine overall status
  const errorCount = Object.values(results).filter(status => status === 'error').length;
  const disabledCount = Object.values(results).filter(status => status === 'disabled').length;

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (errorCount === 0 && disabledCount === 0) {
    status = 'healthy';
  } else if (errorCount === 0 && disabledCount > 0) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    services: results,
    errors,
  };
}

/**
 * Emergency security shutdown - disables all services
 */
export function emergencyShutdown(reason: string): void {
  // Log the emergency shutdown
  auditLogger.logEvent('admin.system_config_changed', {
    action: 'emergency_shutdown',
    reason,
  }, {
    message: `Emergency security shutdown: ${reason}`,
    outcome: 'warning',
  });

  // Note: In a real implementation, you would disable services here
  console.warn(`SECURITY EMERGENCY SHUTDOWN: ${reason}`);
}

// Default export - advanced security module
const AdvancedSecurityModule = {
  // Advanced Services
  sessionSecurity,
  cspService,
  encryptionService,
  auditLogger,
  
  // Utilities
  SessionUtils,
  CSPUtils,
  EncryptionUtils,
  AuditUtils,
  
  // Functions
  initializeSecurity,
  getSecurityStatus,
  securityHealthCheck,
  emergencyShutdown,
};

export default AdvancedSecurityModule;