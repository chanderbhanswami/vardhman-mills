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

// Payment Status Types
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially-refunded'
  | 'disputed'
  | 'authorized'
  | 'captured'
  | 'voided'
  | 'expired';

export type PaymentMethod = 
  | 'credit-card' 
  | 'debit-card' 
  | 'paypal' 
  | 'stripe' 
  | 'razorpay'
  | 'bank-transfer' 
  | 'upi'
  | 'wallet'
  | 'cash-on-delivery' 
  | 'crypto'
  | 'buy-now-pay-later';

export type RefundStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type DisputeStatus = 
  | 'opened' 
  | 'under-review' 
  | 'evidence-required' 
  | 'resolved' 
  | 'lost' 
  | 'won';

// Payment Information Types
export interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  country?: string;
  isDefault: boolean;
  fingerprint: string;
  funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  network: string;
  
  // Billing Address
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Security & Verification
  cvcCheck?: 'pass' | 'fail' | 'unavailable';
  addressLine1Check?: 'pass' | 'fail' | 'unavailable';
  addressZipCheck?: 'pass' | 'fail' | 'unavailable';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
  last4: string;
  holderName: string;
  holderType: 'individual' | 'company';
  currency: string;
  country: string;
  isVerified: boolean;
  isDefault: boolean;
  
  // Verification
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationDocument?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalWallet {
  id: string;
  type: 'paypal' | 'apple-pay' | 'google-pay' | 'samsung-pay';
  email?: string;
  phone?: string;
  accountId: string;
  isVerified: boolean;
  isDefault: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Payment Transaction Types
export interface Payment {
  id: string;
  orderId?: string;
  customerId?: string;
  
  // Transaction Details
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  
  // Payment Method Information
  paymentMethod: PaymentMethod;
  paymentMethodId?: string;
  gatewayTransactionId?: string;
  
  // Gateway Information
  gateway: string;
  gatewayProvider: 'stripe' | 'paypal' | 'razorpay' | 'square' | 'braintree';
  processorResponseCode?: string;
  processorResponseMessage?: string;
  
  // Authorization & Capture
  authorizationCode?: string;
  captureAmount?: number;
  capturedAt?: Date;
  
  // Fees & Costs
  processingFee: number;
  gatewayFee: number;
  netAmount: number;
  
  // Refund Information
  refundedAmount: number;
  refunds: PaymentRefund[];
  
  // Risk & Security
  riskScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
  fraudAnalysis?: {
    avsResult?: string;
    cvvResult?: string;
    scoreAction?: string;
    riskFactors?: string[];
  };
  
  // 3D Secure
  threeDSecure?: {
    authenticated: boolean;
    version: string;
    status: string;
    liability_shift: 'possible' | 'not_possible' | 'already_shifted';
  };
  
  // Receipt & Documentation
  receiptNumber: string;
  receiptUrl?: string;
  invoiceId?: string;
  
  // Customer Information
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Installments & Recurring
  installments?: {
    count: number;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    nextPaymentDate?: Date;
  };
  
  isRecurring: boolean;
  subscriptionId?: string;
  
  // Metadata & Tracking
  metadata: Record<string, string>;
  tags: string[];
  internalNotes?: string;
  
  // Webhook & Notifications
  webhookEvents: Array<{
    event: string;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    response?: string;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  
  // Dispute Information
  disputes: PaymentDispute[];
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  
  // Gateway Information
  gatewayRefundId?: string;
  processorResponseCode?: string;
  processorResponseMessage?: string;
  
  // Fees
  refundFee: number;
  netRefundAmount: number;
  
  // Documentation
  receiptNumber: string;
  receiptUrl?: string;
  
  // Metadata
  metadata: Record<string, string>;
  internalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  failedAt?: Date;
}

export interface PaymentDispute {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: DisputeStatus;
  
  // Gateway Information
  gatewayDisputeId?: string;
  evidenceDueBy?: Date;
  
  // Evidence & Documentation
  evidence: Array<{
    type: string;
    description: string;
    documentUrl?: string;
    submittedAt: Date;
  }>;
  
  // Resolution
  resolutionAmount?: number;
  resolutionDate?: Date;
  resolutionNotes?: string;
  
  // Metadata  
  metadata: Record<string, string>;
  internalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Payment Analytics & Reports
export interface PaymentAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Transaction Metrics
  transactions: {
    totalCount: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
    failureRate: number;
    disputeRate: number;
    refundRate: number;
  };
  
  // Status Breakdown
  statusBreakdown: Record<PaymentStatus, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  
  // Payment Method Analysis
  methodBreakdown: Record<PaymentMethod, {
    count: number;
    amount: number;
    successRate: number;
    averageAmount: number;
  }>;
  
  // Geographic Distribution
  geographicBreakdown: Record<string, {
    count: number;
    amount: number;
    successRate: number;
  }>;
  
  // Time-based Analysis
  hourlyDistribution: Record<string, number>;
  dailyDistribution: Record<string, number>;
  
  // Revenue Metrics
  revenue: {
    grossAmount: number;
    netAmount: number;
    totalFees: number;
    refundedAmount: number;
    disputedAmount: number;
    chargedBackAmount: number;
  };
  
  // Risk Analysis
  riskMetrics: {
    highRiskTransactions: number;
    fraudDetected: number;
    declinedTransactions: number;
    averageRiskScore: number;
  };
  
  // Performance Metrics
  performance: {
    averageProcessingTime: number;
    timeToCapture: number;
    settlementTime: number;
    uptimePercentage: number;
  };
}

// Subscription & Recurring Payment Types
export interface PaymentSubscription {
  id: string;
  customerId: string;
  planId: string;
  
  // Subscription Details
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  
  // Billing Information
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  
  // Trial Information
  trialStart?: Date;
  trialEnd?: Date;
  trialDays?: number;
  
  // Payment Method
  paymentMethodId: string;
  
  // Billing History
  invoices: Array<{
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    paidAt?: Date;
    dueDate: Date;
  }>;
  
  // Discounts & Coupons
  discount?: {
    couponId: string;
    amount: number;
    type: 'percent' | 'amount';
    duration: 'once' | 'repeating' | 'forever';
    endsAt?: Date;
  };
  
  // Metadata
  metadata: Record<string, string>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date;
  endedAt?: Date;
}

// Additional Parameter Types
export interface PaymentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeRefunds?: boolean;
  includeDisputes?: boolean;
}

export interface PaymentFilter {
  status?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  gateway?: string[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  orderId?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string[];
  riskLevel?: ('low' | 'medium' | 'high')[];
  hasRefunds?: boolean;
  hasDisputes?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Payment API Service Class
class PaymentApi {
  // Basic CRUD Operations
  async getPayments(params?: PaymentListParams & PaymentFilter) {
    const response = await httpClient.get<ApiResponse<{ items: Payment[]; pagination: PaginationInfo }>>(
      endpoints.payments.list,
      { params }
    );
    return response.data;
  }

  async getPayment(id: string, options?: {
    includeRefunds?: boolean;
    includeDisputes?: boolean;
    includeCustomer?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<Payment>>(
      endpoints.payments.byId(id),
      { params: options }
    );
    return response.data!.data;
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    orderId?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) {
    const response = await httpClient.post<ApiResponse<Payment>>(
      endpoints.payments.create,
      data
    );
    return response.data!.data;
  }

  async updatePayment(id: string, data: Partial<Payment>) {
    const response = await httpClient.put<ApiResponse<Payment>>(
      endpoints.payments.update(id),
      data
    );
    return response.data!.data;
  }

  async deletePayment(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.payments.delete(id)
    );
    return response.data;
  }

  // Payment Processing Operations
  async authorizePayment(id: string) {
    const response = await httpClient.post<ApiResponse<{
      payment: Payment;
      authorizationCode: string;
      expiresAt: Date;
    }>>(
      endpoints.payments.authorize(id)
    );
    return response.data!.data;
  }

  async capturePayment(id: string, amount?: number) {
    const response = await httpClient.post<ApiResponse<{
      payment: Payment;
      captureId: string;
      capturedAmount: number;
    }>>(
      endpoints.payments.capture(id),
      { amount }
    );
    return response.data!.data;
  }

  async voidPayment(id: string, reason?: string) {
    const response = await httpClient.post<ApiResponse<Payment>>(
      endpoints.payments.void(id),
      { reason }
    );
    return response.data!.data;
  }

  async cancelPayment(id: string, reason?: string) {
    const response = await httpClient.post<ApiResponse<Payment>>(
      endpoints.payments.cancel(id),
      { reason }
    );
    return response.data!.data;
  }

  // Refund Operations
  async createRefund(paymentId: string, data: {
    amount?: number;
    reason: string;
    metadata?: Record<string, string>;
    notifyCustomer?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<{
      payment: Payment;
      refund: PaymentRefund;
    }>>(
      endpoints.payments.createRefund(paymentId),
      data
    );
    return response.data!.data;
  }

  async getRefunds(paymentId: string) {
    const response = await httpClient.get<ApiResponse<PaymentRefund[]>>(
      endpoints.payments.refunds(paymentId)
    );
    return response.data!.data;
  }

  async getRefund(paymentId: string, refundId: string) {
    const response = await httpClient.get<ApiResponse<PaymentRefund>>(
      endpoints.payments.refund(paymentId, refundId)
    );
    return response.data!.data;
  }

  async updateRefund(paymentId: string, refundId: string, updates: Partial<PaymentRefund>) {
    const response = await httpClient.put<ApiResponse<PaymentRefund>>(
      endpoints.payments.updateRefund(paymentId, refundId),
      updates
    );
    return response.data!.data;
  }

  // Dispute Management
  async getDisputes(paymentId?: string) {
    const url = paymentId 
      ? endpoints.payments.disputes(paymentId)
      : endpoints.payments.allDisputes;
    
    const response = await httpClient.get<ApiResponse<PaymentDispute[]>>(url);
    return response.data!.data;
  }

  async getDispute(paymentId: string, disputeId: string) {
    const response = await httpClient.get<ApiResponse<PaymentDispute>>(
      endpoints.payments.dispute(paymentId, disputeId)
    );
    return response.data!.data;
  }

  async submitDisputeEvidence(paymentId: string, disputeId: string, evidence: {
    type: string;
    description: string;
    documentUrl?: string;
  }) {
    const response = await httpClient.post<ApiResponse<PaymentDispute>>(
      endpoints.payments.submitEvidence(paymentId, disputeId),
      evidence
    );
    return response.data!.data;
  }

  async acceptDispute(paymentId: string, disputeId: string) {
    const response = await httpClient.post<ApiResponse<PaymentDispute>>(
      endpoints.payments.acceptDispute(paymentId, disputeId)
    );
    return response.data!.data;
  }

  // Payment Methods Management
  async getPaymentMethods(customerId?: string) {
    const response = await httpClient.get<ApiResponse<{
      cards: PaymentCard[];
      bankAccounts: BankAccount[];
      wallets: DigitalWallet[];
    }>>(
      endpoints.payments.paymentMethods,
      { params: { customerId } }
    );
    return response.data!.data;
  }

  async addPaymentMethod(data: {
    type: 'card' | 'bank' | 'wallet';
    customerId: string;
    token: string;
    setAsDefault?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<PaymentCard | BankAccount | DigitalWallet>>(
      endpoints.payments.addPaymentMethod,
      data
    );
    return response.data!.data;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentCard | BankAccount | DigitalWallet>) {
    const response = await httpClient.put<ApiResponse<PaymentCard | BankAccount | DigitalWallet>>(
      endpoints.payments.updatePaymentMethod(id),
      updates
    );
    return response.data!.data;
  }

  async deletePaymentMethod(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.payments.deletePaymentMethod(id)
    );
    return response.data;
  }

  async setDefaultPaymentMethod(id: string, customerId: string) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.payments.setDefaultPaymentMethod(id),
      { customerId }
    );
    return response.data;
  }

  // Subscription Management
  async getSubscriptions(customerId?: string) {
    const response = await httpClient.get<ApiResponse<PaymentSubscription[]>>(
      endpoints.payments.subscriptions,
      { params: { customerId } }
    );
    return response.data!.data;
  }

  async getSubscription(id: string) {
    const response = await httpClient.get<ApiResponse<PaymentSubscription>>(
      endpoints.payments.subscription(id)
    );
    return response.data!.data;
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }) {
    const response = await httpClient.post<ApiResponse<PaymentSubscription>>(
      endpoints.payments.createSubscription,
      data
    );
    return response.data!.data;
  }

  async updateSubscription(id: string, updates: Partial<PaymentSubscription>) {
    const response = await httpClient.put<ApiResponse<PaymentSubscription>>(
      endpoints.payments.updateSubscription(id),
      updates
    );
    return response.data!.data;
  }

  async cancelSubscription(id: string, reason?: string, cancelAtPeriodEnd?: boolean) {
    const response = await httpClient.post<ApiResponse<PaymentSubscription>>(
      endpoints.payments.cancelSubscription(id),
      { reason, cancelAtPeriodEnd }
    );
    return response.data!.data;
  }

  // Analytics & Reports
  async getPaymentAnalytics(params?: {
    period?: PaymentAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string[];
    filters?: PaymentFilter;
  }) {
    const response = await httpClient.get<ApiResponse<PaymentAnalytics>>(
      endpoints.payments.analytics,
      { params }
    );
    return response.data!.data;
  }

  async getPaymentReports(type: string, params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'csv' | 'pdf';
  }) {
    const response = await httpClient.get<ApiResponse<unknown>>(
      endpoints.payments.reports(type),
      { params }
    );
    return response.data!.data;
  }

  // Search & Filtering
  async searchPayments(query: string, filters?: PaymentFilter) {
    const response = await httpClient.get<ApiResponse<{ items: Payment[]; pagination: PaginationInfo }>>(
      endpoints.payments.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  async getPaymentsByCustomer(customerId: string, params?: PaymentListParams) {
    const response = await httpClient.get<ApiResponse<{ items: Payment[]; pagination: PaginationInfo }>>(
      endpoints.payments.byCustomer(customerId),
      { params }
    );
    return response.data;
  }

  async getPaymentsByOrder(orderId: string) {
    const response = await httpClient.get<ApiResponse<Payment[]>>(
      endpoints.payments.byOrder(orderId)
    );
    return response.data!.data;
  }

  // Bulk Operations
  async bulkPaymentOperation(operation: {
    action: 'capture' | 'void' | 'refund' | 'export';
    paymentIds: string[];
    parameters?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{
        paymentId: string;
        error: string;
      }>;
    }>>(
      endpoints.payments.bulk,
      operation
    );
    return response.data!.data;
  }

  async exportPayments(filters?: PaymentFilter, options?: {
    format?: 'csv' | 'xlsx' | 'pdf';
    fields?: string[];
    includeRefunds?: boolean;
    includeDisputes?: boolean;
  }) {
    const response = await httpClient.get(
      endpoints.payments.export,
      { 
        params: { ...filters, ...options },
        responseType: 'blob' 
      }
    );
    return response.data;
  }

  // Validation & Verification
  async validatePaymentMethod(data: {
    type: 'card' | 'bank';
    token: string;
  }) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      errors: string[];
      metadata: Record<string, unknown>;
    }>>(
      endpoints.payments.validatePaymentMethod,
      data
    );
    return response.data!.data;
  }

  async verifyMicroDeposits(bankAccountId: string, deposits: number[]) {
    const response = await httpClient.post<ApiResponse<BankAccount>>(
      endpoints.payments.verifyMicroDeposits(bankAccountId),
      { deposits }
    );
    return response.data!.data;
  }

  // Webhook Management
  async getWebhookEvents(paymentId: string) {
    const response = await httpClient.get<ApiResponse<Array<{
      id: string;
      event: string;
      status: 'pending' | 'sent' | 'failed';
      payload: Record<string, unknown>;
      sentAt?: Date;
      response?: string;
    }>>>(
      endpoints.payments.webhookEvents(paymentId)
    );
    return response.data!.data;
  }

  async resendWebhook(paymentId: string, eventId: string) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.payments.resendWebhook(paymentId, eventId)
    );
    return response.data;
  }

  // Integration & Gateway Management
  async getGatewayStatus() {
    const response = await httpClient.get<ApiResponse<Record<string, {
      status: 'active' | 'inactive' | 'maintenance';
      latency: number;
      uptime: number;
      lastChecked: Date;
    }>>>(
      endpoints.payments.gatewayStatus
    );
    return response.data!.data;
  }

  async syncPaymentWithGateway(id: string, gateway: string) {
    const response = await httpClient.post<ApiResponse<Payment>>(
      endpoints.payments.syncWithGateway(id),
      { gateway }
    );
    return response.data!.data;
  }
}

