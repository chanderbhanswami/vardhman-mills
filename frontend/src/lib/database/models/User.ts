/**
 * User Model - Comprehensive user management with authentication and profile features
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * User Profile Schema
 */
export const UserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  avatar: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  website: z.string().url().optional(),
  social: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
});

/**
 * User Preferences Schema
 */
export const UserPreferencesSchema = z.object({
  language: z.string().default('en'),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  emailMarketing: z.boolean().default(false),
  smsMarketing: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  promotionalEmails: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  productRecommendations: z.boolean().default(true),
  reviewReminders: z.boolean().default(true),
});

/**
 * User Security Schema
 */
export const UserSecuritySchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
  loginAttempts: z.number().default(0),
  lockedUntil: z.date().optional(),
  passwordResetToken: z.string().optional(),
  passwordResetExpires: z.date().optional(),
  emailVerificationToken: z.string().optional(),
  emailVerificationExpires: z.date().optional(),
  lastPasswordChange: z.date().optional(),
  sessionTokens: z.array(z.object({
    token: z.string(),
    device: z.string().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    createdAt: z.date(),
    lastUsed: z.date(),
    expiresAt: z.date(),
  })).default([]),
});

/**
 * User Activity Schema
 */
export const UserActivitySchema = z.object({
  lastLogin: z.date().optional(),
  lastLoginIP: z.string().optional(),
  lastLoginDevice: z.string().optional(),
  totalLogins: z.number().default(0),
  totalOrders: z.number().default(0),
  totalSpent: z.number().default(0),
  averageOrderValue: z.number().default(0),
  favoriteCategories: z.array(z.string()).default([]),
  lastViewedProducts: z.array(z.string()).default([]),
  searchHistory: z.array(z.object({
    query: z.string(),
    timestamp: z.date(),
    results: z.number().optional(),
  })).default([]),
  loginHistory: z.array(z.object({
    timestamp: z.date(),
    ip: z.string().optional(),
    device: z.string().optional(),
    userAgent: z.string().optional(),
    success: z.boolean(),
    failureReason: z.string().optional(),
  })).default([]),
});

/**
 * User Loyalty Schema
 */
export const UserLoyaltySchema = z.object({
  points: z.number().default(0),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']).default('bronze'),
  totalEarned: z.number().default(0),
  totalRedeemed: z.number().default(0),
  expiringPoints: z.array(z.object({
    points: z.number(),
    expiresAt: z.date(),
  })).default([]),
  tierBenefits: z.array(z.string()).default([]),
  nextTierRequirement: z.number().optional(),
});

/**
 * Main User Schema
 */
export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  email: z.string().email('Invalid email format').toLowerCase(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['customer', 'admin', 'moderator', 'staff']).default('customer'),
  status: z.enum(['active', 'inactive', 'suspended', 'banned', 'pending']).default('pending'),
  isVerified: z.boolean().default(false),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  profile: UserProfileSchema,
  preferences: UserPreferencesSchema.default({
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    theme: 'light',
    emailMarketing: false,
    smsMarketing: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: false,
    productRecommendations: true,
    reviewReminders: true,
  }),
  security: UserSecuritySchema.default({
    twoFactorEnabled: false,
    loginAttempts: 0,
    sessionTokens: [],
  }),
  activity: UserActivitySchema.default({
    totalLogins: 0,
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    favoriteCategories: [],
    lastViewedProducts: [],
    searchHistory: [],
    loginHistory: [],
  }),
  loyalty: UserLoyaltySchema.default({
    points: 0,
    tier: 'bronze',
    totalEarned: 0,
    totalRedeemed: 0,
    expiringPoints: [],
    tierBenefits: [],
  }),
  addresses: z.array(z.string()).default([]), // Address IDs
  paymentMethods: z.array(z.object({
    id: z.string(),
    type: z.enum(['card', 'upi', 'netbanking', 'wallet']),
    provider: z.string(),
    lastFour: z.string().optional(),
    isDefault: z.boolean().default(false),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })).default([]),
  subscription: z.object({
    newsletter: z.boolean().default(false),
    promotions: z.boolean().default(false),
    updates: z.boolean().default(true),
  }).default({
    newsletter: false,
    promotions: false,
    updates: true,
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().optional(),
});

/**
 * TypeScript Types
 */
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserSecurity = z.infer<typeof UserSecuritySchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type UserLoyalty = z.infer<typeof UserLoyaltySchema>;
export type User = z.infer<typeof UserSchema>;

/**
 * Create User Input Schema (for registration)
 */
