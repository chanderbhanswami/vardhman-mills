/**
 * Content Security Policy (CSP) Helper for Vardhman Mills Frontend
 * Advanced CSP management and security headers
 */

import { NextRequest, NextResponse } from 'next/server';

// CSP Directive types
export type CSPDirective = 
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'media-src'
  | 'object-src'
  | 'child-src'
  | 'frame-src'
  | 'worker-src'
  | 'manifest-src'
  | 'base-uri'
  | 'form-action'
  | 'frame-ancestors'
  | 'plugin-types'
  | 'sandbox'
  | 'upgrade-insecure-requests'
  | 'block-all-mixed-content'
  | 'require-sri-for'
  | 'require-trusted-types-for'
  | 'trusted-types';

// CSP Source keywords
export type CSPSource = 
  | "'self'"
  | "'unsafe-inline'"
  | "'unsafe-eval'"
  | "'strict-dynamic'"
  | "'unsafe-hashes'"
  | "'report-sample'"
  | "'none'";

// CSP Violation Report interface
export interface CSPViolationReport {
  'blocked-uri'?: string;
  'document-uri'?: string;
  'violated-directive'?: string;
  'original-policy'?: string;
  disposition?: string;
  'effective-directive'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'source-file'?: string;
  'status-code'?: number;
  'script-sample'?: string;
}

// Processed violation report
export interface ProcessedViolationReport {
  blockedUri: string;
  documentUri: string;
  violatedDirective: string;
  disposition: string;
  timestamp: number;
}

// Security headers configuration
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: Partial<Record<CSPDirective, (string | CSPSource)[]>>;
  reportOnly?: boolean;
  reportUri?: string;
  enableNonce?: boolean;
  strictTransportSecurity?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: boolean;
  referrerPolicy?: 
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  permissionsPolicy?: Partial<Record<string, string[]>>;
}

// Default security configuration for Vardhman Mills
export const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // For inline scripts (consider removing in production)
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://checkout.razorpay.com',
      'https://api.razorpay.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // For inline styles
      'https://fonts.googleapis.com',
      'https://checkout.razorpay.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://www.google-analytics.com',
      'https://stats.g.doubleclick.net',
      'https://res.cloudinary.com', // If using Cloudinary
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://checkout.razorpay.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.razorpay.com',
      'https://checkout.razorpay.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'wss:', // For WebSocket connections
      'ws:', // For development WebSocket
    ],
    'media-src': ["'self'", 'https:', 'data:'],
    'object-src': ["'none'"],
    'frame-src': [
      "'self'",
      'https://checkout.razorpay.com',
      'https://api.razorpay.com',
    ],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  },
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    geolocation: [],
    microphone: [],
    camera: [],
    payment: ["'self'"],
    'display-capture': [],
    'fullscreen': ["'self'"],
  },
};