// Create service instance
const paymentApi = new PaymentApi();

// REACT QUERY HOOKS - COMPREHENSIVE PAYMENT MANAGEMENT SYSTEM

// ========== BASIC CRUD HOOKS ==========

export const usePayments = (params?: PaymentListParams & PaymentFilter) => {
  return useQuery({
    queryKey: ['payments', 'list', params],
    queryFn: () => paymentApi.getPayments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInfinitePayments = (params?: PaymentListParams & PaymentFilter) => {
  return useInfiniteQuery({
    queryKey: ['payments', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      paymentApi.getPayments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.data || !lastPage.data.pagination) return undefined;
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePayment = (paymentId: string, options?: {
  includeRefunds?: boolean;
  includeDisputes?: boolean;
  includeCustomer?: boolean;
}) => {
  return useQuery({
    queryKey: ['payments', paymentId, options],
    queryFn: () => paymentApi.getPayment(paymentId, options),
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      amount: number;
      currency: string;
      paymentMethodId: string;
      description?: string;
      orderId?: string;
      customerId?: string;
      metadata?: Record<string, string>;
    }) => paymentApi.createPayment(data),
    onSuccess: (newPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', newPayment.id], newPayment);
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
      paymentApi.updatePayment(id, data),
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', updatedPayment.id], updatedPayment);
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentId: string) => paymentApi.deletePayment(paymentId),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.removeQueries({ queryKey: ['payments', paymentId] });
    },
  });
};

// ========== PAYMENT PROCESSING HOOKS ==========

export const useAuthorizePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentId: string) => paymentApi.authorizePayment(paymentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', result.payment.id], result.payment);
    },
  });
};

