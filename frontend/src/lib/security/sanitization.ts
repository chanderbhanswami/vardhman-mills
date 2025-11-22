/**
 * Input Sanitization and Data Cleaning for Vardhman Mills Frontend
 * Comprehensive sanitization to prevent XSS, SQL injection, and other attacks
 */

// Sanitization configuration
export const SANITIZATION_CONFIG = {
  html: {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'] as const,
  },
  text: {
    maxLength: 10000,
    removeEmojis: false,
    normalizeWhitespace: true,
  },
  files: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'] as const,
    maxNameLength: 255,
    sanitizeFilename: true,
  },
} as const;

// Type for allowed extensions
export type AllowedExtension = typeof SANITIZATION_CONFIG.files.allowedExtensions[number];

// Type for allowed schemes
export type AllowedScheme = typeof SANITIZATION_CONFIG.html.allowedSchemes[number];

// Type for sanitization metadata
export interface SanitizationMetadata {
  originalLength?: number;
  sanitizedLength?: number;
  extension?: string;
  hasExtension?: boolean;
  [key: string]: unknown;
}

// Sanitization result interface
export interface SanitizationResult<T = string> {
  original: T;
  sanitized: T;
  wasModified: boolean;
  violations: string[];
  metadata?: SanitizationMetadata;
}

// HTML sanitization options
export interface HtmlSanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripTags?: boolean;
}

// Text sanitization options
export interface TextSanitizationOptions {
  maxLength?: number;
  removeEmojis?: boolean;
  normalizeWhitespace?: boolean;
  allowedCharsets?: string[];
}

// Main sanitization service
export class SanitizationService {
  private static instance: SanitizationService;

  private constructor() {}

  static getInstance(): SanitizationService {
    if (!SanitizationService.instance) {
      SanitizationService.instance = new SanitizationService();
    }
    return SanitizationService.instance;
  }

