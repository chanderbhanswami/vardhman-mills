/**
 * Redis Cache Configuration
 * Redis caching and session management configuration
 * @module config/redis
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RedisConfig {
  enabled: boolean;
  connection: RedisConnectionConfig;
  options: RedisOptions;
  cache: CacheConfig;
  session: SessionConfig;
  rateLimit: RateLimitConfig;
  pubsub: PubSubConfig;
  monitoring: MonitoringConfig;
}

export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
  username?: string;
  tls?: boolean;
  url?: string;
}

export interface RedisOptions {
  retryStrategy: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    factor: number;
  };
  connectionTimeout: number;
  commandTimeout: number;
  keepAlive: number;
  noDelay: boolean;
  lazyConnect: boolean;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  maxRetriesPerRequest: number;
  reconnectOnError: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  prefix: string;
  ttl: TTLConfig;
  serialization: {
    enabled: boolean;
    compress: boolean;
  };
  invalidation: {
    enabled: boolean;
    strategies: string[];
  };
}

export interface TTLConfig {
  default: number;
  short: number;
  medium: number;
  long: number;
  permanent: number;
  keys: Record<string, number>;
}

export interface SessionConfig {
  enabled: boolean;
  prefix: string;
  ttl: number;
  rolling: boolean;
  saveUninitialized: boolean;
  resave: boolean;
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
  };
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyPrefix: string;
  limits: {
    [key: string]: {
      windowMs: number;
      max: number;
    };
  };
}

export interface PubSubConfig {
  enabled: boolean;
  channels: string[];
  patterns: string[];
  messageTimeout: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  slowLogThreshold: number;
  logCommands: boolean;
  metrics: {
    hits: boolean;
    misses: boolean;
    keys: boolean;
    memory: boolean;
    connections: boolean;
  };
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || '';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DATABASE = parseInt(process.env.REDIS_DATABASE || '0', 10);
const REDIS_USERNAME = process.env.REDIS_USERNAME || '';
const REDIS_TLS = process.env.REDIS_TLS === 'true';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const ENABLE_REDIS = process.env.ENABLE_REDIS !== 'false';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const redisConfig: RedisConfig = {
  enabled: ENABLE_REDIS,

  // Connection Configuration
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    database: REDIS_DATABASE,
    username: REDIS_USERNAME || undefined,
    tls: REDIS_TLS,
    url: REDIS_URL || undefined,
  },

  // Redis Options
  options: {
    retryStrategy: {
      maxAttempts: 10,
      initialDelay: 100, // ms
      maxDelay: 3000, // ms
      factor: 2,
    },
    connectionTimeout: 10000, // 10 seconds
    commandTimeout: 5000, // 5 seconds
    keepAlive: 30000, // 30 seconds
    noDelay: true,
    lazyConnect: false,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    reconnectOnError: true,
  },

  // Cache Configuration
  cache: {
    enabled: true,
    prefix: 'vardhman:',
    ttl: {
      default: 3600, // 1 hour
      short: 300, // 5 minutes
      medium: 1800, // 30 minutes
      long: 86400, // 24 hours
      permanent: 2592000, // 30 days
      
      // Specific key patterns
      keys: {
        'user:*': 1800, // 30 minutes
        'product:*': 3600, // 1 hour
        'category:*': 7200, // 2 hours
        'cart:*': 1800, // 30 minutes
        'session:*': 86400, // 24 hours
        'auth:token:*': 3600, // 1 hour
        'otp:*': 300, // 5 minutes
        'rate:limit:*': 60, // 1 minute
        'api:response:*': 300, // 5 minutes
        'search:*': 600, // 10 minutes
      },
    },
    serialization: {
      enabled: true,
      compress: IS_PRODUCTION,
    },
    invalidation: {
      enabled: true,
      strategies: ['manual', 'ttl', 'lru'],
    },
  },

  // Session Configuration
  session: {
    enabled: true,
    prefix: 'sess:',
    ttl: 86400, // 24 hours
    rolling: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: IS_PRODUCTION,
      httpOnly: true,
      maxAge: 86400000, // 24 hours in milliseconds
      sameSite: 'lax',
      path: '/',
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1 minute
    max: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyPrefix: 'rl:',
    
    // Specific endpoint limits
    limits: {
      'auth:login': {
        windowMs: 900000, // 15 minutes
        max: 5, // 5 attempts
      },
      'auth:register': {
        windowMs: 3600000, // 1 hour
        max: 3, // 3 registrations
      },
      'auth:otp': {
        windowMs: 300000, // 5 minutes
        max: 3, // 3 OTP requests
      },
      'api:public': {
        windowMs: 60000, // 1 minute
        max: 60, // 60 requests
      },
      'api:authenticated': {
        windowMs: 60000, // 1 minute
        max: 120, // 120 requests
      },
      'api:admin': {
        windowMs: 60000, // 1 minute
        max: 200, // 200 requests
      },
      'payments:create': {
        windowMs: 300000, // 5 minutes
        max: 10, // 10 payment attempts
      },
      'search:query': {
        windowMs: 60000, // 1 minute
        max: 30, // 30 searches
      },
    },
  },

  // Pub/Sub Configuration
  pubsub: {
    enabled: true,
    channels: [
      'notifications',
      'orders',
      'payments',
      'inventory',
      'cache:invalidate',
    ],
    patterns: [
      'user:*',
      'order:*',
      'product:*',
    ],
    messageTimeout: 5000,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: IS_PRODUCTION,
    slowLogThreshold: 100, // ms
    logCommands: !IS_PRODUCTION,
    metrics: {
      hits: true,
      misses: true,
      keys: true,
      memory: true,
      connections: true,
    },
  },
};

// ============================================================================
// CACHE KEY PATTERNS
// ============================================================================

export const cacheKeys = {
  // User related
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  userCart: (id: string) => `user:${id}:cart`,
  userWishlist: (id: string) => `user:${id}:wishlist`,
  userAddresses: (id: string) => `user:${id}:addresses`,
  userOrders: (id: string) => `user:${id}:orders`,
  
  // Product related
  product: (id: string) => `product:${id}`,
  productSlug: (slug: string) => `product:slug:${slug}`,
  products: (page: number, limit: number) => `products:list:${page}:${limit}`,
  productsByCategory: (categoryId: string, page: number) => `products:category:${categoryId}:${page}`,
  featuredProducts: () => `products:featured`,
  relatedProducts: (id: string) => `products:${id}:related`,
  
  // Category related
  category: (id: string) => `category:${id}`,
  categorySlug: (slug: string) => `category:slug:${slug}`,
  categories: () => `categories:all`,
  categoryTree: () => `categories:tree`,
  
  // Cart related
  cart: (id: string) => `cart:${id}`,
  cartSession: (sessionId: string) => `cart:session:${sessionId}`,
  
  // Order related
  order: (id: string) => `order:${id}`,
  orderNumber: (orderNumber: string) => `order:number:${orderNumber}`,
  
  // Session & Auth related
  session: (sessionId: string) => `session:${sessionId}`,
  authToken: (token: string) => `auth:token:${token}`,
  refreshToken: (token: string) => `auth:refresh:${token}`,
  otp: (phone: string) => `otp:${phone}`,
  resetToken: (email: string) => `reset:${email}`,
  
  // Search related
  search: (query: string, filters: string) => `search:${query}:${filters}`,
  searchSuggestions: (query: string) => `search:suggestions:${query}`,
  
  // API response caching
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
  
  // Rate limiting
  rateLimit: (ip: string, endpoint: string) => `rl:${ip}:${endpoint}`,
  
  // Analytics
  analytics: (type: string, date: string) => `analytics:${type}:${date}`,
  
  // Settings & Config
  settings: () => `settings:app`,
  config: (key: string) => `config:${key}`,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build Redis connection URL
 */