export const useCapturePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      paymentApi.capturePayment(id, amount),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', result.payment.id], result.payment);
    },
  });
};

export const useVoidPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentApi.voidPayment(id, reason),
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', updatedPayment.id], updatedPayment);
    },
  });
};

export const useCancelPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentApi.cancelPayment(id, reason),
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', updatedPayment.id], updatedPayment);
    },
  });
};

// ========== REFUND MANAGEMENT HOOKS ==========

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, data }: {
      paymentId: string;
      data: {
        amount?: number;
        reason: string;
        metadata?: Record<string, string>;
        notifyCustomer?: boolean;
      };
    }) => paymentApi.createRefund(paymentId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', result.payment.id], result.payment);
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
    },
  });
};

export const usePaymentRefunds = (paymentId: string) => {
  return useQuery({
    queryKey: ['payments', paymentId, 'refunds'],
    queryFn: () => paymentApi.getRefunds(paymentId),
    enabled: !!paymentId,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePaymentRefund = (paymentId: string, refundId: string) => {
  return useQuery({
    queryKey: ['payments', paymentId, 'refunds', refundId],
    queryFn: () => paymentApi.getRefund(paymentId, refundId),
    enabled: !!paymentId && !!refundId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, refundId, updates }: {
      paymentId: string;
      refundId: string;
      updates: Partial<PaymentRefund>;
    }) => paymentApi.updateRefund(paymentId, refundId, updates),
    onSuccess: (updatedRefund, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId, 'refunds'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

// ========== DISPUTE MANAGEMENT HOOKS ==========

export const usePaymentDisputes = (paymentId?: string) => {
  return useQuery({
    queryKey: ['disputes', paymentId || 'all'],
    queryFn: () => paymentApi.getDisputes(paymentId),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePaymentDispute = (paymentId: string, disputeId: string) => {
  return useQuery({
    queryKey: ['payments', paymentId, 'disputes', disputeId],
    queryFn: () => paymentApi.getDispute(paymentId, disputeId),
    enabled: !!paymentId && !!disputeId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubmitDisputeEvidence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, disputeId, evidence }: {
      paymentId: string;
      disputeId: string;
      evidence: {
        type: string;
        description: string;
        documentUrl?: string;
      };
    }) => paymentApi.submitDisputeEvidence(paymentId, disputeId, evidence),
    onSuccess: (updatedDispute, { paymentId, disputeId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId, 'disputes', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
};

export const useAcceptDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, disputeId }: { paymentId: string; disputeId: string }) =>
      paymentApi.acceptDispute(paymentId, disputeId),
    onSuccess: (updatedDispute, { paymentId, disputeId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId, 'disputes', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
};

// ========== PAYMENT METHODS HOOKS ==========

export const usePaymentMethods = (customerId?: string) => {
  return useQuery({
    queryKey: ['payment-methods', customerId || 'all'],
    queryFn: () => paymentApi.getPaymentMethods(customerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      type: 'card' | 'bank' | 'wallet';
      customerId: string;
      token: string;
      setAsDefault?: boolean;
    }) => paymentApi.addPaymentMethod(data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods', customerId] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: {
      id: string;
      updates: Partial<PaymentCard | BankAccount | DigitalWallet>;
    }) => paymentApi.updatePaymentMethod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => paymentApi.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      paymentApi.setDefaultPaymentMethod(id, customerId),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods', customerId] });
    },
  });
};

// ========== SUBSCRIPTION MANAGEMENT HOOKS ==========

export const useSubscriptions = (customerId?: string) => {
  return useQuery({
    queryKey: ['subscriptions', customerId || 'all'],
    queryFn: () => paymentApi.getSubscriptions(customerId),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscriptions', subscriptionId],
    queryFn: () => paymentApi.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      customerId: string;
      planId: string;
      paymentMethodId: string;
      trialDays?: number;
      metadata?: Record<string, string>;
    }) => paymentApi.createSubscription(data),
    onSuccess: (newSubscription) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.setQueryData(['subscriptions', newSubscription.id], newSubscription);
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PaymentSubscription> }) =>
      paymentApi.updateSubscription(id, updates),
    onSuccess: (updatedSubscription) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.setQueryData(['subscriptions', updatedSubscription.id], updatedSubscription);
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, cancelAtPeriodEnd }: {
      id: string;
      reason?: string;
      cancelAtPeriodEnd?: boolean;
    }) => paymentApi.cancelSubscription(id, reason, cancelAtPeriodEnd),
    onSuccess: (updatedSubscription) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.setQueryData(['subscriptions', updatedSubscription.id], updatedSubscription);
    },
  });
};

