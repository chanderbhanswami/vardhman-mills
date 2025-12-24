/**
 * Next.js Middleware - Vardhman Mills Frontend
 * Comprehensive middleware implementation with authentication, security, i18n, rate limiting, and analytics
 */

import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

// Import constants
import {
  PROTECTED_ROUTES,
  GUEST_ONLY_ROUTES,
  AUTH_ROUTES,
  ACCOUNT_ROUTES,
  SHOPPING_ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES
} from '@/constants/routes.constants';
import {
  USER_ROLES,
  SESSION_CONFIG,
  AUTH_CONSTANTS
} from '@/constants/auth.constants';

// Rate limiting store (in-memory for simplicity, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers configuration
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' http://127.0.0.1:5000 https://www.google-analytics.com https://api.razorpay.com https://checkout.razorpay.com; " +
    "frame-src 'self' https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self';",
};

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Supported locales
const SUPPORTED_LOCALES = ['en', 'hi', 'pa'] as const;
const DEFAULT_LOCALE = 'en';

type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * Rate Limiting Implementation
 */
function checkRateLimit(ip: string, limit: number = 100, window: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + window });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Clean expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  rateLimitStore.forEach((entry, ip) => {
    if (now > entry.resetTime) {
      entriesToDelete.push(ip);
    }
  });

  entriesToDelete.forEach(ip => rateLimitStore.delete(ip));
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return 'unknown';
}

/**
 * Detect locale from request
 */
function detectLocale(request: NextRequest): Locale {
  // Check URL pathname for locale
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = SUPPORTED_LOCALES.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    return pathnameLocale;
  }

  // Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value as Locale;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().split('-')[0]);

    for (const lang of preferredLanguages) {
      const locale = SUPPORTED_LOCALES.find(l => l === lang);
      if (locale) {
        return locale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => {
    if (typeof route === 'string') {
      return pathname === route || pathname.startsWith(`${route}/`);
    }
    return false;
  });
}

/**
 * Check if route is guest only
 */
function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some(route => {
    if (typeof route === 'string') {
      return pathname === route || pathname.startsWith(`${route}/`);
    }
    return false;
  });
}

/**
 * Check if route is admin route
 */
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') ||
    Object.values(ADMIN_ROUTES).some(route => pathname.startsWith(route as string));
}

/**
 * Check if route is API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api');
}

/**
 * Check if user has required role
 */
function hasRequiredRole(token: JWT | null, requiredRole: string): boolean {
  if (!token) return false;

  const userRole = (token.role as string) || USER_ROLES.USER;

  // Admin has access to everything
  if (userRole === USER_ROLES.ADMIN) return true;

  // Check specific role
  return userRole === requiredRole;
}

/**
 * Get redirect URL for authentication
 */
function getAuthRedirectUrl(request: NextRequest, path: string): URL {
  const redirectUrl = new URL(path, request.url);

  // Store the original URL for redirect after login
  const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
  if (callbackUrl !== '/') {
    redirectUrl.searchParams.set('callbackUrl', callbackUrl);
  }

  return redirectUrl;
}

/**
 * Analytics tracking (GTM data layer push)
 */
function trackPageView(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  const referrer = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';

  // Set analytics cookies/headers for client-side tracking
  response.headers.set('X-Page-Path', pathname);
  response.headers.set('X-Referrer', referrer);
  response.headers.set('X-User-Agent', userAgent);

  return response;
}

/**
 * Handle CORS preflight requests
 */
