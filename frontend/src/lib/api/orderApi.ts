import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';

// API Response Type
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Order Status Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded'
  | 'partially-shipped'
  | 'partially-delivered'
  | 'on-hold'
  | 'failed';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially-refunded'
  | 'disputed'
  | 'on-hold';

export type FulfillmentStatus = 
  | 'unfulfilled' 
  | 'partially-fulfilled' 
  | 'fulfilled' 
  | 'shipped' 
  | 'delivered' 
  | 'returned'
  | 'cancelled';

// Order Item Types
export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  description?: string;
  
  // Pricing & Quantity
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalPrice?: number;
  discountAmount?: number;
  taxAmount?: number;
  
  // Product Details
  image?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Customization & Configuration
  customizations?: Record<string, unknown>;
  productOptions?: Array<{
    name: string;
    value: string;
    price?: number;
  }>;
  
  // Fulfillment & Shipping
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  shippedDate?: Date;
  deliveredDate?: Date;
  returnDate?: Date;
  
  // Business Logic
  isRefundable: boolean;
  isReturnable: boolean;
  warrantyPeriod?: number;
  warrantyExpiry?: Date;
  
  // Vendor Information
  vendorId?: string;
  vendorName?: string;
  dropshipment?: boolean;
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
}

// Address Information
export interface Address {
  id?: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isDefault?: boolean;
  
  // Delivery Instructions
  deliveryInstructions?: string;
  accessCode?: string;
  
  // Validation & Verification
  isVerified?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Shipping Information
export interface ShippingInfo {
  method: string;
  carrier: string;
  service: string;
  cost: number;
  estimatedDelivery: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  
  // Package Details
  packages: Array<{
    id: string;
    trackingNumber: string;
    items: string[];
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shippedDate?: Date;
    deliveredDate?: Date;
  }>;
  
  // Delivery Status
  status: 'pending' | 'shipped' | 'in-transit' | 'delivered' | 'failed' | 'returned';
  deliveryAttempts?: Array<{
    date: Date;
    status: 'attempted' | 'delivered' | 'failed';
    notes?: string;
  }>;
  
  // Insurance & Signature
  insuranceValue?: number;
  signatureRequired?: boolean;
  signedBy?: string;
  deliveryPhoto?: string;
}

// Payment Information
export interface PaymentInfo {
  method: 'credit-card' | 'debit-card' | 'paypal' | 'bank-transfer' | 'cash-on-delivery' | 'digital-wallet' | 'crypto';
  provider: string;
  transactionId?: string;
  authorizationCode?: string;
  
  // Payment Status
  status: PaymentStatus;
  paidAmount: number;
  paidDate?: Date;
  refundedAmount?: number;
  refundedDate?: Date;
  
  // Card/Account Details (masked)
  last4Digits?: string;
  cardType?: string;
  expiryMonth?: number;
  expiryYear?: number;
  
  // Payment Processing
  processingFee?: number;
  gateway?: string;
  gatewayTransactionId?: string;
  
  // Security & Fraud
  fraudScore?: number;
  fraudChecks?: Array<{
    type: string;
    result: 'pass' | 'fail' | 'review';
    details?: string;
  }>;
  
  // Installments & Subscriptions
  installments?: {
    total: number;
    current: number;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
  };
}

// Order Main Type
export interface Order {
  id: string;
  orderNumber: string;
  
  // Customer Information
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  guestCheckout: boolean;
  
  // Order Status & Dates
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  orderDate: Date;
  confirmedDate?: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  cancelledDate?: Date;
  
  // Items & Pricing
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  
  // Currency & Localization
  currency: string;
  exchangeRate?: number;
  originalCurrency?: string;
  
  // Addresses & Shipping
  billingAddress: Address;
  shippingAddress: Address;
  shipping: ShippingInfo;
  
  // Payment Information
  payment: PaymentInfo;
  
  // Discounts & Promotions
  appliedCoupons?: Array<{
    code: string;
    type: 'percentage' | 'fixed' | 'free-shipping';
    value: number;
    discountAmount: number;
  }>;
  
  appliedPromotions?: Array<{
    id: string;
    name: string;
    type: string;
    discountAmount: number;
  }>;
  
  // Order Notes & Communication
  customerNotes?: string;
  internalNotes?: string;
  orderNotes?: Array<{
    id: string;
    type: 'customer' | 'internal' | 'system';
    message: string;
    createdBy?: string;
    createdAt: Date;
    isPublic: boolean;
  }>;
  
