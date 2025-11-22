import jwt from 'jsonwebtoken';
import { ExtendedUser, ExtendedJWT, TokenResponse } from './types';

/**
 * JWT Configuration
 */
const JWT_CONFIG = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  accessTokenExpiry: 15 * 60, // 15 minutes in seconds
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  algorithm: 'HS256' as const,
};

/**
 * JWT Payload interface
 */
interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  type?: string;
  iat?: number;
  exp?: number;
  jti?: string; // token id
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: ExtendedUser): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    jti: generateTokenId(),
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
    algorithm: JWT_CONFIG.algorithm,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  const payload = {
    sub: userId,
    type: 'refresh',
    jti: generateTokenId(),
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
    algorithm: JWT_CONFIG.algorithm,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: ExtendedUser): TokenResponse {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
    tokenType: 'Bearer',
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
    }) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  return Date.now() >= decoded.exp * 1000;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  try {
    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return null;
    }

    // In a real application, you would fetch user data from database
    // For now, we'll create a mock user object
    const user: ExtendedUser = {
      id: decoded.sub,
      email: '', // This should be fetched from database
      name: '', // This should be fetched from database
    };

    return generateTokenPair(user);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Validate JWT token format
 */
export function isValidJWTFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Create JWT token for NextAuth
 */
export function createNextAuthJWT(user: ExtendedUser): ExtendedJWT {
  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpires = now + 900; // 15 minutes
  const refreshTokenExpires = now + 604800; // 7 days

  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    picture: user.image,
    accessToken: generateAccessToken(user),
    refreshToken: user.refreshToken || generateRefreshToken(user.id),
    accessTokenExpires,
    refreshTokenExpires,
    user,
    iat: now,
    exp: accessTokenExpires,
  };
}

/**
 * Update JWT token with new data
 */
export function updateJWT(token: ExtendedJWT, updates: Partial<ExtendedJWT>): ExtendedJWT {
  return {
    ...token,
    ...updates,
  };
}

/**
 * Check if JWT needs refresh
 */
export function shouldRefreshToken(token: ExtendedJWT): boolean {
  if (!token.accessTokenExpires) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = token.accessTokenExpires - now;
  
  // Refresh if token expires in less than 5 minutes
  return timeUntilExpiry < 300;
}

/**
 * Generate unique token ID
 */
function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create session token
 */
export function createSessionToken(user: ExtendedUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'session',
    jti: generateTokenId(),
  };

  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: '30d', // 30 days for session
    algorithm: JWT_CONFIG.algorithm,
  });
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
    }) as JWTPayload & { type: string };

    if (decoded.type !== 'session') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Session token verification failed:', error);
    return null;
  }
}

/**
 * Blacklist token (in production, store in Redis or database)
 */
const blacklistedTokens = new Set<string>();

export function blacklistToken(tokenId: string): void {
  blacklistedTokens.add(tokenId);
}

export function isTokenBlacklisted(tokenId: string): boolean {
  return blacklistedTokens.has(tokenId);
}

/**
 * Clean expired blacklisted tokens
 */
export function cleanExpiredBlacklistedTokens(): void {
  // In production, this should clean tokens from persistent storage
  // This is a simplified version for in-memory storage
  blacklistedTokens.clear();
}
