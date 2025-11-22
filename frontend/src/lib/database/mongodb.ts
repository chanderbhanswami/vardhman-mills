/**
 * MongoDB Connection and Database Management
 * Comprehensive MongoDB connection with connection pooling, caching, and error handling
 * Built for Next.js applications with frontend-optimized database operations
 */

import { MongoClient, Db, MongoClientOptions, Document } from 'mongodb';

// Environment validation
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'vardhman_mills';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * MongoDB Connection Options
 */
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true,
  compressors: ['snappy', 'zlib'],
  zlibCompressionLevel: 6,
};

/**
 * Connection Interface
 */
interface CachedConnection {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

/**
 * Global connection cache for serverless environments
 */
let cached: CachedConnection = (global as typeof globalThis & { mongo?: CachedConnection }).mongo as CachedConnection;

if (!cached) {
  cached = (global as typeof globalThis & { mongo?: CachedConnection }).mongo = {
    client: null,
    db: null,
    promise: null,
  };
}

/**
 * Database Configuration
 */
export interface DatabaseConfig {
  uri: string;
  dbName: string;
  options: MongoClientOptions;
}

/**
 * Connection Status
 */
export interface ConnectionStatus {
  isConnected: boolean;
  connectionTime?: number;
  dbName?: string;
  serverInfo?: {
    version: string;
    uptime: number;
    connections: {
      current: number;
      available: number;
    };
  };
  stats?: {
    collections: number;
    dataSize: number;
    indexSize: number;
    storageSize: number;
  };
}

/**
 * Database Health Check Result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  uptime: number;
  version: string;
  connections: {
    current: number;
    available: number;
    totalCreated: number;
  };
  memory: {
    resident: number;
    virtual: number;
    mapped?: number;
  };
  operations: {
    insert: number;
    query: number;
    update: number;
    delete: number;
    getmore: number;
    command: number;
  };
  timestamp: string;
}

/**
 * MongoDB Connection Manager Class
 */
export class MongoDBManager {
  private static instance: MongoDBManager;
  private connectionPromise: Promise<{ client: MongoClient; db: Db }> | null = null;
  private connectionAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private healthCheckCache: { result: HealthCheckResult; timestamp: number } | null = null;
  private healthCheckTTL = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): MongoDBManager {
    if (!MongoDBManager.instance) {
      MongoDBManager.instance = new MongoDBManager();
    }
    return MongoDBManager.instance;
  }

  /**
   * Connect to MongoDB with connection pooling and retry logic
   */
  public async connect(): Promise<{ client: MongoClient; db: Db }> {
    if (cached.client && cached.db) {
      try {
        // Test the connection
        await cached.client.db('admin').command({ ping: 1 });
        return { client: cached.client, db: cached.db };
      } catch (error) {
        console.warn('Cached connection failed ping test, reconnecting...', error);
        cached.client = null;
        cached.db = null;
        cached.promise = null;
      }
    }

    if (cached.promise) {
      return cached.promise;
    }

    cached.promise = this.createConnection();
    return cached.promise;
  }