function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin') || '*';
    const response = new NextResponse(null, { status: 204 });

    response.headers.set('Access-Control-Allow-Origin', origin);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return null;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  // Allow requests from same origin and specific trusted origins
  if (origin) {
    const allowedOrigins = [
      process.env.NEXTAUTH_URL || '',
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

/**
 * Handle locale redirection
 */
function handleLocaleRedirect(request: NextRequest, locale: Locale): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Skip if already has locale or is API route
  if (
    pathname.startsWith(`/${locale}`) ||
    isApiRoute(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.includes('/public/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|json|xml|txt)$/)
  ) {
    return null;
  }

  // Add locale to URL if needed
  if (!SUPPORTED_LOCALES.some(l => pathname.startsWith(`/${l}`))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 31536000, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    return response;
  }

  return null;
}

/**
 * Log request for monitoring
 */
function logRequest(request: NextRequest, token: JWT | null, action: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log({
      timestamp: new Date().toISOString(),
      action,
      path: request.nextUrl.pathname,
      method: request.method,
      userId: token?.sub || 'anonymous',
      userRole: token?.role || 'guest',
      ip: getClientIp(request),
    });
  }
}

/**
 * Main Middleware Function
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();

  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) {
    return addSecurityHeaders(corsResponse);
  }

  const { pathname, search } = request.nextUrl;
  const fullPath = pathname + search; // Full URL path with query params

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/public/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/) ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const isRateLimitOk = checkRateLimit(clientIp, 100, 60000); // 100 requests per minute

  if (!isRateLimitOk) {
    logRequest(request, null, 'RATE_LIMIT_EXCEEDED');
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        ...SECURITY_HEADERS,
      },
    });
  }

  // Detect locale
  const locale = DEFAULT_LOCALE; // Temporarily hardcoded to avoid redirects

  // TEMPORARILY DISABLED: Handle locale redirection for non-API routes
  // const localeRedirect = handleLocaleRedirect(request, locale);
  // if (localeRedirect) {
  //   return addSecurityHeaders(localeRedirect);
  // }

  // Get authentication token
  let token: JWT | null = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error('Error getting token:', error);
  }

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) || USER_ROLES.GUEST;

  // Use pathname directly (no locale prefix removal for now)
  const cleanPathname = pathname;

  // Handle admin routes (separate admin panel)
  if (isAdminRoute(cleanPathname)) {
    logRequest(request, token, 'ADMIN_ACCESS_ATTEMPT');

    // Redirect to admin panel (separate application)
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || '/admin';
    return NextResponse.redirect(new URL(adminUrl, request.url));
  }

  // Handle guest-only routes (redirect authenticated users)
  if (isGuestOnlyRoute(cleanPathname) && isAuthenticated) {
    logRequest(request, token, 'GUEST_ROUTE_REDIRECT');

    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectPath = callbackUrl || ACCOUNT_ROUTES.DASHBOARD;

    return NextResponse.redirect(new URL(`/${locale}${redirectPath}`, request.url));
  }

  // Handle protected routes (require authentication)
  if (isProtectedRoute(cleanPathname) && !isAuthenticated) {
    logRequest(request, token, 'AUTH_REQUIRED');

    const loginUrl = getAuthRedirectUrl(request, `/${locale}${AUTH_ROUTES.LOGIN}`);
    return NextResponse.redirect(loginUrl);
  }

  // Additional protection for checkout routes (require authentication)
  if (cleanPathname.startsWith(SHOPPING_ROUTES.CHECKOUT) && !isAuthenticated) {
    logRequest(request, token, 'CHECKOUT_AUTH_REQUIRED');

    const loginUrl = getAuthRedirectUrl(request, `/${locale}${AUTH_ROUTES.LOGIN}`);
    return NextResponse.redirect(loginUrl);
  }

  // Check for session timeout (last activity check)
  if (isAuthenticated && token) {
    const tokenIat = token.iat;
    if (tokenIat && typeof tokenIat === 'number') {
      const tokenAge = Date.now() - (tokenIat * 1000);

      if (tokenAge > SESSION_CONFIG.TIMEOUT) {
        logRequest(request, token, 'SESSION_TIMEOUT');

        // Clear session and redirect to login
        const response = NextResponse.redirect(
          getAuthRedirectUrl(request, `/${locale}${AUTH_ROUTES.LOGIN}`)
        );

        response.cookies.delete(AUTH_CONSTANTS.TOKEN_KEY);
        response.cookies.delete(AUTH_CONSTANTS.SESSION_KEY);

        return addSecurityHeaders(response);
      }
    }
  }

  // Role-based access control for specific routes
  if (cleanPathname.startsWith(ACCOUNT_ROUTES.DASHBOARD) && isAuthenticated) {
    // Check if user has proper role
    if (!hasRequiredRole(token, USER_ROLES.USER)) {
      logRequest(request, token, 'INSUFFICIENT_PERMISSIONS');

      return NextResponse.redirect(new URL(`/${locale}${PUBLIC_ROUTES.HOME}`, request.url));
    }
  }

  // Create response
  let response = NextResponse.next();

  // Add security headers
  response = addSecurityHeaders(response);

  // Add CORS headers for API routes
  if (isApiRoute(cleanPathname)) {
    response = addCorsHeaders(request, response);
  }

  // TEMPORARILY DISABLED: Add locale cookie
  // response.cookies.set('NEXT_LOCALE', locale, {
  //   maxAge: 31536000, // 1 year
  //   path: '/',
  //   sameSite: 'lax',
  // });

  // Update last activity timestamp
  if (isAuthenticated) {
    response.cookies.set(AUTH_CONSTANTS.LAST_ACTIVITY_KEY, Date.now().toString(), {
      maxAge: SESSION_CONFIG.TIMEOUT / 1000,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // Add performance metrics
  const duration = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Middleware-Version', '1.0.0');

  // Track page view for analytics
  response = trackPageView(request, response);

  // Add user context headers for client-side use
  if (isAuthenticated && token) {
    response.headers.set('X-User-Id', token.sub || '');
    response.headers.set('X-User-Role', userRole);
    response.headers.set('X-User-Email', token.email || '');
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-Id', requestId);

  // Add full path for debugging
  response.headers.set('X-Full-Path', fullPath);

  // Log successful request
  logRequest(request, token, 'SUCCESS');

  return response;
}

/**
 * Middleware Configuration
 * Define which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};
