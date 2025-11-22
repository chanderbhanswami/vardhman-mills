/**
 * Encryption and Security Utilities
 * Client-side encryption, hashing, and security utilities using crypto-js
 */

import CryptoJS from 'crypto-js';

export interface EncryptionResult {
  encrypted: string;
  iv?: string;
  salt?: string;
}

export interface HashOptions {
  algorithm?: 'sha256' | 'sha512' | 'md5' | 'sha1';
  iterations?: number;
  keySize?: number;
}

/**
 * Encrypt a string using AES encryption
 */
export function encrypt(text: string, secretKey: string): EncryptionResult {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
    return { encrypted };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a string using AES decryption
 */
export function decrypt(encryptedText: string, secretKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Invalid key or corrupted data');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Advanced AES encryption with custom IV
 */
export function encryptAdvanced(text: string, secretKey: string, iv?: string): EncryptionResult {
  try {
    const keyHash = CryptoJS.SHA256(secretKey);
    const ivValue = iv ? CryptoJS.enc.Hex.parse(iv) : CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(text, keyHash, { 
      iv: ivValue,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return {
      encrypted: encrypted.toString(),
      iv: ivValue.toString(CryptoJS.enc.Hex)
    };
  } catch (error) {
    console.error('Advanced encryption failed:', error);
    throw new Error('Advanced encryption failed');
  }
}

/**
 * Advanced AES decryption with custom IV
 */
export function decryptAdvanced(encryptedText: string, secretKey: string, iv: string): string {
  try {
    const keyHash = CryptoJS.SHA256(secretKey);
    const ivValue = CryptoJS.enc.Hex.parse(iv);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedText, keyHash, {
      iv: ivValue,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Invalid key, IV, or corrupted data');
    }
    
    return result;
  } catch (error) {
    console.error('Advanced decryption failed:', error);
    throw new Error('Advanced decryption failed');
  }
}

/**
 * Generate a hash of the input text
 */
export function hash(text: string, options: HashOptions = {}): string {
  const { algorithm = 'sha256' } = options;
  
  try {
    switch (algorithm) {
      case 'sha256':
        return CryptoJS.SHA256(text).toString();
      case 'sha512':
        return CryptoJS.SHA512(text).toString();
      case 'md5':
        return CryptoJS.MD5(text).toString();
      case 'sha1':
        return CryptoJS.SHA1(text).toString();
      default:
        return CryptoJS.SHA256(text).toString();
    }
  } catch (error) {
    console.error('Hashing failed:', error);
    throw new Error('Hashing failed');
  }
}

/**
 * Generate PBKDF2 hash for password storage
 */
export function hashPassword(password: string, salt?: string, options: HashOptions = {}): EncryptionResult {
  const { iterations = 10000, keySize = 256 } = options;
  
  try {
    const saltValue = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const key = CryptoJS.PBKDF2(password, saltValue, {
      keySize: keySize/32,
      iterations
    });
    
    return {
      encrypted: key.toString(),
      salt: saltValue
    };
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string, salt: string, options: HashOptions = {}): boolean {
  try {
    const { iterations = 10000, keySize = 256 } = options;
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize/32,
      iterations
    });
    
    return key.toString() === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Generate a random key
 */
export function generateKey(length = 32): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Key generation failed:', error);
    throw new Error('Key generation failed');
  }
}

/**
 * Generate a random salt
 */
export function generateSalt(length = 16): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Salt generation failed:', error);
    throw new Error('Salt generation failed');
  }
}

/**
 * Generate a random IV
 */
export function generateIV(): string {
  try {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('IV generation failed:', error);
    throw new Error('IV generation failed');
  }
}

/**
 * Encode text to Base64
 */
export function encodeBase64(text: string): string {
  try {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
  } catch (error) {
    console.error('Base64 encoding failed:', error);
    throw new Error('Base64 encoding failed');
  }
}

/**
 * Decode text from Base64
 */
export function decodeBase64(encodedText: string): string {
  try {
    return CryptoJS.enc.Base64.parse(encodedText).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Base64 decoding failed:', error);
    throw new Error('Base64 decoding failed');
  }
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(message: string, secret: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  try {
    if (algorithm === 'sha512') {
      return CryptoJS.HmacSHA512(message, secret).toString();
    }
    return CryptoJS.HmacSHA256(message, secret).toString();
  } catch (error) {
    console.error('HMAC generation failed:', error);
    throw new Error('HMAC generation failed');
  }
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(message: string, secret: string, signature: string, algorithm: 'sha256' | 'sha512' = 'sha256'): boolean {
  try {
    const expectedSignature = generateHMAC(message, secret, algorithm);
    return expectedSignature === signature;
  } catch (error) {
    console.error('HMAC verification failed:', error);
    return false;
  }
}

/**
 * Encrypt object to JSON string
 */
export function encryptObject(obj: object, secretKey: string): string {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString, secretKey).encrypted;
  } catch (error) {
    console.error('Object encryption failed:', error);
    throw new Error('Object encryption failed');
  }
}

/**
 * Decrypt JSON string to object
 */
export function decryptObject<T = object>(encryptedText: string, secretKey: string): T {
  try {
    const decryptedString = decrypt(encryptedText, secretKey);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Object decryption failed:', error);
    throw new Error('Object decryption failed');
  }
}

/**
 * Secure storage encryption (for localStorage)
 */
export function encryptForStorage(data: string, key?: string): string {
  const storageKey = key || 'default-storage-key';
  return encrypt(data, storageKey).encrypted;
}

/**
 * Secure storage decryption (for localStorage)
 */
export function decryptFromStorage(encryptedData: string, key?: string): string {
  const storageKey = key || 'default-storage-key';
  return decrypt(encryptedData, storageKey);
}

/**
 * Generate a secure token
 */
export function generateToken(length = 32): string {
  try {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Token generation failed:', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  try {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    const hex = randomBytes.toString(CryptoJS.enc.Hex);
    
    return [
      hex.substr(0, 8),
      hex.substr(8, 4),
      '4' + hex.substr(13, 3),
      ((parseInt(hex.substr(16, 1), 16) & 0x3) | 0x8).toString(16) + hex.substr(17, 3),
      hex.substr(20, 12)
    ].join('-');
  } catch (error) {
    console.error('UUID generation failed:', error);
    throw new Error('UUID generation failed');
  }
}

/**
 * Secure password generator
 */
export function generateSecurePassword(
  length = 12,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  } = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false
  } = options;
  
  let charset = '';
  
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (excludeSimilar) {
    charset = charset.replace(/[0O1lI]/g, '');
  }
  
  if (!charset) {
    throw new Error('At least one character type must be included');
  }
  
  try {
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  } catch (error) {
    console.error('Password generation failed:', error);
    throw new Error('Password generation failed');
  }
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('Include special characters');
  
  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else suggestions.push('Avoid repeating characters');
  
  if (!/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde)/i.test(password)) score += 1;
  else suggestions.push('Avoid sequential characters');
  
  let level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  
  if (score < 2) level = 'very-weak';
  else if (score < 4) level = 'weak';
  else if (score < 6) level = 'fair';
  else if (score < 7) level = 'good';
  else level = 'strong';
  
  return { score, level, suggestions };
}

/**
 * Encryption utilities object
 */
export const crypto = {
  encrypt,
  decrypt,
  encryptAdvanced,
  decryptAdvanced,
  hash,
  hashPassword,
  verifyPassword,
  generateKey,
  generateSalt,
  generateIV,
  encodeBase64,
  decodeBase64,
  generateHMAC,
  verifyHMAC,
  encryptObject,
  decryptObject,
  encryptForStorage,
  decryptFromStorage,
  generateToken,
  generateUUID,
  generateSecurePassword,
  checkPasswordStrength
};

// Export default
const encryptionUtils = {
  encrypt,
  decrypt,
  encryptAdvanced,
  decryptAdvanced,
  hash,
  hashPassword,
  verifyPassword,
  generateKey,
  generateSalt,
  generateIV,
  encodeBase64,
  decodeBase64,
  generateHMAC,
  verifyHMAC,
  encryptObject,
  decryptObject,
  encryptForStorage,
  decryptFromStorage,
  generateToken,
  generateUUID,
  generateSecurePassword,
  checkPasswordStrength,
  crypto
};

export default encryptionUtils;
