import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  Address, 
  ImageAsset, 
  DeviceInfo, 
  SessionInfo,
  Status,
  Language,
  Theme,
  ValidationError 
} from './common.types';

// Re-export Address type for convenience
export type { Address } from './common.types';

// Address form data for creating/updating addresses
export interface AddressFormData {
  type: 'home' | 'work' | 'office' | 'other';
  label?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  postalCode?: string;
  country: string;
  landmark?: string;
  phone?: string;
  email?: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

// Create address request (for API calls)
export interface CreateAddressRequest {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'home' | 'work' | 'other';
  landmark?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// User Account Types
export interface User extends BaseEntity {
  // Basic Information
  firstName: string;
  lastName: string;
  name?: string; // Convenience property for full name
  email: string;
  phone?: string;
  dateOfBirth?: Timestamp;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar?: ImageAsset;
  
  // Account Status
  status: Status;
  emailVerified: boolean;
  isEmailVerified?: boolean; // Alias for emailVerified
  phoneVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  
  // Profile Settings
  preferences: UserPreferences;
  addresses: Address[];
  defaultAddressId?: ID;
  
  // Account Metadata
  lastLoginAt?: Timestamp;
  lastActiveAt?: Timestamp;
  loginCount: number;
  orderCount?: number; // Total orders placed
  totalSpent?: number; // Total amount spent
  accountType: 'regular' | 'premium' | 'vip';
  memberSince: Timestamp;
  
  // Social Links (optional)
  socialProfiles?: SocialProfile[];
  
  // Privacy Settings
  privacySettings: PrivacySettings;
  
  // Communication Preferences
  communicationPreferences: CommunicationPreferences;
  