// ========== ANALYTICS & REPORTS HOOKS ==========

export const usePaymentAnalytics = (params?: {
  period?: PaymentAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
  groupBy?: string[];
  filters?: PaymentFilter;
}) => {
  return useQuery({
    queryKey: ['payments', 'analytics', params],
    queryFn: () => paymentApi.getPaymentAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePaymentReports = (type: string, params?: {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: 'json' | 'csv' | 'pdf';
}) => {
  return useQuery({
    queryKey: ['payments', 'reports', type, params],
    queryFn: () => paymentApi.getPaymentReports(type, params),
    enabled: !!type,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
};

// ========== SEARCH & FILTERING HOOKS ==========

export const useSearchPayments = (query: string, filters?: PaymentFilter) => {
  return useQuery({
    queryKey: ['payments', 'search', query, filters],
    queryFn: () => paymentApi.searchPayments(query, filters),
    enabled: !!query,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const usePaymentsByCustomer = (customerId: string, params?: PaymentListParams) => {
  return useQuery({
    queryKey: ['payments', 'customer', customerId, params],
    queryFn: () => paymentApi.getPaymentsByCustomer(customerId, params),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePaymentsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => paymentApi.getPaymentsByOrder(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
};

// ========== BULK OPERATIONS HOOKS ==========

export const useBulkPaymentOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: {
      action: 'capture' | 'void' | 'refund' | 'export';
      paymentIds: string[];
      parameters?: Record<string, unknown>;
    }) => paymentApi.bulkPaymentOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useExportPayments = () => {
  return useMutation({
    mutationFn: ({ filters, options }: {
      filters?: PaymentFilter;
      options?: {
        format?: 'csv' | 'xlsx' | 'pdf';
        fields?: string[];
        includeRefunds?: boolean;
        includeDisputes?: boolean;
      };
    }) => paymentApi.exportPayments(filters, options),
  });
};

// ========== VALIDATION & VERIFICATION HOOKS ==========

export const useValidatePaymentMethod = () => {
  return useMutation({
    mutationFn: (data: {
      type: 'card' | 'bank';
      token: string;
    }) => paymentApi.validatePaymentMethod(data),
  });
};

export const useVerifyMicroDeposits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bankAccountId, deposits }: {
      bankAccountId: string;
      deposits: number[];
    }) => paymentApi.verifyMicroDeposits(bankAccountId, deposits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

// ========== WEBHOOK & EVENTS HOOKS ==========

export const useWebhookEvents = (paymentId: string) => {
  return useQuery({
    queryKey: ['payments', paymentId, 'webhook-events'],
    queryFn: () => paymentApi.getWebhookEvents(paymentId),
    enabled: !!paymentId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useResendWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, eventId }: { paymentId: string; eventId: string }) =>
      paymentApi.resendWebhook(paymentId, eventId),
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId, 'webhook-events'] });
    },
  });
};

// ========== GATEWAY & INTEGRATION HOOKS ==========

export const useGatewayStatus = () => {
  return useQuery({
    queryKey: ['payments', 'gateway-status'],
    queryFn: () => paymentApi.getGatewayStatus(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useSyncPaymentWithGateway = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, gateway }: { id: string; gateway: string }) =>
      paymentApi.syncPaymentWithGateway(id, gateway),
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.setQueryData(['payments', updatedPayment.id], updatedPayment);
    },
  });
};

// ========== COMPOUND HOOKS FOR COMPLEX OPERATIONS ==========

export const usePaymentManagement = (paymentId: string) => {
  const payment = usePayment(paymentId, {
    includeRefunds: true,
    includeDisputes: true,
    includeCustomer: true,
  });
  const refunds = usePaymentRefunds(paymentId);
  const disputes = usePaymentDisputes(paymentId);
  const webhookEvents = useWebhookEvents(paymentId);
  
  return {
    payment,
    refunds,
    disputes,
    webhookEvents,
    isLoading: payment.isLoading || refunds.isLoading || disputes.isLoading || webhookEvents.isLoading,
    error: payment.error || refunds.error || disputes.error || webhookEvents.error,
  };
};

export const usePaymentDashboard = (period?: PaymentAnalytics['period']) => {
  const analytics = usePaymentAnalytics({ period });
  const recentPayments = usePayments({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const gatewayStatus = useGatewayStatus();
  const disputes = usePaymentDisputes();
  
  return {
    analytics,
    recentPayments,
    gatewayStatus,
    disputes,
    isLoading: analytics.isLoading || recentPayments.isLoading || gatewayStatus.isLoading || disputes.isLoading,
    error: analytics.error || recentPayments.error || gatewayStatus.error || disputes.error,
  };
};

export const useCustomerPaymentProfile = (customerId: string) => {
  const paymentMethods = usePaymentMethods(customerId);
  const payments = usePaymentsByCustomer(customerId);
  const subscriptions = useSubscriptions(customerId);
  
  return {
    paymentMethods,
    payments,
    subscriptions,
    isLoading: paymentMethods.isLoading || payments.isLoading || subscriptions.isLoading,
    error: paymentMethods.error || payments.error || subscriptions.error,
  };
};

// Export the API instance and all hooks
export { paymentApi };
export default paymentApi;