  // Fulfillment & Processing
  processingTime?: number;
  fulfillmentCenter?: string;
  pickingList?: string;
  packingSlip?: string;
  invoice?: string;
  
  // Returns & Refunds
  returnPolicy?: {
    eligible: boolean;
    period: number;
    conditions: string[];
  };
  
  returns?: Array<{
    id: string;
    items: string[];
    reason: string;
    status: 'requested' | 'approved' | 'rejected' | 'completed';
    refundAmount: number;
    returnDate: Date;
  }>;
  
  // Marketing & Attribution
  source: 'website' | 'mobile-app' | 'marketplace' | 'social-media' | 'email' | 'phone' | 'store';
  campaign?: string;
  referrer?: string;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  
  // Business Intelligence
  tags: string[];
  customFields: Record<string, unknown>;
  
  // Risk & Fraud
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  fraudChecks?: Array<{
    type: string;
    result: 'pass' | 'fail' | 'review';
    score?: number;
    details?: string;
  }>;
  
  // Integration & Sync
  externalOrderId?: string;
  marketplaceOrderId?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  version: number;
}

// Order Analytics & Reports
export interface OrderAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Sales Metrics
  sales: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    averageItemsPerOrder: number;
    conversionRate: number;
    repeatCustomerRate: number;
  };
  
  // Order Status Breakdown
  statusBreakdown: Record<OrderStatus, number>;
  paymentStatusBreakdown: Record<PaymentStatus, number>;
  fulfillmentStatusBreakdown: Record<FulfillmentStatus, number>;
  
  // Geographic Analysis
  salesByRegion: Record<string, {
    orders: number;
    revenue: number;
    customers: number;
  }>;
  
  // Product Performance
  topProducts: Array<{
    productId: string;
    name: string;
    orders: number;
    revenue: number;
    quantity: number;
  }>;
  
  // Customer Analysis
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    averageLifetimeValue: number;
    customerRetentionRate: number;
  };
  
  // Time-based Analysis
  hourlyDistribution: Record<string, number>;
  dailyDistribution: Record<string, number>;
  
  // Payment & Shipping Analysis
  paymentMethodBreakdown: Record<string, number>;
  shippingMethodBreakdown: Record<string, number>;
  
  // Performance Metrics
  fulfillmentMetrics: {
    averageProcessingTime: number;
    averageShippingTime: number;
    onTimeDeliveryRate: number;
    returnRate: number;
    refundRate: number;
  };
}

// Order Tracking Information
export interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception';
  
  // Tracking Events
  events: Array<{
    date: Date;
    location: string;
    status: string;
    description: string;
    details?: string;
  }>;
  
  // Delivery Information
  estimatedDelivery: Date;
  actualDelivery?: Date;
  deliveryAddress: Address;
  
  // Package Information
  packageInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    serviceType: string;
  };
  
  // Additional Services
  signatureRequired: boolean;
  insuranceValue?: number;
  codAmount?: number;
  
  // Real-time Updates
  lastUpdated: Date;
  nextUpdate?: Date;
  updateFrequency: number;
}

// Order Invoice
export interface OrderInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  
  // Invoice Details
  issueDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  
  // Financial Information
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  
  // Tax Breakdown
  taxBreakdown: Array<{
    name: string;
    rate: number;
    amount: number;
    taxableAmount: number;
  }>;
  
  // Invoice Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Payment Terms
  paymentTerms?: string;
  paymentMethod?: string;
  
  // Document Information
  pdfUrl?: string;
  downloadUrl?: string;
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
}

// Additional Type Interfaces for TypeScript Safety
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  notifyCustomer?: boolean;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface OrderFulfillment {
  orderId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    trackingNumber?: string;
  }>;
  shippingMethod: string;
  trackingNumber: string;
  shippedDate: Date;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface OrderRefund {
  orderId: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    reason?: string;
  }>;
  refundAmount: number;
  reason: string;
  refundMethod?: 'original' | 'store-credit' | 'bank-transfer';
  processImmediately?: boolean;
  notifyCustomer?: boolean;
  notes?: string;
}

export interface OrderReturn {
  orderId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    reason: string;
    condition?: 'new' | 'used' | 'damaged';
  }>;
  returnReason: string;
  customerNotes?: string;
  returnMethod: 'ship-back' | 'drop-off' | 'pickup';
  refundRequested: boolean;
  exchangeRequested: boolean;
}

