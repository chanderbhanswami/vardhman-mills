/**
 * reCAPTCHA Integration for Vardhman Mills Frontend
 * Google reCAPTCHA v2 and v3 implementation
 */

import { NextRequest } from 'next/server';

// reCAPTCHA configuration
export const RECAPTCHA_CONFIG = {
  v2: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || '',
    secretKey: process.env.RECAPTCHA_V2_SECRET_KEY || '',
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
  },
  v3: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || '',
    secretKey: process.env.RECAPTCHA_V3_SECRET_KEY || '',
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
    minScore: 0.5, // Minimum score for v3 (0.0 to 1.0)
  },
} as const;

// reCAPTCHA verification response
export interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number; // v3 only
  action?: string; // v3 only
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// reCAPTCHA verification result
export interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  errors?: string[];
  hostname?: string;
  timestamp?: Date;
}

// reCAPTCHA service class
export class RecaptchaService {
  private static instance: RecaptchaService;

  private constructor() {}

  static getInstance(): RecaptchaService {
    if (!RecaptchaService.instance) {
      RecaptchaService.instance = new RecaptchaService();
    }
    return RecaptchaService.instance;
  }

  /**
   * Verify reCAPTCHA v2 token
   */
  async verifyV2Token(
    token: string,
    remoteip?: string
  ): Promise<RecaptchaResult> {
    try {
      const response = await fetch(RECAPTCHA_CONFIG.v2.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: RECAPTCHA_CONFIG.v2.secretKey,
          response: token,
          ...(remoteip && { remoteip }),
        }),
      });

      const data: RecaptchaVerificationResponse = await response.json();

      return {
        success: data.success,
        errors: data['error-codes'],
        hostname: data.hostname,
        timestamp: data.challenge_ts ? new Date(data.challenge_ts) : undefined,
      };

    } catch (error) {
      console.error('reCAPTCHA v2 verification error:', error);
      return {
        success: false,
        errors: ['verification-failed'],
      };
    }
  }

  /**
   * Verify reCAPTCHA v3 token
   */
  async verifyV3Token(
    token: string,
    expectedAction: string,
    remoteip?: string,
    minScore?: number
  ): Promise<RecaptchaResult> {
    try {
      const response = await fetch(RECAPTCHA_CONFIG.v3.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: RECAPTCHA_CONFIG.v3.secretKey,
          response: token,
          ...(remoteip && { remoteip }),
        }),
      });

      const data: RecaptchaVerificationResponse = await response.json();

      const scoreThreshold = minScore ?? RECAPTCHA_CONFIG.v3.minScore;
      const scoreValid = data.score !== undefined && data.score >= scoreThreshold;
      const actionValid = !expectedAction || data.action === expectedAction;

      return {
        success: data.success && scoreValid && actionValid,
        score: data.score,
        action: data.action,
        errors: [
          ...(data['error-codes'] || []),
          ...(!scoreValid ? ['low-score'] : []),
          ...(!actionValid ? ['action-mismatch'] : []),
        ],
        hostname: data.hostname,
        timestamp: data.challenge_ts ? new Date(data.challenge_ts) : undefined,
      };

    } catch (error) {
      console.error('reCAPTCHA v3 verification error:', error);
      return {
        success: false,
        errors: ['verification-failed'],
      };
    }
  }

  /**
   * Verify reCAPTCHA token from request
   */
  async verifyFromRequest(
    request: NextRequest,
    version: 'v2' | 'v3' = 'v3',
    expectedAction?: string
  ): Promise<RecaptchaResult> {
    // Extract token from request
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      return {
        success: false,
        errors: ['missing-token'],
      };
    }

    // Get client IP
    const remoteip = this.getClientIP(request);

    // Verify based on version
    if (version === 'v2') {
      return this.verifyV2Token(token, remoteip);
    } else {
      return this.verifyV3Token(
        token,
        expectedAction || 'submit',
        remoteip
      );
    }
  }

  /**
   * Extract reCAPTCHA token from request
   */
  private extractTokenFromRequest(request: NextRequest): string | null {
    // Try header first
    const headerToken = request.headers.get('x-recaptcha-token');
    if (headerToken) return headerToken;

    // Try URL search params for GET requests
    const url = new URL(request.url);
    const paramToken = url.searchParams.get('g-recaptcha-response');
    if (paramToken) return paramToken;

    return null;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') ||
               request.headers.get('cf-connecting-ip') ||
               '0.0.0.0';
    return ip.trim();
  }

  /**
   * Check if reCAPTCHA is properly configured
   */
  isConfigured(version: 'v2' | 'v3' = 'v3'): boolean {
    if (version === 'v2') {
      return !!(RECAPTCHA_CONFIG.v2.siteKey && RECAPTCHA_CONFIG.v2.secretKey);
    }
    return !!(RECAPTCHA_CONFIG.v3.siteKey && RECAPTCHA_CONFIG.v3.secretKey);
  }
}

