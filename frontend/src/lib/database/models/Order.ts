/**
 * Order Model - Comprehensive e-commerce order management
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Order Address Schema
 */
export const OrderAddressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isDefault: z.boolean().default(false),
  instructions: z.string().optional(),
});

export type OrderAddress = z.infer<typeof OrderAddressSchema>;

/**
 * Order Item Schema
 */
export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  image: z.string().url().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
  }).optional(),
  attributes: z.record(z.string(), z.string()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  customization: z.object({
    text: z.string().optional(),
    options: z.record(z.string(), z.string()).optional(),
    files: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })).optional(),
  }).optional(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  refundedAmount: z.number().nonnegative().default(0),
  returnedQuantity: z.number().nonnegative().default(0),
  status: z.enum([
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 
    'cancelled', 'refunded', 'returned', 'exchanged'
  ]).default('pending'),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Order Payment Schema
 */
export const OrderPaymentSchema = z.object({
  id: z.string(),
  method: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod', 'emi', 'bank_transfer']),
  provider: z.string(), // razorpay, stripe, paytm, etc.
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded']),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  transactionId: z.string().optional(),
  gatewayTransactionId: z.string().optional(),
  gatewayOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  processingFees: z.number().nonnegative().default(0),
  gatewayFees: z.number().nonnegative().default(0),
  refundedAmount: z.number().nonnegative().default(0),
  failureReason: z.string().optional(),
  paymentDate: z.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  emi: z.object({
    tenure: z.number().positive().optional(),
    interestRate: z.number().nonnegative().optional(),
    monthlyAmount: z.number().positive().optional(),
    processingFee: z.number().nonnegative().default(0),
  }).optional(),
  cardDetails: z.object({
    lastFour: z.string().optional(),
    brand: z.string().optional(),
    type: z.enum(['credit', 'debit']).optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
  }).optional(),
  upiDetails: z.object({
    vpa: z.string().optional(),
    bank: z.string().optional(),
  }).optional(),
});

export type OrderPayment = z.infer<typeof OrderPaymentSchema>;

/**
 * Order Shipping Schema
 */
export const OrderShippingSchema = z.object({
  method: z.string(), // standard, express, overnight, pickup
  provider: z.string(), // bluedart, delhivery, fedex, etc.
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  cost: z.number().nonnegative().default(0),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
  }).optional(),
  packages: z.array(z.object({
    id: z.string(),
    trackingNumber: z.string().optional(),
    weight: z.number().positive().optional(),
    items: z.array(z.string()), // Order item IDs
    status: z.enum(['packed', 'shipped', 'in_transit', 'delivered', 'returned']),
    shippedAt: z.date().optional(),
    deliveredAt: z.date().optional(),
  })).default([]),
  address: OrderAddressSchema,
  instructions: z.string().optional(),
  signature: z.string().optional(),
  deliveredBy: z.string().optional(),
  status: z.enum([
    'pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery',
    'delivered', 'failed', 'returned', 'cancelled'
  ]).default('pending'),
  timeline: z.array(z.object({
    status: z.string(),
    timestamp: z.date(),
    location: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
});

export type OrderShipping = z.infer<typeof OrderShippingSchema>;

/**
 * Order Discount Schema
 */
export const OrderDiscountSchema = z.object({
  id: z.string(),
  type: z.enum(['coupon', 'loyalty', 'promotion', 'referral', 'bulk', 'seasonal']),
  code: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  percentage: z.number().min(0).max(100).optional(),
  maxDiscount: z.number().positive().optional(),
  appliedTo: z.enum(['total', 'shipping', 'tax', 'items']).default('total'),
  conditions: z.object({
    minOrderValue: z.number().positive().optional(),
    maxOrderValue: z.number().positive().optional(),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    userGroups: z.array(z.string()).optional(),
  }).optional(),
});

export type OrderDiscount = z.infer<typeof OrderDiscountSchema>;

/**
 * Order Tax Schema
 */
export const OrderTaxSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number().min(0).max(100),
  amount: z.number().nonnegative(),
  type: z.enum(['gst', 'vat', 'sales_tax', 'service_tax']),
  jurisdiction: z.string().optional(),
  taxableAmount: z.number().nonnegative(),
  exemptions: z.array(z.string()).default([]),
});

export type OrderTax = z.infer<typeof OrderTaxSchema>;

/**
 * Order Status History Schema
 */
