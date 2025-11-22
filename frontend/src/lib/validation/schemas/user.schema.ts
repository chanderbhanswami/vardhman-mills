/**
 * User Schemas for Vardhman Mills Frontend
 * Zod schemas for user profile management, preferences, and account operations
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// User address schema
export const userAddressSchema = z.object({
  id: z.string().optional(),
  
  type: z.enum(['home', 'office', 'billing', 'shipping', 'other']).default('home'),
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  phone: commonValidations.phone,
  
  addressLine1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 must not exceed 200 characters')
    .transform(val => val.trim()),
  
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters')
    .transform(val => val.trim()),
  
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters')
    .transform(val => val.trim()),
  
  pincode: commonValidations.pincode,
  
  country: z.string().default('India'),
  
  landmark: z
    .string()
    .max(100, 'Landmark must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  isDefault: z.boolean().default(false),
  
  isActive: z.boolean().default(true),
});

export type UserAddressData = z.infer<typeof userAddressSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  // Communication preferences
  communication: z.object({
    email: z.object({
      newsletter: z.boolean().default(true),
      promotions: z.boolean().default(true),
      orderUpdates: z.boolean().default(true),
      recommendations: z.boolean().default(false),
      reviews: z.boolean().default(true),
      surveys: z.boolean().default(false),
    }),
    
    sms: z.object({
      orderUpdates: z.boolean().default(true),
      promotions: z.boolean().default(false),
      deliveryUpdates: z.boolean().default(true),
      securityAlerts: z.boolean().default(true),
    }),
    
    push: z.object({
      orderUpdates: z.boolean().default(true),
      promotions: z.boolean().default(false),
      newArrivals: z.boolean().default(false),
      priceDrops: z.boolean().default(false),
      backInStock: z.boolean().default(true),
    }),
    
    frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']).default('immediate'),
    
    language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu']).default('en'),
  }),
  
  // Shopping preferences
  shopping: z.object({
    currency: z.enum(['INR', 'USD']).default('INR'),
    
    priceRange: z.object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(100000),
    }),
    
    categories: z.array(z.string()).max(20).optional(),
    
    brands: z.array(z.string()).max(15).optional(),
    
    sizes: z.array(z.string()).max(10).optional(),
    
    colors: z.array(z.string()).max(15).optional(),
    
    materials: z.array(z.string()).max(10).optional(),
    
    sortPreference: z.enum([
      'relevance',
      'price_low_high',
      'price_high_low',
      'newest',
      'rating',
      'popularity'
    ]).default('relevance'),
    
    itemsPerPage: z.number().min(12).max(60).default(24),
    
    showOutOfStock: z.boolean().default(false),
    
    autoApplyCoupons: z.boolean().default(true),
  }),
  
  // Display preferences
  display: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    
    layout: z.enum(['grid', 'list']).default('grid'),
    
    density: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
    
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    
    animations: z.boolean().default(true),
    
    autoplay: z.boolean().default(false),
  }),
  
  // Privacy preferences
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).default('private'),
    
    showPurchaseHistory: z.boolean().default(false),
    
    showWishlist: z.boolean().default(false),
    
    shareReviews: z.boolean().default(true),
    
    dataTracking: z.boolean().default(false),
    
    personalizedAds: z.boolean().default(false),
    
    analytics: z.boolean().default(false),
  }),
  
  // Accessibility preferences
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    
    largeText: z.boolean().default(false),
    
    reduceMotion: z.boolean().default(false),
    
    screenReader: z.boolean().default(false),
    
    keyboardNavigation: z.boolean().default(false),
  }),
});

export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;

// User profile schema
export const userProfileSchema = z.object({
  // Basic Information
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  email: commonValidations.email,
  
  phone: commonValidations.phone.optional(),
  
  alternatePhone: commonValidations.phone.optional(),
  
  dateOfBirth: z
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .refine(
      date => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 13 && age <= 120;
      },
      'Age must be between 13 and 120 years'
    )
    .optional(),
  
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  
  avatar: z.object({
    url: z.string().url('Invalid avatar URL'),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  }).optional(),
  
  // Professional Information
  profession: z.enum([
    'student',
    'professional',
    'business_owner',
    'homemaker',
    'retired',
    'designer',
    'architect',
    'contractor',
    'hospitality',
    'healthcare',
    'education',
    'other'
  ]).optional(),
  
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  designation: z
    .string()
    .max(100, 'Designation must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  industry: z.enum([
    'textiles',
    'fashion',
    'interior_design',
    'hospitality',
    'healthcare',
    'education',
    'retail',
    'manufacturing',
    'construction',
    'other'
  ]).optional(),
  
  // Business Information (for B2B customers)
  businessInfo: z.object({
    isBusinessCustomer: z.boolean().default(false),
    
    businessName: z
      .string()
      .max(200, 'Business name must not exceed 200 characters')
      .optional(),
    
    businessType: z.enum([
      'sole_proprietorship',
      'partnership',
      'private_limited',
      'public_limited',
      'llp',
      'trust',
      'ngo',
      'government'
    ]).optional(),
    
    gstNumber: commonValidations.gst.optional(),
    
    panNumber: commonValidations.pan.optional(),
    
    industryType: z.string().max(100).optional(),
    
    annualTurnover: z.enum([
      'below_1_lakh',
      '1_5_lakhs',
      '5_10_lakhs',
      '10_25_lakhs',
      '25_50_lakhs',
      '50_lakhs_1_crore',
      'above_1_crore'
    ]).optional(),
    
    employeeCount: z.enum([
      '1_10',
      '11_50',
      '51_200',
      '201_500',
      '501_1000',
      'above_1000'
    ]).optional(),
    
    website: z.string().url('Invalid website URL').optional(),
    
    businessRegistrationNumber: z.string().max(50).optional(),
  }).optional(),
  
  // Social Information
  social: z.object({
    linkedin: z.string().url('Invalid LinkedIn URL').optional(),
    
    instagram: z.string().url('Invalid Instagram URL').optional(),
    
    facebook: z.string().url('Invalid Facebook URL').optional(),
    
    twitter: z.string().url('Invalid Twitter URL').optional(),
    
    website: z.string().url('Invalid website URL').optional(),
  }).optional(),
  
  // Location Information
  location: z.object({
    country: z.string().default('India'),
    
    state: z.string().max(50).optional(),
    
    city: z.string().max(50).optional(),
    
    pincode: commonValidations.pincode.optional(),
    
    timezone: z.string().default('Asia/Kolkata'),
  }).optional(),
  
  // Account Settings
  settings: z.object({
    twoFactorEnabled: z.boolean().default(false),
    
    loginNotifications: z.boolean().default(true),
    
    sessionTimeout: z.number().min(15).max(480).default(60), // minutes
    
    autoLogout: z.boolean().default(false),
    
    passwordChangeReminder: z.boolean().default(true),
  }),
  
  // Verification Status
  verification: z.object({
    emailVerified: z.boolean().default(false),
    
    phoneVerified: z.boolean().default(false),
    
    identityVerified: z.boolean().default(false),
    
    businessVerified: z.boolean().default(false),
    
    kycStatus: z.enum(['not_started', 'pending', 'approved', 'rejected']).default('not_started'),
  }),
});

export type UserProfileData = z.infer<typeof userProfileSchema>;

// User profile update schema
export const updateUserProfileSchema = userProfileSchema.partial();

export type UpdateUserProfileData = z.infer<typeof updateUserProfileSchema>;

// User account settings schema
export const userAccountSettingsSchema = z.object({
  // Security Settings
  security: z.object({
    currentPassword: z.string().min(1, 'Current password is required').optional(),
    
    newPassword: commonValidations.password.optional(),
    
    confirmPassword: z.string().optional(),
    
    twoFactorEnabled: z.boolean(),
    
    trustedDevices: z.array(z.object({
      deviceId: z.string(),
      deviceName: z.string(),
      lastUsed: z.date(),
      trusted: z.boolean(),
    })).optional(),
    
    loginNotifications: z.boolean(),
    
    passwordChangeReminder: z.boolean(),
    
    sessionTimeout: z.number().min(15).max(480),
  }).optional(),
  
  // Privacy Settings
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']),
    
    showPurchaseHistory: z.boolean(),
    
    showWishlist: z.boolean(),
    
    shareReviews: z.boolean(),
    
    dataTracking: z.boolean(),
    
    personalizedAds: z.boolean(),
    
    analytics: z.boolean(),
    
    cookiePreferences: z.object({
      necessary: z.boolean().default(true),
      
      functional: z.boolean(),
      
      analytical: z.boolean(),
      
      marketing: z.boolean(),
    }),
  }).optional(),
  
  // Notification Settings
  notifications: userPreferencesSchema.shape.communication.optional(),
  
  // Display Settings
  display: userPreferencesSchema.shape.display.optional(),
  
  // Shopping Settings
  shopping: userPreferencesSchema.shape.shopping.optional(),
}).refine(data => {
  if (data.security?.newPassword && data.security?.confirmPassword) {
    return data.security.newPassword === data.security.confirmPassword;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['security', 'confirmPassword'],
});

export type UserAccountSettingsData = z.infer<typeof userAccountSettingsSchema>;

// User search schema (admin)
export const userSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional(),
  
  filters: z.object({
    status: z.array(z.enum(['active', 'inactive', 'suspended', 'banned'])).optional(),
    
    role: z.array(z.enum(['customer', 'business', 'admin', 'moderator'])).optional(),
    
    verificationStatus: z.array(z.enum(['verified', 'unverified', 'pending'])).optional(),
    
    registrationDate: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).refine(
      data => data.startDate <= data.endDate,
      'Start date must be before or equal to end date'
    ).optional(),
    
    lastLoginDate: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).optional(),
    
    location: z.object({
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    }).optional(),
    
    orderCount: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    
    totalSpent: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    
    profession: z.array(z.string()).optional(),
    
    businessCustomer: z.boolean().optional(),
    
    hasGstNumber: z.boolean().optional(),
    
    newsletter: z.boolean().optional(),
  }).optional(),
  
  sortBy: z.enum([
    'name_asc',
    'name_desc',
    'email_asc',
    'email_desc',
    'registration_date_desc',
    'registration_date_asc',
    'last_login_desc',
    'last_login_asc',
    'order_count_desc',
    'total_spent_desc'
  ]).default('registration_date_desc'),
  
  page: z.number().min(1).default(1),
  
  limit: z.number().min(1).max(100).default(20),
  
  includeProfile: z.boolean().default(false),
  
  includeStats: z.boolean().default(false),
});

export type UserSearchData = z.infer<typeof userSearchSchema>;

// User analytics schema
export const userAnalyticsSchema = z.object({
  userIds: z.array(z.string().min(1)).optional(),
  
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    data => data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  ),
  
  metrics: z
    .array(z.enum([
      'total_users',
      'new_registrations',
      'active_users',
      'user_retention',
      'average_order_value',
      'lifetime_value',
      'engagement_rate',
      'conversion_rate',
      'churn_rate'
    ]))
    .min(1, 'At least one metric is required')
    .max(9, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('month'),
  
  segmentBy: z.enum([
    'registration_date',
    'location',
    'profession',
    'order_count',
    'total_spent',
    'verification_status',
    'customer_type'
  ]).optional(),
  
  includeComparison: z.boolean().default(false),
  
  includeDetails: z.boolean().default(false),
  
  includeCohorts: z.boolean().default(false),
});

export type UserAnalyticsData = z.infer<typeof userAnalyticsSchema>;

// Bulk user operations schema
export const bulkUserOperationSchema = z.object({
  operation: z.enum([
    'activate',
    'deactivate',
    'suspend',
    'unsuspend',
    'verify_email',
    'verify_phone',
    'send_newsletter',
    'export',
    'delete'
  ]),
  
  userIds: z
    .array(z.string().min(1))
    .min(1, 'At least one user required')
    .max(1000, 'Maximum 1000 users allowed'),
  
  data: z.object({
    reason: z.string().max(500).optional(),
    
    notificationMessage: z.string().max(1000).optional(),
    
    sendNotification: z.boolean().default(true),
    
    emailTemplate: z.string().optional(),
  }).optional(),
  
  filters: z.object({
    status: z.array(z.string()).optional(),
    
    role: z.array(z.string()).optional(),
    
    location: z.object({
      country: z.string().optional(),
      state: z.string().optional(),
    }).optional(),
    
    registrationDate: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).optional(),
  }).optional(),
  
  dryRun: z.boolean().default(false),
});

export type BulkUserOperationData = z.infer<typeof bulkUserOperationSchema>;

// Export all schemas
export const userSchemas = {
  userAddress: userAddressSchema,
  userPreferences: userPreferencesSchema,
  userProfile: userProfileSchema,
  updateUserProfile: updateUserProfileSchema,
  userAccountSettings: userAccountSettingsSchema,
  userSearch: userSearchSchema,
  userAnalytics: userAnalyticsSchema,
  bulkUserOperation: bulkUserOperationSchema,
};

export default userSchemas;
