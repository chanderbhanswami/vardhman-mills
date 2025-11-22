/**
 * Email Utilities
 * Comprehensive email utility functions for template rendering, validation, and formatting
 */

import { z } from 'zod';
import { EmailOptions, EmailAttachment } from './nodemailer';
import { emailConfig } from './smtp.config';

/**
 * Email Template Context Schema
 */
export const EmailTemplateContextSchema = z.object({
  appName: z.string().default('Vardhman Mills'),
  appUrl: z.string().url().default('http://localhost:3000'),
  supportEmail: z.string().email().default('support@vardhmanmills.com'),
  year: z.number().default(new Date().getFullYear()),
  user: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
  }).optional(),
  order: z.object({
    id: z.string().optional(),
    number: z.string().optional(),
    total: z.number().optional(),
    currency: z.string().default('₹'),
    status: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      image: z.string().url().optional(),
    })).optional(),
  }).optional(),
  product: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().default('₹'),
    image: z.string().url().optional(),
    url: z.string().url().optional(),
  }).optional(),
  newsletter: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    unsubscribeUrl: z.string().url().optional(),
    preferencesUrl: z.string().url().optional(),
  }).optional(),
  security: z.object({
    code: z.string().optional(),
    token: z.string().optional(),
    expiresAt: z.date().optional(),
    ip: z.string().optional(),
    location: z.string().optional(),
    device: z.string().optional(),
  }).optional(),
  notification: z.object({
    title: z.string().optional(),
    message: z.string().optional(),
    type: z.enum(['info', 'success', 'warning', 'error']).optional(),
    actionUrl: z.string().url().optional(),
    actionText: z.string().optional(),
  }).optional(),
});

export type EmailTemplateContext = z.infer<typeof EmailTemplateContextSchema>;

/**
 * Email Validation Schema
 */
export const EmailValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
});

/**
 * Bulk Email Schema
 */
export const BulkEmailSchema = z.object({
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    context: z.record(z.string(), z.unknown()).optional(),
  })).min(1, 'At least one recipient is required'),
  template: z.string().min(1, 'Template is required'),
  subject: z.string().min(1, 'Subject is required'),
  globalContext: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Email Template Types
 */
export type EmailTemplateType = 
  | 'welcome'
  | 'verification'
  | 'reset-password'
  | 'password_changed'
  | 'login_notification'
  | 'login_otp'
  | '2fa_code'
  | 'account_created'
  | 'account_locked'
  | 'order-confirmation'
  | 'order-cancellation'
  | 'order-refund'
  | 'delivery-confirmation'
  | 'shipping-update'
  | 'deliverd-items-review'
  | 'invoice'
  | 'newsletter_welcome'
  | 'newsletter_confirmation'
  | 'newsletter_unsubscribe'
  | 'new_lauch';

/**
 * Email Priority Levels
 */
export type EmailPriority = 'high' | 'normal' | 'low';

/**
 * Email Status Types
 */
export type EmailStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened' | 'clicked';

/**
 * Email Analytics Data
 */
export interface EmailAnalytics {
  emailId: string;
  templateType: EmailTemplateType;
  recipient: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  opens: number;
  clicks: number;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

/**
 * Email Template Renderer
 */
export class EmailTemplateRenderer {
  private baseContext: EmailTemplateContext;

  constructor(baseContext?: Partial<EmailTemplateContext>) {
    this.baseContext = {
      appName: emailConfig.from.name,
      appUrl: emailConfig.templates.baseUrl,
      supportEmail: emailConfig.from.email,
      year: new Date().getFullYear(),
      ...baseContext,
    };
  }

  /**
   * Render Email Template
   */
  public render(template: string, context: Partial<EmailTemplateContext> = {}): string {
    const mergedContext = { ...this.baseContext, ...context };
    
    // Simple template engine (can be replaced with Handlebars, Mustache, etc.)
    let rendered = template;
    
    // Replace variables in double curly braces
    rendered = rendered.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(mergedContext, path);
      return value !== undefined ? String(value) : match;
    });

