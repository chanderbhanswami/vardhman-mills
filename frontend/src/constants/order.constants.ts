/**
 * Order Constants - Vardhman Mills Frontend
 * Contains order-related configuration, statuses, and constants
 */

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

// Shipping Status
export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED_DELIVERY: 'failed_delivery',
  RETURNED_TO_SENDER: 'returned_to_sender',
} as const;

// Return/Refund Status
export const RETURN_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
} as const;

// Order Types
export const ORDER_TYPES = {
  REGULAR: 'regular',
  WHOLESALE: 'wholesale',
  CUSTOM: 'custom',
  SUBSCRIPTION: 'subscription',
  GIFT: 'gift',
} as const;

// Priority Levels
export const ORDER_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Shipping Methods
export const SHIPPING_METHODS = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 0,
    estimatedDays: 7,
  },
  EXPRESS: {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 99,
    estimatedDays: 3,
  },
  OVERNIGHT: {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 199,
    estimatedDays: 1,
  },
  PICKUP: {
    id: 'pickup',
    name: 'Store Pickup',
    description: 'Pick up from store',
    price: 0,
    estimatedDays: 0,
  },
} as const;

// Order Limits
export const ORDER_LIMITS = {
  MAX_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 10,
  MIN_ORDER_VALUE: 100,
  MAX_ORDER_VALUE: 100000,
  FREE_SHIPPING_THRESHOLD: 500,
} as const;

// Return/Refund Reasons
export const RETURN_REASONS = {
  DEFECTIVE: 'defective',
  WRONG_SIZE: 'wrong_size',
  WRONG_COLOR: 'wrong_color',
  NOT_AS_DESCRIBED: 'not_as_described',
  DAMAGED_IN_SHIPPING: 'damaged_in_shipping',
  CHANGED_MIND: 'changed_mind',
  ORDERED_BY_MISTAKE: 'ordered_by_mistake',
  RECEIVED_WRONG_ITEM: 'received_wrong_item',
  QUALITY_ISSUES: 'quality_issues',
  OTHER: 'other',
} as const;

// Return Policies
export const RETURN_POLICY = {
  RETURN_WINDOW_DAYS: 30,
  EXCHANGE_WINDOW_DAYS: 30,
  REFUND_PROCESSING_DAYS: 7,
  CONDITIONS: [
    'Item must be in original condition',
    'Original packaging required',
    'Tags must be attached',
    'No signs of wear or use',
  ],
  NON_RETURNABLE_ITEMS: [
    'Custom/personalized items',
    'Intimate apparel',
    'Final sale items',
    'Gift cards',
  ],
} as const;

// Order Actions
export const ORDER_ACTIONS = {
  VIEW_DETAILS: 'view_details',
  CANCEL: 'cancel',
  RETURN: 'return',
  EXCHANGE: 'exchange',
  TRACK: 'track',
  REORDER: 'reorder',
  DOWNLOAD_INVOICE: 'download_invoice',
  CONTACT_SUPPORT: 'contact_support',
  LEAVE_REVIEW: 'leave_review',
} as const;

// Cancellation Reasons
export const CANCELLATION_REASONS = {
  CHANGED_MIND: 'changed_mind',
  FOUND_BETTER_PRICE: 'found_better_price',
  ORDERED_BY_MISTAKE: 'ordered_by_mistake',
  SHIPPING_TOO_SLOW: 'shipping_too_slow',
  PAYMENT_ISSUES: 'payment_issues',
  PRODUCT_UNAVAILABLE: 'product_unavailable',
  OTHER: 'other',
} as const;

// Order Filters
export const ORDER_FILTERS = {
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  TIME_RANGE: {
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    LAST_YEAR: 'last_year',
    ALL_TIME: 'all_time',
  },
  SORT_BY: {
    DATE_DESC: 'date_desc',
    DATE_ASC: 'date_asc',
    AMOUNT_DESC: 'amount_desc',
    AMOUNT_ASC: 'amount_asc',
    STATUS: 'status',
  },
} as const;

// Notification Triggers
export const ORDER_NOTIFICATIONS = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  RETURN_APPROVED: 'return_approved',
  REFUND_PROCESSED: 'refund_processed',
  PAYMENT_FAILED: 'payment_failed',
} as const;

// Status Labels
export const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Order Pending',
  [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.RETURNED]: 'Returned',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
  [ORDER_STATUS.FAILED]: 'Failed',
} as const;

// Status Colors
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'orange',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PROCESSING]: 'purple',
  [ORDER_STATUS.SHIPPED]: 'indigo',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'yellow',
  [ORDER_STATUS.DELIVERED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
  [ORDER_STATUS.RETURNED]: 'gray',
  [ORDER_STATUS.REFUNDED]: 'teal',
  [ORDER_STATUS.FAILED]: 'red',
} as const;

export type OrderStatus = typeof ORDER_STATUS;
export type PaymentStatus = typeof PAYMENT_STATUS;
export type ShippingStatus = typeof SHIPPING_STATUS;
export type ReturnStatus = typeof RETURN_STATUS;
export type OrderTypes = typeof ORDER_TYPES;