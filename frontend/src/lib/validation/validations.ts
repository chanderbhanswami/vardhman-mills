/**
 * Main Validation Schemas for Vardhman Mills Frontend
 * This file contains only unique validation schemas not covered by other validation files
 * Removed duplicates to avoid conflicts with common.ts, custom-validators.ts, and form-validation.ts
 */

import { z } from 'zod';
import { commonValidations } from './common';

// ============================================================================
// AUTHENTICATION SCHEMAS (Simplified, removing duplicates from common.ts)
// ============================================================================

export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  firstName: commonValidations.name('First name'),
  lastName: commonValidations.name('Last name'),
  email: commonValidations.email,
  password: commonValidations.password,
  passwordConfirm: z.string(),
  mobile: commonValidations.phone.optional(),
  agreeToTerms: commonValidations.terms,
  agreeToPrivacy: commonValidations.privacy,
  marketingConsent: z.boolean().default(false),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

export const forgotPasswordSchema = z.object({
  email: commonValidations.email,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: commonValidations.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================================================
// PROFILE & ACCOUNT SCHEMAS (Unique to this file)
// ============================================================================

export const profileUpdateSchema = z.object({
  firstName: commonValidations.name('First name'),
  lastName: commonValidations.name('Last name'),
  mobile: commonValidations.phone.optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  occupation: z.string().max(100, 'Occupation too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  website: commonValidations.url.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonValidations.password,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  reason: z.enum(['not_useful', 'too_expensive', 'found_alternative', 'privacy_concerns', 'other']),
  feedback: z.string().max(1000, 'Feedback too long').optional(),
  confirmDeletion: z.boolean().refine(val => val === true, {
    message: 'You must confirm account deletion'
  }),
});

// ============================================================================
// BUSINESS-SPECIFIC SCHEMAS (Unique to Vardhman Mills)
// ============================================================================

export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'billing', 'shipping', 'other']).default('home'),
  firstName: commonValidations.name('First name'),
  lastName: commonValidations.name('Last name'),
  company: z.string().max(100, 'Company name too long').optional(),
  addressLine1: commonValidations.address,
  addressLine2: z.string().max(200, 'Address line 2 too long').optional(),
  landmark: z.string().max(100, 'Landmark too long').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required'),
  pincode: commonValidations.pincode,
  country: z.string().default('India'),
  mobile: commonValidations.phone.optional(),
  alternatePhone: commonValidations.phone.optional(),
  isDefault: z.boolean().default(false),
  instructions: z.string().max(200, 'Delivery instructions too long').optional(),
});

export const reviewSchema = z.object({
  rating: commonValidations.rating,
  title: z.string().min(5, 'Review title must be at least 5 characters').max(100, 'Title too long'),
  comment: commonValidations.comment,
  recommend: z.boolean().default(true),
  pros: z.array(z.string().max(100)).max(5, 'Maximum 5 pros allowed').optional(),
  cons: z.array(z.string().max(100)).max(5, 'Maximum 5 cons allowed').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
  purchaseVerified: z.boolean().default(false),
});

export const wishlistSchema = z.object({
  name: z.string().min(1, 'Wishlist name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  isPublic: z.boolean().default(false),
  products: z.array(z.string()).max(100, 'Maximum 100 products per wishlist'),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['razorpay', 'cod', 'upi', 'netbanking', 'wallet']),
  sameAsBilling: z.boolean().default(false),
  notes: z.string().max(500, 'Notes too long').optional(),
  couponCode: z.string().max(20, 'Invalid coupon code').optional(),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().max(200, 'Gift message too long').optional(),
  newsletterSubscribe: z.boolean().default(false),
  terms: commonValidations.terms,
});

// ============================================================================
// PRODUCT & INVENTORY SCHEMAS (Business-specific)
// ============================================================================

export const productInquirySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  inquiryType: z.enum(['price', 'availability', 'bulk_order', 'customization', 'sample', 'general']),
  quantity: commonValidations.quantity.optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  budget: commonValidations.price.optional(),
});

export const bulkOrderSchema = z.object({
  products: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: commonValidations.quantity,
    customization: z.string().max(200).optional(),
    notes: z.string().max(200).optional(),
  })).min(1, 'At least one product is required').max(50, 'Maximum 50 products per bulk order'),
  deliveryDate: z.date().refine(date => date > new Date(), {
    message: 'Delivery date must be in the future'
  }),
  shippingAddress: addressSchema,
  paymentTerms: z.enum(['advance_full', 'advance_50', 'advance_30', 'cod', 'credit_30', 'credit_60']),
  specialRequirements: z.string().max(1000).optional(),
  budget: commonValidations.price.optional(),
});

