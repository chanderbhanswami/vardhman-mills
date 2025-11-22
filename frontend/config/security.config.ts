/**
 * Security Configuration
 * Comprehensive security settings and policies
 * @module config/security
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityConfig {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
  cors: CORSConfig;
  csrf: CSRFConfig;
  headers: SecurityHeadersConfig;
  rateLimit: RateLimitConfig;
  passwords: PasswordConfig;
  tokens: TokenConfig;
  sessions: SessionSecurityConfig;
  dataProtection: DataProtectionConfig;
  logging: SecurityLoggingConfig;
}

export interface AuthenticationConfig {
  enabled: boolean;
  strategies: {
    local: boolean;
    jwt: boolean;
    oauth: boolean;
    otp: boolean;
  };
  multiFactorAuth: {
    enabled: boolean;
    methods: string[];
    required: boolean;
  };
  passwordless: boolean;
  rememberMe: {
    enabled: boolean;
    duration: number;
  };
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
}

export interface AuthorizationConfig {
  enabled: boolean;
  rbac: {
    enabled: boolean;
    roles: string[];
    permissions: string[];
  };
  abac: {
    enabled: boolean;
    attributes: string[];
  };
  defaultRole: string;
  guestAccess: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  saltRounds: number;
  pepper: string;
  secrets: {
    jwt: SecretConfig;
    cookie: SecretConfig;
    session: SecretConfig;
    encryption: SecretConfig;
  };
}

export interface SecretConfig {
  secret: string;
  algorithm?: string;
  expiresIn?: string;
}

export interface CORSConfig {
  enabled: boolean;
  origin: string | string[] | boolean;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
}

export interface CSRFConfig {
  enabled: boolean;
  cookieName: string;
  headerName: string;
  tokenLength: number;
  secret: string;
  ignoreMethods: string[];
  cookie: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

export interface SecurityHeadersConfig {
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly: boolean;
  };
  xssProtection: {
    enabled: boolean;
    mode: 'block';
  };
  frameOptions: {
    enabled: boolean;
    action: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  };
  contentTypeOptions: {
    enabled: boolean;
    noSniff: boolean;
  };
  referrerPolicy: {
    enabled: boolean;
    policy: string;
  };
  permissionsPolicy: {
    enabled: boolean;
    features: Record<string, string[]>;
  };
}

export interface RateLimitConfig {
  enabled: boolean;
  global: {
    windowMs: number;
    max: number;
  };
  auth: {
    windowMs: number;
    max: number;
  };
  api: {
    windowMs: number;
    max: number;
  };
  trustProxy: boolean;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface PasswordConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
  preventCommon: boolean;
  preventReuse: number;
  expiryDays: number;
  strengthMeter: boolean;
}

export interface TokenConfig {
  jwt: {
    accessToken: {
      secret: string;
      expiresIn: string;
      algorithm: string;
    };
    refreshToken: {
      secret: string;
      expiresIn: string;
      algorithm: string;
    };
  };
  otp: {
    length: number;
    expiresIn: number;
    type: 'numeric' | 'alphanumeric';
    maxAttempts: number;
  };
  reset: {
    length: number;
    expiresIn: number;
    maxAttempts: number;
  };
  verification: {
    length: number;
    expiresIn: number;
  };
}

export interface SessionSecurityConfig {
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  rolling: boolean;
  regenerate: boolean;
  maxAge: number;
  ipCheck: boolean;
  userAgentCheck: boolean;
}

export interface DataProtectionConfig {
  pii: {
    encryption: boolean;
    masking: boolean;
    anonymization: boolean;
  };
  gdpr: {
    enabled: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
    consentRequired: boolean;
  };
  dataRetention: {
    logs: number;
    sessions: number;
    deletedUsers: number;
  };
}

export interface SecurityLoggingConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  events: {
    auth: boolean;
    authorization: boolean;
    dataAccess: boolean;
    adminActions: boolean;
    suspiciousActivity: boolean;
  };
  storage: {
    type: 'file' | 'database' | 'external';
    retention: number;
  };
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'your-cookie-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-key';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'your-encryption-secret-key';
const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const securityConfig: SecurityConfig = {
  // Authentication Configuration
  authentication: {
    enabled: true,
    strategies: {
      local: true,
      jwt: true,
      oauth: true,
      otp: true,
    },
    multiFactorAuth: {
      enabled: false,
      methods: ['otp', 'email', 'authenticator'],
      required: false,
    },
    passwordless: false,
    rememberMe: {
      enabled: true,
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 60 * 60 * 1000, // 1 hour
  },

  // Authorization Configuration
  authorization: {
    enabled: true,
    rbac: {
      enabled: true,
      roles: ['super_admin', 'admin', 'manager', 'user', 'guest'],
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'products:read',
        'products:write',
        'products:delete',
        'orders:read',
        'orders:write',
        'orders:delete',
        'reports:read',
        'settings:read',
        'settings:write',
      ],
    },
    abac: {
      enabled: false,
      attributes: ['department', 'location', 'clearance'],
    },
    defaultRole: 'user',
    guestAccess: true,
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    saltRounds: 10,
    pepper: ENCRYPTION_SECRET,
    secrets: {
      jwt: {
        secret: JWT_SECRET,
        algorithm: 'HS256',
        expiresIn: '7d',
      },
      cookie: {
        secret: COOKIE_SECRET,
      },
      session: {
        secret: SESSION_SECRET,
      },
      encryption: {
        secret: ENCRYPTION_SECRET,
      },
    },
  },

  // CORS Configuration
  cors: {
    enabled: true,
    origin: IS_PRODUCTION ? ALLOWED_ORIGINS : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Per-Page',
      'X-Current-Page',
    ],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
  },

  // CSRF Protection
  csrf: {
    enabled: IS_PRODUCTION,
    cookieName: '_csrf',
    headerName: 'X-CSRF-Token',
    tokenLength: 32,
    secret: CSRF_SECRET,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    cookie: {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
    },
  },

  // Security Headers
  headers: {
    hsts: {
      enabled: IS_PRODUCTION,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      enabled: IS_PRODUCTION,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'", 'https://www.google-analytics.com'],
        'frame-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': [],
      },
      reportOnly: !IS_PRODUCTION,
    },
    xssProtection: {
      enabled: true,
      mode: 'block',
    },
    frameOptions: {
      enabled: true,
      action: 'DENY',
    },
    contentTypeOptions: {
      enabled: true,
      noSniff: true,
    },
    referrerPolicy: {
      enabled: true,
      policy: 'strict-origin-when-cross-origin',
    },
    permissionsPolicy: {
      enabled: true,
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'self'"],
        payment: ["'self'"],
        usb: ["'none'"],
      },
    },
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60,
    },
    trustProxy: IS_PRODUCTION,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // Password Policy
  passwords: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    preventCommon: true,
    preventReuse: 5,
    expiryDays: 90,
    strengthMeter: true,
  },

  // Token Configuration
  tokens: {
    jwt: {
      accessToken: {
        secret: JWT_SECRET,
        expiresIn: '15m',
        algorithm: 'HS256',
      },
      refreshToken: {
        secret: JWT_REFRESH_SECRET,
        expiresIn: '7d',
        algorithm: 'HS256',
      },
    },
    otp: {
      length: 6,
      expiresIn: 5 * 60, // 5 minutes
      type: 'numeric',
      maxAttempts: 3,
    },
    reset: {
      length: 32,
      expiresIn: 60 * 60, // 1 hour
      maxAttempts: 3,
    },
    verification: {
      length: 32,
      expiresIn: 24 * 60 * 60, // 24 hours
    },
  },

  // Session Security
  sessions: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    sameSite: 'lax',
    rolling: true,
    regenerate: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    ipCheck: false,
    userAgentCheck: false,
  },

  // Data Protection
  dataProtection: {
    pii: {
      encryption: true,
      masking: true,
      anonymization: false,
    },
    gdpr: {
      enabled: true,
      rightToErasure: true,
      dataPortability: true,
      consentRequired: true,
    },
    dataRetention: {
      logs: 90, // days
      sessions: 30, // days
      deletedUsers: 7, // days
    },
  },

  // Security Logging
  logging: {
    enabled: true,
    level: IS_PRODUCTION ? 'info' : 'debug',
    events: {
      auth: true,
      authorization: true,
      dataAccess: true,
      adminActions: true,
      suspiciousActivity: true,
    },
    storage: {
      type: 'file',
      retention: 90, // days
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate password against policy
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { passwords: policy } = securityConfig;

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Password must not exceed ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${policy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate password strength
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  else suggestions.push('Use at least 16 characters');

  // Character diversity
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else suggestions.push('Add special characters');

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else suggestions.push('Avoid repeating characters');

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const labelIndex = Math.min(Math.floor(score / 1.5), labels.length - 1);

  return {
    score: Math.min(score, 10),
    label: labels[labelIndex],
    suggestions,
  };
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for Node.js - dynamic import
  const crypto = eval('require')('crypto');
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate OTP
 */