export interface BulkOrderOperation {
  operation: 'update-status' | 'fulfill' | 'cancel' | 'export' | 'print-labels' | 'send-notifications';
  orderIds: string[];
  parameters?: Record<string, unknown>;
}

export interface OrderFilter {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  fulfillmentStatus?: FulfillmentStatus[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  customerEmail?: string;
  orderNumber?: string;
  productId?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  source?: string[];
  tags?: string[];
  riskLevel?: ('low' | 'medium' | 'high')[];
  hasReturns?: boolean;
  hasRefunds?: boolean;
}

// API Parameter Types
interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeItems?: boolean;
  includeCustomer?: boolean;
  includeShipping?: boolean;
}

// Order API Service Class
class OrderApi {
  // Basic CRUD Operations
  async getOrders(params?: OrderListParams & OrderFilter) {
    const response = await httpClient.get<ApiResponse<{ items: Order[]; pagination: PaginationInfo }>>(
      endpoints.orders.list,
      { params }
    );
    return response.data;
  }

  async getOrder(id: string, options?: {
    includeItems?: boolean;
    includeTracking?: boolean;
    includeInvoice?: boolean;
    includeReturns?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<Order>>(
      endpoints.orders.byId(id),
      { params: options }
    );
    return response.data?.data;
  }

  async createOrder(data: Partial<Order>) {
    const response = await httpClient.post<ApiResponse<Order>>(
      endpoints.orders.create,
      data
    );
    return response.data?.data;
  }

  async updateOrder(id: string, data: Partial<Order>) {
    const response = await httpClient.put<ApiResponse<Order>>(
      endpoints.orders.update(id),
      data
    );
    return response.data?.data;
  }

  async deleteOrder(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.orders.delete(id)
    );
    return response.data;
  }

  async duplicateOrder(id: string, modifications?: Partial<Order>) {
    const response = await httpClient.post<ApiResponse<Order>>(
      endpoints.orders.duplicate(id),
      modifications
    );
    return response.data?.data;
  }

