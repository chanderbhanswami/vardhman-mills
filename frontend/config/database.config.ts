/**
 * Database Configuration
 * MongoDB and database connection settings
 * @module config/database
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DatabaseConfig {
  mongodb: MongoDBConfig;
  connection: ConnectionConfig;
  pools: PoolConfig;
  indexes: IndexConfig;
  queries: QueryConfig;
  backup: BackupConfig;
  monitoring: MonitoringConfig;
}

export interface MongoDBConfig {
  enabled: boolean;
  uri: string;
  database: string;
  options: MongoDBOptions;
}

export interface MongoDBOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  maxPoolSize: number;
  minPoolSize: number;
  socketTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  heartbeatFrequencyMS: number;
  retryWrites: boolean;
  retryReads: boolean;
  w: string | number;
  journal: boolean;
  readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  authSource: string;
  ssl: boolean;
  sslValidate: boolean;
  compressors: string[];
}

export interface ConnectionConfig {
  autoConnect: boolean;
  reconnectTries: number;
  reconnectInterval: number;
  bufferMaxEntries: number;
  bufferCommands: boolean;
  connectionTimeout: number;
  maxConnectionAttempts: number;
}

export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

export interface IndexConfig {
  autoCreate: boolean;
  background: boolean;
  sparse: boolean;
  unique: boolean;
  expireAfterSeconds?: number;
}

export interface QueryConfig {
  defaultLimit: number;
  maxLimit: number;
  defaultSort: Record<string, 1 | -1>;
  allowDiskUse: boolean;
  explain: boolean;
  timeout: number;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  location: string;
  compression: boolean;
  incremental: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  slowQueryThreshold: number;
  logQueries: boolean;
  metrics: {
    connections: boolean;
    operations: boolean;
    network: boolean;
    memory: boolean;
  };
}

// ============================================================================
// COLLECTION SCHEMAS
// ============================================================================

export interface CollectionSchema {
  name: string;
  indexes: IndexDefinition[];
  validation?: ValidationSchema;
  options?: CollectionOptions;
}

export interface IndexDefinition {
  name: string;
  keys: Record<string, 1 | -1 | 'text'>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    expireAfterSeconds?: number;
    partialFilterExpression?: Record<string, unknown>;
  };
}

export interface ValidationSchema {
  validator: Record<string, unknown>;
  validationLevel: 'strict' | 'moderate';
  validationAction: 'error' | 'warn';
}

export interface CollectionOptions {
  capped?: boolean;
  size?: number;
  max?: number;
  autoIndexId?: boolean;
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'vardhman_mills';
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || '';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const databaseConfig: DatabaseConfig = {
  // MongoDB Configuration
  mongodb: {
    enabled: true,
    uri: MONGODB_URI,
    database: MONGODB_DATABASE,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: IS_PRODUCTION ? 50 : 10,
      minPoolSize: IS_PRODUCTION ? 10 : 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      journal: true,
      readPreference: 'primaryPreferred',
      authSource: 'admin',
      ssl: IS_PRODUCTION,
      sslValidate: IS_PRODUCTION,
      compressors: ['snappy', 'zlib'],
    },
  },

  // Connection Configuration
  connection: {
    autoConnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    bufferMaxEntries: 0,
    bufferCommands: true,
    connectionTimeout: 30000,
    maxConnectionAttempts: 5,
  },

  // Connection Pool Configuration
  pools: {
    min: IS_PRODUCTION ? 10 : 2,
    max: IS_PRODUCTION ? 50 : 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },

  // Index Configuration
  indexes: {
    autoCreate: !IS_PRODUCTION,
    background: true,
    sparse: false,
    unique: false,
  },

  // Query Configuration
  queries: {
    defaultLimit: 20,
    maxLimit: 100,
    defaultSort: { createdAt: -1 },
    allowDiskUse: false,
    explain: !IS_PRODUCTION,
    timeout: 30000,
  },

  // Backup Configuration
  backup: {
    enabled: IS_PRODUCTION,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: 30, // Keep backups for 30 days
    location: '/backups/mongodb',
    compression: true,
    incremental: true,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    slowQueryThreshold: 1000, // 1 second
    logQueries: !IS_PRODUCTION,
    metrics: {
      connections: true,
      operations: true,
      network: true,
      memory: true,
    },
  },
};

// ============================================================================
// COLLECTION SCHEMAS
// ============================================================================

export const collectionSchemas: CollectionSchema[] = [
  // Users Collection
  {
    name: 'users',
    indexes: [
      {
        name: 'email_unique',
        keys: { email: 1 },
        options: { unique: true, sparse: true },
      },
      {
        name: 'phone_unique',
        keys: { phone: 1 },
        options: { unique: true, sparse: true },
      },
      {
        name: 'username_unique',
        keys: { username: 1 },
        options: { unique: true, sparse: true },
      },
      {
        name: 'role_status',
        keys: { role: 1, status: 1 },
      },
      {
        name: 'created_at',
        keys: { createdAt: -1 },
      },
    ],
  },

  // Products Collection
  {
    name: 'products',
    indexes: [
      {
        name: 'sku_unique',
        keys: { sku: 1 },
        options: { unique: true },
      },
      {
        name: 'slug_unique',
        keys: { slug: 1 },
        options: { unique: true },
      },
      {
        name: 'category_status',
        keys: { category: 1, status: 1 },
      },
      {
        name: 'price_range',
        keys: { price: 1 },
      },
      {
        name: 'featured_products',
        keys: { featured: 1, createdAt: -1 },
      },
      {
        name: 'text_search',
        keys: { name: 'text', description: 'text', tags: 'text' },
      },
    ],
  },

  // Orders Collection
  {
    name: 'orders',
    indexes: [
      {
        name: 'order_number_unique',
        keys: { orderNumber: 1 },
        options: { unique: true },
      },
      {
        name: 'user_orders',
        keys: { userId: 1, createdAt: -1 },
      },
      {
        name: 'status_tracking',
        keys: { status: 1, createdAt: -1 },
      },
      {
        name: 'payment_status',
        keys: { 'payment.status': 1 },
      },
      {
        name: 'date_range',
        keys: { createdAt: -1 },
      },
    ],
  },

  // Cart Collection
  {
    name: 'carts',
    indexes: [
      {
        name: 'user_cart',
        keys: { userId: 1 },
        options: { unique: true },
      },
      {
        name: 'session_cart',
        keys: { sessionId: 1 },
        options: { sparse: true },
      },
      {
        name: 'expired_carts',
        keys: { updatedAt: 1 },
        options: { expireAfterSeconds: 2592000 }, // 30 days
      },
    ],
  },

  // Reviews Collection
  {
    name: 'reviews',
    indexes: [
      {
        name: 'product_reviews',
        keys: { productId: 1, createdAt: -1 },
      },
      {
        name: 'user_reviews',
        keys: { userId: 1, createdAt: -1 },
      },
      {
        name: 'rating_filter',
        keys: { rating: 1 },
      },
      {
        name: 'verified_reviews',
        keys: { verified: 1, status: 1 },
      },
    ],
  },

  // Categories Collection
  {
    name: 'categories',
    indexes: [
      {
        name: 'slug_unique',
        keys: { slug: 1 },
        options: { unique: true },
      },
      {
        name: 'parent_category',
        keys: { parent: 1, order: 1 },
      },
      {
        name: 'active_categories',
        keys: { active: 1, order: 1 },
      },
    ],
  },

  // Addresses Collection
  {
    name: 'addresses',
    indexes: [
      {
        name: 'user_addresses',
        keys: { userId: 1, isDefault: -1 },
      },
      {
        name: 'address_type',
        keys: { type: 1 },
      },
    ],
  },

  // Notifications Collection
  {
    name: 'notifications',
    indexes: [
      {
        name: 'user_notifications',
        keys: { userId: 1, createdAt: -1 },
      },
      {
        name: 'unread_notifications',
        keys: { userId: 1, read: 1, createdAt: -1 },
      },
      {
        name: 'expire_notifications',
        keys: { createdAt: 1 },
        options: { expireAfterSeconds: 7776000 }, // 90 days
      },
    ],
  },

  // Sessions Collection
  {
    name: 'sessions',
    indexes: [
      {
        name: 'session_id',
        keys: { sessionId: 1 },
        options: { unique: true },
      },
      {
        name: 'expire_sessions',
        keys: { expiresAt: 1 },
        options: { expireAfterSeconds: 0 },
      },
    ],
  },

  // Audit Logs Collection
  {
    name: 'audit_logs',
    indexes: [
      {
        name: 'user_logs',
        keys: { userId: 1, timestamp: -1 },
      },
      {
        name: 'action_logs',
        keys: { action: 1, timestamp: -1 },
      },
      {
        name: 'resource_logs',
        keys: { resourceType: 1, resourceId: 1, timestamp: -1 },
      },
      {
        name: 'expire_logs',
        keys: { timestamp: 1 },
        options: { expireAfterSeconds: 31536000 }, // 1 year
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build MongoDB connection URI
 */