export const generateOTP = (): string => {
  const { length, type } = securityConfig.tokens.otp;
  
  if (type === 'numeric') {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * Mask sensitive data
 */
export const maskData = (data: string, type: 'email' | 'phone' | 'card' = 'email'): string => {
  if (!data) return '';

  switch (type) {
    case 'email': {
      const [username, domain] = data.split('@');
      const maskedUsername = username.length > 2
        ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
        : '*'.repeat(username.length);
      return `${maskedUsername}@${domain}`;
    }
    case 'phone': {
      return data.replace(/\d(?=\d{4})/g, '*');
    }
    case 'card': {
      return data.replace(/\d(?=\d{4})/g, '*');
    }
    default:
      return data;
  }
};

/**
 * Hash password (placeholder - use bcrypt in production)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // This is a placeholder. In production, use bcrypt or argon2
  if (typeof window !== 'undefined') {
    throw new Error('hashPassword should only be called server-side');
  }
  
  // Dynamic import for bcrypt
  const bcrypt = eval('require')('bcrypt');
  return bcrypt.hash(password, securityConfig.encryption.saltRounds);
};

/**
 * Verify password (placeholder - use bcrypt in production)
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    throw new Error('verifyPassword should only be called server-side');
  }
  
  // Dynamic import for bcrypt
  const bcrypt = eval('require')('bcrypt');
  return bcrypt.compare(password, hash);
};

/**
 * Sanitize input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Check if user has permission
 */
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
};

/**
 * Check if user has role
 */
export const hasRole = (userRoles: string[], requiredRole: string | string[]): boolean => {
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return required.some(role => userRoles.includes(role));
};

/**
 * Get CSP directives as string
 */
export const getCSPString = (): string => {
  const { directives } = securityConfig.headers.contentSecurityPolicy;
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

/**
 * Check if security is configured
 */
export const isSecurityConfigured = (): boolean => {
  return !!(
    securityConfig.encryption.secrets.jwt.secret !== 'your-jwt-secret-key-change-this' &&
    securityConfig.encryption.secrets.cookie.secret !== 'your-cookie-secret-key' &&
    securityConfig.encryption.secrets.session.secret !== 'your-session-secret-key'
  );
};

/**
 * Get security headers
 */
export const getSecurityHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (securityConfig.headers.hsts.enabled) {
    const { maxAge, includeSubDomains, preload } = securityConfig.headers.hsts;
    headers['Strict-Transport-Security'] = 
      `max-age=${maxAge}${includeSubDomains ? '; includeSubDomains' : ''}${preload ? '; preload' : ''}`;
  }

  if (securityConfig.headers.xssProtection.enabled) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  if (securityConfig.headers.frameOptions.enabled) {
    headers['X-Frame-Options'] = securityConfig.headers.frameOptions.action;
  }

  if (securityConfig.headers.contentTypeOptions.enabled) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  if (securityConfig.headers.referrerPolicy.enabled) {
    headers['Referrer-Policy'] = securityConfig.headers.referrerPolicy.policy;
  }

  if (securityConfig.headers.contentSecurityPolicy.enabled) {
    headers['Content-Security-Policy'] = getCSPString();
  }

  return headers;
};

// ============================================================================
// COMMON PATTERNS
// ============================================================================

export const commonPasswords = [
  '123456', 'password', '12345678', 'qwerty', '123456789',
  '12345', '1234', '111111', '1234567', 'dragon',
];

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[\d\s\-\+\(\)]+$/;
export const urlRegex = /^https?:\/\/.+/;

// ============================================================================
// EXPORTS
// ============================================================================

export default securityConfig;

export {
  JWT_SECRET,
  COOKIE_SECRET,
  SESSION_SECRET,
  NODE_ENV,
  IS_PRODUCTION,
};
