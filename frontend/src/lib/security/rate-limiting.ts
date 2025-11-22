/**
 * Rate Limiting for Vardhman Mills Frontend
 * Comprehensive rate limiting and abuse prevention
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (request: NextRequest, identifier: string) => void;
  message?: string;
  standardHeaders?: boolean; // Add X-RateLimit headers
  legacyHeaders?: boolean; // Add X-RateLimit-* headers
}

// Rate limit store interface
export interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
  reset(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
  identifier: string;
}

// In-memory store implementation
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private timers = new Map<string, NodeJS.Timeout>();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry || entry.resetTime < Date.now()) {
      return null;
    }
    return entry.count;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    const resetTime = Date.now() + ttl;
    this.store.set(key, { count: value, resetTime });
    this.setCleanupTimer(key, ttl);
  }

  async increment(key: string, ttl: number): Promise<number> {
    const existing = await this.get(key);
    const newCount = (existing || 0) + 1;
    await this.set(key, newCount, ttl);
    return newCount;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  private setCleanupTimer(key: string, ttl: number): void {
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }
}

// Redis store implementation (for production)
export class RedisStore implements RateLimitStore {
  private redis: {
    get: (key: string) => Promise<string | null>;
    setex: (key: string, seconds: number, value: string | number) => Promise<void>;
    multi: () => {
      incr: (key: string) => { expire: (key: string, seconds: number) => { exec: () => Promise<[[null, number]]> } };
    };
    del: (key: string) => Promise<void>;
    flushdb: () => Promise<void>;
  };

  constructor(redisClient: RedisStore['redis']) {
    this.redis = redisClient;
  }

  async get(key: string): Promise<number | null> {
    try {
      const value = await this.redis.get(key);
      return value ? parseInt(value, 10) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, Math.ceil(ttl / 1000), value);
    } catch {
      // Handle Redis errors gracefully
    }
  }

  async increment(key: string, ttl: number): Promise<number> {
    try {
      const result = await this.redis.multi()
        .incr(key)
        .expire(key, Math.ceil(ttl / 1000))
        .exec();
      
      return result[0][1] || 1;
    } catch {
      return 1;
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      // Handle Redis errors gracefully
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch {
      // Handle Redis errors gracefully
    }
  }
}

// Rate limiter class
export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      onLimitReached: () => {},
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      ...config,
    };
    this.store = store || new MemoryStore();
  }

  /**
   * Default key generator (uses IP address)
   */
  private defaultKeyGenerator(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';
    return `rate_limit:${ip}`;
  }

  /**
   * Check rate limit for request
   */
  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const identifier = this.config.keyGenerator(request);
    const key = `${identifier}:${Math.floor(Date.now() / this.config.windowMs)}`;
    
    const currentRequests = await this.store.increment(key, this.config.windowMs);
    const resetTime = new Date(Math.ceil(Date.now() / this.config.windowMs) * this.config.windowMs);
    
    const result: RateLimitResult = {
      allowed: currentRequests <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - currentRequests),
      resetTime,
      totalRequests: currentRequests,
      identifier,
    };

    if (!result.allowed) {
      this.config.onLimitReached(request, identifier);
    }

    return result;
  }

  /**
   * Apply rate limiting middleware
   */
  async middleware(request: NextRequest): Promise<NextResponse | null> {
    const result = await this.checkLimit(request);

    // Create response with rate limit headers
    let response: NextResponse;

    if (!result.allowed) {
      response = NextResponse.json(
        { error: this.config.message },
        { status: 429 }
      );
    } else {
      response = NextResponse.next();
    }

    // Add rate limit headers
    if (this.config.standardHeaders) {
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
    }

    if (this.config.legacyHeaders) {
      response.headers.set('X-Rate-Limit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-Rate-Limit-Remaining', result.remaining.toString());
      response.headers.set('X-Rate-Limit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
    }

    return result.allowed ? null : response;
  }

  /**
   * Reset rate limit for identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = `${identifier}:${Math.floor(Date.now() / this.config.windowMs)}`;
    await this.store.reset(key);
  }

  /**
   * Get current limit status
   */
  async getStatus(identifier: string): Promise<Omit<RateLimitResult, 'allowed'>> {
    const key = `${identifier}:${Math.floor(Date.now() / this.config.windowMs)}`;
    const currentRequests = await this.store.get(key) || 0;
    const resetTime = new Date(Math.ceil(Date.now() / this.config.windowMs) * this.config.windowMs);

    return {
      remaining: Math.max(0, this.config.maxRequests - currentRequests),
      resetTime,
      totalRequests: currentRequests,
      identifier,
    };
  }
}

