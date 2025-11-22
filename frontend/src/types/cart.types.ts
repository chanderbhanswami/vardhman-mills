import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  Address, 
  Price, 
  Currency
} from './common.types';
import type { Product, ProductVariant } from './product.types';
import type { User } from './user.types';

// Cart Types
export interface Cart extends BaseEntity {
  userId?: ID; // null for guest carts
  sessionId?: string; // for guest carts
  items: CartItem[];
  
  // Pricing
  subtotal: Price;
  taxAmount: Price;
  shippingAmount: Price;
  discountAmount: Price;
  total: Price;
  
  // Applied Promotions
  appliedCoupons: AppliedCoupon[];
  appliedDiscounts: AppliedDiscount[];
  
  // Cart Status
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  expiresAt?: Timestamp;
  
  // Shipping
  shippingAddressId?: ID;
  shippingAddress?: Address;
  shippingMethod?: ShippingMethod;
  
  // Metadata
  currency: Currency;
  locale?: string;
  
  // Analytics
  abandonedAt?: Timestamp;
  lastActivityAt: Timestamp;
  source?: 'web' | 'mobile' | 'app' | 'social';
  utm?: UTMParameters;
}

export interface CartItem {
  id: ID;
  cartId: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  
  // Quantity and Pricing
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  originalPrice?: Price; // before any item-specific discounts
  
  // Customization
  customization?: CartItemCustomization;
  personalMessage?: string;
  giftWrap?: GiftWrapOption;
  
  // Dates
  addedAt: Timestamp;
  updatedAt: Timestamp;
  
  // Availability
  isAvailable: boolean;
  availabilityMessage?: string;
  
  // Applied Discounts
  appliedDiscounts: AppliedDiscount[];
}

export interface CartItemCustomization {
  options: Array<{
    name: string;
    value: string;
    price?: Price;
  }>;
  instructions?: string;
  uploadedFiles?: CustomizationFile[];
}

export interface CustomizationFile {
  id: ID;
  filename: string;
  url: string;
  type: 'image' | 'document';
  size: number;
}

export interface GiftWrapOption {
  id: ID;
  name: string;
  description?: string;
  price: Price;
  image?: string;
  isSelected: boolean;
  message?: string;
}

export interface AppliedCoupon {
  couponId: ID;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed' | 'shipping' | 'buy_x_get_y';
  discountAmount: Price;
  minimumAmount?: Price;
  appliedTo: 'cart' | 'items' | 'shipping';
  appliedAt: Timestamp;
}

export interface AppliedDiscount {
  discountId: ID;
  name: string;
  type: 'automatic' | 'coupon' | 'loyalty' | 'bulk' | 'member';
  amount: Price;
  percentage?: number;
  appliedTo: 'item' | 'cart' | 'shipping';
  description?: string;
}

export interface ShippingMethod {
  id: ID;
  name: string;
  description?: string;
  carrier: string;
  serviceType: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  price: Price;
  isFree: boolean;
  isExpress: boolean;
  trackingAvailable: boolean;
  restrictions?: ShippingRestriction[];
}

export interface ShippingRestriction {
  type: 'weight' | 'dimensions' | 'value' | 'quantity' | 'location';
  condition: 'max' | 'min' | 'equals' | 'not_allowed';
  value: number | string;
  message: string;
}

export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Cart Operations
export interface AddToCartRequest {
  productId: ID;
  variantId?: ID;
  quantity: number;
  customization?: CartItemCustomization;
  giftWrapId?: ID;
  personalMessage?: string;
}

export interface UpdateCartItemRequest {
  itemId: ID;
  quantity?: number;
  customization?: CartItemCustomization;
  giftWrapId?: ID;
  personalMessage?: string;
}

export interface ApplyCouponRequest {
  couponCode: string;
}