export const buildRedisURL = (): string => {
  if (redisConfig.connection.url) {
    return redisConfig.connection.url;
  }

  const { host, port, password, username, database, tls } = redisConfig.connection;
  const protocol = tls ? 'rediss' : 'redis';
  const auth = username && password 
    ? `${username}:${password}@` 
    : password 
    ? `:${password}@` 
    : '';

  return `${protocol}://${auth}${host}:${port}/${database}`;
};

/**
 * Get cache key with prefix
 */
export const getCacheKey = (key: string): string => {
  return `${redisConfig.cache.prefix}${key}`;
};

/**
 * Get TTL for cache key
 */
export const getTTL = (key: string): number => {
  // Check specific key patterns
  for (const [pattern, ttl] of Object.entries(redisConfig.cache.ttl.keys)) {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    if (regex.test(key)) {
      return ttl;
    }
  }
  
  return redisConfig.cache.ttl.default;
};

/**
 * Generate cache key from object
 */
export const generateCacheKey = (prefix: string, params: Record<string, unknown>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  
  return getCacheKey(`${prefix}:${sortedParams}`);
};

/**
 * Check if Redis is configured
 */
export const isRedisConfigured = (): boolean => {
  return !!(
    redisConfig.enabled &&
    (redisConfig.connection.url || 
     (redisConfig.connection.host && redisConfig.connection.port))
  );
};

