/**
 * SEO Middleware for Vardhman Mills Frontend
 * Next.js middleware for SEO optimization and redirects
 */

import { NextRequest, NextResponse } from 'next/server';

// SEO middleware interfaces
export interface SEORedirect {
  from: string;
  to: string;
  permanent: boolean;
  type: 'exact' | 'pattern' | 'wildcard';
  reason?: string;
}

export interface SEORule {
  path: string | RegExp;
  actions: Array<{
    type: 'redirect' | 'rewrite' | 'block' | 'canonical' | 'headers';
    config: Record<string, unknown>;
  }>;
  priority: number;
  description: string;
}

export interface SecurityHeaders {
  [key: string]: string;
}

export interface SEOHeaders {
  [key: string]: string;
}

export interface MiddlewareConfig {
  redirects: SEORedirect[];
  rules: SEORule[];
  securityHeaders: SecurityHeaders;
  seoHeaders: SEOHeaders;
  blockedPaths: string[];
  allowedOrigins: string[];
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

// Default SEO redirects
export const DEFAULT_REDIRECTS: SEORedirect[] = [
  // Remove trailing slashes (except root)
  {
    from: '/(.*)/+',
    to: '/$1',
    permanent: true,
    type: 'pattern',
    reason: 'Remove trailing slashes for SEO consistency',
  },
  
  // Lowercase URLs
  {
    from: '/([A-Z]+.*)',
    to: '/$1',
    permanent: true,
    type: 'pattern',
    reason: 'Convert uppercase URLs to lowercase',
  },
  
  // Old product URLs
  {
    from: '/product-old/(.*)',
    to: '/products/$1',
    permanent: true,
    type: 'pattern',
    reason: 'Redirect old product URLs',
  },
  
  // Legacy paths
  {
    from: '/home',
    to: '/',
    permanent: true,
    type: 'exact',
    reason: 'Redirect home page to root',
  },
  
  // Remove .html extensions
  {
    from: '/(.*).html',
    to: '/$1',
    permanent: true,
    type: 'pattern',
    reason: 'Remove .html extensions',
  },
];

// Security headers
export const SECURITY_HEADERS: SecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *.googleapis.com *.gstatic.com; connect-src 'self' *.google-analytics.com *.googletagmanager.com;",
};

// SEO headers
export const SEO_HEADERS: SEOHeaders = {
  'X-Robots-Tag': 'index, follow',
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Vary': 'Accept-Encoding',
};

// Blocked paths for SEO
export const BLOCKED_PATHS: string[] = [
  '/admin',
  '/api/internal',
  '/.git',
  '/.env',
  '/config',
  '/logs',
  '/backup',
  '/tmp',
  '/temp',
];

/**
 * SEO Middleware Class
 */