export const OrderStatusHistorySchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'processing', 'shipped', 'delivered',
    'cancelled', 'refunded', 'returned', 'exchanged', 'failed'
  ]),
  timestamp: z.date(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  updatedBy: z.string().optional(), // User ID
  notificationSent: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>;

/**
 * Main Order Schema
 */
export const OrderSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  orderNumber: z.string().min(1, 'Order number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().optional(),
  status: z.enum([
    'pending', 'confirmed', 'processing', 'shipped', 'delivered',
    'cancelled', 'refunded', 'returned', 'exchanged', 'failed'
  ]).default('pending'),
  paymentStatus: z.enum([
    'pending', 'processing', 'completed', 'failed', 'cancelled',
    'refunded', 'partially_refunded', 'authorized', 'captured'
  ]).default('pending'),
  fulfillmentStatus: z.enum([
    'pending', 'processing', 'shipped', 'partially_shipped',
    'delivered', 'cancelled', 'returned', 'exchanged'
  ]).default('pending'),
  source: z.enum(['web', 'mobile', 'admin', 'api', 'phone', 'store']).default('web'),
  currency: z.string().default('INR'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative().default(0),
    shipping: z.number().nonnegative().default(0),
    discount: z.number().nonnegative().default(0),
    total: z.number().nonnegative(),
    paid: z.number().nonnegative().default(0),
    refunded: z.number().nonnegative().default(0),
    due: z.number().nonnegative().default(0),
  }),
  billingAddress: OrderAddressSchema,
  shippingAddress: OrderAddressSchema,
  shipping: OrderShippingSchema.optional(),
  payments: z.array(OrderPaymentSchema).default([]),
  discounts: z.array(OrderDiscountSchema).default([]),
  taxes: z.array(OrderTaxSchema).default([]),
  statusHistory: z.array(OrderStatusHistorySchema).default([]),
  notes: z.array(z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['customer', 'internal', 'system']).default('internal'),
    createdBy: z.string().optional(),
    createdAt: z.date(),
    isPrivate: z.boolean().default(false),
  })).default([]),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  riskLevel: z.enum(['low', 'medium', 'high']).default('low'),
  fraudScore: z.number().min(0).max(100).optional(),
  loyaltyPoints: z.object({
    earned: z.number().nonnegative().default(0),
    redeemed: z.number().nonnegative().default(0),
    rate: z.number().positive().default(1), // Points per currency unit
  }).optional(),
  referral: z.object({
    referredBy: z.string().optional(),
    referralCode: z.string().optional(),
    commission: z.number().nonnegative().optional(),
  }).optional(),
  marketing: z.object({
    source: z.string().optional(), // google, facebook, email, etc.
    medium: z.string().optional(), // cpc, email, organic, etc.
    campaign: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
  }).optional(),
  customFields: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  cancelledAt: z.date().optional(),
  cancelledBy: z.string().optional(),
  cancellationReason: z.string().optional(),
  refundRequests: z.array(z.object({
    id: z.string(),
    amount: z.number().positive(),
    reason: z.string(),
    status: z.enum(['pending', 'approved', 'denied', 'processed']),
    requestedBy: z.string(),
    requestedAt: z.date(),
    processedBy: z.string().optional(),
    processedAt: z.date().optional(),
    notes: z.string().optional(),
  })).default([]),
  returnRequests: z.array(z.object({
    id: z.string(),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().positive(),
      reason: z.string(),
      condition: z.enum(['new', 'used', 'damaged']),
    })),
    reason: z.string(),
    status: z.enum(['pending', 'approved', 'denied', 'received', 'processed']),
    requestedBy: z.string(),
    requestedAt: z.date(),
    approvedBy: z.string().optional(),
    approvedAt: z.date().optional(),
    trackingNumber: z.string().optional(),
    receivedAt: z.date().optional(),
    refundAmount: z.number().nonnegative().optional(),
    restockFee: z.number().nonnegative().default(0),
    notes: z.string().optional(),
  })).default([]),
  exchangeRequests: z.array(z.object({
    id: z.string(),
    originalItems: z.array(z.string()), // Order item IDs
    newItems: z.array(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().positive(),
    })),
    reason: z.string(),
    status: z.enum(['pending', 'approved', 'denied', 'processed']),
    priceDifference: z.number(), // Can be negative
    requestedBy: z.string(),
    requestedAt: z.date(),
    processedBy: z.string().optional(),
    processedAt: z.date().optional(),
    notes: z.string().optional(),
  })).default([]),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

