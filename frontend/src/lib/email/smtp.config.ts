/**
 * SMTP Configuration for Email Services
 * Comprehensive email service configuration with multiple providers support
 */

import { z } from 'zod';

/**
 * SMTP Provider Types
 */
export type SMTPProvider = 'gmail' | 'outlook' | 'sendgrid' | 'mailgun' | 'ses' | 'smtp2go' | 'custom';

/**
 * SMTP Configuration Schema
 */
export const SMTPConfigSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'sendgrid', 'mailgun', 'ses', 'smtp2go', 'custom']).default('gmail'),
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535),
  secure: z.boolean().default(true), // true for 465, false for other ports
  auth: z.object({
    user: z.string().email('Invalid email address'),
    pass: z.string().min(1, 'Password is required'),
  }),
  tls: z.object({
    rejectUnauthorized: z.boolean().default(true),
    ciphers: z.string().optional(),
    servername: z.string().optional(),
  }).optional(),
  pool: z.boolean().default(true), // Use connection pooling
  maxConnections: z.number().positive().default(5),
  maxMessages: z.number().positive().default(100),
  rateLimit: z.number().positive().default(14), // messages per second
  rateDelta: z.number().positive().default(1000), // time window in ms
});

export type SMTPConfig = z.infer<typeof SMTPConfigSchema>;

/**
 * Email Service Configuration
 */
export interface EmailServiceConfig extends SMTPConfig {
  from: {
    name: string;
    email: string;
  };
  replyTo?: {
    name: string;
    email: string;
  };
  templates: {
    baseUrl: string;
    imagesUrl: string;
    unsubscribeUrl: string;
    preferencesUrl: string;
  };
  tracking: {
    enabled: boolean;
    pixelUrl?: string;
    linkTracking?: boolean;
  };
  encryption: {
    enabled: boolean;
    key?: string;
  };
}

/**
 * Predefined SMTP Configurations for Popular Providers
 */
export const SMTP_PROVIDERS: Record<SMTPProvider, Partial<SMTPConfig>> = {
  gmail: {
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    tls: {
      rejectUnauthorized: true,
    },
  },
  outlook: {
    provider: 'outlook',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: true,
      ciphers: 'SSLv3',
    },
  },
  sendgrid: {
    provider: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: '', // SendGrid API key
    },
  },
  mailgun: {
    provider: 'mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
  },
  ses: {
    provider: 'ses',
    host: '', // Region-specific, e.g., email-smtp.us-east-1.amazonaws.com
    port: 587,
    secure: false,
  },
  smtp2go: {
    provider: 'smtp2go',
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
  },
  custom: {
    provider: 'custom',
    host: '',
    port: 587,
    secure: false,
  },
};

/**
 * Environment Variables Configuration
 */
export const getEmailConfig = (): EmailServiceConfig => {
  const provider = (process.env.SMTP_PROVIDER as SMTPProvider) || 'gmail';
  const baseConfig = SMTP_PROVIDERS[provider];

  return {
    ...baseConfig,
    provider,
    host: process.env.SMTP_HOST || baseConfig.host || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || String(baseConfig.port || 587)),
    secure: process.env.SMTP_SECURE === 'true' || baseConfig.secure || false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      ciphers: process.env.SMTP_TLS_CIPHERS,
      servername: process.env.SMTP_TLS_SERVERNAME,
    },
    pool: process.env.SMTP_POOL !== 'false',
    maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
    maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || '100'),
    rateLimit: parseInt(process.env.SMTP_RATE_LIMIT || '14'),
    rateDelta: parseInt(process.env.SMTP_RATE_DELTA || '1000'),
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Vardhman Mills',
      email: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || '',
    },
    replyTo: process.env.EMAIL_REPLY_TO ? {
      name: process.env.EMAIL_REPLY_TO_NAME || 'Vardhman Mills Support',
      email: process.env.EMAIL_REPLY_TO,
    } : undefined,
    templates: {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      imagesUrl: process.env.NEXT_PUBLIC_IMAGES_URL || 'http://localhost:3000/images',
      unsubscribeUrl: process.env.NEXT_PUBLIC_UNSUBSCRIBE_URL || 'http://localhost:3000/unsubscribe',
      preferencesUrl: process.env.NEXT_PUBLIC_PREFERENCES_URL || 'http://localhost:3000/preferences',
    },
    tracking: {
      enabled: process.env.EMAIL_TRACKING_ENABLED === 'true',
      pixelUrl: process.env.EMAIL_TRACKING_PIXEL_URL,
      linkTracking: process.env.EMAIL_LINK_TRACKING === 'true',
    },
    encryption: {
      enabled: process.env.EMAIL_ENCRYPTION_ENABLED === 'true',
      key: process.env.EMAIL_ENCRYPTION_KEY,
    },
  } as EmailServiceConfig;
};