  /**
   * Basic HTML sanitization without external dependencies
   */
  sanitizeHtml(
    html: string,
    options?: HtmlSanitizationOptions
  ): SanitizationResult<string> {
    if (!html || typeof html !== 'string') {
      return {
        original: html,
        sanitized: '',
        wasModified: !!html,
        violations: html ? ['invalid-input'] : [],
      };
    }

    const original = html;
    let sanitized = html;
    const violations: string[] = [];

    // Remove script tags
    if (/<script[^>]*>[\s\S]*?<\/script>/gi.test(sanitized)) {
      violations.push('script-tags-removed');
      sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    }

    // Remove dangerous attributes
    if (/on\w+\s*=/gi.test(sanitized)) {
      violations.push('event-handlers-removed');
      sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    }

    // Remove javascript: links
    if (/javascript:/gi.test(sanitized)) {
      violations.push('javascript-links-removed');
      sanitized = sanitized.replace(/javascript:[^"']*/gi, '');
    }

    // Remove iframe tags
    if (/<iframe[^>]*>[\s\S]*?<\/iframe>/gi.test(sanitized)) {
      violations.push('iframe-tags-removed');
      sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    }

    // Remove object and embed tags
    if (/<(object|embed)[^>]*>[\s\S]*?<\/\1>/gi.test(sanitized)) {
      violations.push('object-embed-removed');
      sanitized = sanitized.replace(/<(object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '');
    }

    // Strip all tags if requested
    if (options?.stripTags) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      violations.push('all-tags-stripped');
    }

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
      metadata: {
        originalLength: original.length,
        sanitizedLength: sanitized.length,
      },
    };
  }

  /**
   * Sanitize plain text
   */
  sanitizeText(
    text: string,
    options?: {
      maxLength?: number;
      removeEmojis?: boolean;
      normalizeWhitespace?: boolean;
      allowedCharsets?: string[];
    }
  ): SanitizationResult<string> {
    if (!text || typeof text !== 'string') {
      return {
        original: text,
        sanitized: '',
        wasModified: !!text,
        violations: text ? ['invalid-input'] : [],
      };
    }

    const original = text;
    let sanitized = text;
    const violations: string[] = [];

    // Normalize whitespace
    if (options?.normalizeWhitespace !== false) {
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
    }

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove emojis if requested
    if (options?.removeEmojis) {
      // Basic emoji removal (ES5/ES6 compatible)
      sanitized = sanitized.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
      sanitized = sanitized.replace(/[\u2600-\u26FF\u2700-\u27BF]/g, '');
    }

    // Check length
    const maxLength = options?.maxLength || SANITIZATION_CONFIG.text.maxLength;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      violations.push('text-too-long');
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
    ];

    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(sanitized)) {
        violations.push(`xss-pattern-${index}`);
        sanitized = sanitized.replace(pattern, '');
      }
    });

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
      metadata: {
        originalLength: original.length,
        sanitizedLength: sanitized.length,
      },
    };
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(
    filename: string,
    options?: {
      maxLength?: number;
      allowedExtensions?: string[];
      preserveExtension?: boolean;
    }
  ): SanitizationResult<string> {
    if (!filename || typeof filename !== 'string') {
      return {
        original: filename,
        sanitized: '',
        wasModified: !!filename,
        violations: filename ? ['invalid-input'] : [],
      };
    }

    const original = filename;
    let sanitized = filename;
    const violations: string[] = [];

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\./g, '');
    sanitized = sanitized.replace(/[\/\\]/g, '');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

    // Check extension
    const extension = sanitized.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    const allowedExtensions = options?.allowedExtensions || SANITIZATION_CONFIG.files.allowedExtensions;
    
    if (extension && !(allowedExtensions as readonly string[]).includes(extension)) {
      violations.push('forbidden-extension');
      if (!options?.preserveExtension) {
        sanitized = sanitized.replace(/\.[^.]+$/, '');
      }
    }

    // Limit length
    const maxLength = options?.maxLength || SANITIZATION_CONFIG.files.maxNameLength;
    if (sanitized.length > maxLength) {
      const nameWithoutExt = sanitized.replace(/\.[^.]+$/, '');
      const ext = sanitized.match(/\.[^.]+$/)?.[0] || '';
      const maxNameLength = maxLength - ext.length;
      sanitized = nameWithoutExt.substring(0, maxNameLength) + ext;
      violations.push('filename-too-long');
    }

    // Ensure filename isn't empty
    if (!sanitized.trim()) {
      sanitized = 'unnamed_file';
      violations.push('empty-filename');
    }

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
      metadata: {
        extension,
        hasExtension: !!extension,
      },
    };
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(
    url: string,
    options?: {
      allowedSchemes?: string[];
      allowedDomains?: string[];
      maxLength?: number;
    }
  ): SanitizationResult<string> {
    if (!url || typeof url !== 'string') {
      return {
        original: url,
        sanitized: '',
        wasModified: !!url,
        violations: url ? ['invalid-input'] : [],
      };
    }

    const original = url;
    let sanitized = url.trim();
    const violations: string[] = [];

    // Basic URL validation using built-in URL constructor
    try {
      const urlObj = new URL(sanitized);
      
      // Check scheme
      const allowedSchemes = options?.allowedSchemes || SANITIZATION_CONFIG.html.allowedSchemes;
      const scheme = urlObj.protocol.replace(':', '') as AllowedScheme;
      if (!(allowedSchemes as readonly string[]).includes(scheme)) {
        violations.push('forbidden-scheme');
        sanitized = '';
      }

      // Check domain
      if (options?.allowedDomains && !options.allowedDomains.includes(urlObj.hostname)) {
        violations.push('forbidden-domain');
        sanitized = '';
      }

      // Check length
      if (options?.maxLength && sanitized.length > options.maxLength) {
        violations.push('url-too-long');
        sanitized = sanitized.substring(0, options.maxLength);
      }

    } catch {
      violations.push('invalid-url');
      sanitized = '';
    }

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
    };
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): SanitizationResult<string> {
    if (!email || typeof email !== 'string') {
      return {
        original: email,
        sanitized: '',
        wasModified: !!email,
        violations: email ? ['invalid-input'] : [],
      };
    }

    const original = email;
    let sanitized = email.toLowerCase().trim();
    const violations: string[] = [];

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      violations.push('invalid-email');
      sanitized = '';
    }

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
    };
  }

  /**
   * Sanitize phone number
   */
  sanitizePhone(phone: string): SanitizationResult<string> {
    if (!phone || typeof phone !== 'string') {
      return {
        original: phone,
        sanitized: '',
        wasModified: !!phone,
        violations: phone ? ['invalid-input'] : [],
      };
    }

    const original = phone;
    const sanitized = phone.replace(/[^\d+\-\s()]/g, '');
    const violations: string[] = [];

    // Basic phone validation (at least 10 digits)
    const digitsOnly = sanitized.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      violations.push('invalid-phone');
    }

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
    };
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    schema?: Record<keyof T, 'html' | 'text' | 'email' | 'url' | 'phone' | 'filename'>
  ): SanitizationResult<T> {
    if (!obj || typeof obj !== 'object') {
      return {
        original: obj,
        sanitized: obj,
        wasModified: false,
        violations: ['invalid-input'],
      };
    }

    const original = { ...obj };
    const sanitized = { ...obj };
    let wasModified = false;
    const violations: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const sanitizationType = schema?.[key as keyof T] || 'text';
        let result: SanitizationResult<string>;

        switch (sanitizationType) {
          case 'html':
            result = this.sanitizeHtml(value);
            break;
          case 'email':
            result = this.sanitizeEmail(value);
            break;
          case 'url':
            result = this.sanitizeUrl(value);
            break;
          case 'phone':
            result = this.sanitizePhone(value);
            break;
          case 'filename':
            result = this.sanitizeFilename(value);
            break;
          default:
            result = this.sanitizeText(value);
        }

        (sanitized as Record<string, unknown>)[key] = result.sanitized;
        if (result.wasModified) wasModified = true;
        violations.push(...result.violations.map(v => `${key}:${v}`));

      } else if (Array.isArray(value)) {
        // Handle arrays
        const sanitizedArray = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item).sanitized : item
        );
        (sanitized as Record<string, unknown>)[key] = sanitizedArray;
        if (JSON.stringify(value) !== JSON.stringify(sanitizedArray)) {
          wasModified = true;
        }

      } else if (value && typeof value === 'object') {
        // Recursively handle nested objects
        const nestedResult = this.sanitizeObject(value as Record<string, unknown>);
        (sanitized as Record<string, unknown>)[key] = nestedResult.sanitized;
        if (nestedResult.wasModified) wasModified = true;
        violations.push(...nestedResult.violations.map(v => `${key}.${v}`));
      }
    }

    return {
      original,
      sanitized,
      wasModified,
      violations,
    };
  }

  /**
   * SQL injection prevention
   */
  preventSqlInjection(input: string): SanitizationResult<string> {
    if (!input || typeof input !== 'string') {
      return {
        original: input,
        sanitized: '',
        wasModified: !!input,
        violations: input ? ['invalid-input'] : [],
      };
    }

    const original = input;
    let sanitized = input;
    const violations: string[] = [];

    // Common SQL injection patterns
    const sqlPatterns = [
      /('|(\\')|(;)|(--)|(\s*(=|<|>|!=)\s*\d))/gi,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
      /(\*|%|_)/g,
      /(script|javascript|vbscript|onload|onerror|onclick)/gi,
    ];

    sqlPatterns.forEach((pattern, index) => {
      if (pattern.test(sanitized)) {
        violations.push(`sql-injection-pattern-${index}`);
        sanitized = sanitized.replace(pattern, '');
      }
    });

    return {
      original,
      sanitized,
      wasModified: original !== sanitized,
      violations,
    };
  }
}