/**
 * Create Order Schema
 */
export const CreateOrderSchema = OrderSchema.omit({
  _id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).extend({
  generateOrderNumber: z.boolean().default(true),
  sendConfirmationEmail: z.boolean().default(true),
  sendSMSNotification: z.boolean().default(false),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/**
 * Update Order Schema
 */
export const UpdateOrderSchema = OrderSchema.partial().omit({
  _id: true,
  orderNumber: true,
  createdAt: true,
});

export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;

/**
 * Order Filter Schema
 */
export const OrderFilterSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum([
    'pending', 'confirmed', 'processing', 'shipped', 'delivered',
    'cancelled', 'refunded', 'returned', 'exchanged', 'failed'
  ]).optional(),
  paymentStatus: z.enum([
    'pending', 'processing', 'completed', 'failed', 'cancelled',
    'refunded', 'partially_refunded', 'authorized', 'captured'
  ]).optional(),
  fulfillmentStatus: z.enum([
    'pending', 'processing', 'shipped', 'partially_shipped',
    'delivered', 'cancelled', 'returned', 'exchanged'
  ]).optional(),
  source: z.enum(['web', 'mobile', 'admin', 'api', 'phone', 'store']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  amountMin: z.number().nonnegative().optional(),
  amountMax: z.number().nonnegative().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(), // Search in order number, customer email, etc.
  tags: z.array(z.string()).optional(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod', 'emi', 'bank_transfer']).optional(),
  shippingMethod: z.string().optional(),
  hasRefunds: z.boolean().optional(),
  hasReturns: z.boolean().optional(),
  hasExchanges: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum([
    'orderNumber', 'createdAt', 'updatedAt', 'total', 'status', 'customerEmail'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeItems: z.boolean().default(true),
  includePayments: z.boolean().default(false),
  includeHistory: z.boolean().default(false),
});

export type OrderFilter = z.infer<typeof OrderFilterSchema>;

/**
 * Order Statistics Schema
 */
export const OrderStatsSchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  ordersToday: z.number(),
  ordersThisWeek: z.number(),
  ordersThisMonth: z.number(),
  revenueToday: z.number(),
  revenueThisWeek: z.number(),
  revenueThisMonth: z.number(),
  ordersByStatus: z.record(z.string(), z.number()),
  ordersByPaymentStatus: z.record(z.string(), z.number()),
  ordersBySource: z.record(z.string(), z.number()),
  topProducts: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number(),
    revenue: z.number(),
  })),
  topCustomers: z.array(z.object({
    customerId: z.string(),
    email: z.string(),
    orders: z.number(),
    revenue: z.number(),
  })),
  conversionRate: z.number(),
  averageProcessingTime: z.number(), // in hours
  averageDeliveryTime: z.number(), // in days
  returnRate: z.number(),
  refundRate: z.number(),
  paymentMethodDistribution: z.record(z.string(), z.number()),
  shippingMethodDistribution: z.record(z.string(), z.number()),
  salesTrends: z.array(z.object({
    date: z.string(),
    orders: z.number(),
    revenue: z.number(),
  })),
});

export type OrderStats = z.infer<typeof OrderStatsSchema>;

/**
 * Order Summary Schema (for lists)
 */
export const OrderSummarySchema = OrderSchema.pick({
  _id: true,
  orderNumber: true,
  customerId: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  fulfillmentStatus: true,
  totals: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  itemCount: z.number(),
  customerName: z.string().optional(),
});

export type OrderSummary = z.infer<typeof OrderSummarySchema>;

/**
 * Validation functions
 */
export const validateOrder = (data: unknown): Order => {
  return OrderSchema.parse(data);
};

export const validateCreateOrder = (data: unknown): CreateOrderInput => {
  return CreateOrderSchema.parse(data);
};

export const validateUpdateOrder = (data: unknown): UpdateOrderInput => {
  return UpdateOrderSchema.parse(data);
};

export const validateOrderFilter = (data: unknown): OrderFilter => {
  return OrderFilterSchema.parse(data);
};

/**
 * Order utility functions
 */
