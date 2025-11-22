/**
 * XSS Protection for Vardhman Mills Frontend
 * Cross-site scripting prevention with content security policy and output encoding
 */

import { NextRequest, NextResponse } from 'next/server';

// XSS protection configuration
export const XSS_PROTECTION_CONFIG = {
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.google.com', 'https://www.gstatic.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://api.razorpay.com', 'wss:', 'ws:'],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  },
  outputEncoding: {
    html: true,
    javascript: true,
    css: true,
    url: true,
    attribute: true,
  },
  inputValidation: {
    maxLength: 10000,
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
    stripTags: true,
  },
} as const;

// XSS detection patterns
const XSS_PATTERNS = [
  // Script injection
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  
  // Event handlers
  /on\w+\s*=/gi,
  
  // HTML injection
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /<object[^>]*>[\s\S]*?<\/object>/gi,
  /<embed[^>]*>[\s\S]*?<\/embed>/gi,
  /<form[^>]*>[\s\S]*?<\/form>/gi,
  
  // Meta refresh
  /<meta[^>]*http-equiv[^>]*refresh[^>]*>/gi,
  
  // Link injection
  /<link[^>]*>/gi,
  
  // Style injection
  /<style[^>]*>[\s\S]*?<\/style>/gi,
  /expression\s*\(/gi,
  /@import/gi,
  
  // Data URIs
  /data:[\w\/\+]+;base64,/gi,
] as const;

// XSS validation result
export interface XSSValidationResult {
  isClean: boolean;
  threats: string[];
  sanitized: string;
  confidence: number;
}

// Output encoding types
export type OutputEncodingType = 'html' | 'javascript' | 'css' | 'url' | 'attribute';

// XSS Protection Service
export class XSSProtectionService {
  private static instance: XSSProtectionService;

  private constructor() {}

  static getInstance(): XSSProtectionService {
    if (!XSSProtectionService.instance) {
      XSSProtectionService.instance = new XSSProtectionService();
    }
    return XSSProtectionService.instance;
  }

  /**
   * Validate input for XSS threats
   */
  validateInput(input: string): XSSValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isClean: true,
        threats: [],
        sanitized: '',
        confidence: 1.0,
      };
    }

    const threats: string[] = [];
    let sanitized = input;
    let confidence = 1.0;

    // Check against XSS patterns
    XSS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(input)) {
        threats.push(`xss-pattern-${index}`);
        sanitized = sanitized.replace(pattern, '');
        confidence -= 0.1;
      }
    });

    // Additional context-aware checks
    if (this.hasObfuscatedPayload(input)) {
      threats.push('obfuscated-payload');
      confidence -= 0.2;
    }

    if (this.hasEncodedPayload(input)) {
      threats.push('encoded-payload');
      confidence -= 0.2;
    }

    // Normalize confidence
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      isClean: threats.length === 0,
      threats,
      sanitized,
      confidence,
    };
  }

  /**
   * Check for obfuscated XSS payloads
   */
  private hasObfuscatedPayload(input: string): boolean {
    const obfuscationPatterns = [
      /String\.fromCharCode/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /\\x[0-9a-f]{2}/gi,
      /\\u[0-9a-f]{4}/gi,
      /&#x[0-9a-f]+;/gi,
      /&#\d+;/gi,
    ];

    return obfuscationPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for encoded XSS payloads
   */
  private hasEncodedPayload(input: string): boolean {
    try {
      const decoded = decodeURIComponent(input);
      if (decoded !== input) {
        return XSS_PATTERNS.some(pattern => pattern.test(decoded));
      }
    } catch {
      // Invalid encoding
    }

    try {
      const b64Decoded = atob(input);
      return XSS_PATTERNS.some(pattern => pattern.test(b64Decoded));
    } catch {
      // Not base64
    }

    return false;
  }

  /**
   * Sanitize input by removing XSS threats
   */
  sanitizeInput(
    input: string,
    options?: {
      allowedTags?: string[];
      stripTags?: boolean;
      maxLength?: number;
    }
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;
    const maxLength = options?.maxLength || XSS_PROTECTION_CONFIG.inputValidation.maxLength;

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Remove XSS patterns
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Strip all HTML tags if requested
    if (options?.stripTags !== false) {
      const allowedTags = options?.allowedTags || XSS_PROTECTION_CONFIG.inputValidation.allowedTags;
      if (allowedTags.length === 0 || options?.stripTags) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
      } else {
        // Remove non-allowed tags
        sanitized = sanitized.replace(/<(?!\/?(?:${allowedTags.join('|')})\b)[^>]*>/gi, '');
      }
    }

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Output encoding for different contexts
   */
  encodeOutput(input: string, context: OutputEncodingType): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    switch (context) {
      case 'html':
        return this.encodeHtml(input);
      case 'javascript':
        return this.encodeJavaScript(input);
      case 'css':
        return this.encodeCSS(input);
      case 'url':
        return this.encodeURL(input);
      case 'attribute':
        return this.encodeAttribute(input);
      default:
        return this.encodeHtml(input);
    }
  }

  /**
   * HTML entity encoding
   */
  private encodeHtml(input: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
  }

  /**
   * JavaScript encoding
   */
  private encodeJavaScript(input: string): string {
    return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, char => {
      const code = char.charCodeAt(0);
      return code < 16 ? '\\x0' + code.toString(16) : '\\x' + code.toString(16);
    }).replace(/['"\\]/g, char => '\\' + char);
  }

  /**
   * CSS encoding
   */
  private encodeCSS(input: string): string {
    return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, char => {
      const code = char.charCodeAt(0);
      return '\\' + code.toString(16) + ' ';
    }).replace(/['"\\]/g, char => '\\' + char);
  }

  /**
   * URL encoding
   */
  private encodeURL(input: string): string {
    return encodeURIComponent(input);
  }

  /**
   * HTML attribute encoding
   */
  private encodeAttribute(input: string): string {
    const attrEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };

    return input.replace(/[&<>"']/g, char => attrEntities[char] || char);
  }

  /**
   * Generate Content Security Policy header
   */
  generateCSPHeader(customDirectives?: Partial<typeof XSS_PROTECTION_CONFIG.csp>): string {
    const directives = { ...XSS_PROTECTION_CONFIG.csp, ...customDirectives };
    
    const cspParts: string[] = [];
    
    Object.entries(directives).forEach(([directive, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        cspParts.push(`${directive} ${values.join(' ')}`);
      } else if (Array.isArray(values) && values.length === 0) {
        // Directives without values (like upgrade-insecure-requests)
        cspParts.push(directive);
      }
    });

    return cspParts.join('; ');
  }

  /**
   * Create XSS protection middleware
   */
  createMiddleware(options?: {
    csp?: Partial<typeof XSS_PROTECTION_CONFIG.csp>;
    validateInput?: boolean;
    sanitizeInput?: boolean;
  }) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const response = NextResponse.next();

      // Set XSS protection headers
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Set Content Security Policy
      const cspHeader = this.generateCSPHeader(options?.csp);
      response.headers.set('Content-Security-Policy', cspHeader);

      // Validate input if requested
      if (options?.validateInput && request.method === 'POST') {
        try {
          const body = await request.text();
          const validation = this.validateInput(body);
          
          if (!validation.isClean && validation.confidence < 0.7) {
            return new NextResponse(
              JSON.stringify({
                error: 'Potential XSS threat detected',
                threats: validation.threats,
                confidence: validation.confidence,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        } catch {
          // Unable to parse body, continue
        }
      }

      return response;
    };
  }
}

// React hooks for XSS protection
export function useXSSProtection() {
  const xssService = XSSProtectionService.getInstance();

  const validateInput = (input: string): XSSValidationResult => {
    return xssService.validateInput(input);
  };

  const sanitizeInput = (input: string, options?: {
    allowedTags?: string[];
    stripTags?: boolean;
    maxLength?: number;
  }): string => {
    return xssService.sanitizeInput(input, options);
  };

  const encodeOutput = (input: string, context: OutputEncodingType): string => {
    return xssService.encodeOutput(input, context);
  };

  return {
    validateInput,
    sanitizeInput,
    encodeOutput,
  };
}

// Utility functions
export const XSSUtils = {
  /**
   * Quick input sanitization
   */
  sanitize: (input: string): string => {
    return XSSProtectionService.getInstance().sanitizeInput(input);
  },

  /**
   * Quick HTML encoding
   */
  encodeHtml: (input: string): string => {
    return XSSProtectionService.getInstance().encodeOutput(input, 'html');
  },

  /**
   * Quick JavaScript encoding
   */
  encodeJs: (input: string): string => {
    return XSSProtectionService.getInstance().encodeOutput(input, 'javascript');
  },

  /**
   * Quick URL encoding
   */
  encodeUrl: (input: string): string => {
    return XSSProtectionService.getInstance().encodeOutput(input, 'url');
  },

  /**
   * Validate if input is safe
   */
  isSafe: (input: string): boolean => {
    const result = XSSProtectionService.getInstance().validateInput(input);
    return result.isClean && result.confidence > 0.8;
  },

  /**
   * Create safe HTML template
   */
  createSafeTemplate: (template: string, data: Record<string, string>): string => {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const encodedValue = XSSProtectionService.getInstance().encodeOutput(value, 'html');
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), encodedValue);
    });
    return result;
  },

  /**
   * Generate nonce for CSP
   */
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const chars: string[] = [];
    for (let i = 0; i < array.length; i++) {
      chars.push(String.fromCharCode(array[i]));
    }
    return btoa(chars.join(''));
  },
};

// Export singleton instance
export const xssProtectionService = XSSProtectionService.getInstance();

export default XSSProtectionService;