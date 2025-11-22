/**
 * CSRF Protection for Vardhman Mills Frontend
 * Cross-Site Request Forgery protection utilities
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// CSRF configuration
export const CSRF_CONFIG = {
  tokenName: '_csrf',
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf-token',
  secretLength: 32,
  tokenLength: 64,
  maxAge: 86400, // 24 hours in seconds
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false, // Allow client-side access for headers
} as const;

// CSRF token interface
export interface CSRFToken {
  token: string;
  secret: string;
  timestamp: number;
  expires: number;
}

// CSRF validation result
export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  newToken?: string;
}

// CSRF service class
export class CSRFService {
  private static instance: CSRFService;

  private constructor() {}

  static getInstance(): CSRFService {
    if (!CSRFService.instance) {
      CSRFService.instance = new CSRFService();
    }
    return CSRFService.instance;
  }

  /**
   * Generate cryptographically secure random bytes
   */
  private generateRandomBytes(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate CSRF secret
   */
  generateSecret(): string {
    return this.generateRandomBytes(CSRF_CONFIG.secretLength);
  }

  /**
   * Generate CSRF token from secret
   */
  generateToken(secret: string): string {
    const timestamp = Date.now().toString();
    const randomPart = this.generateRandomBytes(16);
    const payload = `${secret}:${timestamp}:${randomPart}`;
    
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex') + ':' + timestamp + ':' + randomPart;
  }

  /**
   * Create new CSRF token pair
   */
  createTokenPair(): CSRFToken {
    const secret = this.generateSecret();
    const token = this.generateToken(secret);
    const timestamp = Date.now();
    const expires = timestamp + (CSRF_CONFIG.maxAge * 1000);

    return {
      token,
      secret,
      timestamp,
      expires,
    };
  }

  /**
   * Validate CSRF token
   */
  validateToken(token: string, secret: string): CSRFValidationResult {
    if (!token || !secret) {
      return { valid: false, error: 'Missing CSRF token or secret' };
    }

    try {
      const parts = token.split(':');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [hash, timestamp, randomPart] = parts;
      const tokenTimestamp = parseInt(timestamp, 10);

      // Check token expiration
      if (Date.now() > tokenTimestamp + (CSRF_CONFIG.maxAge * 1000)) {
        return { valid: false, error: 'Token expired' };
      }

      // Reconstruct expected token
      const payload = `${secret}:${timestamp}:${randomPart}`;
      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Use constant-time comparison
      if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
        return { valid: false, error: 'Invalid token' };
      }

      return { valid: true };

    } catch {
      return { valid: false, error: 'Token validation failed' };
    }
  }

  /**
   * Validate token with automatic refresh
   */
  validateWithRefresh(token: string, secret: string): CSRFValidationResult {
    const validation = this.validateToken(token, secret);

    if (!validation.valid) {
      return validation;
    }

    // Check if token is close to expiration (refresh if < 1 hour remaining)
    const parts = token.split(':');
    const tokenTimestamp = parseInt(parts[1], 10);
    const timeUntilExpiry = (tokenTimestamp + (CSRF_CONFIG.maxAge * 1000)) - Date.now();
    
    if (timeUntilExpiry < 3600000) { // Less than 1 hour
      const newToken = this.generateToken(secret);
      return { valid: true, newToken };
    }

    return validation;
  }

  /**
   * Extract CSRF token from request
   */
  extractTokenFromRequest(request: NextRequest): string | null {
    // Try header first
    const headerToken = request.headers.get(CSRF_CONFIG.headerName);
    if (headerToken) {
      return headerToken;
    }

    // Try form data (skip for now as it's async)
    // Form data extraction would need to be handled in async context

    // Try cookie
    const cookieToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  /**
   * Extract CSRF secret from request
   */
  extractSecretFromRequest(request: NextRequest): string | null {
    // Secret should be stored in secure httpOnly cookie
    const secret = request.cookies.get(`${CSRF_CONFIG.cookieName}-secret`)?.value;
    return secret || null;
  }

  /**
   * Set CSRF token in response
   */
  setTokenInResponse(response: NextResponse, tokenPair: CSRFToken): void {
    // Set token cookie (accessible to JavaScript)
    response.cookies.set(CSRF_CONFIG.cookieName, tokenPair.token, {
      maxAge: CSRF_CONFIG.maxAge,
      sameSite: CSRF_CONFIG.sameSite,
      secure: CSRF_CONFIG.secure,
      httpOnly: false,
      path: '/',
    });

    // Set secret cookie (httpOnly for security)
    response.cookies.set(`${CSRF_CONFIG.cookieName}-secret`, tokenPair.secret, {
      maxAge: CSRF_CONFIG.maxAge,
      sameSite: CSRF_CONFIG.sameSite,
      secure: CSRF_CONFIG.secure,
      httpOnly: true,
      path: '/',
    });

    // Also set as header for immediate use
    response.headers.set(CSRF_CONFIG.headerName, tokenPair.token);
  }

  /**
   * Clear CSRF tokens from response
   */
  clearTokensFromResponse(response: NextResponse): void {
    response.cookies.delete(CSRF_CONFIG.cookieName);
    response.cookies.delete(`${CSRF_CONFIG.cookieName}-secret`);
  }
}

