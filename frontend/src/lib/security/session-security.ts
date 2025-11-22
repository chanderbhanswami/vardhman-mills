/**
 * Session Security Management for Vardhman Mills Frontend
 * Secure session handling, token management, and session validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Session configuration
export const SESSION_CONFIG = {
  cookieName: 'vardhman-session',
  refreshCookieName: 'vardhman-refresh',
  maxAge: 15 * 60, // 15 minutes for access token
  refreshMaxAge: 7 * 24 * 60 * 60, // 7 days for refresh token
  renewalThreshold: 5 * 60, // Renew when 5 minutes left
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict' as const,
  domain: process.env.COOKIE_DOMAIN,
} as const;

// JWT Secret (should be in environment variables)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars'
);

// Session payload interface
export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  fingerprint?: string;
  lastActivity: number;
}

// Session validation result
export interface SessionValidationResult {
  isValid: boolean;
  payload?: SessionPayload;
  needsRenewal?: boolean;
  error?: string;
}

// Device fingerprint interface
export interface DeviceFingerprint {
  userAgent: string;
  ipAddress: string;
  acceptLanguage: string;
  acceptEncoding: string;
  timezone?: string;
}

// Session Security Service
export class SessionSecurityService {
  private static instance: SessionSecurityService;

  private constructor() {}

  static getInstance(): SessionSecurityService {
    if (!SessionSecurityService.instance) {
      SessionSecurityService.instance = new SessionSecurityService();
    }
    return SessionSecurityService.instance;
  }

  /**
   * Create a new secure session token
   */
  async createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp' | 'sessionId'>): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = Math.floor(Date.now() / 1000);

    const sessionPayload: SessionPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      permissions: payload.permissions as string[],
      fingerprint: payload.fingerprint as string | undefined,
      sessionId,
      lastActivity: now,
      iat: now,
      exp: now + SESSION_CONFIG.maxAge,
    };

    const token = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(now + SESSION_CONFIG.maxAge)
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Create a refresh token
   */
  async createRefreshToken(sessionId: string, userId: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const refreshPayload = {
      sessionId,
      userId,
      type: 'refresh',
      iat: now,
      exp: now + SESSION_CONFIG.refreshMaxAge,
    };

    const refreshToken = await new SignJWT(refreshPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(now + SESSION_CONFIG.refreshMaxAge)
      .sign(JWT_SECRET);

    return refreshToken;
  }

  /**
   * Validate session token
   */
  async validateSessionToken(token: string, fingerprint?: DeviceFingerprint): Promise<SessionValidationResult> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const sessionPayload = payload as SessionPayload;

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (sessionPayload.exp && sessionPayload.exp < now) {
        return {
          isValid: false,
          error: 'Token expired',
        };
      }

      // Check if token needs renewal
      const needsRenewal = !!(sessionPayload.exp && (sessionPayload.exp - now) < SESSION_CONFIG.renewalThreshold);

      // Validate device fingerprint if provided
      if (fingerprint && sessionPayload.fingerprint) {
        const isValidFingerprint = this.validateFingerprint(sessionPayload.fingerprint, fingerprint);
        if (!isValidFingerprint) {
          return {
            isValid: false,
            error: 'Invalid device fingerprint',
          };
        }
      }

      // Check session activity
      if (this.isSessionInactive(sessionPayload.lastActivity)) {
        return {
          isValid: false,
          error: 'Session inactive',
        };
      }

      return {
        isValid: true,
        payload: sessionPayload,
        needsRenewal,
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  /**
   * Refresh session token
   */
  async refreshSessionToken(refreshToken: string, newActivity?: Partial<SessionPayload>): Promise<string | null> {
    try {
      const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get current session data (from database or cache)
      const currentSession = await this.getStoredSession(payload.sessionId as string);
      if (!currentSession) {
        throw new Error('Session not found');
      }

      // Create new session token
      const newToken = await this.createSessionToken({
        ...currentSession,
        ...newActivity,
        lastActivity: Math.floor(Date.now() / 1000),
      });

      return newToken;

    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  /**
   * Generate device fingerprint
   */
  generateFingerprint(request: NextRequest): DeviceFingerprint {
    return {
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: this.getClientIP(request),
      acceptLanguage: request.headers.get('accept-language') || '',
      acceptEncoding: request.headers.get('accept-encoding') || '',
      timezone: request.headers.get('x-timezone') || undefined,
    };
  }

  /**
   * Validate device fingerprint
   */
  private validateFingerprint(stored: string, current: DeviceFingerprint): boolean {
    try {
      const storedFingerprint = JSON.parse(stored) as DeviceFingerprint;
      
      // Check critical components
      return (
        storedFingerprint.userAgent === current.userAgent &&
        storedFingerprint.ipAddress === current.ipAddress &&
        storedFingerprint.acceptLanguage === current.acceptLanguage
      );
    } catch {
      return false;
    }
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
   * Check if session is inactive
   */
  private isSessionInactive(lastActivity: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const maxInactivity = 60 * 60; // 1 hour
    return (now - lastActivity) > maxInactivity;
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store session data (implement based on your storage solution)
   */
  private async getStoredSession(sessionId: string): Promise<SessionPayload | null> {
    // Implement session storage retrieval
    // This could be Redis, database, or other storage
    console.log('Getting stored session:', sessionId);
    return null;
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      // Implement session invalidation
      // Remove from storage and blacklist
      console.log('Invalidating session:', sessionId);
      return true;
    } catch (error) {
      console.error('Session invalidation error:', error);
      return false;
    }
  }

  /**
   * Set secure session cookies
   */
  setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
    response.cookies.set(SESSION_CONFIG.cookieName, accessToken, {
      maxAge: SESSION_CONFIG.maxAge,
      secure: SESSION_CONFIG.secure,
      httpOnly: SESSION_CONFIG.httpOnly,
      sameSite: SESSION_CONFIG.sameSite,
      domain: SESSION_CONFIG.domain,
      path: '/',
    });

    response.cookies.set(SESSION_CONFIG.refreshCookieName, refreshToken, {
      maxAge: SESSION_CONFIG.refreshMaxAge,
      secure: SESSION_CONFIG.secure,
      httpOnly: SESSION_CONFIG.httpOnly,
      sameSite: SESSION_CONFIG.sameSite,
      domain: SESSION_CONFIG.domain,
      path: '/',
    });
  }

  /**
   * Clear session cookies
   */
  clearSessionCookies(response: NextResponse): void {
    response.cookies.delete(SESSION_CONFIG.cookieName);
    response.cookies.delete(SESSION_CONFIG.refreshCookieName);
  }

  /**
   * Create session middleware
   */
  createMiddleware(options?: {
    requireAuth?: boolean;
    allowedRoles?: string[];
    renewThreshold?: number;
  }) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;
      
      if (!token) {
        if (options?.requireAuth) {
          return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return null;
      }

      const fingerprint = this.generateFingerprint(request);
      const validation = await this.validateSessionToken(token, fingerprint);

      if (!validation.isValid) {
        const response = new NextResponse(
          JSON.stringify({ error: validation.error || 'Invalid session' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
        this.clearSessionCookies(response);
        return response;
      }

      // Check role permissions
      if (options?.allowedRoles && validation.payload) {
        const hasPermission = options.allowedRoles.includes(validation.payload.role);
        if (!hasPermission) {
          return new NextResponse(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Handle token renewal
      if (validation.needsRenewal && validation.payload) {
        const refreshToken = request.cookies.get(SESSION_CONFIG.refreshCookieName)?.value;
        if (refreshToken) {
          const newToken = await this.refreshSessionToken(refreshToken, {
            lastActivity: Math.floor(Date.now() / 1000),
          });

          if (newToken) {
            const response = NextResponse.next();
            response.cookies.set(SESSION_CONFIG.cookieName, newToken, {
              maxAge: SESSION_CONFIG.maxAge,
              secure: SESSION_CONFIG.secure,
              httpOnly: SESSION_CONFIG.httpOnly,
              sameSite: SESSION_CONFIG.sameSite,
              domain: SESSION_CONFIG.domain,
              path: '/',
            });
            return response;
          }
        }
      }

      return null; // Continue processing
    };
  }
}

// Utility functions
export const SessionUtils = {
  /**
   * Get current session from cookies
   */
  getCurrentSession: async (): Promise<SessionPayload | null> => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_CONFIG.cookieName)?.value;
      
      if (!token) return null;

      const service = SessionSecurityService.getInstance();
      const validation = await service.validateSessionToken(token);
      
      return validation.isValid ? validation.payload || null : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const session = await SessionUtils.getCurrentSession();
    return !!session;
  },

  /**
   * Check if user has specific role
   */
  hasRole: async (role: string): Promise<boolean> => {
    const session = await SessionUtils.getCurrentSession();
    return session?.role === role;
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: async (permission: string): Promise<boolean> => {
    const session = await SessionUtils.getCurrentSession();
    return session?.permissions?.includes(permission) || false;
  },
};

// Export singleton instance
export const sessionSecurity = SessionSecurityService.getInstance();

export default SessionSecurityService;