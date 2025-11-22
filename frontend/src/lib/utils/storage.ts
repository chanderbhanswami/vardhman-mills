/**
 * Storage Utilities
 * Comprehensive localStorage and sessionStorage wrapper utilities with error handling and type safety
 */

// Types
export interface StorageOptions {
  expire?: number; // Expiration time in milliseconds
  encrypt?: boolean; // Whether to encrypt the data
  compress?: boolean; // Whether to compress large data
  fallback?: unknown; // Fallback value if retrieval fails
}

export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  expire?: number;
  encrypted?: boolean;
  compressed?: boolean;
  version?: string;
}

export interface StorageStats {
  used: number;
  available: number;
  total: number;
  items: number;
  percentage: number;
}

// Storage availability check
let localStorageAvailable = false;
let sessionStorageAvailable = false;

try {
  const testKey = '__storage_test__';
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    localStorageAvailable = true;
  }
} catch {
  localStorageAvailable = false;
}

try {
  const testKey = '__session_test__';
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    sessionStorageAvailable = true;
  }
} catch {
  sessionStorageAvailable = false;
}

/**
 * Base storage class with common functionality
 */
class BaseStorage {
  private storage: Storage;
  private available: boolean;
  private prefix: string;

  constructor(storage: Storage, available: boolean, prefix = '') {
    this.storage = storage;
    this.available = available;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  private createStorageItem<T>(value: T, options: StorageOptions = {}): StorageItem<T> {
    const now = Date.now();
    return {
      value,
      timestamp: now,
      expire: options.expire ? now + options.expire : undefined,
      encrypted: options.encrypt,
      compressed: options.compress,
      version: '1.0'
    };
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.expire) return false;
    return Date.now() > item.expire;
  }

  private compressData(data: string): string {
    // Simple compression using repeated character encoding
    return data.replace(/(.)\1+/g, (match, char) => {
      return match.length > 3 ? `${char}*${match.length}` : match;
    });
  }

  private decompressData(data: string): string {
    // Decompress the simple encoding
    return data.replace(/(.)\*(\d+)/g, (match, char, count) => {
      return char.repeat(parseInt(count, 10));
    });
  }