/**
 * Get retry delay based on attempt number
 */
export const getRetryDelay = (attempt: number): number => {
  const { initialDelay, maxDelay, factor } = redisConfig.options.retryStrategy;
  const delay = initialDelay * Math.pow(factor, attempt - 1);
  return Math.min(delay, maxDelay);
};

/**
 * Get rate limit key
 */
export const getRateLimitKey = (identifier: string, endpoint?: string): string => {
  const base = `${redisConfig.rateLimit.keyPrefix}${identifier}`;
  return endpoint ? `${base}:${endpoint}` : base;
};

/**
 * Get rate limit config for endpoint
 */
export const getRateLimitConfig = (endpoint: string) => {
  return redisConfig.rateLimit.limits[endpoint] || {
    windowMs: redisConfig.rateLimit.windowMs,
    max: redisConfig.rateLimit.max,
  };
};

/**
 * Get session key
 */
export const getSessionKey = (sessionId: string): string => {
  return `${redisConfig.session.prefix}${sessionId}`;
};

/**
 * Parse cache value
 */
export const parseCacheValue = <T>(value: string | null): T | null => {
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

/**
 * Stringify cache value
 */
export const stringifyCacheValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

/**
 * Get pub/sub channel
 */
export const getPubSubChannel = (channel: string): string => {
  return `${redisConfig.cache.prefix}${channel}`;
};

/**
 * Build cache invalidation pattern
 */
export const buildInvalidationPattern = (prefix: string): string => {
  return `${redisConfig.cache.prefix}${prefix}*`;
};

/**
 * Get connection info (sanitized)
 */
export const getConnectionInfo = () => ({
  host: redisConfig.connection.host,
  port: redisConfig.connection.port,
  database: redisConfig.connection.database,
  tls: redisConfig.connection.tls,
  configured: isRedisConfigured(),
});

/**
 * Get cache stats structure
 */
export const getCacheStatsStructure = () => ({
  hits: 0,
  misses: 0,
  keys: 0,
  memory: 0,
  hitRate: 0,
  avgTTL: 0,
});

/**
 * Calculate cache hit rate
 */
export const calculateHitRate = (hits: number, misses: number): number => {
  const total = hits + misses;
  return total > 0 ? (hits / total) * 100 : 0;
};

/**
 * Get memory usage in MB
 */
export const formatMemoryUsage = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

/**
 * Check if key should be cached
 */
export const shouldCache = (key: string): boolean => {
  if (!redisConfig.cache.enabled) return false;
  
  // Add custom logic to determine if specific keys should be cached
  const noCachePatterns = ['temp:', 'lock:', 'queue:'];
  return !noCachePatterns.some(pattern => key.startsWith(pattern));
};

/**
 * Get compression threshold
 */
export const getCompressionThreshold = (): number => {
  return 1024; // 1KB - compress values larger than this
};

/**
 * Should compress value
 */
export const shouldCompress = (value: string): boolean => {
  return (
    redisConfig.cache.serialization.compress &&
    value.length > getCompressionThreshold()
  );
};

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

export const cacheStrategies = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
} as const;

// ============================================================================
// REDIS COMMANDS SHORTCUTS
// ============================================================================

export const redisCommands = {
  // String operations
  GET: 'GET',
  SET: 'SET',
  SETEX: 'SETEX',
  DEL: 'DEL',
  INCR: 'INCR',
  DECR: 'DECR',
  
  // Hash operations
  HGET: 'HGET',
  HSET: 'HSET',
  HDEL: 'HDEL',
  HGETALL: 'HGETALL',
  
  // List operations
  LPUSH: 'LPUSH',
  RPUSH: 'RPUSH',
  LPOP: 'LPOP',
  RPOP: 'RPOP',
  LRANGE: 'LRANGE',
  
  // Set operations
  SADD: 'SADD',
  SREM: 'SREM',
  SMEMBERS: 'SMEMBERS',
  SISMEMBER: 'SISMEMBER',
  
  // Sorted set operations
  ZADD: 'ZADD',
  ZREM: 'ZREM',
  ZRANGE: 'ZRANGE',
  ZREVRANGE: 'ZREVRANGE',
  
  // Key operations
  KEYS: 'KEYS',
  SCAN: 'SCAN',
  EXISTS: 'EXISTS',
  EXPIRE: 'EXPIRE',
  TTL: 'TTL',
  
  // Pub/Sub
  PUBLISH: 'PUBLISH',
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default redisConfig;

export {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_DATABASE,
  NODE_ENV,
  IS_PRODUCTION,
  ENABLE_REDIS,
};