export const CreateUserSchema = UserSchema.pick({
  email: true,
  phone: true,
  password: true,
  profile: true,
  preferences: true,
}).extend({
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
  subscribeNewsletter: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Update User Input Schema
 */
export const UpdateUserSchema = UserSchema.partial().omit({
  _id: true,
  createdAt: true,
  email: true, // Email updates should be handled separately
  password: true, // Password updates should be handled separately
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * User Login Schema
 */
export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
  captcha: z.string().optional(),
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;

/**
 * Password Change Schema
 */
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;

/**
 * Password Reset Schema
 */
export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
  captcha: z.string().optional(),
});

export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;

/**
 * Password Reset Confirm Schema
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>;

/**
 * Email Verification Schema
 */
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type EmailVerificationInput = z.infer<typeof EmailVerificationSchema>;

/**
 * User Filter Schema (for admin/search)
 */
export const UserFilterSchema = z.object({
  role: z.enum(['customer', 'admin', 'moderator', 'staff']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'banned', 'pending']).optional(),
  isVerified: z.boolean().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']).optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'totalSpent', 'totalOrders']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UserFilter = z.infer<typeof UserFilterSchema>;

/**
 * User Statistics Schema
 */
export const UserStatsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  newUsersToday: z.number(),
  newUsersThisWeek: z.number(),
  newUsersThisMonth: z.number(),
  verifiedUsers: z.number(),
  unverifiedUsers: z.number(),
  usersByRole: z.record(z.string(), z.number()),
  usersByStatus: z.record(z.string(), z.number()),
  usersByTier: z.record(z.string(), z.number()),
  averageOrderValue: z.number(),
  totalRevenue: z.number(),
  topSpenders: z.array(z.object({
    userId: z.string(),
    email: z.string(),
    name: z.string(),
    totalSpent: z.number(),
    totalOrders: z.number(),
  })),
  registrationTrends: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

/**
 * User Public Profile Schema (for frontend display)
 */
export const UserPublicProfileSchema = UserSchema.pick({
  _id: true,
  profile: true,
  loyalty: true,
  createdAt: true,
}).extend({
  displayName: z.string(),
  avatar: z.string().optional(),
  totalReviews: z.number().default(0),
  averageRating: z.number().default(0),
  badgesEarned: z.array(z.string()).default([]),
  isVerifiedReviewer: z.boolean().default(false),
});

export type UserPublicProfile = z.infer<typeof UserPublicProfileSchema>;

/**
 * User Session Schema
 */
export const UserSessionSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  preferences: UserPreferencesSchema.partial(),
  permissions: z.array(z.string()).default([]),
  sessionId: z.string(),
  expiresAt: z.date(),
  issuedAt: z.date(),
  refreshToken: z.string().optional(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

/**
 * Validation functions
 */
export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};

export const validateCreateUser = (data: unknown): CreateUserInput => {
  return CreateUserSchema.parse(data);
};

export const validateUpdateUser = (data: unknown): UpdateUserInput => {
  return UpdateUserSchema.parse(data);
};

export const validateUserLogin = (data: unknown): UserLoginInput => {
  return UserLoginSchema.parse(data);
};

export const validatePasswordChange = (data: unknown): PasswordChangeInput => {
  return PasswordChangeSchema.parse(data);
};

export const validatePasswordReset = (data: unknown): PasswordResetInput => {
  return PasswordResetSchema.parse(data);
};

export const validatePasswordResetConfirm = (data: unknown): PasswordResetConfirmInput => {
  return PasswordResetConfirmSchema.parse(data);
};

export const validateEmailVerification = (data: unknown): EmailVerificationInput => {
  return EmailVerificationSchema.parse(data);
};

export const validateUserFilter = (data: unknown): UserFilter => {
  return UserFilterSchema.parse(data);
};

/**
 * User utility functions
 */
export const userUtils = {
  /**
   * Get display name from user profile
   */
  getDisplayName: (user: User): string => {
    const { firstName, lastName } = user.profile;
    return `${firstName} ${lastName}`.trim() || user.email.split('@')[0];
  },

  /**
   * Check if user is admin
   */
  isAdmin: (user: User): boolean => {
    return user.role === 'admin';
  },

  /**
   * Check if user is staff
   */
  isStaff: (user: User): boolean => {
    return ['admin', 'moderator', 'staff'].includes(user.role);
  },

  /**
   * Check if user is active
   */
  isActive: (user: User): boolean => {
    return user.status === 'active' && !user.deletedAt;
  },

  /**
   * Check if user account is locked
   */
  isLocked: (user: User): boolean => {
    return user.security.lockedUntil ? user.security.lockedUntil > new Date() : false;
  },

  /**
   * Get user's full address
   */
  getFullName: (user: User): string => {
    return `${user.profile.firstName} ${user.profile.lastName}`.trim();
  },

  /**
   * Get user's loyalty tier info
   */
  getLoyaltyInfo: (user: User) => {
    const { points, tier, nextTierRequirement } = user.loyalty;
    return {
      currentTier: tier,
      currentPoints: points,
      nextTier: getNextTier(tier),
      pointsToNextTier: nextTierRequirement ? nextTierRequirement - points : 0,
      tierBenefits: user.loyalty.tierBenefits,
    };
  },

  /**
   * Check if user has permission
   */
  hasPermission: (user: User, permission: string): boolean => {
    // This would typically check against a permissions system
    // For now, we'll use role-based checks
    const rolePermissions = {
      customer: ['read:own', 'update:own'],
      staff: ['read:own', 'update:own', 'read:users'],
      moderator: ['read:own', 'update:own', 'read:users', 'update:users'],
      admin: ['*'], // All permissions
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  },

  /**
   * Sanitize user data for public display
   */
  sanitizeForPublic: (user: User): UserPublicProfile => {
    return {
      _id: user._id,
      profile: user.profile,
      loyalty: user.loyalty,
      createdAt: user.createdAt,
      displayName: userUtils.getDisplayName(user),
      avatar: user.profile.avatar,
      totalReviews: 0, // This would be populated from reviews collection
      averageRating: 0, // This would be calculated from reviews
      badgesEarned: [], // This would be calculated based on achievements
      isVerifiedReviewer: user.isVerified && user.activity.totalOrders > 0,
    };
  },

  /**
   * Create user session data
   */
  createSessionData: (user: User): Omit<UserSession, 'sessionId' | 'expiresAt' | 'issuedAt' | 'refreshToken'> => {
    return {
      userId: user._id?.toString() || '',
      email: user.email,
      role: user.role,
      name: userUtils.getDisplayName(user),
      avatar: user.profile.avatar,
      preferences: user.preferences,
      permissions: [], // This would be populated based on role
    };
  },

  /**
   * Update user activity
   */
  updateActivity: (
    user: User,
    updates: Partial<UserActivity>
  ): UserActivity => {
    return {
      ...user.activity,
      ...updates,
    };
  },

  /**
   * Add loyalty points
   */
  addLoyaltyPoints: (user: User, points: number): UserLoyalty => {
    const newPoints = user.loyalty.points + points;
    const newTier = calculateTier(newPoints);
    
    return {
      ...user.loyalty,
      points: newPoints,
      tier: newTier,
      totalEarned: user.loyalty.totalEarned + points,
    };
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password should contain uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password should contain numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Password should contain special characters');

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  },

  /**
   * Generate user avatar URL
   */
  generateAvatarUrl: (user: User): string => {
    if (user.profile.avatar) {
      return user.profile.avatar;
    }
    
    // Generate avatar based on initials
    const name = userUtils.getDisplayName(user);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=200`;
  },
};

/**
 * Helper functions
 */
function getNextTier(currentTier: UserLoyalty['tier']): UserLoyalty['tier'] | null {
  const tiers: UserLoyalty['tier'][] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function calculateTier(points: number): UserLoyalty['tier'] {
  if (points >= 10000) return 'diamond';
  if (points >= 5000) return 'platinum';
  if (points >= 2500) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
}

/**
 * Default user values
 */
export const defaultUser: Partial<User> = {
  role: 'customer',
  status: 'pending',
  isVerified: false,
  isEmailVerified: false,
  isPhoneVerified: false,
  preferences: {
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    theme: 'light',
    emailMarketing: false,
    smsMarketing: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: false,
    productRecommendations: true,
    reviewReminders: true,
  },
  security: {
    twoFactorEnabled: false,
    loginAttempts: 0,
    sessionTokens: [],
  },
  activity: {
    totalLogins: 0,
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    favoriteCategories: [],
    lastViewedProducts: [],
    searchHistory: [],
    loginHistory: [],
  },
  loyalty: {
    points: 0,
    tier: 'bronze',
    totalEarned: 0,
    totalRedeemed: 0,
    expiringPoints: [],
    tierBenefits: [],
  },
  addresses: [],
  paymentMethods: [],
  subscription: {
    newsletter: false,
    promotions: false,
    updates: true,
  },
  tags: [],
};

const UserModel = {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserLoginSchema,
  PasswordChangeSchema,
  PasswordResetSchema,
  PasswordResetConfirmSchema,
  EmailVerificationSchema,
  UserFilterSchema,
  UserStatsSchema,
  UserPublicProfileSchema,
  UserSessionSchema,
  validateUser,
  validateCreateUser,
  validateUpdateUser,
  validateUserLogin,
  validatePasswordChange,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateEmailVerification,
  validateUserFilter,
  userUtils,
  defaultUser,
};

export default UserModel;