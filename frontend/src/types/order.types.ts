// Re-export order types from cart.types since they're closely related
export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
  OrderNotification,
  OrderFilters,
  OrderSummary,
  OrderReturn,
  ReturnItem,
  ReturnReason,
  ReturnStatus,
  OrderAnalytics,
  CheckoutSession,
  CheckoutStep,
  CheckoutPricing,
  GuestCheckoutData
} from './cart.types';

import { ID, Timestamp, Price, BaseEntity, Address } from './common.types';
import type { User } from './user.types';
import type { Product } from './product.types';
import type { OrderStatus, PaymentStatus, FulfillmentStatus, OrderFilters } from './cart.types';

// Additional Order-specific types that aren't in cart.types
export interface OrderTracking {
  orderId: ID;
  trackingNumber: string;
  carrier: string;
  service: string;
  status: TrackingStatus;
  events: TrackingEvent[];
  estimatedDeliveryDate?: Timestamp;
  actualDeliveryDate?: Timestamp;
  deliverySignature?: string;
  deliveryPhoto?: string;
  lastUpdated: Timestamp;
}

export interface TrackingEvent {
  id: ID;
  timestamp: Timestamp;
  status: TrackingStatus;
  description: string;
  location?: string;
  facility?: string;
  nextExpectedEvent?: string;
}

export type TrackingStatus = 
  | 'label_created'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'at_facility'
  | 'out_for_delivery'
  | 'delivery_attempted'
  | 'delivered'
  | 'exception'
  | 'returned_to_sender'
  | 'lost'
  | 'damaged';

export interface OrderInvoice extends BaseEntity {
  orderId: ID;
  invoiceNumber: string;
  issueDate: Timestamp;
  dueDate?: Timestamp;
  
  // Billing Information
  billTo: Address;
  shipTo: Address;
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // Amounts
  subtotal: Price;
  taxAmount: Price;
  discountAmount: Price;
  shippingAmount: Price;
  total: Price;
  
  // Tax Details
  taxBreakdown: OrderTaxBreakdown[];
  taxId?: string; // GST number, VAT number, etc.
  
  // Payment Information
  paymentTerms?: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: Timestamp;
  
  // Document
  pdfUrl?: string;
  downloadCount: number;
  
  // Notes
  notes?: string;
  termsAndConditions?: string;
}

export interface InvoiceLineItem {
  id: ID;
  productId: ID;
  productName: string;
  productSku: string;
  description?: string;
  quantity: number;
  unitPrice: Price;
  discountAmount?: Price;
  taxAmount?: Price;
  totalPrice: Price;
  hsnCode?: string; // for Indian GST
  taxRate?: number;
}

export interface OrderTaxBreakdown {
  name: string;
  type: 'cgst' | 'sgst' | 'igst' | 'vat' | 'sales_tax' | 'service_tax';
  rate: number;
  amount: Price;
  taxableAmount: Price;
}

export interface OrderTimeline {
  orderId: ID;
  events: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  id: ID;
  timestamp: Timestamp;
  type: 'order_placed' | 'payment_received' | 'order_confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  actor?: string; // user, system, admin
  metadata?: Record<string, string | number | boolean>;
}

