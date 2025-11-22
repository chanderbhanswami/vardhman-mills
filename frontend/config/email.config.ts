/**
 * Email Configuration
 * Email service and template configuration
 * @module config/email
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailConfig {
  service: EmailServiceConfig;
  smtp: SMTPConfig;
  sendgrid: SendGridConfig;
  templates: EmailTemplatesConfig;
  defaults: EmailDefaults;
  features: EmailFeatures;
  limits: EmailLimits;
  queue: EmailQueueConfig;
}

export interface EmailServiceConfig {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  enabled: boolean;
  from: EmailAddress;
  replyTo?: EmailAddress;
  bcc?: string[];
  testMode: boolean;
}

export interface EmailAddress {
  name: string;
  email: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
  pool: boolean;
  maxConnections: number;
  maxMessages: number;
  rateDelta: number;
  rateLimit: number;
}

export interface SendGridConfig {
  apiKey: string;
  sandboxMode: boolean;
  mailSettings: {
    bypassListManagement: boolean;
    footer: boolean;
    sandboxMode: boolean;
  };
  trackingSettings: {
    clickTracking: boolean;
    openTracking: boolean;
    subscriptionTracking: boolean;
  };
}

export interface EmailTemplatesConfig {
  baseUrl: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  templates: {
    [key: string]: EmailTemplate;
  };
}

export interface EmailTemplate {
  subject: string;
  template: string;
  variables: string[];
  category?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailDefaults {
  charset: string;
  encoding: string;
  textVersion: boolean;
  inlineCss: boolean;
  attachments: {
    logo: boolean;
    signature: boolean;
  };
}

export interface EmailFeatures {
  templates: boolean;
  scheduling: boolean;
  tracking: boolean;
  analytics: boolean;
  unsubscribe: boolean;
  bulkSend: boolean;
  personalization: boolean;
}

export interface EmailLimits {
  maxRecipients: number;
  maxAttachments: number;
  maxAttachmentSize: number;
  maxBodySize: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
}

export interface EmailQueueConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  priority: {
    high: number;
    normal: number;
    low: number;
  };
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'smtp') as 'smtp' | 'sendgrid';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Vardhman Mills';
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@vardhmanmills.com';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@vardhmanmills.com';

// SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

// SendGrid Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const emailConfig: EmailConfig = {
  // Service Configuration
  service: {
    provider: EMAIL_PROVIDER,
    enabled: true,
    from: {
      name: EMAIL_FROM_NAME,
      email: EMAIL_FROM_ADDRESS,
    },
    replyTo: {
      name: EMAIL_FROM_NAME,
      email: EMAIL_REPLY_TO,
    },
    testMode: !IS_PRODUCTION,
  },

  // SMTP Configuration
  smtp: {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: IS_PRODUCTION,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10,
  },

  // SendGrid Configuration
  sendgrid: {
    apiKey: SENDGRID_API_KEY,
    sandboxMode: !IS_PRODUCTION,
    mailSettings: {
      bypassListManagement: false,
      footer: true,
      sandboxMode: !IS_PRODUCTION,
    },
    trackingSettings: {
      clickTracking: true,
      openTracking: true,
      subscriptionTracking: true,
    },
  },

  // Email Templates Configuration
  templates: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'hi', 'pa'],
    templates: {
      // Authentication Emails
      welcome: {
        subject: 'Welcome to Vardhman Mills',
        template: 'auth/welcome',
        variables: ['username', 'verificationLink'],
        category: 'authentication',
        priority: 'high',
      },
      verifyEmail: {
        subject: 'Verify Your Email Address',
        template: 'auth/verify-email',
        variables: ['username', 'verificationCode', 'verificationLink', 'expiresIn'],
        category: 'authentication',
        priority: 'high',
      },
      resetPassword: {
        subject: 'Reset Your Password',
        template: 'auth/reset-password',
        variables: ['username', 'resetLink', 'expiresIn'],
        category: 'authentication',
        priority: 'high',
      },
      passwordChanged: {
        subject: 'Password Successfully Changed',
        template: 'auth/password-changed',
        variables: ['username', 'timestamp', 'ipAddress'],
        category: 'authentication',
        priority: 'high',
      },

      // Order Emails
      orderConfirmation: {
        subject: 'Order Confirmed - #{orderNumber}',
        template: 'orders/confirmation',
        variables: ['username', 'orderNumber', 'orderDate', 'items', 'total', 'trackingLink'],
        category: 'orders',
        priority: 'high',
      },
      orderShipped: {
        subject: 'Your Order Has Been Shipped - #{orderNumber}',
        template: 'orders/shipped',
        variables: ['username', 'orderNumber', 'trackingNumber', 'carrier', 'trackingLink', 'estimatedDelivery'],
        category: 'orders',
        priority: 'high',
      },
      orderDelivered: {
        subject: 'Your Order Has Been Delivered - #{orderNumber}',
        template: 'orders/delivered',
        variables: ['username', 'orderNumber', 'deliveryDate', 'reviewLink'],
        category: 'orders',
        priority: 'normal',
      },
      orderCancelled: {
        subject: 'Order Cancelled - #{orderNumber}',
        template: 'orders/cancelled',
        variables: ['username', 'orderNumber', 'reason', 'refundAmount', 'refundTimeline'],
        category: 'orders',
        priority: 'high',
      },

      // Payment Emails
      paymentSuccess: {
        subject: 'Payment Received - #{orderNumber}',
        template: 'payments/success',
        variables: ['username', 'orderNumber', 'amount', 'paymentMethod', 'transactionId', 'receiptLink'],
        category: 'payments',
        priority: 'high',
      },
      paymentFailed: {
        subject: 'Payment Failed - #{orderNumber}',
        template: 'payments/failed',
        variables: ['username', 'orderNumber', 'amount', 'reason', 'retryLink'],
        category: 'payments',
        priority: 'high',
      },
      refundProcessed: {
        subject: 'Refund Processed - #{orderNumber}',
        template: 'payments/refund',
        variables: ['username', 'orderNumber', 'refundAmount', 'refundMethod', 'transactionId', 'processingTime'],
        category: 'payments',
        priority: 'high',
      },

      // Notification Emails
      priceDropAlert: {
        subject: 'Price Drop Alert: {productName}',
        template: 'notifications/price-drop',
        variables: ['username', 'productName', 'oldPrice', 'newPrice', 'discount', 'productLink'],
        category: 'notifications',
        priority: 'normal',
      },
      backInStock: {
        subject: 'Back in Stock: {productName}',
        template: 'notifications/back-in-stock',
        variables: ['username', 'productName', 'productLink'],
        category: 'notifications',
        priority: 'normal',
      },
      wishlistReminder: {
        subject: 'Items in Your Wishlist',
        template: 'notifications/wishlist-reminder',
        variables: ['username', 'items', 'wishlistLink'],
        category: 'notifications',
        priority: 'low',
      },
      cartAbandonment: {
        subject: 'Complete Your Purchase',
        template: 'notifications/cart-abandonment',
        variables: ['username', 'items', 'total', 'cartLink', 'discount'],
        category: 'notifications',
        priority: 'normal',
      },

      // Marketing Emails
      newsletter: {
        subject: '{subject}',
        template: 'marketing/newsletter',
        variables: ['username', 'content', 'unsubscribeLink'],
        category: 'marketing',
        priority: 'low',
      },
      promotionalOffer: {
        subject: 'Special Offer: {offerTitle}',
        template: 'marketing/promotional',
        variables: ['username', 'offerTitle', 'offerDescription', 'discount', 'expiresAt', 'ctaLink'],
        category: 'marketing',
        priority: 'normal',
      },
      seasonalSale: {
        subject: '{saleName} - Up to {discount}% Off',
        template: 'marketing/seasonal-sale',
        variables: ['username', 'saleName', 'discount', 'startDate', 'endDate', 'shopLink'],
        category: 'marketing',
        priority: 'normal',
      },

      // Account Emails
      accountUpdate: {
        subject: 'Account Information Updated',
        template: 'account/update',
        variables: ['username', 'updatedFields', 'timestamp'],
        category: 'account',
        priority: 'normal',
      },
      securityAlert: {
        subject: 'Security Alert: Unusual Activity Detected',
        template: 'account/security-alert',
        variables: ['username', 'activity', 'timestamp', 'location', 'device', 'actionLink'],
        category: 'account',
        priority: 'high',
      },
      reviewRequest: {
        subject: 'How was your recent purchase?',
        template: 'account/review-request',
        variables: ['username', 'orderNumber', 'items', 'reviewLink'],
        category: 'account',
        priority: 'low',
      },

      // Support Emails
      supportTicketCreated: {
        subject: 'Support Ticket Created - #{ticketNumber}',
        template: 'support/ticket-created',
        variables: ['username', 'ticketNumber', 'subject', 'description', 'trackingLink'],
        category: 'support',
        priority: 'high',
      },
      supportTicketUpdate: {
        subject: 'Support Ticket Update - #{ticketNumber}',
        template: 'support/ticket-update',
        variables: ['username', 'ticketNumber', 'update', 'status', 'trackingLink'],
        category: 'support',
        priority: 'high',
      },
      supportTicketResolved: {
        subject: 'Support Ticket Resolved - #{ticketNumber}',
        template: 'support/ticket-resolved',
        variables: ['username', 'ticketNumber', 'resolution', 'feedbackLink'],
        category: 'support',
        priority: 'normal',
      },
    },
  },

  // Email Defaults
  defaults: {
    charset: 'UTF-8',
    encoding: 'base64',
    textVersion: true,
    inlineCss: true,
    attachments: {
      logo: true,
      signature: true,
    },
  },

  // Email Features
  features: {
    templates: true,
    scheduling: true,
    tracking: IS_PRODUCTION,
    analytics: IS_PRODUCTION,
    unsubscribe: true,
    bulkSend: true,
    personalization: true,
  },

  // Email Limits
  limits: {
    maxRecipients: 50,
    maxAttachments: 5,
    maxAttachmentSize: 5 * 1024 * 1024, // 5MB
    maxBodySize: 2 * 1024 * 1024, // 2MB
    rateLimitPerHour: 100,
    rateLimitPerDay: 1000,
  },

  // Email Queue Configuration
  queue: {
    enabled: IS_PRODUCTION,
    maxRetries: 3,
    retryDelay: 60000, // 1 minute
    timeout: 30000, // 30 seconds
    priority: {
      high: 1,
      normal: 5,
      low: 10,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get email template configuration
 */