export const sampleRequestSchema = z.object({
  products: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number().min(1).max(5, 'Maximum 5 samples per product'),
    notes: z.string().max(100).optional(),
  })).min(1, 'At least one product is required').max(10, 'Maximum 10 products per sample request'),
  purpose: z.enum(['evaluation', 'quality_check', 'client_approval', 'testing', 'other']),
  companyName: z.string().max(100).optional(),
  designationTitle: z.string().max(50).optional(),
  shippingAddress: addressSchema,
  expectedUsage: z.string().max(500).optional(),
  timeline: z.enum(['immediate', 'within_week', 'within_month', 'flexible']),
});

// ============================================================================
// SUPPORT & COMMUNICATION SCHEMAS
// ============================================================================

export const contactSchema = z.object({
  name: commonValidations.name(),
  email: commonValidations.email,
  phone: commonValidations.phone.optional(),
  company: z.string().max(100).optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject too long'),
  category: z.enum(['general', 'product_inquiry', 'technical_support', 'billing', 'complaint', 'suggestion', 'partnership']),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message too long'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  attachments: z.array(z.string().url()).max(3, 'Maximum 3 attachments').optional(),
  preferredResponse: z.enum(['email', 'phone', 'whatsapp']).default('email'),
});

export const supportTicketSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  category: z.enum(['technical', 'billing', 'product', 'shipping', 'account', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  attachments: z.array(z.string().url()).max(5, 'Maximum 5 attachments').optional(),
  environment: z.object({
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
  }).optional(),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug_report', 'feature_request', 'improvement', 'compliment', 'complaint']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  rating: commonValidations.rating.optional(),
  page: z.string().url('Invalid page URL').optional(),
  screenshot: z.string().url('Invalid screenshot URL').optional(),
  anonymous: z.boolean().default(false),
});

// ============================================================================
// NEWSLETTER & MARKETING SCHEMAS
// ============================================================================

export const newsletterSchema = z.object({
  email: commonValidations.email,
  preferences: z.array(z.enum(['new_products', 'offers', 'industry_news', 'company_updates', 'events'])).default(['new_products']),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  categories: z.array(z.string()).max(10, 'Maximum 10 categories').optional(),
  firstName: z.string().max(50).optional(),
  source: z.string().max(50).optional(),
});

export const unsubscribeSchema = z.object({
  email: commonValidations.email,
  reason: z.enum(['too_frequent', 'not_relevant', 'never_subscribed', 'technical_issues', 'other']).optional(),
  feedback: z.string().max(500).optional(),
  resubscribeOptions: z.array(z.enum(['reduced_frequency', 'specific_topics', 'important_only'])).optional(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type WishlistFormData = z.infer<typeof wishlistSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductInquiryFormData = z.infer<typeof productInquirySchema>;
export type BulkOrderFormData = z.infer<typeof bulkOrderSchema>;
export type SampleRequestFormData = z.infer<typeof sampleRequestSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type UnsubscribeFormData = z.infer<typeof unsubscribeSchema>;

// ============================================================================
// SCHEMA GROUPS FOR EASY IMPORTS
// ============================================================================

export const authSchemas = {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
};

export const profileSchemas = {
  update: profileUpdateSchema,
  changePassword: changePasswordSchema,
  deleteAccount: deleteAccountSchema,
};

export const businessSchemas = {
  address: addressSchema,
  review: reviewSchema,
  wishlist: wishlistSchema,
  checkout: checkoutSchema,
  productInquiry: productInquirySchema,
  bulkOrder: bulkOrderSchema,
  sampleRequest: sampleRequestSchema,
};

export const communicationSchemas = {
  contact: contactSchema,
  supportTicket: supportTicketSchema,
  feedback: feedbackSchema,
  newsletter: newsletterSchema,
  unsubscribe: unsubscribeSchema,
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const validationSchemas = {
  // Auth schemas
  ...authSchemas,
  
  // Profile schemas
  profileUpdate: profileUpdateSchema,
  deleteAccount: deleteAccountSchema,
  
  // Business schemas
  ...businessSchemas,
  
  // Communication schemas
  ...communicationSchemas,
  
  // Schema groups
  auth: authSchemas,
  profile: profileSchemas,
  business: businessSchemas,
  communication: communicationSchemas,
};

export default validationSchemas;