export const buildMongoDBURI = (): string => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    const encodedUser = encodeURIComponent(MONGODB_USER);
    const encodedPassword = encodeURIComponent(MONGODB_PASSWORD);
    return MONGODB_URI.replace('://', `://${encodedUser}:${encodedPassword}@`);
  }
  return MONGODB_URI;
};

/**
 * Get database connection options
 */
export const getConnectionOptions = () => {
  return {
    ...databaseConfig.mongodb.options,
    maxIdleTimeMS: databaseConfig.pools.idleTimeoutMillis,
    maxPoolSize: databaseConfig.pools.max,
    minPoolSize: databaseConfig.pools.min,
  };
};

/**
 * Check if database is configured
 */
export const isDatabaseConfigured = (): boolean => {
  return !!(
    databaseConfig.mongodb.enabled &&
    databaseConfig.mongodb.uri &&
    databaseConfig.mongodb.database
  );
};

/**
 * Get collection schema by name
 */
export const getCollectionSchema = (name: string): CollectionSchema | undefined => {
  return collectionSchemas.find(schema => schema.name === name);
};

/**
 * Build query with pagination
 */
export const buildPaginatedQuery = (options: {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    options.limit || databaseConfig.queries.defaultLimit,
    databaseConfig.queries.maxLimit
  );
  const skip = (page - 1) * limit;
  const sort = options.sort || databaseConfig.queries.defaultSort;

  return {
    skip,
    limit,
    sort,
    page,
  };
};

