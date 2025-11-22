import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

/**
 * Extended User interface for NextAuth
 */
export interface ExtendedUser extends DefaultUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  token?: string;
  refreshToken?: string;
  role?: string;
  provider?: string;
  providerId?: string;
  isVerified?: boolean;
  permissions?: string[];
  profile?: UserProfile;
}

/**
 * User Profile interface
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    language?: string;
    currency?: string;
    timezone?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

/**
 * Extended Session interface
 */
export interface ExtendedSession extends DefaultSession {
  user: ExtendedUser;
  accessToken?: string;
  refreshToken?: string;
  expires: string;
  error?: string;
}

/**
 * Extended JWT interface
 */
export interface ExtendedJWT extends DefaultJWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  refreshTokenExpires?: number;
  error?: string;
  user?: ExtendedUser;
}

/**
 * OAuth Provider Data
 */
export interface OAuthProviderData {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  image?: string;
  accessToken: string;
  refreshToken?: string;
  profile: Record<string, unknown>;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  success: boolean;
  data?: {
    user: ExtendedUser;
    token: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  error?: string;
  message?: string;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration Data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

/**
 * Password Reset Data
 */
export interface PasswordResetData {
  email: string;
}

/**
 * Password Change Data
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Email Verification Data
 */
export interface EmailVerificationData {
  token: string;
  email: string;
}

/**
 * Two-Factor Authentication Data
 */
export interface TwoFactorData {
  code: string;
  token: string;
}

/**
 * Authentication Provider Configuration
 */
export interface AuthProviderConfig {
  name: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scope?: string[];
  params?: Record<string, unknown>;
}

/**
 * Session Storage Options
 */
export interface SessionStorageOptions {
  maxAge: number;
  updateAge: number;
  strategy: 'jwt' | 'database';
}

/**
 * Authentication Events
 */
export type AuthEvent = 
  | 'signIn'
  | 'signOut'
  | 'createUser'
  | 'updateUser'
  | 'linkAccount'
  | 'session';

/**
 * Authentication Error Types
 */
export type AuthErrorType =
  | 'Configuration'
  | 'AccessDenied'
  | 'Verification'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthProfile'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'
  | 'InvalidCredentials'
  | 'UserNotFound'
  | 'EmailNotVerified'
  | 'AccountLocked'
  | 'TwoFactorRequired'
  | 'TokenExpired'
  | 'RefreshTokenExpired';

/**
 * Authentication Error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Token Response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * User Permission
 */
export interface UserPermission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

/**
 * User Role
 */
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: UserPermission[];
  isDefault?: boolean;
}

/**
 * Account linking data
 */
export interface AccountLinkData {
  provider: string;
  providerAccountId: string;
  userId: string;
  type: 'oauth' | 'email' | 'credentials';
  access_token?: string;
  token_type?: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
}