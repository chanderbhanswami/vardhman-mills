/**
 * Gift Card Schemas for Vardhman Mills Frontend
 * Zod schemas for gift card purchase, redemption, and management
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// Gift card purchase schema
export const purchaseGiftCardSchema = z.object({
  amount: z
    .number()
    .min(100, 'Minimum gift card amount is ₹100')
    .max(50000, 'Maximum gift card amount is ₹50,000')
    .multipleOf(50, 'Gift card amount must be in multiples of ₹50'),
  
  recipientInfo: z.object({
    name: z
      .string()
      .min(2, 'Recipient name must be at least 2 characters')
      .max(50, 'Recipient name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .transform(val => val.trim()),
    
    email: commonValidations.email,
    
    phone: commonValidations.phone.optional(),
  }),
  
  senderInfo: z.object({
    name: z
      .string()
      .min(2, 'Sender name must be at least 2 characters')
      .max(50, 'Sender name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .transform(val => val.trim()),
    
    email: commonValidations.email,
    
    phone: commonValidations.phone.optional(),
  }),
  
  message: z
    .string()
    .max(500, 'Message must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  deliveryMethod: z.enum(['email', 'sms', 'both']).default('email'),
  
  deliveryDate: z
    .date()
    .min(new Date(), 'Delivery date must be in the future')
    .max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'Delivery date cannot be more than 1 year in future')
    .optional(),
  
  designTemplate: z
    .string()
    .min(1, 'Design template is required')
    .max(50, 'Invalid design template'),
  
  customImage: z
    .instanceof(File)
    .refine(file => file.size <= 2 * 1024 * 1024, 'Image size must be less than 2MB')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only JPEG, PNG, and WebP images are allowed')
    .optional(),
});

export type PurchaseGiftCardData = z.infer<typeof purchaseGiftCardSchema>;

// Gift card redemption schema
export const redeemGiftCardSchema = z.object({
  code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(20, 'Gift card code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Invalid gift card code format')
    .transform(val => val.toUpperCase().trim()),
  
  cartTotal: z
    .number()
    .min(0, 'Cart total must be non-negative')
    .max(10000000, 'Cart total too large'),
  
  customerEmail: commonValidations.email.optional(),
});

export type RedeemGiftCardData = z.infer<typeof redeemGiftCardSchema>;

// Gift card balance check schema
export const checkGiftCardBalanceSchema = z.object({
  code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(20, 'Gift card code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Invalid gift card code format')
    .transform(val => val.toUpperCase().trim()),
  
  email: commonValidations.email.optional(),
  
  phone: commonValidations.phone.optional(),
}).refine(
  data => data.email || data.phone,
  {
    message: 'Either email or phone number is required',
    path: ['email'],
  }
);

export type CheckGiftCardBalanceData = z.infer<typeof checkGiftCardBalanceSchema>;

// Gift card activation schema (admin)
export const activateGiftCardSchema = z.object({
  codes: z
    .array(z.string().regex(/^[A-Z0-9-]+$/))
    .min(1, 'At least one gift card code is required')
    .max(100, 'Cannot activate more than 100 gift cards at once'),
  
  activationDate: z.date().optional(),
  
  expiryDate: z
    .date()
    .min(new Date(), 'Expiry date must be in the future')
    .max(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), 'Expiry date cannot be more than 5 years in future'),
  
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
});

export type ActivateGiftCardData = z.infer<typeof activateGiftCardSchema>;

// Bulk gift card generation schema (admin)
export const generateBulkGiftCardsSchema = z.object({
  count: z
    .number()
    .min(1, 'Count must be at least 1')
    .max(10000, 'Cannot generate more than 10,000 gift cards at once'),
  
  amount: z
    .number()
    .min(100, 'Minimum gift card amount is ₹100')
    .max(50000, 'Maximum gift card amount is ₹50,000')
    .multipleOf(50, 'Gift card amount must be in multiples of ₹50'),
  
  prefix: z
    .string()
    .min(2, 'Prefix must be at least 2 characters')
    .max(5, 'Prefix must not exceed 5 characters')
    .regex(/^[A-Z]+$/, 'Prefix can only contain uppercase letters')
    .default('GC'),
  
  codeLength: z
    .number()
    .min(8, 'Code length must be at least 8 characters')
    .max(16, 'Code length must not exceed 16 characters')
    .default(12),
  
  expiryMonths: z
    .number()
    .min(1, 'Expiry must be at least 1 month')
    .max(60, 'Expiry cannot exceed 60 months')
    .default(12),
  
  batchName: z
    .string()
    .min(3, 'Batch name must be at least 3 characters')
    .max(100, 'Batch name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  restrictToCategories: z
    .array(z.string())
    .max(50, 'Too many categories selected')
    .optional(),
  
  minimumOrderValue: z
    .number()
    .min(0, 'Minimum order value must be non-negative')
    .max(100000, 'Minimum order value too large')
    .optional(),
  
  maximumDiscount: z
    .number()
    .min(0, 'Maximum discount must be non-negative')
    .max(50000, 'Maximum discount too large')
    .optional(),
});

export type GenerateBulkGiftCardsData = z.infer<typeof generateBulkGiftCardsSchema>;

// Gift card transaction history schema
export const giftCardTransactionHistorySchema = z.object({
  code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(20, 'Gift card code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Invalid gift card code format')
    .transform(val => val.toUpperCase().trim()),
  
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    data => data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  ).optional(),
  
  transactionType: z.enum(['purchase', 'redemption', 'refund', 'transfer']).optional(),
  
  limit: z.number().min(1).max(1000).default(50),
  
  offset: z.number().min(0).default(0),
});

export type GiftCardTransactionHistoryData = z.infer<typeof giftCardTransactionHistorySchema>;

// Gift card transfer schema
export const transferGiftCardSchema = z.object({
  code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(20, 'Gift card code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Invalid gift card code format')
    .transform(val => val.toUpperCase().trim()),
  
  currentOwnerEmail: commonValidations.email,
  
  newOwnerInfo: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .transform(val => val.trim()),
    
    email: commonValidations.email,
    
    phone: commonValidations.phone.optional(),
  }),
  
  transferReason: z.enum([
    'gift',
    'sale',
    'prize',
    'compensation',
    'other'
  ]),
  
  message: z
    .string()
    .max(500, 'Message must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  notifyNewOwner: z.boolean().default(true),
});

export type TransferGiftCardData = z.infer<typeof transferGiftCardSchema>;

// Gift card refund schema
export const refundGiftCardSchema = z.object({
  code: z
    .string()
    .min(8, 'Gift card code must be at least 8 characters')
    .max(20, 'Gift card code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Invalid gift card code format')
    .transform(val => val.toUpperCase().trim()),
  
  refundAmount: z
    .number()
    .min(1, 'Refund amount must be positive')
    .max(50000, 'Refund amount too large'),
  
  refundReason: z.enum([
    'customer_request',
    'defective_product',
    'wrong_delivery',
    'cancelled_order',
    'goodwill',
    'other'
  ]),
  
  refundMethod: z.enum([
    'original_payment_method',
    'bank_transfer',
    'new_gift_card',
    'store_credit'
  ]),
  
  refundNotes: z
    .string()
    .max(1000, 'Refund notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  customerEmail: commonValidations.email,
  
  adminApproval: z.boolean().default(false),
});

export type RefundGiftCardData = z.infer<typeof refundGiftCardSchema>;

// Gift card analytics schema
export const giftCardAnalyticsSchema = z.object({
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
      'total_sales',
      'total_redemptions',
      'active_cards',
      'expired_cards',
      'average_amount',
      'redemption_rate',
      'breakage_rate'
    ]))
    .min(1, 'At least one metric is required')
    .max(7, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  
  includeDetails: z.boolean().default(false),
  
  filterBy: z.object({
    amountRange: z.object({
      min: z.number().min(0),
      max: z.number().max(100000),
    }).optional(),
    categories: z.array(z.string()).max(50).optional(),
    status: z.enum(['active', 'used', 'expired', 'refunded']).optional(),
  }).optional(),
});

export type GiftCardAnalyticsData = z.infer<typeof giftCardAnalyticsSchema>;

// Gift card design template schema
export const giftCardDesignTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Template name must be at least 3 characters')
    .max(50, 'Template name must not exceed 50 characters')
    .transform(val => val.trim()),
  
  category: z.enum([
    'birthday',
    'anniversary',
    'wedding',
    'festival',
    'corporate',
    'general',
    'seasonal'
  ]),
  
  backgroundImage: z
    .instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'Image size must be less than 5MB')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only JPEG, PNG, and WebP images are allowed'),
    
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'),
  
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'),
  
  fontFamily: z.enum([
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Roboto',
    'Open Sans'
  ]).default('Arial'),
  
  isActive: z.boolean().default(true),
  
  displayOrder: z.number().min(0).max(1000).default(0),
});

export type GiftCardDesignTemplateData = z.infer<typeof giftCardDesignTemplateSchema>;

// Export all schemas
export const giftCardSchemas = {
  purchaseGiftCard: purchaseGiftCardSchema,
  redeemGiftCard: redeemGiftCardSchema,
  checkGiftCardBalance: checkGiftCardBalanceSchema,
  activateGiftCard: activateGiftCardSchema,
  generateBulkGiftCards: generateBulkGiftCardsSchema,
  giftCardTransactionHistory: giftCardTransactionHistorySchema,
  transferGiftCard: transferGiftCardSchema,
  refundGiftCard: refundGiftCardSchema,
  giftCardAnalytics: giftCardAnalyticsSchema,
  giftCardDesignTemplate: giftCardDesignTemplateSchema,
};

export default giftCardSchemas;