  /**
   * Create new MongoDB connection with retry logic
   */
  private async createConnection(): Promise<{ client: MongoClient; db: Db }> {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        console.log(`Attempting MongoDB connection (attempt ${this.connectionAttempts + 1}/${this.maxRetries})`);
        
        const client = new MongoClient(MONGODB_URI!, options);
        await client.connect();
        
        // Test the connection
        await client.db('admin').command({ ping: 1 });
        
        const db = client.db(MONGODB_DB);
        
        cached.client = client;
        cached.db = db;
        this.connectionAttempts = 0; // Reset on successful connection
        
        console.log('MongoDB connected successfully');
        
        // Set up connection event listeners
        this.setupEventListeners(client);
        
        return { client, db };
      } catch (error) {
        this.connectionAttempts++;
        console.error(`MongoDB connection attempt ${this.connectionAttempts} failed:`, error);
        
        if (this.connectionAttempts >= this.maxRetries) {
          cached.promise = null;
          this.connectionAttempts = 0;
          throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error}`);
        }
        
        // Wait before retry
        await this.delay(this.retryDelay * this.connectionAttempts);
      }
    }
    
    throw new Error('Unexpected error in connection creation');
  }

  /**
   * Setup connection event listeners
   */
  private setupEventListeners(client: MongoClient): void {
    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      this.handleConnectionError();
    });

    client.on('close', () => {
      console.warn('MongoDB connection closed');
      this.handleConnectionError();
    });

    client.on('reconnect', () => {
      console.log('MongoDB reconnected');
    });

    client.on('timeout', () => {
      console.warn('MongoDB connection timeout');
    });
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(): void {
    cached.client = null;
    cached.db = null;
    cached.promise = null;
    this.healthCheckCache = null;
  }

  /**
   * Get database instance
   */
  public async getDatabase(): Promise<Db> {
    const { db } = await this.connect();
    return db;
  }

  /**
   * Get client instance
   */
  public async getClient(): Promise<MongoClient> {
    const { client } = await this.connect();
    return client;
  }

  /**
   * Check connection status
   */
  public async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const { client, db } = await this.connect();
      const startTime = Date.now();
      
      // Ping the database
      await client.db('admin').command({ ping: 1 });
      const connectionTime = Date.now() - startTime;

      // Get server status
      const serverStatus = await client.db('admin').command({ serverStatus: 1 });
      
      // Get database stats
      const dbStats = await db.stats();

      return {
        isConnected: true,
        connectionTime,
        dbName: db.databaseName,
        serverInfo: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: {
            current: serverStatus.connections.current,
            available: serverStatus.connections.available,
          },
        },
        stats: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          indexSize: dbStats.indexSize,
          storageSize: dbStats.storageSize,
        },
      };
    } catch (error) {
      console.error('Failed to get connection status:', error);
      return {
        isConnected: false,
      };
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    // Return cached result if still valid
    if (this.healthCheckCache && 
        Date.now() - this.healthCheckCache.timestamp < this.healthCheckTTL) {
      return this.healthCheckCache.result;
    }

    try {
      const { client } = await this.connect();
      const startTime = Date.now();
      
      // Get comprehensive server status
      const serverStatus = await client.db('admin').command({ serverStatus: 1 });
      const latency = Date.now() - startTime;

      const result: HealthCheckResult = {
        status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
        latency,
        uptime: serverStatus.uptime,
        version: serverStatus.version,
        connections: {
          current: serverStatus.connections.current,
          available: serverStatus.connections.available,
          totalCreated: serverStatus.connections.totalCreated,
        },
        memory: {
          resident: serverStatus.mem.resident,
          virtual: serverStatus.mem.virtual,
          mapped: serverStatus.mem.mapped,
        },
        operations: {
          insert: serverStatus.opcounters.insert,
          query: serverStatus.opcounters.query,
          update: serverStatus.opcounters.update,
          delete: serverStatus.opcounters.delete,
          getmore: serverStatus.opcounters.getmore,
          command: serverStatus.opcounters.command,
        },
        timestamp: new Date().toISOString(),
      };

      // Cache the result
      this.healthCheckCache = {
        result,
        timestamp: Date.now(),
      };

      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        latency: -1,
        uptime: 0,
        version: 'unknown',
        connections: { current: 0, available: 0, totalCreated: 0 },
        memory: { resident: 0, virtual: 0 },
        operations: { insert: 0, query: 0, update: 0, delete: 0, getmore: 0, command: 0 },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Close all connections
   */
  public async disconnect(): Promise<void> {
    if (cached.client) {
      try {
        await cached.client.close();
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      } finally {
        cached.client = null;
        cached.db = null;
        cached.promise = null;
        this.healthCheckCache = null;
      }
    }
  }

  /**
   * Execute with automatic connection management
   */
  public async executeWithConnection<T>(
    operation: (db: Db) => Promise<T>
  ): Promise<T> {
    const db = await this.getDatabase();
    return operation(db);
  }

  /**
   * Execute transaction with automatic retry
   */
  public async executeTransaction<T>(
    operations: (session: import('mongodb').ClientSession) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    const session = client.startSession();
    
    try {
      let result: T;
      
      await session.withTransaction(async () => {
        result = await operations(session);
      }, {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        maxCommitTimeMS: 30000,
      });
      
      return result!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get collection with proper typing
   */
  public async getCollection<T extends Document = Document>(name: string) {
    const db = await this.getDatabase();
    return db.collection<T>(name);
  }

  /**
   * Create indexes for all collections
   */
  public async createIndexes(): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      // User indexes
      await db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { phone: 1 }, sparse: true },
        { key: { 'profile.firstName': 1, 'profile.lastName': 1 } },
        { key: { createdAt: -1 } },
        { key: { isVerified: 1 } },
        { key: { role: 1 } },
        { key: { 'preferences.emailMarketing': 1 } },
      ]);

      // Product indexes
      await db.collection('products').createIndexes([
        { key: { name: 'text', description: 'text', 'variants.name': 'text' } },
        { key: { category: 1 } },
        { key: { subcategory: 1 } },
        { key: { brand: 1 } },
        { key: { price: 1 } },
        { key: { 'variants.price': 1 } },
        { key: { status: 1 } },
        { key: { featured: 1 } },
        { key: { createdAt: -1 } },
        { key: { 'seo.slug': 1 }, unique: true },
        { key: { tags: 1 } },
        { key: { 'inventory.stock': 1 } },
      ]);

      // Order indexes  
      await db.collection('orders').createIndexes([
        { key: { userId: 1 } },
        { key: { orderNumber: 1 }, unique: true },
        { key: { status: 1 } },
        { key: { createdAt: -1 } },
        { key: { 'payment.status': 1 } },
        { key: { 'shipping.trackingNumber': 1 }, sparse: true },
      ]);

      // Cart indexes
      await db.collection('carts').createIndexes([
        { key: { userId: 1 } },
        { key: { sessionId: 1 }, sparse: true },
        { key: { updatedAt: -1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      ]);

      // Review indexes
      await db.collection('reviews').createIndexes([
        { key: { productId: 1 } },
        { key: { userId: 1 } },
        { key: { rating: 1 } },
        { key: { createdAt: -1 } },
        { key: { status: 1 } },
        { key: { helpful: 1 } },
      ]);

      // Wishlist indexes
      await db.collection('wishlists').createIndexes([
        { key: { userId: 1 } },
        { key: { 'items.productId': 1 } },
        { key: { updatedAt: -1 } },
      ]);

      // Category indexes
      await db.collection('categories').createIndexes([
        { key: { name: 1 } },
        { key: { slug: 1 }, unique: true },
        { key: { parentId: 1 }, sparse: true },
        { key: { level: 1 } },
        { key: { status: 1 } },
        { key: { sortOrder: 1 } },
      ]);

      // Blog indexes
      await db.collection('blogs').createIndexes([
        { key: { title: 'text', content: 'text', excerpt: 'text' } },
        { key: { slug: 1 }, unique: true },
        { key: { status: 1 } },
        { key: { featured: 1 } },
        { key: { publishedAt: -1 } },
        { key: { 'author.id': 1 } },
        { key: { tags: 1 } },
        { key: { category: 1 } },
      ]);

      // Newsletter indexes
      await db.collection('newsletters').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { status: 1 } },
        { key: { subscribedAt: -1 } },
        { key: { preferences: 1 } },
      ]);

      // Notification indexes
      await db.collection('notifications').createIndexes([
        { key: { userId: 1 } },
        { key: { type: 1 } },
        { key: { status: 1 } },
        { key: { createdAt: -1 } },
        { key: { priority: 1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0, sparse: true },
      ]);

      // Address indexes
      await db.collection('addresses').createIndexes([
        { key: { userId: 1 } },
        { key: { type: 1 } },
        { key: { isDefault: 1 } },
        { key: { 'location.coordinates': '2dsphere' } },
        { key: { city: 1 } },
        { key: { state: 1 } },
        { key: { country: 1 } },
        { key: { pincode: 1 } },
      ]);

      console.log('All database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<{
    collections: Record<string, {
      count: number;
      size: number;
      avgObjSize: number;
      indexes: number;
      totalIndexSize: number;
    }>;
    totalSize: number;
    totalIndexSize: number;
    totalDocuments: number;
  }> {
    const db = await this.getDatabase();
    const collections = await db.listCollections().toArray();
    const stats: {
      collections: Record<string, {
        count: number;
        size: number;
        avgObjSize: number;
        indexes: number;
        totalIndexSize: number;
      }>;
      totalSize: number;
      totalIndexSize: number;
      totalDocuments: number;
    } = {
      collections: {},
      totalSize: 0,
      totalIndexSize: 0,
      totalDocuments: 0,
    };

    for (const collection of collections) {
      try {
        const collStats = await db.collection(collection.name).stats();
        stats.collections[collection.name] = {
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          indexes: collStats.nindexes,
          totalIndexSize: collStats.totalIndexSize,
        };
        
        stats.totalSize += collStats.size;
        stats.totalIndexSize += collStats.totalIndexSize;
        stats.totalDocuments += collStats.count;
      } catch (error) {
        console.warn(`Failed to get stats for collection ${collection.name}:`, error);
      }
    }

    return stats;
  }
}

// Export singleton instance
export const mongoManager = MongoDBManager.getInstance();

/**
 * Main connection function (backward compatibility)
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  return mongoManager.connect();
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Db> {
  return mongoManager.getDatabase();
}

/**
 * Get client instance
 */
export async function getClient(): Promise<MongoClient> {
  return mongoManager.getClient();
}

/**
 * Execute operation with database
 */
export async function withDatabase<T>(
  operation: (db: Db) => Promise<T>
): Promise<T> {
  return mongoManager.executeWithConnection(operation);
}

/**
 * Execute transaction
 */
export async function withTransaction<T>(
  operations: (session: import('mongodb').ClientSession) => Promise<T>
): Promise<T> {
  return mongoManager.executeTransaction(operations);
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  return mongoManager.healthCheck();
}

/**
 * Initialize database with indexes and initial data
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Ensure connection
    await mongoManager.connect();
    
    // Create indexes
    await mongoManager.createIndexes();
    
    // You can add initial data seeding here if needed
    // await seedInitialData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export async function cleanup(): Promise<void> {
  await mongoManager.disconnect();
}

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGUSR2', cleanup); // Nodemon restart
}

export default mongoManager;