// Predefined rate limiters
export const RateLimitPresets = {
  /**
   * Strict rate limiting for authentication endpoints
   */
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again in 15 minutes.',
  },

  /**
   * API rate limiting
   */
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'API rate limit exceeded, please slow down.',
  },

  /**
   * Contact form rate limiting
   */
  contactForm: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 submissions per hour
    message: 'Too many form submissions, please try again later.',
  },

  /**
   * Search rate limiting
   */
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Too many search requests, please slow down.',
  },

  /**
   * General web requests
   */
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
    message: 'Rate limit exceeded, please try again later.',
  },

  /**
   * Password reset rate limiting
   */
  passwordReset: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 attempts per window
    message: 'Too many password reset attempts, please try again in 15 minutes.',
  },

  /**
   * OTP/2FA rate limiting
   */
  otp: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 OTP requests per 5 minutes
    message: 'Too many OTP requests, please wait before requesting again.',
  },
} as const;

// Advanced rate limiting with multiple tiers
export class TieredRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map();

  constructor(configs: Record<string, RateLimitConfig>, store?: RateLimitStore) {
    for (const [tier, config] of Object.entries(configs)) {
      this.limiters.set(tier, new RateLimiter(config, store));
    }
  }

  /**
   * Check multiple rate limits
   */
  async checkLimits(request: NextRequest, tiers: string[]): Promise<RateLimitResult[]> {
    const results: RateLimitResult[] = [];

    for (const tier of tiers) {
      const limiter = this.limiters.get(tier);
      if (limiter) {
        const result = await limiter.checkLimit(request);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Apply tiered rate limiting
   */
  async middleware(request: NextRequest, tiers: string[]): Promise<NextResponse | null> {
    const results = await this.checkLimits(request, tiers);
    const blockedResult = results.find(result => !result.allowed);

    if (blockedResult) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          tier: tiers[results.indexOf(blockedResult)],
          resetTime: blockedResult.resetTime.toISOString(),
        },
        { status: 429 }
      );

      // Add headers from the most restrictive limit
      const mostRestrictive = results.reduce((prev, current) => 
        current.remaining < prev.remaining ? current : prev
      );

      response.headers.set('X-RateLimit-Limit', '0');
      response.headers.set('X-RateLimit-Remaining', mostRestrictive.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(mostRestrictive.resetTime.getTime() / 1000).toString());

      return response;
    }

    return null;
  }
}

// Utility functions
export const RateLimitUtils = {
  /**
   * Create rate limiter with preset configuration
   */
  createLimiter: (preset: keyof typeof RateLimitPresets, store?: RateLimitStore): RateLimiter => {
    const config = RateLimitPresets[preset];
    return new RateLimiter(config, store);
  },

  /**
   * Create custom key generator
   */
  createKeyGenerator: (
    strategy: 'ip' | 'user' | 'session' | 'custom',
    customFn?: (request: NextRequest) => string
  ) => {
    return (request: NextRequest): string => {
      switch (strategy) {
        case 'ip':
          const forwarded = request.headers.get('x-forwarded-for');
          const ip = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 'unknown';
          return `rate_limit:ip:${ip}`;

        case 'user':
          const userId = request.headers.get('x-user-id') || 
                        request.cookies.get('user-id')?.value || 'anonymous';
          return `rate_limit:user:${userId}`;

        case 'session':
          const sessionId = request.cookies.get('session-id')?.value || 'no-session';
          return `rate_limit:session:${sessionId}`;

        case 'custom':
          return customFn ? customFn(request) : 'rate_limit:custom';

        default:
          return 'rate_limit:default';
      }
    };
  },

  /**
   * Get client identifier from request
   */
  getClientIdentifier: (request: NextRequest): string => {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent}`;
  },

  /**
   * Create sliding window rate limiter
   */
  createSlidingWindow: (config: RateLimitConfig, store?: RateLimitStore): RateLimiter => {
    const slidingConfig = {
      ...config,
      keyGenerator: (request: NextRequest) => {
        const baseKey = config.keyGenerator ? config.keyGenerator(request) : 
                       RateLimitUtils.getClientIdentifier(request);
        // Use current minute for sliding window
        const window = Math.floor(Date.now() / (config.windowMs / 60));
        return `${baseKey}:${window}`;
      },
    };

    return new RateLimiter(slidingConfig, store);
  },

  /**
   * Check if request is from trusted source
   */
  isTrustedSource: (request: NextRequest, trustedIPs: string[] = []): boolean => {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip');

    if (!ip) return false;

    // Check against trusted IPs
    return trustedIPs.includes(ip) || ip === '127.0.0.1' || ip === '::1';
  },
};

// Export default instances
export const defaultRateLimiter = new RateLimiter(RateLimitPresets.general);
export const authRateLimiter = new RateLimiter(RateLimitPresets.auth);
export const apiRateLimiter = new RateLimiter(RateLimitPresets.api);

export default RateLimiter;