  // Order Status Management
  async updateOrderStatus(id: string, statusUpdate: OrderStatusUpdate) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.updateStatus(id),
      statusUpdate
    );
    return response.data?.data;
  }

  async cancelOrder(id: string, reason?: string, refundAmount?: number) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.cancel(id),
      { reason, refundAmount }
    );
    return response.data?.data;
  }

  async holdOrder(id: string, reason: string, duration?: number) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.hold(id),
      { reason, duration }
    );
    return response.data?.data;
  }

  async releaseOrder(id: string) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.release(id)
    );
    return response.data?.data;
  }

  // Order Fulfillment
  async fulfillOrder(id: string, fulfillment: OrderFulfillment) {
    const response = await httpClient.post<ApiResponse<{
      order: Order;
      fulfillmentId: string;
      trackingNumbers: string[];
    }>>(
      endpoints.orders.fulfill(id),
      fulfillment
    );
    return response.data?.data;
  }

  async partialFulfillment(id: string, items: Array<{
    itemId: string;
    quantity: number;
    trackingNumber?: string;
  }>) {
    const response = await httpClient.post<ApiResponse<Order>>(
      endpoints.orders.partialFulfill(id),
      { items }
    );
    return response.data?.data;
  }

  async updateShipping(id: string, shippingUpdate: Partial<ShippingInfo>) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.updateShipping(id),
      shippingUpdate
    );
    return response.data?.data;
  }

  // Payment Operations
  async capturePayment(id: string, amount?: number) {
    const response = await httpClient.post<ApiResponse<{
      order: Order;
      transactionId: string;
      capturedAmount: number;
    }>>(
      endpoints.orders.capturePayment(id),
      { amount }
    );
    return response.data?.data;
  }

  async refundOrder(id: string, refund: OrderRefund) {
    const response = await httpClient.post<ApiResponse<{
      order: Order;
      refundId: string;
      refundedAmount: number;
    }>>(
      endpoints.orders.refund(id),
      refund
    );
    return response.data?.data;
  }

  async voidPayment(id: string, reason: string) {
    const response = await httpClient.post<ApiResponse<Order>>(
      endpoints.orders.voidPayment(id),
      { reason }
    );
    return response.data?.data;
  }

  // Returns Management
  async createReturn(id: string, returnData: OrderReturn) {
    const response = await httpClient.post<ApiResponse<{
      order: Order;
      returnId: string;
      returnLabel?: string;
    }>>(
      endpoints.orders.createReturn(id),
      returnData
    );
    return response.data?.data;
  }

  async processReturn(id: string, returnId: string, action: 'approve' | 'reject' | 'complete', notes?: string) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.processReturn(id, returnId),
      { action, notes }
    );
    return response.data?.data;
  }

  // Order Tracking
  async getOrderTracking(id: string) {
    const response = await httpClient.get<ApiResponse<OrderTracking>>(
      endpoints.orders.tracking(id)
    );
    return response.data?.data;
  }

  async updateTracking(id: string, trackingNumber: string, carrier?: string) {
    const response = await httpClient.patch<ApiResponse<OrderTracking>>(
      endpoints.orders.updateTracking(id),
      { trackingNumber, carrier }
    );
    return response.data?.data;
  }

  // Invoice Management
  async getOrderInvoice(id: string) {
    const response = await httpClient.get<ApiResponse<OrderInvoice>>(
      endpoints.orders.invoice(id)
    );
    return response.data?.data;
  }

  async generateInvoice(id: string, options?: {
    template?: string;
    format?: 'pdf' | 'html';
    emailToCustomer?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<OrderInvoice>>(
      endpoints.orders.generateInvoice(id),
      options
    );
    return response.data?.data;
  }

  async downloadInvoice(id: string, format: 'pdf' | 'html' = 'pdf') {
    const response = await httpClient.get(
      endpoints.orders.downloadInvoice(id),
      { params: { format }, responseType: 'blob' }
    );
    return response.data;
  }

  // Bulk Operations
  async bulkOrderOperation(operation: BulkOrderOperation) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{
        orderId: string;
        error: string;
      }>;
      results?: Record<string, unknown>;
    }>>(
      endpoints.orders.bulk,
      operation
    );
    return response.data?.data;
  }

  async exportOrders(filters?: OrderFilter, options?: {
    format?: 'csv' | 'xlsx' | 'pdf';
    fields?: string[];
    includeItems?: boolean;
  }) {
    const response = await httpClient.get(
      endpoints.orders.export,
      { 
        params: { ...filters, ...options },
        responseType: 'blob' 
      }
    );
    return response.data;
  }

  // Order Analytics & Reports
  async getOrderAnalytics(params?: {
    period?: OrderAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string[];
    filters?: OrderFilter;
  }) {
    const response = await httpClient.get<ApiResponse<OrderAnalytics>>(
      endpoints.orders.analytics,
      { params }
    );
    return response.data?.data;
  }

  async getOrderReports(type: 'sales' | 'fulfillment' | 'customer' | 'product' | 'geographic', params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'csv' | 'pdf';
  }) {
    const response = await httpClient.get<ApiResponse<{
      type: string;
      data: unknown[];
      summary: Record<string, number>;
      charts: Array<{
        type: string;
        data: unknown[];
        config: Record<string, unknown>;
      }>;
    }>>(
      endpoints.orders.reports[type],
      { params }
    );
    return response.data?.data;
  }

  // Search & Filtering
  async searchOrders(query: string, filters?: OrderFilter) {
    const response = await httpClient.get<ApiResponse<{ items: Order[]; pagination: PaginationInfo }>>(
      endpoints.orders.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  async getOrdersByCustomer(customerId: string, params?: OrderListParams) {
    const response = await httpClient.get<ApiResponse<{ items: Order[]; pagination: PaginationInfo }>>(
      endpoints.orders.byCustomer(customerId),
      { params }
    );
    return response.data;
  }

  async getOrdersByProduct(productId: string, params?: OrderListParams) {
    const response = await httpClient.get<ApiResponse<{ items: Order[]; pagination: PaginationInfo }>>(
      endpoints.orders.byProduct(productId),
      { params }
    );
    return response.data;
  }

  // Order Validation & Verification
  async validateOrder(orderData: Partial<Order>) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      errors: Array<{
        field: string;
        message: string;
        code: string;
      }>;
      warnings: string[];
      estimatedTotal: number;
      taxCalculation: Record<string, number>;
      shippingOptions: Array<{
        method: string;
        cost: number;
        estimatedDelivery: Date;
      }>;
    }>>(
      endpoints.orders.validate,
      orderData
    );
    return response.data?.data;
  }

  async verifyInventory(items: Array<{ productId: string; variantId?: string; quantity: number }>) {
    const response = await httpClient.post<ApiResponse<{
      available: boolean;
      items: Array<{
        productId: string;
        variantId?: string;
        available: number;
        reserved: number;
        backorder: boolean;
      }>;
    }>>(
      endpoints.orders.verifyInventory,
      { items }
    );
    return response.data?.data;
  }

  // Order Notes & Communication
  async addOrderNote(id: string, note: {
    message: string;
    type?: 'customer' | 'internal' | 'system';
    isPublic?: boolean;
    notifyCustomer?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<Order>>(
      endpoints.orders.addNote(id),
      note
    );
    return response.data?.data;
  }

  async getOrderNotes(id: string) {
    const response = await httpClient.get<ApiResponse<Order['orderNotes']>>(
      endpoints.orders.notes(id)
    );
    return response.data?.data;
  }

  async updateOrderNote(id: string, noteId: string, updates: Partial<{
    id: string;
    type: 'customer' | 'internal' | 'system';
    message: string;
    createdBy?: string;
    createdAt: Date;
    isPublic: boolean;
  }>) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.updateNote(id, noteId),
      updates
    );
    return response.data?.data;
  }

  async deleteOrderNote(id: string, noteId: string) {
    const response = await httpClient.delete<ApiResponse<Order>>(
      endpoints.orders.deleteNote(id, noteId)
    );
    return response.data?.data;
  }

  // Fraud Detection & Risk Management
  async assessOrderRisk(id: string) {
    const response = await httpClient.post<ApiResponse<{
      riskScore: number;
      riskLevel: 'low' | 'medium' | 'high';
      factors: Array<{
        factor: string;
        score: number;
        impact: 'positive' | 'negative';
        description: string;
      }>;
      recommendations: string[];
      actionRequired: boolean;
    }>>(
      endpoints.orders.riskAssessment(id)
    );
    return response.data?.data;
  }

  async flagOrder(id: string, reason: string, severity: 'low' | 'medium' | 'high') {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.flag(id),
      { reason, severity }
    );
    return response.data?.data;
  }

  async unflagOrder(id: string, notes?: string) {
    const response = await httpClient.patch<ApiResponse<Order>>(
      endpoints.orders.unflag(id),
      { notes }
    );
    return response.data?.data;
  }

  // Integration & Sync
  async syncWithMarketplace(id: string, marketplace: string) {
    const response = await httpClient.post<ApiResponse<{
      synced: boolean;
      marketplaceOrderId?: string;
      errors?: string[];
    }>>(
      endpoints.orders.syncMarketplace(id),
      { marketplace }
    );
    return response.data?.data;
  }

  async webhookNotification(id: string, event: string, data?: Record<string, unknown>) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.orders.webhook(id),
      { event, data }
    );
    return response.data;
  }
}