export interface CartSummary {
  itemCount: number;
  uniqueItemCount: number;
  subtotal: Price;
  taxAmount: Price;
  shippingAmount: Price;
  discountAmount: Price;
  total: Price;
  estimatedDelivery?: {
    min: Date;
    max: Date;
  };
  freeShippingThreshold?: Price;
  freeShippingRemaining?: Price;
}

// Order Types
export interface Order extends BaseEntity {
  // Order Identification
  orderNumber: string;
  userId: ID;
  user: User;
  
  // Order Items
  items: OrderItem[];
  
  // Pricing
  subtotal: Price;
  taxAmount: Price;
  shippingAmount: Price;
  discountAmount: Price;
  total: Price;
  currency: Currency;
  
  // Status and Tracking
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Shipping and Delivery
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  estimatedDeliveryDate?: Timestamp;
  actualDeliveryDate?: Timestamp;
  
  // Payment Information
  paymentMethodId: ID;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  transactionId?: string;
  
  // Applied Promotions
  appliedCoupons: AppliedCoupon[];
  appliedDiscounts: AppliedDiscount[];
  
  // Order Metadata
  source: 'web' | 'mobile' | 'app' | 'phone' | 'admin';
  channel: 'online' | 'retail' | 'wholesale';
  customerNotes?: string;
  adminNotes?: string;
  tags?: string[];
  
  // Important Dates
  placedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  
  // Analytics
  utm?: UTMParameters;
  referralSource?: string;
  
  // Customer Communication
  emailSent: boolean;
  smsSent: boolean;
  notifications: OrderNotification[];
  
  // Return/Exchange Information
  isReturnable: boolean;
  returnDeadline?: Timestamp;
  exchangeDeadline?: Timestamp;
  returns?: OrderReturn[];
}

export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  
  // Quantity and Pricing
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  originalPrice?: Price;
  
  // Product Snapshot (at time of order)
  productSnapshot: {
    name: string;
    description: string;
    sku: string;
    image?: string;
    specifications?: Record<string, string>;
  };
  
  // Customization
  customization?: CartItemCustomization;
  personalMessage?: string;
  giftWrap?: GiftWrapOption;
  
  // Fulfillment
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  trackingNumber?: string;
  
  // Return/Exchange
  isReturnable: boolean;
  returnQuantity: number;
  exchangeQuantity: number;
  
  // Applied Discounts
  appliedDiscounts: AppliedDiscount[];
}

export type OrderStatus = 
  | 'pending'           // Order placed, awaiting confirmation
  | 'confirmed'         // Order confirmed, payment processing
  | 'processing'        // Payment successful, preparing order
  | 'shipped'          // Order shipped
  | 'delivered'        // Order delivered
  | 'completed'        // Order completed (after return period)
  | 'cancelled'        // Order cancelled
  | 'refunded'         // Order refunded
  | 'partially_shipped' // Some items shipped
  | 'partially_delivered' // Some items delivered
  | 'on_hold';         // Order on hold (manual review needed)

export type PaymentStatus = 
  | 'pending'          // Payment not yet processed
  | 'processing'       // Payment being processed
  | 'paid'            // Payment successful
  | 'failed'          // Payment failed
  | 'partially_paid'   // Partial payment received
  | 'refunded'        // Payment refunded
  | 'partially_refunded' // Partial refund
  | 'cancelled'       // Payment cancelled
  | 'authorized'      // Payment authorized but not captured
  | 'expired';        // Payment authorization expired

export type FulfillmentStatus = 
  | 'pending'         // Not yet processed
  | 'processing'      // Being prepared
  | 'ready'          // Ready for pickup/shipping
  | 'shipped'        // Shipped
  | 'in_transit'     // In transit
  | 'out_for_delivery' // Out for delivery
  | 'delivered'      // Delivered
  | 'failed'         // Delivery failed
  | 'returned'       // Returned to sender
  | 'cancelled';     // Fulfillment cancelled

export interface PaymentMethod {
  id: ID;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'cash_on_delivery' | 'emi' | 'gift_card';
  provider: string; // Razorpay, Stripe, PayPal, etc.
  last4?: string;
  brand?: string; // Visa, Mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isSecure: boolean;
}

