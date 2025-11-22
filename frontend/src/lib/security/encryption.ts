/**
 * Encryption Utilities for Vardhman Mills Frontend
 * Client-side encryption, hashing, and data protection utilities
 */

// Encryption algorithms and key types
export type EncryptionAlgorithm = 'AES-GCM' | 'AES-CTR' | 'AES-CBC';
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
export type KeyFormat = 'raw' | 'pkcs8' | 'spki' | 'jwk';

// Encryption configuration
export interface EncryptionConfig {
  algorithm: EncryptionAlgorithm;
  keySize: 128 | 192 | 256;
  ivSize: number;
  tagSize?: number; // For GCM mode
}

// Encrypted data structure
export interface EncryptedData {
  data: string; // Base64 encoded
  iv: string; // Base64 encoded
  tag?: string; // Base64 encoded (for GCM)
  algorithm: EncryptionAlgorithm;
  timestamp: number;
}

// Key derivation options
export interface KeyDerivationOptions {
  algorithm: 'PBKDF2';
  hash: HashAlgorithm;
  iterations: number;
  salt?: Uint8Array;
}

// Default configurations
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-GCM',
  keySize: 256,
  ivSize: 12, // 96 bits for GCM
  tagSize: 16, // 128 bits for GCM
};

export const DEFAULT_KEY_DERIVATION: KeyDerivationOptions = {
  algorithm: 'PBKDF2',
  hash: 'SHA-256',
  iterations: 100000,
};

// Encryption Service
export class EncryptionService {
  private static instance: EncryptionService;
  private keyCache: Map<string, CryptoKey> = new Map();

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Check if Web Crypto API is available
   */
  isSupported(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined';
  }

  /**
   * Generate cryptographically secure random bytes
   */
  generateRandomBytes(size: number): Uint8Array {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }
    
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Generate a random salt
   */
  generateSalt(size: number = 32): Uint8Array {
    return this.generateRandomBytes(size);
  }

  /**
   * Generate initialization vector
   */
  generateIV(size: number): Uint8Array {
    return this.generateRandomBytes(size);
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive key from password using PBKDF2
   */
  async deriveKey(
    password: string,
    salt?: Uint8Array,
    options: Partial<KeyDerivationOptions> = {}
  ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    const config = { ...DEFAULT_KEY_DERIVATION, ...options };
    const usedSalt = salt || this.generateSalt();

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive the actual encryption key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: usedSalt as BufferSource,
        iterations: config.iterations,
        hash: config.hash,
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt: usedSalt };
  }