export const getEmailTemplate = (templateName: string): EmailTemplate | undefined => {
  return emailConfig.templates.templates[templateName];
};

/**
 * Build email options
 */
export const buildEmailOptions = (options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, string | number>;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
  priority?: 'high' | 'normal' | 'low';
}) => {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  return {
    from: `${emailConfig.service.from.name} <${emailConfig.service.from.email}>`,
    to: recipients.join(', '),
    replyTo: emailConfig.service.replyTo
      ? `${emailConfig.service.replyTo.name} <${emailConfig.service.replyTo.email}>`
      : undefined,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
    priority: options.priority || 'normal',
  };
};

/**
 * Replace variables in template
 */
export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string | number>
): string => {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  return result;
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get unsubscribe link
 */
export const getUnsubscribeLink = (userId: string, token: string): string => {
  return `${emailConfig.templates.baseUrl}/unsubscribe?user=${userId}&token=${token}`;
};

/**
 * Get email tracking pixel
 */
export const getTrackingPixel = (emailId: string): string => {
  if (!emailConfig.features.tracking) return '';
  return `<img src="${emailConfig.templates.baseUrl}/api/email/track/${emailId}" width="1" height="1" alt="" />`;
};

/**
 * Check if email service is configured
 */
export const isEmailConfigured = (): boolean => {
  if (emailConfig.service.provider === 'smtp') {
    return !!(
      emailConfig.smtp.host &&
      emailConfig.smtp.auth.user &&
      emailConfig.smtp.auth.pass
    );
  }
  
  if (emailConfig.service.provider === 'sendgrid') {
    return !!emailConfig.sendgrid.apiKey;
  }
  
  return false;
};

/**
 * Get rate limit info
 */
export const getRateLimitInfo = () => ({
  perHour: emailConfig.limits.rateLimitPerHour,
  perDay: emailConfig.limits.rateLimitPerDay,
  maxRecipients: emailConfig.limits.maxRecipients,
});

/**
 * Format email for display
 */
export const formatEmailDisplay = (email: string, name?: string): string => {
  return name ? `${name} <${email}>` : email;
};

/**
 * Build verification email link
 */
export const buildVerificationLink = (token: string, type: 'email' | 'reset' = 'email'): string => {
  const path = type === 'email' ? '/verify-email' : '/reset-password';
  return `${emailConfig.templates.baseUrl}${path}?token=${token}`;
};

/**
 * Build order tracking link
 */
export const buildOrderTrackingLink = (orderNumber: string): string => {
  return `${emailConfig.templates.baseUrl}/orders/track/${orderNumber}`;
};

/**
 * Build product link
 */
export const buildProductLink = (productSlug: string): string => {
  return `${emailConfig.templates.baseUrl}/products/${productSlug}`;
};

/**
 * Get email footer content
 */
export const getEmailFooter = () => ({
  companyName: 'Vardhman Textiles Mills Pvt. Ltd.',
  address: 'Industrial Area, Phase 2, Ludhiana, Punjab 141003, India',
  phone: '+91-161-2345678',
  email: emailConfig.service.from.email,
  website: emailConfig.templates.baseUrl,
  socialLinks: {
    facebook: 'https://facebook.com/vardhmanmills',
    instagram: 'https://instagram.com/vardhmanmills',
    twitter: 'https://twitter.com/vardhmanmills',
  },
});

/**
 * Generate email preview text
 */
export const generatePreviewText = (content: string, maxLength: number = 100): string => {
  const stripped = content.replace(/<[^>]*>/g, '').trim();
  return stripped.length > maxLength ? `${stripped.substring(0, maxLength)}...` : stripped;
};

/**
 * Sanitize email content
 */
export const sanitizeEmailContent = (content: string): string => {
  // Remove potentially dangerous HTML tags and attributes
  const dangerous = /<script|<iframe|javascript:|onerror=|onclick=/gi;
  return content.replace(dangerous, '');
};

// ============================================================================
// EMAIL CATEGORIES
// ============================================================================

export const emailCategories = {
  authentication: 'Authentication & Security',
  orders: 'Order Updates',
  payments: 'Payment & Billing',
  notifications: 'Product Notifications',
  marketing: 'Marketing & Promotions',
  account: 'Account Management',
  support: 'Customer Support',
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default emailConfig;

export {
  EMAIL_PROVIDER,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
  EMAIL_REPLY_TO,
  NODE_ENV,
  IS_PRODUCTION,
};