// React hooks for reCAPTCHA
export function useRecaptchaV2() {
  const siteKey = RECAPTCHA_CONFIG.v2.siteKey;

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.grecaptcha) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const executeRecaptcha = (callback: (token: string | null) => void): void => {
    if (!window.grecaptcha || !siteKey) {
      callback(null);
      return;
    }

    window.grecaptcha.execute(siteKey, { action: 'submit' }).then(callback);
  };

  const renderRecaptcha = (): number | null => {
    if (!window.grecaptcha || !siteKey) return null;

    // Note: render method is for v2 invisible reCAPTCHA, not commonly used
    // For v2 checkbox, use the standard widget insertion method
    console.warn('render method not available in current interface');
    return null;
  };

  return {
    siteKey,
    loadScript,
    executeRecaptcha,
    renderRecaptcha,
    isConfigured: !!siteKey,
  };
}

export function useRecaptchaV3() {
  const siteKey = RECAPTCHA_CONFIG.v3.siteKey;

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.grecaptcha) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const executeRecaptcha = (action: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!window.grecaptcha || !siteKey) {
        resolve(null);
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action }).then(resolve);
      });
    });
  };

  return {
    siteKey,
    loadScript,
    executeRecaptcha,
    isConfigured: !!siteKey,
  };
}

// reCAPTCHA middleware for API routes
export async function recaptchaMiddleware(
  request: NextRequest,
  options?: {
    version?: 'v2' | 'v3';
    action?: string;
    minScore?: number;
    onError?: (errors: string[]) => Response;
  }
): Promise<Response | null> {
  const recaptchaService = RecaptchaService.getInstance();
  const version = options?.version || 'v3';

  // Check if reCAPTCHA is configured
  if (!recaptchaService.isConfigured(version)) {
    console.warn('reCAPTCHA not configured, skipping verification');
    return null; // Continue without verification in development
  }

  // Verify reCAPTCHA
  const result = await recaptchaService.verifyFromRequest(
    request,
    version,
    options?.action
  );

  if (!result.success) {
    const errors = result.errors || ['verification-failed'];
    
    if (options?.onError) {
      return options.onError(errors);
    }

    return new Response(
      JSON.stringify({
        error: 'reCAPTCHA verification failed',
        details: errors,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Additional score check for v3
  if (version === 'v3' && options?.minScore) {
    const score = result.score || 0;
    if (score < options.minScore) {
      return new Response(
        JSON.stringify({
          error: 'reCAPTCHA score too low',
          score,
          required: options.minScore,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return null; // Continue processing
}

// Utility functions
export const RecaptchaUtils = {
  /**
   * Get error message for error code
   */
  getErrorMessage: (errorCode: string): string => {
    const messages: Record<string, string> = {
      'missing-input-secret': 'The secret parameter is missing',
      'invalid-input-secret': 'The secret parameter is invalid or malformed',
      'missing-input-response': 'The response parameter is missing',
      'invalid-input-response': 'The response parameter is invalid or malformed',
      'bad-request': 'The request is invalid or malformed',
      'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously',
      'low-score': 'reCAPTCHA score is too low',
      'action-mismatch': 'reCAPTCHA action does not match expected action',
      'verification-failed': 'reCAPTCHA verification failed',
      'missing-token': 'reCAPTCHA token is missing',
    };

    return messages[errorCode] || `Unknown error: ${errorCode}`;
  },

  /**
   * Validate reCAPTCHA configuration
   */
  validateConfig: (version: 'v2' | 'v3' = 'v3'): boolean => {
    const config = version === 'v2' ? RECAPTCHA_CONFIG.v2 : RECAPTCHA_CONFIG.v3;
    return !!(config.siteKey && config.secretKey);
  },

  /**
   * Create reCAPTCHA verification middleware
   */
  createMiddleware: (options?: {
    version?: 'v2' | 'v3';
    action?: string;
    minScore?: number;
  }) => {
    return (request: NextRequest) => recaptchaMiddleware(request, options);
  },
};

// Global declarations for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      reset: () => void;
    };
  }
}

// Export singleton instance
export const recaptchaService = RecaptchaService.getInstance();

export default RecaptchaService;