  private encryptData(data: string): string {
    // Simple Caesar cipher for basic obfuscation (not secure encryption)
    return data.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + 3);
    }).join('');
  }

  private decryptData(data: string): string {
    // Reverse Caesar cipher
    return data.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - 3);
    }).join('');
  }

  /**
   * Set item in storage with options
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    if (!this.available) return false;

    try {
      const storageItem = this.createStorageItem(value, options);
      let serialized = JSON.stringify(storageItem);

      // Apply compression if requested
      if (options.compress) {
        serialized = this.compressData(serialized);
      }

      // Apply encryption if requested
      if (options.encrypt) {
        serialized = this.encryptData(serialized);
      }

      this.storage.setItem(this.getKey(key), serialized);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem<T>(key: string, fallback?: T): T | undefined {
    if (!this.available) return fallback;

    try {
      const stored = this.storage.getItem(this.getKey(key));
      if (!stored) return fallback;

      let data = stored;

      // Try to detect if data is encrypted (basic heuristic)
      const isEncrypted = data.charCodeAt(0) > 127;
      if (isEncrypted) {
        data = this.decryptData(data);
      }

      // Try to detect if data is compressed
      if (data.includes('*')) {
        data = this.decompressData(data);
      }

      const item: StorageItem<T> = JSON.parse(data);

      // Check if expired
      if (this.isExpired(item)) {
        this.removeItem(key);
        return fallback;
      }

      return item.value;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return fallback;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    if (!this.available) return false;

    try {
      this.storage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }

  /**
   * Check if item exists and is not expired
   */
  hasItem(key: string): boolean {
    if (!this.available) return false;

    try {
      const stored = this.storage.getItem(this.getKey(key));
      if (!stored) return false;

      // Parse to check expiration
      const item: StorageItem = JSON.parse(stored);
      if (this.isExpired(item)) {
        this.removeItem(key);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys with the current prefix
   */
  getKeys(): string[] {
    if (!this.available) return [];

    const keys: string[] = [];
    const prefixLength = this.prefix ? this.prefix.length + 1 : 0;

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        if (this.prefix) {
          if (key.startsWith(this.prefix + ':')) {
            keys.push(key.substring(prefixLength));
          }
        } else {
          keys.push(key);
        }
      }
    }

    return keys;
  }

  /**
   * Clear all items with the current prefix
   */
  clear(): boolean {
    if (!this.available) return false;

    try {
      if (this.prefix) {
        const keys = this.getKeys();
        keys.forEach(key => this.removeItem(key));
      } else {
        this.storage.clear();
      }
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    if (!this.available) {
      return { used: 0, available: 0, total: 0, items: 0, percentage: 0 };
    }

    let used = 0;
    const items = this.getKeys().length;

    // Calculate used space
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        const value = this.storage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Estimate available space (5MB is typical localStorage limit)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const available = total - used;
    const percentage = (used / total) * 100;

    return {
      used,
      available,
      total,
      items,
      percentage: Math.round(percentage * 100) / 100
    };
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Get raw storage object (use with caution)
   */
  getRawStorage(): Storage {
    return this.storage;
  }
}

// Create storage instances
export const localStorageUtils = new BaseStorage(
  typeof window !== 'undefined' ? window.localStorage : {} as Storage,
  localStorageAvailable,
  ''
);

export const sessionStorageUtils = new BaseStorage(
  typeof window !== 'undefined' ? window.sessionStorage : {} as Storage,
  sessionStorageAvailable,
  ''
);

/**
 * Create a namespaced storage instance
 */
export function createNamespacedStorage(namespace: string, type: 'local' | 'session' = 'local'): BaseStorage {
  const storage = type === 'local' 
    ? (typeof window !== 'undefined' ? window.localStorage : {} as Storage)
    : (typeof window !== 'undefined' ? window.sessionStorage : {} as Storage);
  
  const available = type === 'local' ? localStorageAvailable : sessionStorageAvailable;
  
  return new BaseStorage(storage, available, namespace);
}

/**
 * Storage with automatic JSON serialization
 */
export class JSONStorage extends BaseStorage {
  setObject<T extends Record<string, unknown>>(key: string, obj: T, options?: StorageOptions): boolean {
    return this.setItem(key, obj, options);
  }

  getObject<T extends Record<string, unknown>>(key: string, fallback?: T): T | undefined {
    return this.getItem<T>(key, fallback);
  }

  updateObject<T extends Record<string, unknown>>(
    key: string, 
    updates: Partial<T>, 
    options?: StorageOptions
  ): boolean {
    const existing = this.getItem<T>(key) as T;
    if (!existing || typeof existing !== 'object') return false;

    const updated = { ...existing, ...updates };
    return this.setItem(key, updated, options);
  }
}

/**
 * Storage with automatic expiration cleanup
 */
export class ExpiringStorage extends BaseStorage {
  private cleanupInterval: NodeJS.Timeout | null = null;

  startAutoCleanup(intervalMs = 60000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  cleanup(): number {
    const keys = this.getKeys();
    let cleaned = 0;

    keys.forEach(key => {
      if (!this.hasItem(key)) {
        cleaned++;
      }
    });

    return cleaned;
  }
}

/**
 * Storage utility functions
 */
export const storageUtils = {
  // Check storage availability
  isLocalStorageAvailable: () => localStorageAvailable,
  isSessionStorageAvailable: () => sessionStorageAvailable,

  // Get storage size
  getStorageSize: (type: 'local' | 'session' = 'local') => {
    const storage = type === 'local' ? localStorageUtils : sessionStorageUtils;
    return storage.getStats();
  },

  // Migrate data between storage types
  migrate: (fromKey: string, toKey: string, fromType: 'local' | 'session', toType: 'local' | 'session') => {
    const fromStorage = fromType === 'local' ? localStorageUtils : sessionStorageUtils;
    const toStorage = toType === 'local' ? localStorageUtils : sessionStorageUtils;

    const data = fromStorage.getItem(fromKey);
    if (data !== undefined) {
      toStorage.setItem(toKey, data);
      fromStorage.removeItem(fromKey);
      return true;
    }
    return false;
  },

  // Backup storage data
  backup: (type: 'local' | 'session' = 'local') => {
    const storage = type === 'local' ? localStorageUtils : sessionStorageUtils;
    const keys = storage.getKeys();
    const backup: Record<string, unknown> = {};

    keys.forEach((key: string) => {
      backup[key] = storage.getItem(key);
    });

    return backup;
  },

  // Restore storage data
  restore: (backup: Record<string, unknown>, type: 'local' | 'session' = 'local') => {
    const storage = type === 'local' ? localStorageUtils : sessionStorageUtils;
    
    Object.entries(backup).forEach(([key, value]) => {
      if (value !== undefined) {
        storage.setItem(key, value);
      }
    });
  },

  // Clear expired items across all storage
  clearExpired: () => {
    const localCleaned = new ExpiringStorage(
      typeof window !== 'undefined' ? window.localStorage : {} as Storage,
      localStorageAvailable
    ).cleanup();
    
    const sessionCleaned = new ExpiringStorage(
      typeof window !== 'undefined' ? window.sessionStorage : {} as Storage,
      sessionStorageAvailable
    ).cleanup();

    return { local: localCleaned, session: sessionCleaned };
  }
};

// Create commonly used storage instances
export const jsonStorage = new JSONStorage(
  typeof window !== 'undefined' ? window.localStorage : {} as Storage,
  localStorageAvailable,
  'json'
);

export const expiringStorage = new ExpiringStorage(
  typeof window !== 'undefined' ? window.localStorage : {} as Storage,
  localStorageAvailable,
  'expiring'
);

// Alias exports for compatibility
export const storage = localStorageUtils;
export const sessionStorage = sessionStorageUtils;

// Export availability flags
export { localStorageAvailable, sessionStorageAvailable };

// Export default
const storageUtilities = {
  localStorageUtils,
  sessionStorageUtils,
  storage,
  sessionStorage,
  localStorageAvailable,
  createNamespacedStorage,
  JSONStorage,
  ExpiringStorage,
  storageUtils,
  jsonStorage,
  expiringStorage
};

export default storageUtilities;
