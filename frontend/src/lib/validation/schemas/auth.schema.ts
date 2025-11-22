/**
 * Authentication Schemas for Vardhman Mills Frontend
 * Zod schemas for user authentication, registration, and profile management
 */

import { z } from 'zod';
import { commonValidations, validationHelpers } from '../common';

// Base user information schema
export const baseUserSchema = z.object({
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
  
  phone: commonValidations.phone,
});

// Login schema
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration schema
export const registrationSchema = baseUserSchema.extend({
  password: commonValidations.password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  dateOfBirth: z
    .date()
    .refine(validationHelpers.isAdult, 'You must be at least 18 years old')
    .refine(date => date <= new Date(), 'Date of birth cannot be in the future'),
  
  gender: z.enum(['male', 'female', 'other']).refine(val => val !== undefined, {
    message: 'Please select your gender',
  }),
  
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
  
  marketingEmails: z.boolean().optional().default(false),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Social registration schema
export const socialRegistrationSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']).refine(val => val !== undefined, {
    message: 'Social provider is required',
  }),
  providerId: z.string().min(1, 'Provider ID is required'),
  email: commonValidations.email,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  avatar: z.string().url().optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  marketingEmails: z.boolean().optional().default(false),
});

export type SocialRegistrationFormData = z.infer<typeof socialRegistrationSchema>;

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: commonValidations.email,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Password reset schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: commonValidations.password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonValidations.password,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  data => data.newPassword === data.confirmPassword,
  {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  data => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: commonValidations.email.optional(),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, 'Secret key is required'),
  token: z
    .string()
    .length(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Authentication code must contain only digits'),
});

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;

// Two-factor authentication verification schema
export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .length(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Authentication code must contain only digits'),
  rememberDevice: z.boolean().optional().default(false),
});

export type TwoFactorVerifyFormData = z.infer<typeof twoFactorVerifySchema>;

// Profile update schema
export const profileUpdateSchema = z.object({
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
  
  phone: commonValidations.phone,
  
  dateOfBirth: z
    .date()
    .refine(validationHelpers.isAdult, 'You must be at least 18 years old')
    .refine(date => date <= new Date(), 'Date of birth cannot be in the future'),
  
  gender: z.enum(['male', 'female', 'other']).refine(val => val !== undefined, {
    message: 'Please select your gender',
  }),
  
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),
  
  preferences: z.object({
    language: z.enum(['en', 'hi']).default('en'),
    currency: z.enum(['INR', 'USD']).default('INR'),
    timezone: z.string().default('Asia/Kolkata'),
    marketingEmails: z.boolean().default(false),
    orderUpdates: z.boolean().default(true),
    securityAlerts: z.boolean().default(true),
  }).optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Avatar update schema
export const avatarUpdateSchema = z.object({
  avatar: z.instanceof(File).optional(),
  removeAvatar: z.boolean().optional().default(false),
}).refine(
  data => data.avatar || data.removeAvatar,
  {
    message: 'Please select an avatar image or choose to remove current avatar',
    path: ['avatar'],
  }
);

export type AvatarUpdateFormData = z.infer<typeof avatarUpdateSchema>;

// Account deactivation schema
export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to deactivate account'),
  reason: z.enum([
    'temporary_break',
    'privacy_concerns',
    'too_many_emails',
    'not_useful',
    'found_alternative',
    'other'
  ]).refine(val => val !== undefined, {
    message: 'Please select a reason for deactivation',
  }),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  confirmDeactivation: z
    .boolean()
    .refine(val => val === true, 'You must confirm account deactivation'),
});

export type DeactivateAccountFormData = z.infer<typeof deactivateAccountSchema>;

// Account deletion schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmationText: z
    .string()
    .refine(val => val === 'DELETE MY ACCOUNT', 'Please type "DELETE MY ACCOUNT" to confirm'),
  reason: z.enum([
    'privacy_concerns',
    'not_useful',
    'found_alternative',
    'security_concerns',
    'other'
  ]).refine(val => val !== undefined, {
    message: 'Please select a reason for deletion',
  }),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  confirmDeletion: z
    .boolean()
    .refine(val => val === true, 'You must confirm account deletion'),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// Session management schema
export const sessionSchema = z.object({
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string(),
    browser: z.string(),
    os: z.string(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  }),
  location: z.object({
    ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Invalid IP address'),
    country: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  lastActivity: z.date(),
  expiresAt: z.date(),
});

export type SessionData = z.infer<typeof sessionSchema>;

// Login activity schema
export const loginActivitySchema = z.object({
  timestamp: z.date(),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Invalid IP address'),
  userAgent: z.string(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  success: z.boolean(),
  failureReason: z.string().optional(),
  deviceInfo: z.object({
    platform: z.string(),
    browser: z.string(),
    os: z.string(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  }),
});

export type LoginActivityData = z.infer<typeof loginActivitySchema>;

// Security settings schema
export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  suspiciousActivityAlerts: z.boolean().default(true),
  sessionTimeout: z.enum(['15', '30', '60', '120']).default('30'),
  trustedDevices: z.array(z.string()).default([]),
});

export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>;

// Export all schemas
export const authSchemas = {
  login: loginSchema,
  registration: registrationSchema,
  socialRegistration: socialRegistrationSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
  verifyEmail: verifyEmailSchema,
  twoFactorSetup: twoFactorSetupSchema,
  twoFactorVerify: twoFactorVerifySchema,
  profileUpdate: profileUpdateSchema,
  avatarUpdate: avatarUpdateSchema,
  deactivateAccount: deactivateAccountSchema,
  deleteAccount: deleteAccountSchema,
  session: sessionSchema,
  loginActivity: loginActivitySchema,
  securitySettings: securitySettingsSchema,
};

export default authSchemas;
