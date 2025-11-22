import { 
  ID, 
  Timestamp, 
  BaseEntity,
  ValidationError 
} from './common.types';
import { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterData, 
  PasswordResetRequest, 
  PasswordReset,
  AuthTokens,
  AuthState,
  OAuthProvider,
  TwoFactorAuth,
  MFASetup,
  MFAChallenge,
  SecurityEvent,
  LoginAttempt,
  PasswordStrength,
  GuestUser
} from './user.types';

// Authentication Forms
export interface LoginForm {
  identifier: string; // email or phone
  password: string;
  rememberMe: boolean;
  captcha?: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  acceptMarketing: boolean;
  referralCode?: string;
  source?: string;
}

export interface ForgotPasswordForm {
  email: string;
  captcha?: string;
}

export interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface EmailUpdateForm {
  newEmail: string;
  password: string;
  otp?: string;
}

export interface PhoneUpdateForm {
  newPhone: string;
  password: string;
  otp?: string;
}

// OAuth and Social Login
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  responseType: 'code' | 'token';
  state?: string;
  nonce?: string;
}

export interface OAuthState {
  provider: string;
  returnUrl?: string;
  state: string;
  codeVerifier?: string; // for PKCE
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface SocialLoginButton {
  provider: 'google' | 'facebook' | 'twitter' | 'github' | 'apple';
  label: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  isEnabled: boolean;
}

// NextAuth.js Types
export interface NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

export interface NextAuthAccount {
  id: string;
  userId: string;
  type: 'oauth' | 'email' | 'credentials';
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface NextAuthSession {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface NextAuthVerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// Authentication Providers
export interface GoogleAuthConfig extends OAuthConfig {
  provider: 'google';
  hostedDomain?: string;
}

export interface FacebookAuthConfig extends OAuthConfig {
  provider: 'facebook';
  fields?: string[];
}

export interface TwitterAuthConfig extends OAuthConfig {
  provider: 'twitter';
  version: '1.0a' | '2.0';
}

export interface AppleAuthConfig extends OAuthConfig {
  provider: 'apple';
  teamId: string;
  keyId: string;
  privateKey: string;
}

// Multi-Factor Authentication
export interface TOTPSetup extends MFASetup {
  method: 'totp';
  secret: string;
  qrCode: string;
  appName: string;
  issuer: string;
}

export interface SMSSetup extends MFASetup {
  method: 'sms';
  phoneNumber: string;
  isPhoneVerified: boolean;
}

export interface EmailSetup extends MFASetup {
  method: 'email';
  emailAddress: string;
  isEmailVerified: boolean;
}

export interface MFAVerification {
  challengeId: string;
  code: string;
  method: 'totp' | 'sms' | 'email' | 'backup';
  trustDevice?: boolean;
}

// Session Management
export interface SessionConfig {
  maxAge: number; // seconds
  updateAge: number; // seconds
  strategy: 'jwt' | 'database';
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
  httpOnly: boolean;
  domain?: string;
  path: string;
}

export interface SessionActivity {
  sessionId: string;
  userId: ID;
  action: 'created' | 'updated' | 'destroyed' | 'extended';
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: Timestamp;
}

// JWT Configuration
export interface JWTConfig {
  secret: string;
  algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  expiresIn: string;
  issuer: string;
  audience: string;
  clockTolerance: number;
}

export interface JWTError {
  name: string;
  message: string;
  expiredAt?: Date;
  date?: Date;
}

// Authentication Events
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'verify_email' | 'verify_phone' | 'reset_password' | 'change_password' | 'enable_mfa' | 'disable_mfa';
  userId?: ID;
  sessionId?: string;
  provider?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: Timestamp;
}

// Rate Limiting and Security
export interface AuthRateLimit {
  endpoint: string;
  identifier: string; // IP or user ID
  attempts: number;
  windowStart: Timestamp;
  windowSize: number; // minutes
  maxAttempts: number;
  resetAt: Timestamp;
  isBlocked: boolean;
}

export interface SecurityPolicy {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventCommonPasswords: boolean;
    passwordHistory: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    inactivityTimeout: number; // minutes
    rememberMeDuration: number; // days
  };
  mfaPolicy: {
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
    gracePeriod: number; // days
  };
}

// Account Recovery
export interface RecoveryMethod {
  type: 'email' | 'phone' | 'security_questions' | 'backup_codes';
  isEnabled: boolean;
  isVerified: boolean;
  value?: string; // email address or phone number
  lastUsed?: Timestamp;
}

export interface SecurityQuestion {
  id: ID;
  question: string;
  answer: string; // hashed
  isActive: boolean;
  createdAt: Timestamp;
}

export interface BackupCode {
  code: string; // hashed
  isUsed: boolean;
  usedAt?: Timestamp;
  createdAt: Timestamp;
}

// Device Trust and Recognition
export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  plugins: string[];
  fonts: string[];
  canvas?: string;
  webgl?: string;
  hash: string;
}