export interface OrderSearch {
  query?: string;
  filters: OrderFilters;
  sortBy: 'created_at' | 'total' | 'status' | 'customer_name';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface OrderListItem {
  id: ID;
  orderNumber: string;
  customer: {
    id: ID;
    name: string;
    email: string;
    avatar?: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  total: Price;
  itemCount: number;
  placedAt: Timestamp;
  estimatedDeliveryDate?: Timestamp;
}

export interface CustomerOrderHistory {
  customerId: ID;
  orders: OrderListItem[];
  summary: {
    totalOrders: number;
    totalSpent: Price;
    averageOrderValue: Price;
    favoriteProducts: Array<{
      product: Product;
      orderCount: number;
    }>;
    lastOrderDate?: Timestamp;
  };
}

export interface OrderFulfillment {
  orderId: ID;
  fulfillmentId: ID;
  items: OrderFulfillmentItem[];
  warehouse?: Warehouse;
  packingSlip: PackingSlip;
  shippingLabel: ShippingLabel;
  status: FulfillmentStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export interface OrderFulfillmentItem {
  orderItemId: ID;
  productId: ID;
  variantId?: ID;
  quantity: number;
  binLocation?: string;
  serialNumbers?: string[];
}

export interface Warehouse {
  id: ID;
  name: string;
  code: string;
  address: Address;
  isActive: boolean;
  priority: number;
}

export interface PackingSlip {
  id: ID;
  fulfillmentId: ID;
  slipNumber: string;
  items: PackingSlipItem[];
  packedBy: ID;
  packedAt: Timestamp;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  pdfUrl?: string;
}

export interface PackingSlipItem {
  orderItemId: ID;
  productName: string;
  sku: string;
  quantity: number;
  binLocation?: string;
  condition: 'new' | 'open_box' | 'refurbished' | 'damaged';
}

export interface ShippingLabel {
  id: ID;
  fulfillmentId: ID;
  carrier: string;
  service: string;
  trackingNumber: string;
  labelUrl: string;
  cost: Price;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  insuranceAmount?: Price;
  signatureRequired: boolean;
  createdAt: Timestamp;
}

// Order Automation
export interface OrderRule {
  id: ID;
  name: string;
  description?: string;
  isActive: boolean;
  conditions: OrderRuleCondition[];
  actions: OrderRuleAction[];
  priority: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderRuleCondition {
  field: 'total' | 'item_count' | 'customer_type' | 'shipping_method' | 'payment_method' | 'location';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: string | number | string[];
}

export interface OrderRuleAction {
  type: 'tag' | 'flag' | 'assign' | 'notify' | 'hold' | 'prioritize';
  value: string | number;
  target?: ID; // user ID for assignment
}

// Order Metrics and Reporting
export interface OrderMetrics {
  period: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year';
  totalOrders: number;
  totalRevenue: Price;
  averageOrderValue: Price;
  conversion: {
    cartToOrder: number;
    visitToOrder: number;
  };
  growth: {
    ordersGrowth: number;
    revenueGrowth: number;
  };
  topProducts: Array<{
    productId: ID;
    productName: string;
    quantity: number;
    revenue: Price;
  }>;
  ordersByHour: Array<{
    hour: number;
    orderCount: number;
  }>;
  ordersByDay: Array<{
    date: string;
    orderCount: number;
    revenue: Price;
  }>;
}

export interface OrderExport {
  filters: OrderFilters;
  format: 'csv' | 'xlsx' | 'pdf';
  fields: string[];
  includeLineItems: boolean;
  includeCustomer: boolean;
  includeShipping: boolean;
  includePayment: boolean;
}

// B2B Order Types
export interface QuoteRequest extends BaseEntity {
  quoteNumber: string;
  customerId: ID;
  customer: User;
  items: QuoteItem[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'converted';
  
  // Pricing
  subtotal: Price;
  discountAmount: Price;
  taxAmount: Price;
  total: Price;
  
  // Validity
  validUntil: Timestamp;
  
  // Communication
  customerMessage?: string;
  adminNotes?: string;
  rejectionReason?: string;
  
  // Approval
  approvedBy?: ID;
  approvedAt?: Timestamp;
  
  // Conversion
  convertedOrderId?: ID;
  convertedAt?: Timestamp;
}

export interface QuoteItem {
  id: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  quantity: number;
  requestedPrice?: Price;
  quotedPrice?: Price;
  notes?: string;
}

export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  customerId: ID;
  customer: User;
  
  // Items
  items: PurchaseOrderItem[];
  
  // Pricing
  subtotal: Price;
  discountAmount: Price;
  taxAmount: Price;
  total: Price;
  
  // Status
  status: 'draft' | 'sent' | 'acknowledged' | 'in_production' | 'ready' | 'delivered' | 'invoiced' | 'paid' | 'cancelled';
  
  // Dates
  issueDate: Timestamp;
  expectedDeliveryDate?: Timestamp;
  acknowledgmentDeadline?: Timestamp;
  
  // Terms
  paymentTerms: string;
  deliveryTerms: string;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  // References
  customerPoNumber?: string;
  quotationReference?: ID;
}

export interface PurchaseOrderItem {
  id: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  quantity: number;
  unitPrice: Price;
  totalPrice: Price;
  expectedDeliveryDate?: Timestamp;
  specifications?: string;
  notes?: string;
}