// Middleware function for CSRF protection
export async function csrfProtection(
  request: NextRequest,
  options?: {
    excludePaths?: string[];
    methods?: string[];
    onError?: (error: string) => NextResponse;
  }
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip CSRF protection for excluded paths
  if (options?.excludePaths?.some(path => pathname.startsWith(path))) {
    return null;
  }

  // Skip for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(method)) {
    return null;
  }

  // Only protect specified methods if configured
  if (options?.methods && !options.methods.includes(method)) {
    return null;
  }

  const csrfService = CSRFService.getInstance();

  // Extract tokens from request
  const token = csrfService.extractTokenFromRequest(request);
  const secret = csrfService.extractSecretFromRequest(request);

  if (!token || !secret) {
    const error = 'CSRF token missing';
    if (options?.onError) {
      return options.onError(error);
    }
    return NextResponse.json({ error }, { status: 403 });
  }

  // Validate token
  const validation = csrfService.validateWithRefresh(token, secret);
  if (!validation.valid) {
    const error = validation.error || 'CSRF validation failed';
    if (options?.onError) {
      return options.onError(error);
    }
    return NextResponse.json({ error }, { status: 403 });
  }

  // If token was refreshed, set new token in response
  if (validation.newToken) {
    const response = NextResponse.next();
    response.headers.set(CSRF_CONFIG.headerName, validation.newToken);
    response.cookies.set(CSRF_CONFIG.cookieName, validation.newToken, {
      maxAge: CSRF_CONFIG.maxAge,
      sameSite: CSRF_CONFIG.sameSite,
      secure: CSRF_CONFIG.secure,
      httpOnly: false,
      path: '/',
    });
    return response;
  }

  return null; // Continue processing
}

// React hook for CSRF token management
export function useCSRFToken() {
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${CSRF_CONFIG.cookieName}=`)
    );
    
    if (csrfCookie) {
      return csrfCookie.split('=')[1];
    }

    // Try to get from meta tag
    const metaTag = document.querySelector(`meta[name="${CSRF_CONFIG.tokenName}"]`);
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    return null;
  };

  const setTokenInHeaders = (headers: Record<string, string>): Record<string, string> => {
    const token = getToken();
    if (token) {
      headers[CSRF_CONFIG.headerName] = token;
    }
    return headers;
  };

  const appendTokenToFormData = (formData: FormData): FormData => {
    const token = getToken();
    if (token) {
      formData.append(CSRF_CONFIG.tokenName, token);
    }
    return formData;
  };

  return {
    getToken,
    setTokenInHeaders,
    appendTokenToFormData,
    tokenName: CSRF_CONFIG.tokenName,
    headerName: CSRF_CONFIG.headerName,
  };
}

// API route helper for CSRF token generation
export async function generateCSRFTokenResponse(): Promise<NextResponse> {
  const csrfService = CSRFService.getInstance();
  const tokenPair = csrfService.createTokenPair();
  
  const response = NextResponse.json({
    token: tokenPair.token,
    expires: tokenPair.expires,
  });

  csrfService.setTokenInResponse(response, tokenPair);
  return response;
}

// Utility functions
export const CSRFUtils = {
  /**
   * Create CSRF middleware for API routes
   */
  createMiddleware: (options?: {
    excludePaths?: string[];
    methods?: string[];
  }) => {
    return (request: NextRequest) => csrfProtection(request, options);
  },

  /**
   * Validate CSRF token manually
   */
  validateRequest: async (request: NextRequest): Promise<CSRFValidationResult> => {
    const csrfService = CSRFService.getInstance();
    const token = csrfService.extractTokenFromRequest(request);
    const secret = csrfService.extractSecretFromRequest(request);

    if (!token || !secret) {
      return { valid: false, error: 'Missing CSRF token or secret' };
    }

    return csrfService.validateToken(token, secret);
  },

  /**
   * Generate token for server-side rendering
   */
  generateTokenForSSR: (): CSRFToken => {
    const csrfService = CSRFService.getInstance();
    return csrfService.createTokenPair();
  },

  /**
   * Check if path should be protected
   */
  shouldProtectPath: (pathname: string, excludePaths?: string[]): boolean => {
    if (!excludePaths) return true;
    return !excludePaths.some(path => pathname.startsWith(path));
  },
};

// Export singleton instance
export const csrfService = CSRFService.getInstance();

export default CSRFService;