export interface TrustedDevice {
  id: ID;
  userId: ID;
  fingerprint: DeviceFingerprint;
  name?: string;
  isTrusted: boolean;
  trustLevel: 'low' | 'medium' | 'high';
  lastSeen: Timestamp;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

// Authentication State Management
export interface AuthContextValue {
  // State
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (data: PasswordResetRequest) => Promise<void>;
  changePassword: (data: ChangePasswordForm) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (otp: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // OAuth
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  
  // MFA
  setupMFA: (method: 'totp' | 'sms' | 'email') => Promise<MFASetup>;
  verifyMFA: (verification: MFAVerification) => Promise<void>;
  disableMFA: () => Promise<void>;
}

// Form Validation
export interface AuthValidationSchema {
  email: ValidationRule[];
  password: ValidationRule[];
  confirmPassword: ValidationRule[];
  firstName: ValidationRule[];
  lastName: ValidationRule[];
  phone: ValidationRule[];
  otp: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'match' | 'custom';
  value?: string | number;
  message: string;
  validator?: (value: string) => boolean;
}

// Authentication Middleware
export interface AuthMiddleware {
  requireAuth: boolean;
  requireVerification: boolean;
  requireMFA: boolean;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  redirectTo?: string;
}

// Captcha and Bot Protection
export interface CaptchaConfig {
  provider: 'recaptcha' | 'hcaptcha' | 'turnstile';
  siteKey: string;
  secretKey: string;
  threshold?: number;
  invisible?: boolean;
}

export interface CaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Email Templates
export interface EmailTemplate {
  type: 'welcome' | 'verification' | 'password_reset' | 'password_changed' | 'login_alert' | 'mfa_enabled';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, string>;
}

// Authentication Analytics
export interface AuthMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  successfulLogins: number;
  failedLogins: number;
  passwordResets: number;
  emailVerifications: number;
  mfaSetups: number;
  suspiciousActivities: number;
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: Timestamp;
}

export interface AuthAnalytics {
  conversionRate: number;
  abandonmentRate: number;
  averageRegistrationTime: number;
  popularOAuthProviders: Array<{
    provider: string;
    percentage: number;
  }>;
  securityIncidents: SecurityEvent[];
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
}

// Security Settings and Alert Types
export interface SecuritySettings {
  id: ID;
  userId: ID;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'totp' | 'sms' | 'email';
  backupCodes: BackupCode[];
  trustedDevices: TrustedDevice[];
  passwordLastChanged: Timestamp;
  securityNotifications: SecurityNotificationSettings;
  loginHistory: LoginHistory[];
  securityAlerts: SecurityAlert[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  sessionTimeout: number; // minutes
  requireReauth: boolean;
  allowMultipleSessions: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SecurityAlert {
  id: ID;
  userId: ID;
  type: 'suspicious_login' | 'new_device' | 'password_changed' | 'mfa_disabled' | 'account_locked' | 'failed_login_attempts';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, string | number | boolean>;
  isRead: boolean;
  isResolved: boolean;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  actionTaken?: string;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

export interface SecurityNotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushAlerts: boolean;
  loginNotifications: boolean;
  securityAlerts: boolean;
  deviceAlerts: boolean;
  locationAlerts: boolean;
  passwordAlerts: boolean;
  mfaAlerts: boolean;
}

export interface LoginHistory {
  id: ID;
  userId: ID;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device: DeviceInfo;
  success: boolean;
  failureReason?: string;
  mfaUsed: boolean;
  duration?: number; // session duration in minutes
  loginAt: Timestamp;
  logoutAt?: Timestamp;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'watch' | 'unknown';
  os: string;
  browser: string;
  fingerprint: string;
  isTrusted: boolean;
  lastSeen: Timestamp;
}

export interface AuthUser extends User {
  currentSession?: AuthSession;
  activeSessions: AuthSession[];
  securitySettings: SecuritySettings;
  mfaEnabled: boolean;
  lastSecurityCheck: Timestamp;
  riskScore: number;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface AuthTypeUsage {
  baseEntity: BaseEntity;
  validationError: ValidationError;
  passwordReset: PasswordReset;
  authTokens: AuthTokens;
  authState: AuthState;
  oauthProvider: OAuthProvider;
  twoFactorAuth: TwoFactorAuth;
  mfaChallenge: MFAChallenge;
  loginAttempt: LoginAttempt;
  passwordStrength: PasswordStrength;
  guestUser: GuestUser;
}