export class SEOMiddleware {
  private config: MiddlewareConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config?: Partial<MiddlewareConfig>) {
    this.config = {
      redirects: DEFAULT_REDIRECTS,
      rules: [],
      securityHeaders: SECURITY_HEADERS,
      seoHeaders: SEO_HEADERS,
      blockedPaths: BLOCKED_PATHS,
      allowedOrigins: ['https://vardhmanmills.com', 'https://www.vardhmanmills.com'],
      ...config,
    };
  }

  /**
   * Main middleware handler
   */
  async handle(request: NextRequest): Promise<NextResponse> {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    const origin = request.headers.get('origin');

    // Rate limiting
    if (this.config.rateLimit && !this.checkRateLimit(request)) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    // Security checks
    if (this.isBlocked(pathname)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // CORS check
    if (origin && !this.isAllowedOrigin(origin)) {
      return new NextResponse('CORS policy violation', { status: 403 });
    }

    // Process redirects
    const redirectResponse = this.processRedirects(url, request);
    if (redirectResponse) {
      return redirectResponse;
    }

    // Process SEO rules
    const ruleResponse = await this.processRules(url, request);
    if (ruleResponse) {
      return ruleResponse;
    }

    // Add SEO and security headers
    const response = NextResponse.next();
    this.addHeaders(response, pathname);

    return response;
  }

  /**
   * Process redirects
   */
  private processRedirects(url: URL, request: NextRequest): NextResponse | null {
    const pathname = url.pathname;

    for (const redirect of this.config.redirects) {
      let shouldRedirect = false;
      let newPath = '';

      switch (redirect.type) {
        case 'exact':
          if (pathname === redirect.from) {
            shouldRedirect = true;
            newPath = redirect.to;
          }
          break;

        case 'pattern':
          const regex = new RegExp(`^${redirect.from}$`);
          const match = pathname.match(regex);
          if (match) {
            shouldRedirect = true;
            newPath = redirect.to;
            // Replace capture groups
            for (let i = 1; i < match.length; i++) {
              newPath = newPath.replace(`$${i}`, match[i]);
            }
          }
          break;

        case 'wildcard':
          if (pathname.startsWith(redirect.from.replace('*', ''))) {
            shouldRedirect = true;
            newPath = redirect.to.replace('*', pathname.substring(redirect.from.length - 1));
          }
          break;
      }

      if (shouldRedirect) {
        const newUrl = new URL(url.toString());
        newUrl.pathname = newPath;
        
        // Add redirect reason to headers for debugging
        const response = NextResponse.redirect(
          newUrl,
          redirect.permanent ? 301 : 302
        );
        
        if (redirect.reason) {
          response.headers.set('X-Redirect-Reason', redirect.reason);
        }
        
        // Log redirect for analytics
        console.log(`Redirecting ${request.url} to ${newUrl.toString()}: ${redirect.reason || 'SEO redirect'}`);

        return response;
      }
    }

    return null;
  }

  /**
   * Process SEO rules
   */
  private async processRules(url: URL, request: NextRequest): Promise<NextResponse | null> {
    const pathname = url.pathname;
    const matchingRules = this.config.rules
      .filter(rule => {
        if (typeof rule.path === 'string') {
          return pathname === rule.path;
        } else {
          return rule.path.test(pathname);
        }
      })
      .sort((a, b) => b.priority - a.priority);

    for (const rule of matchingRules) {
      for (const action of rule.actions) {
        const result = await this.executeAction(action, url, request);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  /**
   * Execute rule action
   */
  private async executeAction(
    action: SEORule['actions'][0],
    url: URL,
    request: NextRequest
  ): Promise<NextResponse | null> {
    switch (action.type) {
      case 'redirect':
        const redirectUrl = new URL(url.toString());
        redirectUrl.pathname = action.config.to as string;
        
        // Log redirect action for debugging
        console.log(`Rule-based redirect: ${request.url} -> ${redirectUrl.toString()}`);
        
        return NextResponse.redirect(
          redirectUrl,
          (action.config.permanent as boolean) ? 301 : 302
        );

      case 'rewrite':
        const rewriteUrl = new URL(url.toString());
        rewriteUrl.pathname = action.config.to as string;
        return NextResponse.rewrite(rewriteUrl);

      case 'block':
        return new NextResponse('Access denied', { status: 403 });

      case 'canonical':
        const response = NextResponse.next();
        const canonicalUrl = `${url.origin}${action.config.canonical as string}`;
        response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
        return response;

      case 'headers':
        const headerResponse = NextResponse.next();
        Object.entries(action.config as Record<string, string>).forEach(([key, value]) => {
          headerResponse.headers.set(key, value);
        });
        return headerResponse;

      default:
        return null;
    }
  }

  /**
   * Add SEO and security headers
   */
  private addHeaders(response: NextResponse, pathname: string): void {
    // Add security headers
    Object.entries(this.config.securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add SEO headers based on path
    if (this.isStaticAsset(pathname)) {
      // Static assets get long cache headers
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (this.isAPIRoute(pathname)) {
      // API routes get different cache headers
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } else {
      // Regular pages
      Object.entries(this.config.seoHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    // Add performance headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(request: NextRequest): boolean {
    if (!this.config.rateLimit) return true;

    const ip = this.getClientIP(request);
    const now = Date.now();
    const windowMs = this.config.rateLimit.windowMs;
    const maxRequests = this.config.rateLimit.maxRequests;

    const clientData = this.requestCounts.get(ip);
    
    if (!clientData || now > clientData.resetTime) {
      this.requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (clientData.count >= maxRequests) {
      return false;
    }

    clientData.count++;
    return true;
  }

  /**
   * Check if path is blocked
   */
  private isBlocked(pathname: string): boolean {
    return this.config.blockedPaths.some(blocked => 
      pathname.startsWith(blocked)
    );
  }

  /**
   * Check if origin is allowed
   */
  private isAllowedOrigin(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Check if path is static asset
   */
  private isStaticAsset(pathname: string): boolean {
    return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(pathname);
  }

  /**
   * Check if path is API route
   */
  private isAPIRoute(pathname: string): boolean {
    return pathname.startsWith('/api/');
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return 'unknown';
  }

  /**
   * Add custom redirect
   */
  addRedirect(redirect: SEORedirect): void {
    this.config.redirects.push(redirect);
  }

  /**
   * Add custom rule
   */
  addRule(rule: SEORule): void {
    this.config.rules.push(rule);
    this.config.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove redirect
   */
  removeRedirect(from: string): void {
    this.config.redirects = this.config.redirects.filter(r => r.from !== from);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): MiddlewareConfig {
    return { ...this.config };
  }
}

/**
 * Utility functions for SEO middleware
 */
export const SEOMiddlewareUtils = {
  /**
   * Create canonical redirect rule
   */
  createCanonicalRule: (path: string, canonical: string): SEORule => ({
    path,
    actions: [{
      type: 'canonical',
      config: { canonical },
    }],
    priority: 5,
    description: `Set canonical URL for ${path}`,
  }),

  /**
   * Create mobile redirect rule
   */
  createMobileRedirect: (desktopPath: string, mobilePath: string): SEORule => ({
    path: desktopPath,
    actions: [{
      type: 'redirect',
      config: {
        to: mobilePath,
        permanent: false,
      },
    }],
    priority: 7,
    description: `Redirect mobile users from ${desktopPath} to ${mobilePath}`,
  }),

  /**
   * Create noindex rule for development
   */
  createNoIndexRule: (path: string | RegExp): SEORule => ({
    path,
    actions: [{
      type: 'headers',
      config: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }],
    priority: 8,
    description: 'Add noindex directive',
  }),

  /**
   * Validate redirect configuration
   */
  validateRedirect: (redirect: SEORedirect): boolean => {
    if (!redirect.from || !redirect.to) return false;
    if (redirect.from === redirect.to) return false;
    
    // Check for redirect loops (basic check)
    if (redirect.to.includes(redirect.from)) return false;
    
    return true;
  },

  /**
   * Generate sitemap from redirects
   */
  generateSitemapFromRedirects: (redirects: SEORedirect[], baseUrl: string): string[] => {
    return redirects
      .filter(r => r.permanent && r.type === 'exact')
      .map(r => `${baseUrl}${r.to}`);
  },

  /**
   * Analyze redirect chains
   */
  analyzeRedirectChains: (redirects: SEORedirect[]): Array<{ chain: string[]; isLoop: boolean }> => {
    const chains: Array<{ chain: string[]; isLoop: boolean }> = [];
    const visited = new Set<string>();

    redirects.forEach(redirect => {
      if (visited.has(redirect.from)) return;

      const chain = [redirect.from];
      let current = redirect.to;
      const seen = new Set([redirect.from]);

      while (current) {
        if (seen.has(current)) {
          chains.push({ chain: [...chain, current], isLoop: true });
          break;
        }

        chain.push(current);
        seen.add(current);

        const nextRedirect = redirects.find(r => r.from === current);
        if (!nextRedirect) {
          chains.push({ chain, isLoop: false });
          break;
        }

        current = nextRedirect.to;
      }

      chain.forEach(path => visited.add(path));
    });

    return chains;
  },
};

// Factory function for creating middleware instance
export function createSEOMiddleware(config?: Partial<MiddlewareConfig>): SEOMiddleware {
  return new SEOMiddleware(config);
}

// Default middleware instance
export const seoMiddleware = new SEOMiddleware();

// Export for use in middleware.ts
export default function middleware(request: NextRequest): Promise<NextResponse> {
  return seoMiddleware.handle(request);
}

// Middleware configuration for Next.js
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};