// Create service instance
const orderApi = new OrderApi();

// REACT QUERY HOOKS - COMPREHENSIVE ORDER MANAGEMENT SYSTEM

// ========== BASIC CRUD HOOKS ==========

export const useOrders = (params?: OrderListParams & OrderFilter) => {
  return useQuery({
    queryKey: ['orders', 'list', params],
    queryFn: () => orderApi.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInfiniteOrders = (params?: OrderListParams & OrderFilter) => {
  return useInfiniteQuery({
    queryKey: ['orders', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      orderApi.getOrders({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrder = (orderId: string, options?: {
  includeItems?: boolean;
  includeTracking?: boolean;
  includeInvoice?: boolean;
  includeReturns?: boolean;
}) => {
  return useQuery({
    queryKey: ['orders', orderId, options],
    queryFn: () => orderApi.getOrder(orderId, options),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: Partial<Order>) => orderApi.createOrder(orderData),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (newOrder?.id) { if (newOrder?.id) { queryClient.setQueryData(['orders', newOrder.id], newOrder); } }
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
      orderApi.updateOrder(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderApi.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['orders', orderId] });
    },
  });
};

export const useDuplicateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, modifications }: { id: string; modifications?: Partial<Order> }) =>
      orderApi.duplicateOrder(id, modifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// ========== ORDER STATUS MANAGEMENT HOOKS ==========

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, statusUpdate }: { id: string; statusUpdate: OrderStatusUpdate }) =>
      orderApi.updateOrderStatus(id, statusUpdate),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, refundAmount }: { id: string; reason?: string; refundAmount?: number }) =>
      orderApi.cancelOrder(id, reason, refundAmount),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useHoldOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, duration }: { id: string; reason: string; duration?: number }) =>
      orderApi.holdOrder(id, reason, duration),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useReleaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderApi.releaseOrder(orderId),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

