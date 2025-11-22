/**
 * Coupon Schemas for Vardhman Mills Frontend
 * Zod schemas for coupon validation, application, and management
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// Coupon code validation schema
export const couponCodeSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code can only contain uppercase letters, numbers, underscores, and hyphens')
    .transform(val => val.toUpperCase().trim()),
});

export type CouponCodeData = z.infer<typeof couponCodeSchema>;

// Coupon application schema
export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Invalid coupon code format')
    .transform(val => val.toUpperCase().trim()),
  
  cartTotal: z
    .number()
    .min(0, 'Cart total must be non-negative')
    .max(10000000, 'Cart total too large'),
  
  cartItems: z
    .array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be non-negative'),
      category: z.string().optional(),
      brand: z.string().optional(),
    }))
    .min(1, 'At least one item is required'),
  
  userId: z.string().optional(),
  
  customerEmail: commonValidations.email.optional(),
});

export type ApplyCouponData = z.infer<typeof applyCouponSchema>;

// Coupon creation schema (admin)
export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code can only contain uppercase letters, numbers, underscores, and hyphens')
    .transform(val => val.toUpperCase().trim()),
  
  name: z
    .string()
    .min(3, 'Coupon name must be at least 3 characters')
    .max(100, 'Coupon name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .transform(val => val.trim()),
  
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']),
  
  value: z
    .number()
    .min(0, 'Coupon value must be non-negative')
    .max(100000, 'Coupon value too large'),
  
  minimumOrderValue: z
    .number()
    .min(0, 'Minimum order value must be non-negative')
    .max(1000000, 'Minimum order value too large'),
  
  maximumDiscount: z
    .number()
    .min(0, 'Maximum discount must be non-negative')
    .max(100000, 'Maximum discount too large')
    .optional(),
  
  usageLimit: z
    .number()
    .min(1, 'Usage limit must be at least 1')
    .max(100000, 'Usage limit too large')
    .optional(),
  
  userUsageLimit: z
    .number()
    .min(1, 'User usage limit must be at least 1')
    .max(100, 'User usage limit too large')
    .optional(),
  
  validFrom: z.date(),
  
  validUntil: z.date(),
  
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']).default('active'),
  
  applicableCategories: z
    .array(z.string())
    .max(50, 'Too many categories selected')
    .optional(),
  
  applicableProducts: z
    .array(z.string())
    .max(1000, 'Too many products selected')
    .optional(),
  
  excludedCategories: z
    .array(z.string())
    .max(50, 'Too many excluded categories')
    .optional(),
  
  excludedProducts: z
    .array(z.string())
    .max(1000, 'Too many excluded products')
    .optional(),
  
  applicableCustomers: z
    .array(z.string())
    .max(10000, 'Too many customers selected')
    .optional(),
  
  customerSegments: z
    .array(z.enum(['new_customer', 'returning_customer', 'vip_customer', 'bulk_buyer']))
    .max(4, 'Too many customer segments')
    .optional(),
  
  minimumQuantity: z
    .number()
    .min(0, 'Minimum quantity must be non-negative')
    .max(10000, 'Minimum quantity too large')
    .optional(),
  
  stackable: z.boolean().default(false),
  
  firstTimeCustomerOnly: z.boolean().default(false),
  
  requiredPaymentMethods: z
    .array(z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod']))
    .max(5, 'Too many payment methods')
    .optional(),
  
  geoRestrictions: z.object({
    includedStates: z.array(z.string()).max(50).optional(),
    excludedStates: z.array(z.string()).max(50).optional(),
    includedCities: z.array(z.string()).max(500).optional(),
    excludedCities: z.array(z.string()).max(500).optional(),
  }).optional(),
  
  buyXGetY: z.object({
    buyQuantity: z.number().min(1),
    getQuantity: z.number().min(1),
    applicableProducts: z.array(z.string()).min(1),
    getProducts: z.array(z.string()).optional(),
  }).optional(),
}).refine(
  data => data.validFrom < data.validUntil,
  {
    message: 'Valid from date must be before valid until date',
    path: ['validUntil'],
  }
).refine(
  data => {
    if (data.type === 'buy_x_get_y') {
      return data.buyXGetY !== undefined;
    }
    return true;
  },
  {
    message: 'Buy X Get Y configuration is required for this coupon type',
    path: ['buyXGetY'],
  }
).refine(
  data => {
    if (data.type === 'percentage' && data.value > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Percentage discount cannot exceed 100%',
    path: ['value'],
  }
);

export type CreateCouponData = z.infer<typeof createCouponSchema>;

// Coupon validation result schema
export const couponValidationSchema = z.object({
  code: z.string(),
  isValid: z.boolean(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']),
    value: z.number(),
    amount: z.number(),
    maxDiscount: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
  warnings: z.array(z.string()).optional(),
  applicableItems: z.array(z.string()).optional(),
  freeItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
  })).optional(),
});

export type CouponValidationResult = z.infer<typeof couponValidationSchema>;

// Bulk coupon generation schema
export const bulkCouponGenerationSchema = z.object({
  namePrefix: z
    .string()
    .min(2, 'Name prefix must be at least 2 characters')
    .max(50, 'Name prefix must not exceed 50 characters')
    .transform(val => val.trim()),
  
  codePrefix: z
    .string()
    .min(2, 'Code prefix must be at least 2 characters')
    .max(10, 'Code prefix must not exceed 10 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code prefix can only contain uppercase letters, numbers, underscores, and hyphens')
    .transform(val => val.toUpperCase().trim()),
  
  count: z
    .number()
    .min(1, 'Count must be at least 1')
    .max(10000, 'Cannot generate more than 10,000 coupons at once'),
  
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  
  value: z
    .number()
    .min(0, 'Coupon value must be non-negative'),
  
  minimumOrderValue: z
    .number()
    .min(0, 'Minimum order value must be non-negative')
    .max(1000000, 'Minimum order value too large'),
  
  maximumDiscount: z
    .number()
    .min(0, 'Maximum discount must be non-negative')
    .max(100000, 'Maximum discount too large')
    .optional(),
  
  userUsageLimit: z
    .number()
    .min(1, 'User usage limit must be at least 1')
    .max(10, 'User usage limit too large')
    .default(1),
  
  validFrom: z.date(),
  
  validUntil: z.date(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .transform(val => val.trim()),
}).refine(
  data => data.validFrom < data.validUntil,
  {
    message: 'Valid from date must be before valid until date',
    path: ['validUntil'],
  }
);

export type BulkCouponGenerationData = z.infer<typeof bulkCouponGenerationSchema>;

// Coupon usage analytics schema
export const couponUsageAnalyticsSchema = z.object({
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
  
  couponCodes: z
    .array(z.string())
    .max(100, 'Cannot analyze more than 100 coupons at once')
    .optional(),
  
  couponType: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']).optional(),
  
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']).optional(),
  
  minUsageCount: z.number().min(0).optional(),
  
  maxUsageCount: z.number().min(0).optional(),
  
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  
  includeDetails: z.boolean().default(false),
});

export type CouponUsageAnalyticsData = z.infer<typeof couponUsageAnalyticsSchema>;

// Customer coupon history schema
export const customerCouponHistorySchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  
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
  
  status: z.enum(['used', 'expired', 'unused']).optional(),
  
  couponType: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']).optional(),
  
  limit: z.number().min(1).max(1000).default(50),
  
  offset: z.number().min(0).default(0),
});

export type CustomerCouponHistoryData = z.infer<typeof customerCouponHistorySchema>;

// Coupon recommendation schema
export const couponRecommendationSchema = z.object({
  customerId: z.string().optional(),
  
  customerEmail: commonValidations.email.optional(),
  
  cartTotal: z
    .number()
    .min(0, 'Cart total must be non-negative')
    .max(10000000, 'Cart total too large'),
  
  cartItems: z
    .array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be non-negative'),
    }))
    .min(1, 'At least one item is required'),
  
  customerSegment: z.enum(['new_customer', 'returning_customer', 'vip_customer', 'bulk_buyer']).optional(),
  
  previousPurchases: z.number().min(0).optional(),
  
  lastPurchaseDate: z.date().optional(),
  
  maxRecommendations: z.number().min(1).max(20).default(5),
});

export type CouponRecommendationData = z.infer<typeof couponRecommendationSchema>;

// Coupon AB test schema
export const couponABTestSchema = z.object({
  testName: z
    .string()
    .min(3, 'Test name must be at least 3 characters')
    .max(100, 'Test name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  variants: z
    .array(z.object({
      name: z.string().min(1, 'Variant name is required'),
      couponCode: z.string().min(3, 'Coupon code must be at least 3 characters'),
      trafficPercentage: z.number().min(0).max(100),
    }))
    .min(2, 'At least 2 variants are required')
    .max(5, 'Maximum 5 variants allowed')
    .refine(
      variants => {
        const totalPercentage = variants.reduce((sum, variant) => sum + variant.trafficPercentage, 0);
        return totalPercentage === 100;
      },
      {
        message: 'Total traffic percentage must equal 100%',
      }
    ),
  
  startDate: z.date(),
  
  endDate: z.date(),
  
  targetAudience: z.object({
    customerSegments: z.array(z.enum(['new_customer', 'returning_customer', 'vip_customer', 'bulk_buyer'])).optional(),
    minOrderValue: z.number().min(0).optional(),
    maxOrderValue: z.number().min(0).optional(),
    includedCategories: z.array(z.string()).optional(),
    excludedCategories: z.array(z.string()).optional(),
  }).optional(),
  
  successMetric: z.enum(['conversion_rate', 'average_order_value', 'total_revenue', 'usage_rate']),
  
  significanceLevel: z.number().min(0.01).max(0.1).default(0.05),
}).refine(
  data => data.startDate < data.endDate,
  {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }
);

export type CouponABTestData = z.infer<typeof couponABTestSchema>;

// Export all schemas
export const couponSchemas = {
  couponCode: couponCodeSchema,
  applyCoupon: applyCouponSchema,
  createCoupon: createCouponSchema,
  couponValidation: couponValidationSchema,
  bulkCouponGeneration: bulkCouponGenerationSchema,
  couponUsageAnalytics: couponUsageAnalyticsSchema,
  customerCouponHistory: customerCouponHistorySchema,
  couponRecommendation: couponRecommendationSchema,
  couponABTest: couponABTestSchema,
};

export default couponSchemas;
