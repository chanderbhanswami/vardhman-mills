/**
 * Order Schemas for Vardhman Mills Frontend
 * Zod schemas for order creation, management, and tracking
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  
  variantId: z.string().optional(),
  
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity too large')
    .int('Quantity must be a whole number'),
  
  unitPrice: z
    .number()
    .min(0, 'Unit price must be non-negative')
    .max(1000000, 'Unit price too large'),
  
  totalPrice: z
    .number()
    .min(0, 'Total price must be non-negative')
    .max(10000000, 'Total price too large'),
  
  specifications: z.object({
    color: z.string().optional(),
    size: z.string().optional(),
    material: z.string().optional(),
    pattern: z.string().optional(),
    customization: z.string().max(500).optional(),
  }).optional(),
  
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
});

export type OrderItemData = z.infer<typeof orderItemSchema>;

// Shipping address schema
export const shippingAddressSchema = z.object({
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
  
  email: commonValidations.email.optional(),
  
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
  
  saveAddress: z.boolean().default(false),
  
  addressType: z.enum(['home', 'office', 'other']).default('home'),
});

export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;

// Billing address schema
export const billingAddressSchema = z.object({
  sameAsShipping: z.boolean().default(true),
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  phone: commonValidations.phone.optional(),
  
  email: commonValidations.email.optional(),
  
  addressLine1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 must not exceed 200 characters')
    .transform(val => val.trim())
    .optional(),
  
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters')
    .transform(val => val.trim())
    .optional(),
  
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters')
    .transform(val => val.trim())
    .optional(),
  
  pincode: commonValidations.pincode.optional(),
  
  country: z.string().default('India').optional(),
  
  gstNumber: commonValidations.gst.optional(),
}).refine(
  data => {
    if (!data.sameAsShipping) {
      return data.firstName && data.lastName && data.addressLine1 && data.city && data.state && data.pincode;
    }
    return true;
  },
  {
    message: 'Billing address details are required when different from shipping address',
    path: ['firstName'],
  }
);

export type BillingAddressData = z.infer<typeof billingAddressSchema>;

// Order creation schema
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items allowed per order'),
  
  shippingAddress: shippingAddressSchema,
  
  billingAddress: billingAddressSchema,
  
  paymentMethod: z.enum([
    'card',
    'upi',
    'netbanking',
    'wallet',
    'cod',
    'emi',
    'bank_transfer'
  ]),
  
  paymentDetails: z.object({
    gateway: z.string().optional(),
    transactionId: z.string().optional(),
    reference: z.string().optional(),
  }).optional(),
  
  shippingMethod: z.enum([
    'standard',
    'express',
    'overnight',
    'pickup',
    'white_glove'
  ]).default('standard'),
  
  pricing: z.object({
    subtotal: z.number().min(0),
    tax: z.number().min(0),
    shipping: z.number().min(0),
    discount: z.number().min(0).default(0),
    total: z.number().min(0),
  }),
  
  coupons: z
    .array(z.object({
      code: z.string(),
      discount: z.number().min(0),
    }))
    .max(5, 'Maximum 5 coupons allowed')
    .optional(),
  
  giftCards: z
    .array(z.object({
      code: z.string(),
      amount: z.number().min(0),
    }))
    .max(3, 'Maximum 3 gift cards allowed')
    .optional(),
  
  customerNotes: z
    .string()
    .max(1000, 'Customer notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  deliveryInstructions: z
    .string()
    .max(500, 'Delivery instructions must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  preferredDeliveryDate: z
    .date()
    .min(new Date(), 'Preferred delivery date must be in the future')
    .optional(),
  
  preferredDeliveryTime: z.enum([
    'morning',
    'afternoon',
    'evening',
    'anytime'
  ]).default('anytime'),
  
  isGift: z.boolean().default(false),
  
  giftMessage: z
    .string()
    .max(500, 'Gift message must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  giftWrap: z.boolean().default(false),
  
  businessOrder: z.object({
    isBusinessOrder: z.boolean().default(false),
    poNumber: z.string().max(50).optional(),
    department: z.string().max(100).optional(),
    requester: z.string().max(100).optional(),
    approver: z.string().max(100).optional(),
  }).optional(),
}).refine(
  data => {
    const calculatedTotal = data.pricing.subtotal + data.pricing.tax + data.pricing.shipping - data.pricing.discount;
    return Math.abs(calculatedTotal - data.pricing.total) < 0.01;
  },
  {
    message: 'Total price calculation does not match',
    path: ['pricing', 'total'],
  }
).refine(
  data => {
    if (data.isGift && !data.giftMessage) {
      return false;
    }
    return true;
  },
  {
    message: 'Gift message is required for gift orders',
    path: ['giftMessage'],
  }
);

export type CreateOrderData = z.infer<typeof createOrderSchema>;

// Order update schema (admin)
export const updateOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'returned'
  ]),
  
  tracking: z.object({
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.date().optional(),
    currentLocation: z.string().optional(),
  }).optional(),
  
  internalNotes: z
    .string()
    .max(2000, 'Internal notes must not exceed 2000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  customerNotification: z.object({
    sendEmail: z.boolean().default(true),
    sendSms: z.boolean().default(false),
    customMessage: z.string().max(500).optional(),
  }).optional(),
  
  refund: z.object({
    amount: z.number().min(0),
    reason: z.string().max(500),
    method: z.enum(['original', 'bank_transfer', 'gift_card']),
    reference: z.string().optional(),
  }).optional(),
});

export type UpdateOrderData = z.infer<typeof updateOrderSchema>;

// Order search/filter schema
export const orderSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional(),
  
  filters: z.object({
    status: z.array(z.enum([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ])).optional(),
    
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).refine(
      data => data.startDate <= data.endDate,
      'Start date must be before or equal to end date'
    ).optional(),
    
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).refine(
      data => data.min <= data.max,
      'Minimum price must be less than or equal to maximum price'
    ).optional(),
    
    paymentMethod: z.array(z.enum([
      'card',
      'upi',
      'netbanking',
      'wallet',
      'cod',
      'emi',
      'bank_transfer'
    ])).optional(),
    
    shippingMethod: z.array(z.enum([
      'standard',
      'express',
      'overnight',
      'pickup',
      'white_glove'
    ])).optional(),
    
    customerId: z.string().optional(),
    
    productId: z.string().optional(),
    
    hasTracking: z.boolean().optional(),
    
    isGift: z.boolean().optional(),
    
    isBusinessOrder: z.boolean().optional(),
  }).optional(),
  
  sortBy: z.enum([
    'date_desc',
    'date_asc',
    'total_desc',
    'total_asc',
    'status',
    'customer_name'
  ]).default('date_desc'),
  
  page: z.number().min(1).default(1),
  
  limit: z.number().min(1).max(100).default(20),
});

export type OrderSearchData = z.infer<typeof orderSearchSchema>;

// Order cancellation schema
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  
  reason: z.enum([
    'customer_request',
    'payment_failed',
    'out_of_stock',
    'delivery_issue',
    'duplicate_order',
    'fraud_prevention',
    'other'
  ]),
  
  customerReason: z
    .string()
    .max(1000, 'Reason must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  refundAmount: z
    .number()
    .min(0, 'Refund amount must be non-negative')
    .max(1000000, 'Refund amount too large'),
  
  refundMethod: z.enum([
    'original_payment_method',
    'bank_transfer',
    'gift_card',
    'store_credit'
  ]).default('original_payment_method'),
  
  restockItems: z.boolean().default(true),
  
  notifyCustomer: z.boolean().default(true),
  
  internalNotes: z
    .string()
    .max(1000, 'Internal notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
});

export type CancelOrderData = z.infer<typeof cancelOrderSchema>;

// Order return/exchange schema
export const returnExchangeOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  
  type: z.enum(['return', 'exchange']),
  
  items: z
    .array(z.object({
      orderItemId: z.string().min(1),
      quantity: z.number().min(1),
      reason: z.enum([
        'defective',
        'wrong_item',
        'size_issue',
        'color_difference',
        'quality_issue',
        'damaged_shipping',
        'not_as_described',
        'changed_mind',
        'other'
      ]),
      condition: z.enum(['new', 'used', 'damaged']),
      notes: z.string().max(500).optional(),
      images: z.array(z.instanceof(File)).max(5).optional(),
    }))
    .min(1, 'At least one item is required')
    .max(20, 'Maximum 20 items allowed'),
  
  exchangeItems: z
    .array(z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      quantity: z.number().min(1),
      specifications: z.record(z.string(), z.string()).optional(),
    }))
    .max(20, 'Maximum 20 exchange items allowed')
    .optional(),
  
  pickupAddress: z.object({
    sameAsDelivery: z.boolean().default(true),
    address: shippingAddressSchema.optional(),
  }).optional(),
  
  preferredPickupDate: z
    .date()
    .min(new Date(), 'Pickup date must be in the future')
    .optional(),
  
  customerComments: z
    .string()
    .max(1000, 'Comments must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
}).refine(
  data => {
    if (data.type === 'exchange' && (!data.exchangeItems || data.exchangeItems.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Exchange items are required for exchange requests',
    path: ['exchangeItems'],
  }
);

export type ReturnExchangeOrderData = z.infer<typeof returnExchangeOrderSchema>;

// Order analytics schema
export const orderAnalyticsSchema = z.object({
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
      'total_orders',
      'total_revenue',
      'average_order_value',
      'conversion_rate',
      'cancellation_rate',
      'return_rate',
      'customer_acquisition',
      'repeat_orders'
    ]))
    .min(1, 'At least one metric is required')
    .max(8, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('day'),
  
  segmentBy: z.enum([
    'customer_type',
    'payment_method',
    'shipping_method',
    'product_category',
    'location'
  ]).optional(),
  
  filters: z.object({
    customerType: z.array(z.string()).optional(),
    productCategories: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
  }).optional(),
  
  includeDetails: z.boolean().default(false),
});

export type OrderAnalyticsData = z.infer<typeof orderAnalyticsSchema>;

// Export all schemas
export const orderSchemas = {
  orderItem: orderItemSchema,
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  createOrder: createOrderSchema,
  updateOrder: updateOrderSchema,
  orderSearch: orderSearchSchema,
  cancelOrder: cancelOrderSchema,
  returnExchangeOrder: returnExchangeOrderSchema,
  orderAnalytics: orderAnalyticsSchema,
};

export default orderSchemas;