  // Verification
  verificationDocuments?: VerificationDocument[];
  kycStatus?: 'pending' | 'verified' | 'rejected';
}

export interface UserProfile {
  id: ID;
  userId: ID;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  interests?: string[];
  favoriteCategories?: ID[];
  followersCount: number;
  followingCount: number;
  orderCount?: number; // Total orders placed
  totalSpent?: number; // Total amount spent
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferences {
  // Language and Localization
  language: Language;
  currency: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  
  // UI Preferences
  theme: Theme;
  colorScheme?: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Shopping Preferences
  defaultPaymentMethod?: ID;
  defaultShippingAddress?: ID;
  autoSaveToWishlist: boolean;
  enableRecommendations: boolean;
  showPriceAlerts: boolean;
  
  // Content Preferences
  contentCategories?: ID[];
  contentLanguages: Language[];
  showAdultContent: boolean;
  
  // Feature Toggles
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enableBrowserNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  showReviews: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
  allowThirdPartySharing: boolean;
  allowMarketingCommunication: boolean;
}

export interface CommunicationPreferences {
  email: {
    orderUpdates: boolean;
    promotionalOffers: boolean;
    newArrivals: boolean;
    priceAlerts: boolean;
    newsletter: boolean;
    productRecommendations: boolean;
    stockAlerts: boolean;
    accountSecurity: boolean;
  };
  sms: {
    orderUpdates: boolean;
    promotionalOffers: boolean;
    securityAlerts: boolean;
    deliveryUpdates: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotionalOffers: boolean;
    newArrivals: boolean;
    priceAlerts: boolean;
    stockAlerts: boolean;
    cartReminders: boolean;
    wishlistUpdates: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface SocialProfile {
  platform: 'facebook' | 'google' | 'twitter' | 'instagram' | 'linkedin';
  profileId: string;
  username?: string;
  profileUrl?: string;
  isVerified: boolean;
  isConnected: boolean;
  connectedAt: Timestamp;
}

export interface VerificationDocument {
  id: ID;
  type: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'voter_id';
  documentNumber: string;
  documentImage?: ImageAsset;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Timestamp;
  rejectionReason?: string;
}

// Authentication Types
export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'email' | 'phone' | 'social';
  icon?: string;
  isEnabled: boolean;
  config?: Record<string, string | number | boolean>;
}

export interface OAuthProvider {
  provider: 'google' | 'facebook' | 'twitter' | 'github' | 'apple';
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Timestamp;
}

export interface AuthSession extends SessionInfo {
  userId: ID;
  sessionToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Timestamp;
  scope?: string[];
  provider?: string;
  providerAccountId?: string;
  tokenType: 'Bearer' | 'Basic';
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
  referralCode?: string;
}

export interface PasswordResetRequest {
  email: string;
  captcha?: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerification {
  email: string;
  token: string;
  expiresAt: Timestamp;
}

export interface PhoneVerification {
  phone: string;
  otp: string;
  expiresAt: Timestamp;
}

export interface TwoFactorAuth {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'app';
  backupCodes?: string[];
  lastUsedAt?: Timestamp;
}

export interface SecurityEvent {
  id: ID;
  userId: ID;
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'phone_change' | 'suspicious_activity';
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isSuccessful: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
}

// JWT and Token Types
export interface JWTPayload {
  sub: ID; // user id
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti?: string;
}

export interface RefreshTokenPayload {
  sub: ID;
  sessionId: string;
  tokenFamily: string;
  iat: number;
  exp: number;
}

export interface AccessToken {
  token: string;
  type: 'Bearer';
  expiresIn: number;
  scope?: string[];
}

export interface AuthTokens {
  accessToken: AccessToken;
  refreshToken?: string;
  idToken?: string;
}

// User Actions and Activities
export interface UserActivity {
  id: ID;
  userId: ID;
  type: 'page_view' | 'product_view' | 'search' | 'add_to_cart' | 'remove_from_cart' | 'add_to_wishlist' | 'purchase' | 'review' | 'share';
  entityType?: string;
  entityId?: ID;
  metadata?: Record<string, string | number | boolean>;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
}

export interface UserNotification {
  id: ID;
  userId: ID;
  type: 'order' | 'promotion' | 'security' | 'system' | 'social';
  title: string;
  message: string;
  data?: Record<string, string | number | boolean>;
  isRead: boolean;
  readAt?: Timestamp;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'in_app' | 'email' | 'push' | 'sms';
  scheduledFor?: Timestamp;
  expiresAt?: Timestamp;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Timestamp;
}

export interface UserSubscription {
  id: ID;
  userId: ID;
  type: 'newsletter' | 'product_alerts' | 'category_updates' | 'brand_updates' | 'sale_alerts';
  isActive: boolean;
  preferences?: Record<string, string | number | boolean>;
  subscribedAt: Timestamp;
  unsubscribedAt?: Timestamp;
}

// Account Management
export interface AccountDeletion {
  userId: ID;
  reason: string;
  scheduledFor: Timestamp;
  confirmationToken: string;
  isConfirmed: boolean;
  confirmedAt?: Timestamp;
  processedAt?: Timestamp;
  dataRetentionPeriod: number; // days
}

export interface AccountSuspension {
  userId: ID;
  reason: string;
  suspendedBy: ID;
  suspendedAt: Timestamp;
  duration?: number; // days, null for indefinite
  notes?: string;
  appealable: boolean;
}

// Auth State Management
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: AuthSession | null;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt?: Timestamp;
  isLocked: boolean;
  lockExpiresAt?: Timestamp;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  isSuccessful: boolean;
  failureReason?: string;
  timestamp: Timestamp;
}

// Password and Security
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventUserInfoInPassword: boolean;
  passwordHistory: number; // number of previous passwords to remember
  maxAge: number; // days before password expires
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
  strengthLevel: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';
}

// Guest User
export interface GuestUser {
  sessionId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferences?: Partial<UserPreferences>;
  cartId?: ID;
  wishlistId?: ID;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

// User Import/Export
export interface UserExport {
  format: 'json' | 'csv' | 'xml';
  includePersonalData: boolean;
  includeActivityData: boolean;
  includePurchaseHistory: boolean;
  includePreferences: boolean;
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
}

export interface UserImport {
  source: 'csv' | 'json' | 'api';
  data: Partial<User>[];
  validationErrors?: ValidationError[];
  importedCount: number;
  failedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Multi-factor Authentication
export interface MFASetup {
  method: 'totp' | 'sms' | 'email';
  secret?: string; // for TOTP
  qrCode?: string; // for TOTP
  backupCodes: string[];
  isVerified: boolean;
}

export interface MFAChallenge {
  challengeId: string;
  method: 'totp' | 'sms' | 'email';
  expiresAt: Timestamp;
  attemptsLeft: number;
}

// Device Management
export interface UserDevice {
  id: ID;
  userId: ID;
  deviceInfo: DeviceInfo;
  fingerprint: string;
  isTrusted: boolean;
  lastUsedAt: Timestamp;
  isActive: boolean;
  name?: string; // user-defined device name
  notificationToken?: string; // for push notifications
  createdAt: Timestamp;
}

// Rate Limiting
export interface RateLimit {
  key: string;
  limit: number;
  window: number; // seconds
  current: number;
  resetAt: Timestamp;
}

// User Analytics
export interface UserSegment {
  id: ID;
  name: string;
  description: string;
  criteria: Record<string, string | number | boolean | string[]>;
  userCount: number;
  isActive: boolean;
}

export interface UserMetrics {
  userId: ID;
  lifetimeValue: number;
  averageOrderValue: number;
  orderCount: number;
  sessionCount: number;
  pageViews: number;
  timeSpent: number; // minutes
  lastPurchaseAt?: Timestamp;
  acquisitionChannel: string;
  segment: string;
  riskScore: number;
  engagementScore: number;
}