export interface OrderNotification {
  id: ID;
  orderId: ID;
  type: 'order_confirmation' | 'payment_confirmation' | 'shipping_update' | 'delivery_update' | 'cancellation' | 'refund';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: Timestamp;
  content?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Order Management
export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  fulfillmentStatus?: FulfillmentStatus[];
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  customerId?: ID;
  search?: string; // order number, customer name, email
  source?: string[];
  channel?: string[];
  shippingMethod?: ID[];
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: Price;
  averageOrderValue: Price;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
}

// Return and Exchange
export interface OrderReturn extends BaseEntity {
  orderId: ID;
  orderItemIds: ID[];
  returnNumber: string;
  
  // Return Details
  reason: ReturnReason;
  description?: string;
  images?: string[];
  
  // Status
  status: ReturnStatus;
  
  // Quantities
  requestedItems: ReturnItem[];
  
  // Refund Information
  refundAmount: Price;
  refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer';
  
  // Processing
  isApproved: boolean;
  approvedBy?: ID;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  
  // Shipping
  returnShippingLabel?: string;
  returnTrackingNumber?: string;
  returnCarrier?: string;
  
  // Important Dates
  requestedAt: Timestamp;
  processedAt?: Timestamp;
  itemsReceivedAt?: Timestamp;
  refundProcessedAt?: Timestamp;
  completedAt?: Timestamp;
}

export interface ReturnItem {
  orderItemId: ID;
  quantity: number;
  reason: string;
  condition: 'unopened' | 'opened' | 'used' | 'damaged';
  images?: string[];
}

export type ReturnReason = 
  | 'defective'
  | 'wrong_item'
  | 'size_issue'
  | 'color_issue'
  | 'quality_issue'
  | 'not_as_described'
  | 'damaged_in_shipping'
  | 'changed_mind'
  | 'duplicate_order'
  | 'arrived_late'
  | 'other';

export type ReturnStatus = 
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'inspecting'
  | 'processed'
  | 'refunded'
  | 'completed'
  | 'cancelled';

// Cart Analytics
export interface CartAnalytics {
  abandonmentRate: number;
  averageCartValue: Price;
  averageItemsPerCart: number;
  conversionRate: number;
  topAbandonedProducts: Array<{
    productId: ID;
    productName: string;
    abandonmentCount: number;
  }>;
  cartsByStage: {
    added: number;
    viewed: number;
    checkout_initiated: number;
    payment_initiated: number;
    completed: number;
  };
}

// Order Analytics
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: Price;
  averageOrderValue: Price;
  ordersByStatus: Record<OrderStatus, number>;
  topSellingProducts: Array<{
    productId: ID;
    productName: string;
    quantitySold: number;
    revenue: Price;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: Price;
  };
  geographicDistribution: Array<{
    region: string;
    orderCount: number;
    revenue: Price;
  }>;
}

// Checkout Process
export interface CheckoutSession {
  id: ID;
  cartId: ID;
  userId?: ID;
  
  // Current Step
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  
  // Form Data
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  
  // Pricing
  pricing: CheckoutPricing;
  
  // Status
  status: 'active' | 'completed' | 'abandoned' | 'expired';
  expiresAt: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export type CheckoutStep = 
  | 'cart_review'
  | 'shipping_address'
  | 'billing_address'
  | 'shipping_method'
  | 'payment_method'
  | 'order_review'
  | 'payment_processing'
  | 'order_confirmation';

export interface CheckoutPricing {
  subtotal: Price;
  shippingAmount: Price;
  taxAmount: Price;
  discountAmount: Price;
  total: Price;
  estimatedTax?: Price;
  taxBreakdown?: TaxBreakdown[];
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: Price;
  type: 'sales_tax' | 'vat' | 'gst' | 'service_tax';
}

// Guest Checkout
export interface GuestCheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createAccount: boolean;
  password?: string;
  marketingOptIn: boolean;
}