// ========== ORDER FULFILLMENT HOOKS ==========

export const useFulfillOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, fulfillment }: { id: string; fulfillment: OrderFulfillment }) =>
      orderApi.fulfillOrder(id, fulfillment),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (result?.order?.id) { queryClient.setQueryData(['orders', result.order.id], result.order); }
    },
  });
};

export const usePartialFulfillment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, items }: { 
      id: string; 
      items: Array<{ itemId: string; quantity: number; trackingNumber?: string }> 
    }) => orderApi.partialFulfillment(id, items),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useUpdateShipping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, shippingUpdate }: { id: string; shippingUpdate: Partial<ShippingInfo> }) =>
      orderApi.updateShipping(id, shippingUpdate),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

// ========== PAYMENT OPERATIONS HOOKS ==========

export const useCapturePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      orderApi.capturePayment(id, amount),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (result?.order?.id) { queryClient.setQueryData(['orders', result.order.id], result.order); }
    },
  });
};

export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, refund }: { id: string; refund: OrderRefund }) =>
      orderApi.refundOrder(id, refund),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (result?.order?.id) { queryClient.setQueryData(['orders', result.order.id], result.order); }
    },
  });
};

export const useVoidPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderApi.voidPayment(id, reason),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

// ========== RETURNS MANAGEMENT HOOKS ==========

export const useCreateReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, returnData }: { id: string; returnData: OrderReturn }) =>
      orderApi.createReturn(id, returnData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (result?.order?.id) { queryClient.setQueryData(['orders', result.order.id], result.order); }
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
};

export const useProcessReturn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      returnId, 
      action, 
      notes 
    }: { 
      id: string; 
      returnId: string; 
      action: 'approve' | 'reject' | 'complete'; 
      notes?: string 
    }) => orderApi.processReturn(id, returnId, action, notes),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
};

// ========== ORDER TRACKING HOOKS ==========

export const useOrderTracking = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId, 'tracking'],
    queryFn: () => orderApi.getOrderTracking(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - tracking should be fresh
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useUpdateTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, trackingNumber, carrier }: { 
      id: string; 
      trackingNumber: string; 
      carrier?: string 
    }) => orderApi.updateTracking(id, trackingNumber, carrier),
    onSuccess: (tracking) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (tracking?.orderId) { queryClient.setQueryData(['orders', tracking.orderId, 'tracking'], tracking); }
    },
  });
};

// ========== INVOICE MANAGEMENT HOOKS ==========

export const useOrderInvoice = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId, 'invoice'],
    queryFn: () => orderApi.getOrderInvoice(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, options }: { 
      id: string; 
      options?: { template?: string; format?: 'pdf' | 'html'; emailToCustomer?: boolean } 
    }) => orderApi.generateInvoice(id, options),
    onSuccess: (invoice) => {
      if (invoice?.orderId) { queryClient.setQueryData(['orders', invoice.orderId, 'invoice'], invoice); }
    },
  });
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format?: 'pdf' | 'html' }) =>
      orderApi.downloadInvoice(id, format),
  });
};

// ========== ORDER NOTES HOOKS ==========

export const useAddOrderNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, note }: { 
      id: string; 
      note: { 
        message: string; 
        type?: 'customer' | 'internal' | 'system'; 
        isPublic?: boolean; 
        notifyCustomer?: boolean 
      } 
    }) => orderApi.addOrderNote(id, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useOrderNotes = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId, 'notes'],
    queryFn: () => orderApi.getOrderNotes(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateOrderNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, noteId, updates }: { 
      id: string; 
      noteId: string; 
      updates: Partial<{
        id: string;
        type: 'customer' | 'internal' | 'system';
        message: string;
        createdBy?: string;
        createdAt: Date;
        isPublic: boolean;
      }> 
    }) => orderApi.updateOrderNote(id, noteId, updates),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useDeleteOrderNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) =>
      orderApi.deleteOrderNote(id, noteId),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

// ========== VALIDATION & VERIFICATION HOOKS ==========

export const useValidateOrder = () => {
  return useMutation({
    mutationFn: (orderData: Partial<Order>) => orderApi.validateOrder(orderData),
  });
};

