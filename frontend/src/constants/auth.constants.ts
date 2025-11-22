/**
 * Authentication Constants - Vardhman Mills Frontend
 * Contains authentication-related configuration and constants
 */

// Storage Keys
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  REMEMBER_ME_KEY: 'remember_me',
  REDIRECT_KEY: 'auth_redirect',
  SESSION_KEY: 'session_data',
  LAST_ACTIVITY_KEY: 'last_activity',
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  STORAGE_TYPE: 'localStorage', // or 'sessionStorage'
  HEADER_PREFIX: 'Bearer',
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
  CHECK_INTERVAL: 60 * 1000, // Check every minute
  EXTEND_ON_ACTIVITY: true,
} as const;

// Authentication Status
export const AUTH_STATUS = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  LOADING: 'loading',
  ERROR: 'error',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const;

// Permissions
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  UPDATE: 'update',
  ADMIN: 'admin',
} as const;

// Authentication Methods
export const AUTH_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
} as const;

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_TIME: 10 * 60 * 1000, // 10 minutes
  RESEND_COOLDOWN: 60 * 1000, // 1 minute
  MAX_ATTEMPTS: 3,
  TYPE: {
    NUMERIC: 'numeric',
    ALPHANUMERIC: 'alphanumeric',
  },
} as const;

// Account Verification
export const VERIFICATION = {
  EMAIL_REQUIRED: true,
  PHONE_REQUIRED: false,
  AUTO_VERIFY: false,
  VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Security Settings
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_HISTORY: 5,
  TWO_FACTOR_AUTH: false,
  FORCE_PASSWORD_CHANGE: false,
  SESSION_FINGERPRINTING: true,
} as const;

// Social Login Configuration
export const SOCIAL_LOGIN = {
  GOOGLE: {
    ENABLED: true,
    CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    SCOPE: 'email profile',
  },
  FACEBOOK: {
    ENABLED: true,
    APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    SCOPE: 'email,public_profile',
  },
  APPLE: {
    ENABLED: false,
    CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
    SCOPE: 'email name',
  },
} as const;

// Error Messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account has been temporarily locked',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  PHONE_NOT_VERIFIED: 'Please verify your phone number',
  TOKEN_EXPIRED: 'Session has expired. Please login again',
  TOKEN_INVALID: 'Invalid authentication token',
  ACCOUNT_DISABLED: 'Account has been disabled',
  REGISTRATION_FAILED: 'Registration failed. Please try again',
  PASSWORD_WEAK: 'Password does not meet security requirements',
  EMAIL_EXISTS: 'Email address is already registered',
  PHONE_EXISTS: 'Phone number is already registered',
  RESET_TOKEN_INVALID: 'Password reset token is invalid or expired',
  OTP_INVALID: 'Invalid or expired OTP',
  OTP_EXPIRED: 'OTP has expired',
  MAX_ATTEMPTS_EXCEEDED: 'Maximum login attempts exceeded',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
} as const;

// Success Messages
export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTRATION_SUCCESS: 'Registration successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PHONE_VERIFIED: 'Phone verified successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successfully',
  OTP_SENT: 'OTP sent successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Form Field Names
export const AUTH_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  OLD_PASSWORD: 'oldPassword',
  NEW_PASSWORD: 'newPassword',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  PHONE: 'phone',
  OTP: 'otp',
  REMEMBER_ME: 'rememberMe',
  TERMS_ACCEPTED: 'termsAccepted',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[+]?[1-9]?[0-9]{7,15}$/,
  PASSWORD: {
    MIN_LENGTH: /.{8,}/,
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBER: /[0-9]/,
    SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },
  NAME: /^[a-zA-Z\s]{2,50}$/,
  OTP: /^[0-9]{6}$/,
} as const;

export type AuthStatus = typeof AUTH_STATUS;
export type UserRoles = typeof USER_ROLES;
export type AuthMethods = typeof AUTH_METHODS;
export type AuthErrors = typeof AUTH_ERRORS;