  /**
   * Generate a new AES key
   */
  async generateKey(
    algorithm: EncryptionAlgorithm = 'AES-GCM',
    keySize: number = 256
  ): Promise<CryptoKey> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    return await crypto.subtle.generateKey(
      {
        name: algorithm,
        length: keySize,
      },
      false, // Not extractable for security
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encryptData(
    data: string,
    key: CryptoKey,
    config: Partial<EncryptionConfig> = {}
  ): Promise<EncryptedData> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    const encConfig = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
    const iv = this.generateIV(encConfig.ivSize);
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: encConfig.algorithm,
        iv: iv as BufferSource,
      },
      key,
      encodedData
    );

    let tag: string | undefined;
    let encryptedData: ArrayBuffer;

    if (encConfig.algorithm === 'AES-GCM') {
      // For GCM mode, the tag is appended to the encrypted data
      const tagSize = encConfig.tagSize || 16;
      tag = this.arrayBufferToBase64(encrypted.slice(-tagSize));
      encryptedData = encrypted.slice(0, -tagSize);
    } else {
      encryptedData = encrypted;
    }

    return {
      data: this.arrayBufferToBase64(encryptedData),
      iv: this.arrayBufferToBase64(iv),
      tag,
      algorithm: encConfig.algorithm,
      timestamp: Date.now(),
    };
  }

  /**
   * Decrypt data
   */
  async decryptData(
    encryptedData: EncryptedData,
    key: CryptoKey
  ): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    let dataToDecrypt: ArrayBuffer;

    if (encryptedData.algorithm === 'AES-GCM' && encryptedData.tag) {
      // For GCM mode, append the tag to the data
      const data = this.base64ToArrayBuffer(encryptedData.data);
      const tag = this.base64ToArrayBuffer(encryptedData.tag);
      
      dataToDecrypt = new ArrayBuffer(data.byteLength + tag.byteLength);
      new Uint8Array(dataToDecrypt).set(new Uint8Array(data));
      new Uint8Array(dataToDecrypt).set(new Uint8Array(tag), data.byteLength);
    } else {
      dataToDecrypt = this.base64ToArrayBuffer(encryptedData.data);
    }

    const decrypted = await crypto.subtle.decrypt(
      {
        name: encryptedData.algorithm,
        iv: iv,
      },
      key,
      dataToDecrypt
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Hash data using SHA-256
   */
  async hashData(
    data: string,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    const encodedData = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, encodedData);
    
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Create HMAC signature
   */
  async createHMAC(
    data: string,
    secret: string,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    // Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      {
        name: 'HMAC',
        hash: algorithm,
      },
      false,
      ['sign']
    );

    // Sign the data
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(data)
    );

    return this.arrayBufferToBase64(signature);
  }

  /**
   * Verify HMAC signature
   */
  async verifyHMAC(
    data: string,
    signature: string,
    secret: string,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    try {
      // Import the secret key
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        {
          name: 'HMAC',
          hash: algorithm,
        },
        false,
        ['verify']
      );

      // Verify the signature
      return await crypto.subtle.verify(
        'HMAC',
        key,
        this.base64ToArrayBuffer(signature),
        new TextEncoder().encode(data)
      );
    } catch {
      return false;
    }
  }

  /**
   * Secure password hashing (client-side preprocessing)
   */
  async hashPassword(
    password: string,
    salt?: Uint8Array,
    iterations: number = 100000
  ): Promise<{ hash: string; salt: string }> {
    const usedSalt = salt || this.generateSalt();
    
    const { key } = await this.deriveKey(password, usedSalt, {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
    });

    // Export the key to get the hash
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    return {
      hash: this.arrayBufferToBase64(exportedKey),
      salt: this.arrayBufferToBase64(usedSalt),
    };
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const randomBytes = this.generateRandomBytes(length);
    return this.arrayBufferToBase64(randomBytes)
      .replace(/[+/]/g, c => c === '+' ? '-' : '_')
      .replace(/=/g, '');
  }

  /**
   * Cache encryption key
   */
  cacheKey(keyId: string, key: CryptoKey): void {
    this.keyCache.set(keyId, key);
  }

  /**
   * Get cached key
   */
  getCachedKey(keyId: string): CryptoKey | undefined {
    return this.keyCache.get(keyId);
  }

  /**
   * Clear key cache
   */
  clearKeyCache(): void {
    this.keyCache.clear();
  }
}

// Utility functions
export const EncryptionUtils = {
  /**
   * Encrypt sensitive form data
   */
  encryptFormData: async (
    formData: Record<string, unknown>,
    password: string
  ): Promise<string> => {
    const service = EncryptionService.getInstance();
    const { key } = await service.deriveKey(password);
    const encrypted = await service.encryptData(
      JSON.stringify(formData),
      key
    );
    return btoa(JSON.stringify(encrypted));
  },

  /**
   * Decrypt form data
   */
  decryptFormData: async (
    encryptedData: string,
    password: string
  ): Promise<Record<string, unknown>> => {
    const service = EncryptionService.getInstance();
    const { key } = await service.deriveKey(password);
    const encrypted: EncryptedData = JSON.parse(atob(encryptedData));
    const decrypted = await service.decryptData(encrypted, key);
    return JSON.parse(decrypted);
  },

  /**
   * Create data integrity hash
   */
  createIntegrityHash: async (data: string): Promise<string> => {
    const service = EncryptionService.getInstance();
    return await service.hashData(data, 'SHA-256');
  },

  /**
   * Verify data integrity
   */
  verifyIntegrity: async (
    data: string,
    expectedHash: string
  ): Promise<boolean> => {
    const currentHash = await EncryptionUtils.createIntegrityHash(data);
    return currentHash === expectedHash;
  },

  /**
   * Secure local storage wrapper
   */
  secureStorage: {
    setItem: async (key: string, value: string, password: string): Promise<void> => {
      const encrypted = await EncryptionUtils.encryptFormData({ value }, password);
      localStorage.setItem(key, encrypted);
    },

    getItem: async (key: string, password: string): Promise<string | null> => {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      try {
        const decrypted = await EncryptionUtils.decryptFormData(encrypted, password);
        return (decrypted.value as string) || null;
      } catch {
        return null;
      }
    },

    removeItem: (key: string): void => {
      localStorage.removeItem(key);
    },
  },

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint: async (): Promise<string> => {
    const service = EncryptionService.getInstance();
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
    };

    return await service.hashData(JSON.stringify(fingerprint));
  },

  /**
   * Create secure session token
   */
  createSessionToken: (): string => {
    const service = EncryptionService.getInstance();
    return service.generateSecureToken(48);
  },
};

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();

export default EncryptionService;