// Utility functions for common sanitization tasks
export const SanitizationUtils = {
  /**
   * Quick HTML sanitization
   */
  html: (input: string): string => {
    return SanitizationService.getInstance().sanitizeHtml(input).sanitized;
  },

  /**
   * Quick text sanitization
   */
  text: (input: string): string => {
    return SanitizationService.getInstance().sanitizeText(input).sanitized;
  },

  /**
   * Quick email sanitization
   */
  email: (input: string): string => {
    return SanitizationService.getInstance().sanitizeEmail(input).sanitized;
  },

  /**
   * Quick URL sanitization
   */
  url: (input: string): string => {
    return SanitizationService.getInstance().sanitizeUrl(input).sanitized;
  },

  /**
   * Quick filename sanitization
   */
  filename: (input: string): string => {
    return SanitizationService.getInstance().sanitizeFilename(input).sanitized;
  },

  /**
   * Create sanitization middleware for forms
   */
  createFormMiddleware: (schema?: Record<string, string>) => {
    return (formData: Record<string, unknown>) => {
      return SanitizationService.getInstance().sanitizeObject(
        formData,
        schema as Record<string, 'html' | 'text' | 'email' | 'url' | 'phone' | 'filename'>
      );
    };
  },

  /**
   * Validate and sanitize user input
   */
  validateInput: (
    input: string,
    type: 'html' | 'text' | 'email' | 'url' | 'phone' | 'filename' = 'text'
  ): { isValid: boolean; sanitized: string; errors: string[] } => {
    const service = SanitizationService.getInstance();
    let result: SanitizationResult<string>;

    switch (type) {
      case 'html':
        result = service.sanitizeHtml(input);
        break;
      case 'email':
        result = service.sanitizeEmail(input);
        break;
      case 'url':
        result = service.sanitizeUrl(input);
        break;
      case 'phone':
        result = service.sanitizePhone(input);
        break;
      case 'filename':
        result = service.sanitizeFilename(input);
        break;
      default:
        result = service.sanitizeText(input);
    }

    return {
      isValid: result.violations.length === 0,
      sanitized: result.sanitized,
      errors: result.violations,
    };
  },
};

// Export singleton instance
export const sanitizationService = SanitizationService.getInstance();

export default SanitizationService;