    // Replace conditionals
    rendered = this.renderConditionals(rendered, mergedContext);
    
    // Replace loops
    rendered = this.renderLoops(rendered, mergedContext);

    return rendered;
  }

  /**
   * Get Nested Object Value
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Render Conditional Blocks
   */
  private renderConditionals(template: string, context: Record<string, unknown>): string {
    const conditionalRegex = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      const value = this.getNestedValue(context, condition);
      return value ? content : '';
    });
  }

  /**
   * Render Loop Blocks
   */
  private renderLoops(template: string, context: Record<string, unknown>): string {
    const loopRegex = /\{\{#each\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(loopRegex, (match, arrayPath, itemTemplate) => {
      const array = this.getNestedValue(context, arrayPath);
      
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item: Record<string, unknown>, index: number) => {
        let rendered = itemTemplate;
        
        // Replace item properties
        rendered = rendered.replace(/\{\{this\.(\w+)\}\}/g, (_match: string, prop: string) => {
          return item[prop] !== undefined ? String(item[prop]) : _match;
        });
        
        // Replace index
        rendered = rendered.replace(/\{\{@index\}\}/g, String(index));
        
        return rendered;
      }).join('');
    });
  }
}

/**
 * Email Formatter Utilities
 */
export class EmailFormatter {
  /**
   * Format Currency
   */
  static formatCurrency(amount: number, currency = '₹'): string {
    return `${currency}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Format Date
   */
  static formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return date.toLocaleDateString('en-IN', options || defaultOptions);
  }

  /**
   * Format Date and Time
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format Address
   */
  static formatAddress(address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  }): string {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Format Phone Number
   */
  static formatPhone(phone: string): string {
    // Format Indian phone numbers
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
  }

  /**
   * Truncate Text
   */
  static truncate(text: string, length: number): string {
    if (text.length <= length) {
      return text;
    }
    
    return text.substring(0, length).trim() + '...';
  }

  /**
   * Generate Tracking URL
   */
  static generateTrackingUrl(baseUrl: string, emailId: string, linkUrl: string): string {
    const params = new URLSearchParams({
      id: emailId,
      url: linkUrl,
    });
    
    return `${baseUrl}/track/click?${params.toString()}`;
  }

  /**
   * Generate Unsubscribe URL
   */
  static generateUnsubscribeUrl(baseUrl: string, email: string, token?: string): string {
    const params = new URLSearchParams({
      email,
      ...(token && { token }),
    });
    
    return `${baseUrl}/unsubscribe?${params.toString()}`;
  }
}

/**
 * Email Validator
 */
export class EmailValidator {
  /**
   * Validate Email Address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Email Domain
   */
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  /**
   * Check if Email is Disposable
   */
  static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'trash-mail.com',
      'temp-mail.org',
      'yopmail.com',
      'maildrop.cc',
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  /**
   * Validate Email List
   */
  static validateEmailList(emails: string[]): {
    valid: string[];
    invalid: string[];
    disposable: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];
    const disposable: string[] = [];

    emails.forEach(email => {
      if (!this.isValidEmail(email)) {
        invalid.push(email);
      } else if (this.isDisposableEmail(email)) {
        disposable.push(email);
      } else {
        valid.push(email);
      }
    });

    return { valid, invalid, disposable };
  }
}

/**
 * Email Subject Generator
 */
export class EmailSubjectGenerator {
  private static templates: Record<EmailTemplateType, string[]> = {
    welcome: [
      'Welcome to {{appName}}! 🎉',
      'Your {{appName}} journey begins now',
      'Welcome aboard, {{user.name}}!',
    ],
    verification: [
      'Verify your {{appName}} account',
      'Please confirm your email address',
      'Account verification required',
    ],
    'reset-password': [
      'Reset your {{appName}} password',
      'Password reset requested',
      'Your password reset link',
    ],
    password_changed: [
      'Your password has been changed',
      'Password updated successfully',
      'Security alert: Password changed',
    ],
    login_notification: [
      'New login to your account',
      'Security alert: Account accessed',
      'Login notification from {{appName}}',
    ],
    login_otp: [
      'Your login code: {{security.code}}',
      'Verification code for {{appName}}',
      'Your one-time password',
    ],
    '2fa_code': [
      'Your 2FA code: {{security.code}}',
      'Two-factor authentication code',
      'Security verification code',
    ],
    account_created: [
      'Your {{appName}} account is ready!',
      'Account created successfully',
      'Welcome to {{appName}}',
    ],
    account_locked: [
      'Your account has been locked',
      'Security alert: Account locked',
      'Account access restricted',
    ],
    'order-confirmation': [
      'Order confirmed: #{{order.number}}',
      'Your order is confirmed!',
      'Thank you for your order',
    ],
    'order-cancellation': [
      'Order cancelled: #{{order.number}}',
      'Your order has been cancelled',
      'Order cancellation confirmed',
    ],
    'order-refund': [
      'Refund processed: #{{order.number}}',
      'Your refund is on the way',
      'Refund confirmation',
    ],
    'delivery-confirmation': [
      'Your order has been delivered!',
      'Delivery confirmed: #{{order.number}}',
      'Package delivered successfully',
    ],
    'shipping-update': [
      'Shipping update: #{{order.number}}',
      'Your order is on the way',
      'Package tracking update',
    ],
    'deliverd-items-review': [
      'How was your experience?',
      'Review your recent purchase',
      'Share your feedback',
    ],
    invoice: [
      'Invoice: #{{order.number}}',
      'Your {{appName}} invoice',
      'Payment receipt',
    ],
    newsletter_welcome: [
      'Welcome to our newsletter!',
      'You\'re subscribed to {{appName}} updates',
      'Thanks for subscribing!',
    ],
    newsletter_confirmation: [
      'Confirm your newsletter subscription',
      'Please verify your subscription',
      'Subscription confirmation required',
    ],
    newsletter_unsubscribe: [
      'You\'ve been unsubscribed',
      'Subscription cancelled',
      'Farewell from {{appName}}',
    ],
    new_lauch: [
      'Introducing {{product.name}}! 🚀',
      'New product launch: {{product.name}}',
      'Something exciting is here!',
    ],
  };

  /**
   * Generate Subject for Template Type
   */
  static generate(templateType: EmailTemplateType, context: Partial<EmailTemplateContext> = {}): string {
    const templates = this.templates[templateType];
    if (!templates || templates.length === 0) {
      return 'Message from {{appName}}';
    }

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Render with context
    const renderer = new EmailTemplateRenderer();
    return renderer.render(template, context);
  }
}

/**
 * Email Attachment Helper
 */
export class EmailAttachmentHelper {
  /**
   * Create File Attachment
   */
  static createFileAttachment(
    filename: string,
    content: string | Buffer,
    contentType?: string
  ): EmailAttachment {
    return {
      filename,
      content,
      contentType: contentType || this.getContentType(filename),
      contentDisposition: 'attachment',
    };
  }

  /**
   * Create Inline Image Attachment
   */
  static createInlineImage(
    filename: string,
    content: string | Buffer,
    cid: string,
    contentType?: string
  ): EmailAttachment {
    return {
      filename,
      content,
      contentType: contentType || this.getContentType(filename),
      contentDisposition: 'inline',
      cid,
    };
  }

  /**
   * Create URL Attachment
   */
  static createUrlAttachment(
    filename: string,
    href: string,
    contentType?: string
  ): EmailAttachment {
    return {
      filename,
      href,
      contentType: contentType || this.getContentType(filename),
      contentDisposition: 'attachment',
    };
  }

  /**
   * Get Content Type by Extension
   */
  private static getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
    };

    return contentTypes[extension || ''] || 'application/octet-stream';
  }
}

/**
 * Email Template Manager
 */
export class EmailTemplateManager {
  private templates = new Map<EmailTemplateType, string>();
  private renderer: EmailTemplateRenderer;

  constructor() {
    this.renderer = new EmailTemplateRenderer();
    this.loadTemplates();
  }

  /**
   * Load Email Templates
   */
  private loadTemplates(): void {
    // Templates will be loaded dynamically from individual template files
    // This is a placeholder for the template loading mechanism
  }

  /**
   * Get Template
   */
  public getTemplate(type: EmailTemplateType): string | undefined {
    return this.templates.get(type);
  }

  /**
   * Set Template
   */
  public setTemplate(type: EmailTemplateType, template: string): void {
    this.templates.set(type, template);
  }

  /**
   * Render Template
   */
  public render(type: EmailTemplateType, context: Partial<EmailTemplateContext>): {
    subject: string;
    html: string;
    text: string;
  } {
    const template = this.getTemplate(type);
    if (!template) {
      throw new Error(`Template '${type}' not found`);
    }

    const subject = EmailSubjectGenerator.generate(type, context);
    const html = this.renderer.render(template, context);
    const text = this.htmlToText(html);

    return { subject, html, text };
  }

  /**
   * Convert HTML to Plain Text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Email Queue Manager
 */
export interface EmailQueueOptions {
  priority: EmailPriority;
  delay?: number; // milliseconds
  attempts?: number;
  backoff?: 'fixed' | 'exponential';
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export class EmailQueueManager {
  private queue: Array<{
    id: string;
    email: EmailOptions;
    options: EmailQueueOptions;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    processedAt?: Date;
    attempts: number;
    error?: string;
  }> = [];

  /**
   * Add Email to Queue
   */
  public add(email: EmailOptions, options: EmailQueueOptions = { priority: 'normal' }): string {
    const id = this.generateId();
    
    this.queue.push({
      id,
      email,
      options,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
    });

    return id;
  }

  /**
   * Get Queue Stats
   */
  public getStats(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    return {
      pending: this.queue.filter(item => item.status === 'pending').length,
      processing: this.queue.filter(item => item.status === 'processing').length,
      completed: this.queue.filter(item => item.status === 'completed').length,
      failed: this.queue.filter(item => item.status === 'failed').length,
      total: this.queue.length,
    };
  }

  /**
   * Clear Completed Jobs
   */
  public clean(): void {
    this.queue = this.queue.filter(item => 
      item.status !== 'completed' && 
      (item.status !== 'failed' || !item.options.removeOnFail)
    );
  }

  /**
   * Generate Unique ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export utility instances
 */
export const emailRenderer = new EmailTemplateRenderer();
export const emailFormatter = EmailFormatter;
export const emailValidator = EmailValidator;
export const emailSubjectGenerator = EmailSubjectGenerator;
export const emailAttachmentHelper = EmailAttachmentHelper;
export const emailTemplateManager = new EmailTemplateManager();
export const emailQueueManager = new EmailQueueManager();

/**
 * Utility Functions
 */
export const utils = {
  /**
   * Generate Secure Token
   */
  generateToken: (length = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate OTP
   */
  generateOTP: (length = 6): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
  },

  /**
   * Hash Email for Privacy
   */
  hashEmail: (email: string): string => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? `${username.slice(0, 2)}***${username.slice(-1)}`
      : '***';
    return `${maskedUsername}@${domain}`;
  },

  /**
   * Calculate Email Score (deliverability estimate)
   */
  calculateEmailScore: (email: string): number => {
    let score = 100;
    
    if (!EmailValidator.isValidEmail(email)) {
      return 0;
    }
    
    if (EmailValidator.isDisposableEmail(email)) {
      score -= 50;
    }
    
    const domain = email.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (!commonDomains.includes(domain)) {
      score -= 10;
    }
    
    return Math.max(0, score);
  },
};

/**
 * Email Constants
 */
export const EMAIL_CONSTANTS = {
  MAX_SUBJECT_LENGTH: 78,
  MAX_RECIPIENTS: 50,
  MAX_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 5000, // 5 seconds
  PRIORITY_WEIGHTS: {
    high: 3,
    normal: 2,
    low: 1,
  },
} as const;