/**
 * Build aggregation pipeline with pagination
 */
export const buildAggregationPipeline = (
  match: Record<string, unknown>,
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    lookup?: Array<{
      from: string;
      localField: string;
      foreignField: string;
      as: string;
    }>;
  }
) => {
  const { skip, limit, sort } = buildPaginatedQuery(options);
  const pipeline: Record<string, unknown>[] = [];

  // Match stage
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // Lookup stages
  if (options.lookup) {
    options.lookup.forEach(lookup => {
      pipeline.push({ $lookup: lookup });
    });
  }

  // Sort stage
  pipeline.push({ $sort: sort });

  // Pagination stages
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  return pipeline;
};

/**
 * Build text search query
 */
export const buildTextSearchQuery = (searchTerm: string, fields?: string[]) => {
  if (!searchTerm) return {};

  if (fields && fields.length > 0) {
    return {
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    };
  }

  return {
    $text: { $search: searchTerm },
  };
};

/**
 * Build date range query
 */
export const buildDateRangeQuery = (
  field: string,
  start?: Date | string,
  end?: Date | string
) => {
  const query: Record<string, Record<string, Date>> = {};

  if (start || end) {
    query[field] = {};
    if (start) query[field].$gte = new Date(start);
    if (end) query[field].$lte = new Date(end);
  }

  return query;
};

/**
 * Get database health check info
 */
export const getDatabaseHealthInfo = () => ({
  uri: MONGODB_URI.replace(/\/\/.*@/, '//*****@'), // Mask credentials
  database: MONGODB_DATABASE,
  maxPoolSize: databaseConfig.pools.max,
  minPoolSize: databaseConfig.pools.min,
  timeout: databaseConfig.mongodb.options.socketTimeoutMS,
  configured: isDatabaseConfigured(),
});

/**
 * Sanitize user input for queries
 */
export const sanitizeQueryInput = (input: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    // Remove MongoDB operators from user input
    if (key.startsWith('$')) continue;

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeQueryInput(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Build update query with timestamp
 */
export const buildUpdateQuery = (
  updates: Record<string, unknown>,
  options?: { unset?: string[]; push?: Record<string, unknown>; pull?: Record<string, unknown> }
) => {
  const query: Record<string, Record<string, unknown>> = {
    $set: {
      ...updates,
      updatedAt: new Date(),
    },
  };

  if (options?.unset && options.unset.length > 0) {
    query.$unset = {};
    options.unset.forEach(field => {
      query.$unset![field] = '';
    });
  }

  if (options?.push) {
    query.$push = options.push;
  }

  if (options?.pull) {
    query.$pull = options.pull;
  }

  return query;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default databaseConfig;

export {
  MONGODB_URI,
  MONGODB_DATABASE,
  NODE_ENV,
  IS_PRODUCTION,
};