export const orderUtils = {
  /**
   * Generate order number
   */
  generateOrderNumber: (prefix: string = 'VM'): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  },

  /**
   * Calculate order totals
   */
  calculateTotals: (items: OrderItem[], shipping: number = 0, discounts: OrderDiscount[] = [], taxes: OrderTax[] = []): Order['totals'] => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const total = subtotal + shipping + totalTax - totalDiscount;

    return {
      subtotal,
      tax: totalTax,
      shipping,
      discount: totalDiscount,
      total: Math.max(0, total), // Ensure total is not negative
      paid: 0,
      refunded: 0,
      due: Math.max(0, total),
    };
  },

  /**
   * Calculate item total
   */
  calculateItemTotal: (item: Omit<OrderItem, 'subtotal' | 'total'>): { subtotal: number; total: number } => {
    const price = item.salePrice || item.price;
    const subtotal = price * item.quantity;
    const total = subtotal + item.tax;
    
    return { subtotal, total };
  },

  /**
   * Get order status color
   */
  getStatusColor: (status: Order['status']): string => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280',
      returned: '#f97316',
      exchanged: '#84cc16',
      failed: '#dc2626',
    };
    return colors[status] || '#6b7280';
  },

  /**
   * Get payment status color
   */
  getPaymentStatusColor: (status: Order['paymentStatus']): string => {
    const colors = {
      pending: '#f59e0b',
      processing: '#8b5cf6',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      refunded: '#f97316',
      partially_refunded: '#f59e0b',
      authorized: '#3b82f6',
      captured: '#059669',
    };
    return colors[status] || '#6b7280';
  },

  /**
   * Check if order can be cancelled
   */
  canCancel: (order: Order): boolean => {
    const cancellableStatuses: Order['status'][] = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.status) && 
           order.paymentStatus !== 'completed';
  },

  /**
   * Check if order can be refunded
   */
  canRefund: (order: Order): boolean => {
    const refundableStatuses: Order['status'][] = ['confirmed', 'processing', 'shipped', 'delivered'];
    return refundableStatuses.includes(order.status) && 
           order.paymentStatus === 'completed' &&
           order.totals.refunded < order.totals.paid;
  },

  /**
   * Check if order can be returned
   */
  canReturn: (order: Order): boolean => {
    const returnableStatuses: Order['status'][] = ['delivered'];
    const deliveryDate = order.actualDelivery || order.estimatedDelivery;
    
    if (!deliveryDate) return false;
    
    // Allow returns within 30 days of delivery
    const thirtyDaysLater = new Date(deliveryDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    return returnableStatuses.includes(order.status) && 
           new Date() <= thirtyDaysLater;
  },

  /**
   * Check if order can be exchanged
   */
  canExchange: (order: Order): boolean => {
    return orderUtils.canReturn(order); // Same conditions as return
  },

  /**
   * Get next possible statuses
   */
  getNextStatuses: (currentStatus: Order['status']): Order['status'][] => {
    const statusFlow: Record<Order['status'], Order['status'][]> = {
      pending: ['confirmed', 'cancelled', 'failed'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned', 'exchanged'],
      cancelled: [],
      refunded: [],
      returned: ['refunded', 'exchanged'],
      exchanged: [],
      failed: ['pending'],
    };
    
    return statusFlow[currentStatus] || [];
  },

  /**
   * Format order for display
   */
  formatForDisplay: (order: Order) => {
    return {
      id: order._id?.toString(),
      orderNumber: order.orderNumber,
      customer: {
        id: order.customerId,
        email: order.customerEmail,
        phone: order.customerPhone,
        name: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
      },
      status: {
        order: order.status,
        payment: order.paymentStatus,
        fulfillment: order.fulfillmentStatus,
        orderColor: orderUtils.getStatusColor(order.status),
        paymentColor: orderUtils.getPaymentStatusColor(order.paymentStatus),
      },
      totals: {
        ...order.totals,
        formatted: {
          subtotal: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency,
          }).format(order.totals.subtotal),
          total: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency,
          }).format(order.totals.total),
          tax: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency,
          }).format(order.totals.tax),
          shipping: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency,
          }).format(order.totals.shipping),
          discount: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency,
          }).format(order.totals.discount),
        },
      },
      items: order.items.map(item => ({
        ...item,
        formattedPrice: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: order.currency,
        }).format(item.price),
        formattedTotal: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: order.currency,
        }).format(item.total),
      })),
      timeline: order.statusHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      addresses: {
        billing: order.billingAddress,
        shipping: order.shippingAddress,
      },
      shipping: order.shipping,
      payments: order.payments,
      actions: {
        canCancel: orderUtils.canCancel(order),
        canRefund: orderUtils.canRefund(order),
        canReturn: orderUtils.canReturn(order),
        canExchange: orderUtils.canExchange(order),
        nextStatuses: orderUtils.getNextStatuses(order.status),
      },
      dates: {
        created: order.createdAt,
        updated: order.updatedAt,
        estimated: order.estimatedDelivery,
        delivered: order.actualDelivery,
        cancelled: order.cancelledAt,
      },
      tags: order.tags,
      priority: order.priority,
      riskLevel: order.riskLevel,
    };
  },

  /**
   * Create order summary
   */
  createSummary: (order: Order): OrderSummary => {
    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      totals: order.totals,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemCount: order.items.length,
      customerName: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
    };
  },

  /**
   * Add status to history
   */
  addStatusHistory: (
    order: Order,
    status: Order['status'],
    reason?: string,
    notes?: string,
    updatedBy?: string
  ): OrderStatusHistory[] => {
    const newHistory: OrderStatusHistory = {
      status,
      timestamp: new Date(),
      reason,
      notes,
      updatedBy,
      notificationSent: false,
    };
    
    return [...order.statusHistory, newHistory];
  },

  /**
   * Calculate processing time
   */
  calculateProcessingTime: (order: Order): number | null => {
    const confirmed = order.statusHistory.find(h => h.status === 'confirmed');
    const shipped = order.statusHistory.find(h => h.status === 'shipped');
    
    if (!confirmed || !shipped) return null;
    
    const diff = shipped.timestamp.getTime() - confirmed.timestamp.getTime();
    return Math.round(diff / (1000 * 60 * 60)); // Hours
  },

  /**
   * Calculate delivery time
   */
  calculateDeliveryTime: (order: Order): number | null => {
    const shipped = order.statusHistory.find(h => h.status === 'shipped');
    const delivered = order.statusHistory.find(h => h.status === 'delivered');
    
    if (!shipped || !delivered) return null;
    
    const diff = delivered.timestamp.getTime() - shipped.timestamp.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)); // Days
  },

  /**
   * Get order invoice data
   */
  getInvoiceData: (order: Order) => {
    return {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: {
        name: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.billingAddress,
      },
      items: order.items,
      totals: order.totals,
      payments: order.payments.filter(p => p.status === 'completed'),
      taxes: order.taxes,
      discounts: order.discounts,
      shipping: order.shipping,
      notes: order.notes.filter(n => n.type === 'customer'),
    };
  },

  /**
   * Validate order data
   */
  validateOrderData: (order: Partial<Order>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!order.items || order.items.length === 0) {
      errors.push('Order must have at least one item');
    }
    
    if (!order.billingAddress) {
      errors.push('Billing address is required');
    }
    
    if (!order.shippingAddress) {
      errors.push('Shipping address is required');
    }
    
    if (order.totals && order.totals.total <= 0) {
      errors.push('Order total must be greater than zero');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate tracking URL
   */
  generateTrackingUrl: (provider: string, trackingNumber: string): string => {
    const urls: Record<string, string> = {
      bluedart: `https://www.bluedart.com/tracking/${trackingNumber}`,
      delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?tracknum=${trackingNumber}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      aramex: `https://www.aramex.com/en/track/shipments/${trackingNumber}`,
    };
    
    return urls[provider.toLowerCase()] || '';
  },
};

/**
 * Default order values
 */
export const defaultOrder: Partial<Order> = {
  status: 'pending',
  paymentStatus: 'pending',
  fulfillmentStatus: 'pending',
  source: 'web',
  currency: 'INR',
  items: [],
  payments: [],
  discounts: [],
  taxes: [],
  statusHistory: [],
  notes: [],
  tags: [],
  priority: 'normal',
  riskLevel: 'low',
  refundRequests: [],
  returnRequests: [],
  exchangeRequests: [],
  customFields: {},
};

const OrderModel = {
  OrderSchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderFilterSchema,
  OrderStatsSchema,
  OrderSummarySchema,
  OrderAddressSchema,
  OrderItemSchema,
  OrderPaymentSchema,
  OrderShippingSchema,
  OrderDiscountSchema,
  OrderTaxSchema,
  OrderStatusHistorySchema,
  validateOrder,
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderFilter,
  orderUtils,
  defaultOrder,
};

export default OrderModel;