/**
 * Validate SMTP Configuration
 */
export const validateSMTPConfig = (config: Partial<SMTPConfig>): { isValid: boolean; errors: string[] } => {
  try {
    SMTPConfigSchema.parse(config);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
};

/**
 * Get Provider-Specific Configuration
 */
export const getProviderConfig = (provider: SMTPProvider, customConfig?: Partial<SMTPConfig>): SMTPConfig => {
  const baseConfig = SMTP_PROVIDERS[provider];
  const envConfig = getEmailConfig();
  
  return {
    ...baseConfig,
    ...envConfig,
    ...customConfig,
  } as SMTPConfig;
};

/**
 * SMTP Connection Test Configuration
 */
export interface SMTPTestResult {
  success: boolean;
  provider: SMTPProvider;
  host: string;
  port: number;
  secure: boolean;
  responseTime?: number;
  error?: string;
  details?: {
    authentication: boolean;
    connection: boolean;
    tlsSupport: boolean;
  };
}

/**
 * Email Queue Configuration
 */
export interface EmailQueueConfig {
  enabled: boolean;
  provider: 'memory' | 'redis' | 'database';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  retries: {
    attempts: number;
    delay: number; // milliseconds
    backoff: 'fixed' | 'exponential';
  };
  concurrency: number;
  cleanupInterval: number; // milliseconds
}

/**
 * Default Email Queue Configuration
 */
export const DEFAULT_QUEUE_CONFIG: EmailQueueConfig = {
  enabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
  provider: (process.env.EMAIL_QUEUE_PROVIDER as 'memory' | 'redis' | 'database') || 'memory',
  redis: process.env.REDIS_URL ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  } : undefined,
  retries: {
    attempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
    delay: parseInt(process.env.EMAIL_RETRY_DELAY || '5000'),
    backoff: (process.env.EMAIL_RETRY_BACKOFF as 'fixed' | 'exponential') || 'exponential',
  },
  concurrency: parseInt(process.env.EMAIL_QUEUE_CONCURRENCY || '5'),
  cleanupInterval: parseInt(process.env.EMAIL_QUEUE_CLEANUP_INTERVAL || '300000'), // 5 minutes
};

/**
 * Email Template Configuration
 */
export interface EmailTemplateConfig {
  engine: 'handlebars' | 'ejs' | 'mustache';
  directory: string;
  extension: string;
  cache: boolean;
  context: Record<string, unknown>;
}

/**
 * Default Template Configuration
 */
export const DEFAULT_TEMPLATE_CONFIG: EmailTemplateConfig = {
  engine: 'handlebars',
  directory: './src/lib/email/templates',
  extension: '.hbs',
  cache: process.env.NODE_ENV === 'production',
  context: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Vardhman Mills',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com',
    year: new Date().getFullYear(),
  },
};

/**
 * Export default configuration
 */
export const emailConfig = getEmailConfig();

const emailConfigExports = {
  getEmailConfig,
  validateSMTPConfig,
  getProviderConfig,
  SMTP_PROVIDERS,
  DEFAULT_QUEUE_CONFIG,
  DEFAULT_TEMPLATE_CONFIG,
  emailConfig,
};

export default emailConfigExports;