// CSP Service
export class CSPService {
  private static instance: CSPService;
  private nonces: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): CSPService {
    if (!CSPService.instance) {
      CSPService.instance = new CSPService();
    }
    return CSPService.instance;
  }

  /**
   * Generate a cryptographically secure nonce
   */
  generateNonce(requestId?: string): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const nonce = btoa(String.fromCharCode(...Array.from(array)));
    
    if (requestId) {
      this.nonces.set(requestId, nonce);
    }
    
    return nonce;
  }

  /**
   * Get stored nonce for request
   */
  getNonce(requestId: string): string | undefined {
    return this.nonces.get(requestId);
  }

  /**
   * Clear expired nonces
   */
  clearExpiredNonces(): void {
    // Clear all nonces older than 1 hour
    // In production, implement proper cleanup with timestamps
    this.nonces.clear();
  }

  /**
   * Build CSP header string
   */
  buildCSPHeader(
    config: Partial<Record<CSPDirective, (string | CSPSource)[]>>,
    nonce?: string,
    reportUri?: string
  ): string {
    const directives: string[] = [];

    Object.entries(config).forEach(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        let sourceList = sources.join(' ');
        
        // Add nonce to script-src and style-src if provided
        if (nonce && (directive === 'script-src' || directive === 'style-src')) {
          sourceList += ` 'nonce-${nonce}'`;
        }
        
        directives.push(`${directive} ${sourceList}`);
      } else if (Array.isArray(sources) && sources.length === 0) {
        // Handle directives without values (like upgrade-insecure-requests)
        directives.push(directive);
      }
    });

    // Add report URI if provided
    if (reportUri) {
      directives.push(`report-uri ${reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * Build Permissions Policy header
   */
  buildPermissionsPolicyHeader(config: Partial<Record<string, string[]>>): string {
    const policies: string[] = [];

    Object.entries(config).forEach(([feature, allowlist]) => {
      if (Array.isArray(allowlist)) {
        if (allowlist.length === 0) {
          policies.push(`${feature}=()`);
        } else {
          const formattedList = allowlist.map(origin => 
            origin === "'self'" ? 'self' : `"${origin}"`
          ).join(' ');
          policies.push(`${feature}=(${formattedList})`);
        }
      }
    });

    return policies.join(', ');
  }

  /**
   * Apply security headers to response
   */
  applySecurityHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig = DEFAULT_SECURITY_CONFIG,
    nonce?: string
  ): NextResponse {
    // Content Security Policy
    if (config.contentSecurityPolicy) {
      const cspHeader = this.buildCSPHeader(
        config.contentSecurityPolicy,
        nonce,
        config.reportUri
      );
      
      const headerName = config.reportOnly 
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      
      response.headers.set(headerName, cspHeader);
    }

    // Strict Transport Security
    if (config.strictTransportSecurity) {
      const { maxAge, includeSubDomains, preload } = config.strictTransportSecurity;
      let hstsValue = `max-age=${maxAge}`;
      
      if (includeSubDomains) hstsValue += '; includeSubDomains';
      if (preload) hstsValue += '; preload';
      
      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // X-Frame-Options
    if (config.xFrameOptions) {
      response.headers.set('X-Frame-Options', config.xFrameOptions);
    }

    // X-Content-Type-Options
    if (config.xContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (config.referrerPolicy) {
      response.headers.set('Referrer-Policy', config.referrerPolicy);
    }

    // Permissions Policy
    if (config.permissionsPolicy) {
      const permissionsHeader = this.buildPermissionsPolicyHeader(config.permissionsPolicy);
      response.headers.set('Permissions-Policy', permissionsHeader);
    }

    // Additional security headers
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
  }

  /**
   * Create CSP middleware
   */
  createMiddleware(config?: SecurityHeadersConfig) {
    return (request: NextRequest): NextResponse => {
      const response = NextResponse.next();
      const requestId = request.headers.get('x-request-id') || 
                       crypto.randomUUID();

      let nonce: string | undefined;
      
      // Generate nonce if enabled
      if (config?.enableNonce !== false) {
        nonce = this.generateNonce(requestId);
        response.headers.set('X-Nonce', nonce);
      }

      // Apply security headers
      this.applySecurityHeaders(response, config || DEFAULT_SECURITY_CONFIG, nonce);

      return response;
    };
  }

  /**
   * Validate CSP violations (for reporting endpoint)
   */
  validateCSPViolation(violation: unknown): violation is CSPViolationReport {
    if (!violation || typeof violation !== 'object') {
      return false;
    }

    const report = violation as Record<string, unknown>;
    const requiredFields = [
      'blocked-uri',
      'document-uri',
      'violated-directive',
      'original-policy'
    ];

    return requiredFields.every(field => 
      typeof report[field] === 'string'
    );
  }

  /**
   * Process CSP violation report
   */
  processViolationReport(violation: unknown): {
    isValid: boolean;
    processed?: ProcessedViolationReport;
  } {
    if (!this.validateCSPViolation(violation)) {
      return { isValid: false };
    }

    return {
      isValid: true,
      processed: {
        blockedUri: violation['blocked-uri'] || '',
        documentUri: violation['document-uri'] || '',
        violatedDirective: violation['violated-directive'] || '',
        disposition: violation.disposition || 'enforce',
        timestamp: Date.now(),
      },
    };
  }
}

// Utility functions
export const CSPUtils = {
  /**
   * Create nonce attribute for inline scripts/styles
   */
  nonceAttr: (nonce: string): string => `nonce="${nonce}"`,

  /**
   * Check if CSP is supported by browser
   */
  isCSPSupported: (userAgent: string): boolean => {
    // Simple check for CSP support
    return !/MSIE [6-9]/.test(userAgent);
  },

  /**
   * Generate CSP report endpoint URL
   */
  getReportEndpoint: (baseUrl: string): string => {
    return `${baseUrl}/api/security/csp-report`;
  },

  /**
   * Create inline script-safe wrapper
   */
  wrapInlineScript: (script: string, nonce?: string): string => {
    const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
    return `<script${nonceAttr}>${script}</script>`;
  },

  /**
   * Create inline style-safe wrapper
   */
  wrapInlineStyle: (styles: string, nonce?: string): string => {
    const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
    return `<style${nonceAttr}>${styles}</style>`;
  },
};

// CSP React Hook (for client-side usage)
export function useCSP() {
  const getNonce = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get nonce from meta tag or headers
    const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
    return metaNonce || null;
  };

  const isCSPEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check if CSP headers are present
    return !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  };

  return {
    getNonce,
    isCSPEnabled,
  };
}

// Export singleton instance
export const cspService = CSPService.getInstance();

export default CSPService;