export const useVerifyInventory = () => {
  return useMutation({
    mutationFn: (items: Array<{ productId: string; variantId?: string; quantity: number }>) =>
      orderApi.verifyInventory(items),
  });
};

// ========== RISK MANAGEMENT HOOKS ==========

export const useAssessOrderRisk = () => {
  return useMutation({
    mutationFn: (orderId: string) => orderApi.assessOrderRisk(orderId),
  });
};

export const useFlagOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, severity }: { 
      id: string; 
      reason: string; 
      severity: 'low' | 'medium' | 'high' 
    }) => orderApi.flagOrder(id, reason, severity),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

export const useUnflagOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      orderApi.unflagOrder(id, notes),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (updatedOrder?.id) { if (updatedOrder?.id) { queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder); } }
    },
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkOrderOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: BulkOrderOperation) => orderApi.bulkOrderOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useExportOrders = () => {
  return useMutation({
    mutationFn: ({ filters, options }: { 
      filters?: OrderFilter; 
      options?: { format?: 'csv' | 'xlsx' | 'pdf'; fields?: string[]; includeItems?: boolean } 
    }) => orderApi.exportOrders(filters, options),
  });
};

// ========== ANALYTICS & REPORTS HOOKS ==========

export const useOrderAnalytics = (params?: {
  period?: OrderAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
  groupBy?: string[];
  filters?: OrderFilter;
}) => {
  return useQuery({
    queryKey: ['orders', 'analytics', params],
    queryFn: () => orderApi.getOrderAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useOrderReports = (
  type: 'sales' | 'fulfillment' | 'customer' | 'product' | 'geographic',
  params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'csv' | 'pdf';
  }
) => {
  return useQuery({
    queryKey: ['orders', 'reports', type, params],
    queryFn: () => orderApi.getOrderReports(type, params),
    enabled: !!type,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchOrders = (query: string, filters?: OrderFilter) => {
  return useQuery({
    queryKey: ['orders', 'search', query, filters],
    queryFn: () => orderApi.searchOrders(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useOrdersByCustomer = (customerId: string, params?: OrderListParams) => {
  return useQuery({
    queryKey: ['orders', 'customer', customerId, params],
    queryFn: () => orderApi.getOrdersByCustomer(customerId, params),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrdersByProduct = (productId: string, params?: OrderListParams) => {
  return useQuery({
    queryKey: ['orders', 'product', productId, params],
    queryFn: () => orderApi.getOrdersByProduct(productId, params),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

// ========== INTEGRATION HOOKS ==========

export const useSyncWithMarketplace = () => {
  return useMutation({
    mutationFn: ({ id, marketplace }: { id: string; marketplace: string }) =>
      orderApi.syncWithMarketplace(id, marketplace),
  });
};

export const useWebhookNotification = () => {
  return useMutation({
    mutationFn: ({ id, event, data }: { 
      id: string; 
      event: string; 
      data?: Record<string, unknown> 
    }) => orderApi.webhookNotification(id, event, data),
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const useOrderManagement = (orderId: string) => {
  const order = useOrder(orderId, { 
    includeItems: true, 
    includeTracking: true, 
    includeInvoice: true, 
    includeReturns: true 
  });
  const tracking = useOrderTracking(orderId);
  const notes = useOrderNotes(orderId);
  const invoice = useOrderInvoice(orderId);
  
  return {
    order,
    tracking,
    notes,
    invoice,
    isLoading: order.isLoading || tracking.isLoading || notes.isLoading || invoice.isLoading,
    error: order.error || tracking.error || notes.error || invoice.error,
  };
};

export const useOrderDashboard = (period?: OrderAnalytics['period']) => {
  const analytics = useOrderAnalytics({ period });
  const recentOrders = useOrders({ 
    limit: 10, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  });
  const salesReport = useOrderReports('sales', { period });
  
  return {
    analytics,
    recentOrders,
    salesReport,
    isLoading: analytics.isLoading || recentOrders.isLoading || salesReport.isLoading,
    error: analytics.error || recentOrders.error || salesReport.error,
  };
};

export const useOrdersWithFilters = (filters: OrderFilter) => {
  const orders = useOrders(filters);
  const analytics = useOrderAnalytics({ filters });
  
  return {
    orders,
    analytics,
    isLoading: orders.isLoading || analytics.isLoading,
    error: orders.error || analytics.error,
  };
};

// Export the API instance and all hooks
export { orderApi };
export default orderApi;
