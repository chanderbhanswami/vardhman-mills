import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Payment API Service
 * Handles payment processing, payment methods, transactions, and financial operations
 */

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank_transfer' | 'upi' | 'net_banking';
  isDefault: boolean;
  name: string;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    walletProvider?: string;
    bankName?: string;
    accountNumber?: string;
    upiId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  gateway: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

class PaymentApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Payment Methods Management

  // Get user's payment methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return this.client.get<PaymentMethod[]>(endpoints.payments.paymentMethods);
  }

  // Add new payment method
  async addPaymentMethod(methodData: {
    type: 'card' | 'wallet' | 'bank_transfer' | 'upi';
    name: string;
    details: {
      cardNumber?: string;
      expiryMonth?: number;
      expiryYear?: number;
      cvv?: string;
      walletProvider?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      upiId?: string;
    };
    isDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    return this.client.post<PaymentMethod>(endpoints.payments.addPaymentMethod, methodData);
  }

  // Update payment method
  async updatePaymentMethod(methodId: string, updates: {
    name?: string;
    isDefault?: boolean;
    details?: Partial<PaymentMethod['details']>;
  }): Promise<ApiResponse<PaymentMethod>> {
    return this.client.put<PaymentMethod>(endpoints.payments.updatePaymentMethod(methodId), updates);
  }

  // Delete payment method
  async deletePaymentMethod(methodId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.payments.deletePaymentMethod(methodId));
  }

  // Set default payment method
  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse<PaymentMethod>> {
    return this.client.post<PaymentMethod>(endpoints.payments.setDefaultPaymentMethod(methodId));
  }

  // Payment Processing

  // Create Razorpay order
  async createRazorpayOrder(orderData: {
    amount: number;
    currency: string;
    orderId: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    notes?: Record<string, string>;
  }): Promise<ApiResponse<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    key: string;
    orderId: string;
  }>> {
    return this.client.post<{
      razorpayOrderId: string;
      amount: number;
      currency: string;
      key: string;
      orderId: string;
    }>(endpoints.payments.createRazorpayOrder, orderData);
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }): Promise<ApiResponse<{
    success: boolean;
    transactionId: string;
    orderId: string;
  }>> {
    return this.client.post<{
      success: boolean;
      transactionId: string;
      orderId: string;
    }>(endpoints.payments.verifyRazorpayPayment, paymentData);
  }

  // Create Stripe payment intent
  async createStripeIntent(intentData: {
    amount: number;
    currency: string;
    orderId: string;
    paymentMethodId?: string;
    customerInfo: {
      name: string;
      email: string;
    };
    metadata?: Record<string, string>;
  }): Promise<ApiResponse<{
    clientSecret: string;
    paymentIntentId: string;
    publishableKey: string;
  }>> {
    return this.client.post<{
      clientSecret: string;
      paymentIntentId: string;
      publishableKey: string;
    }>(endpoints.payments.createStripeIntent, intentData);
  }

  // Confirm Stripe payment
  async confirmStripePayment(confirmData: {
    paymentIntentId: string;
    orderId: string;
  }): Promise<ApiResponse<{
    success: boolean;
    transactionId: string;
    orderId: string;
  }>> {
    return this.client.post<{
      success: boolean;
      transactionId: string;
      orderId: string;
    }>(endpoints.payments.confirmStripePayment, confirmData);
  }

  // Process UPI payment
  async processUpiPayment(upiData: {
    amount: number;
    orderId: string;
    upiId: string;
    description: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    upiUrl: string;
    qrCode: string;
    status: string;
  }>> {
    return this.client.post<{
      transactionId: string;
      upiUrl: string;
      qrCode: string;
      status: string;
    }>(endpoints.payments.upiPayment, upiData);
  }

  // Process wallet payment
  async processWalletPayment(walletData: {
    amount: number;
    orderId: string;
    walletProvider: string;
    phone: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    redirectUrl: string;
    status: string;
  }>> {
    return this.client.post<{
      transactionId: string;
      redirectUrl: string;
      status: string;
    }>(endpoints.payments.walletPayment, walletData);
  }

  // Process net banking payment
  async processNetBankingPayment(bankingData: {
    amount: number;
    orderId: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    redirectUrl: string;
    status: string;
  }>> {
    return this.client.post<{
      transactionId: string;
      redirectUrl: string;
      status: string;
    }>(endpoints.payments.netBanking, bankingData);
  }

  // Transaction Management

  // Get user transactions
  async getTransactions(params?: SearchParams & PaginationParams & {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    orderId?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
      ...(params?.dateFrom && { dateFrom: params.dateFrom }),
      ...(params?.dateTo && { dateTo: params.dateTo }),
      ...(params?.orderId && { orderId: params.orderId }),
    };
    
    return this.client.get<Transaction[]>(endpoints.payments.transactions, { params: queryParams });
  }

  // Get transaction by ID
  async getTransactionById(transactionId: string): Promise<ApiResponse<Transaction>> {
    return this.client.get<Transaction>(endpoints.payments.transactionById(transactionId));
  }

  // Get transaction status
  async getTransactionStatus(transactionId: string): Promise<ApiResponse<{
    status: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    gateway: string;
    lastUpdated: string;
  }>> {
    return this.client.get<{
      status: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      gateway: string;
      lastUpdated: string;
    }>(endpoints.payments.transactionStatus(transactionId));
  }

  // Refund Management

  // Initiate refund
  async initiateRefund(refundData: {
    transactionId: string;
    amount: number;
    reason: string;
    orderId: string;
  }): Promise<ApiResponse<{
    refundId: string;
    status: string;
    amount: number;
    estimatedDate: string;
  }>> {
    return this.client.post<{
      refundId: string;
      status: string;
      amount: number;
      estimatedDate: string;
    }>(endpoints.payments.createRefund(refundData.transactionId), refundData);
  }

  // Get refund status
  async getRefundStatus(refundId: string): Promise<ApiResponse<{
    status: string;
    amount: number;
    processedDate?: string;
    failureReason?: string;
  }>> {
    return this.client.get<{
      status: string;
      amount: number;
      processedDate?: string;
      failureReason?: string;
    }>(endpoints.payments.refundStatus(refundId));
  }

  // Get user refunds
  async getRefunds(params?: PaginationParams): Promise<ApiResponse<Array<{
    id: string;
    transactionId: string;
    orderId: string;
    amount: number;
    status: string;
    reason: string;
    createdAt: string;
    processedAt?: string;
  }>>> {
    const queryParams = buildPaginationParams(params || {});
    return this.client.get<Array<{
      id: string;
      transactionId: string;
      orderId: string;
      amount: number;
      status: string;
      reason: string;
      createdAt: string;
      processedAt?: string;
    }>>(endpoints.payments.allRefunds, { params: queryParams });
  }

  // Payment Configuration

  // Get supported payment gateways
  async getSupportedGateways(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    isEnabled: boolean;
    supportedMethods: string[];
    fees: {
      percentage: number;
      fixed: number;
    };
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      type: string;
      isEnabled: boolean;
      supportedMethods: string[];
      fees: {
        percentage: number;
        fixed: number;
      };
    }>>(endpoints.payments.gateways);
  }

  // Get supported banks for net banking
  async getSupportedBanks(): Promise<ApiResponse<Array<{
    code: string;
    name: string;
    isPopular: boolean;
  }>>> {
    return this.client.get<Array<{
      code: string;
      name: string;
      isPopular: boolean;
    }>>(endpoints.payments.banks);
  }

  // Get supported wallets
  async getSupportedWallets(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    icon: string;
    isEnabled: boolean;
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      icon: string;
      isEnabled: boolean;
    }>>(endpoints.payments.wallets);
  }

  // Calculate payment fees
  async calculateFees(feeData: {
    amount: number;
    paymentMethod: string;
    gateway: string;
  }): Promise<ApiResponse<{
    baseFee: number;
    gatewayFee: number;
    totalFee: number;
    netAmount: number;
  }>> {
    return this.client.post<{
      baseFee: number;
      gatewayFee: number;
      totalFee: number;
      netAmount: number;
    }>(endpoints.payments.calculateFees, feeData);
  }

  // Payment Analytics

  // Get payment analytics
  async getPaymentAnalytics(period?: string): Promise<ApiResponse<{
    totalTransactions: number;
    totalAmount: number;
    successRate: number;
    averageTransactionValue: number;
    transactionsByMethod: Record<string, number>;
    transactionsByStatus: Record<string, number>;
    revenueByDay: Array<{ date: string; amount: number; transactions: number }>;
    topFailureReasons: Array<{ reason: string; count: number }>;
  }>> {
    const params = period ? { period } : {};
    return this.client.get<{
      totalTransactions: number;
      totalAmount: number;
      successRate: number;
      averageTransactionValue: number;
      transactionsByMethod: Record<string, number>;
      transactionsByStatus: Record<string, number>;
      revenueByDay: Array<{ date: string; amount: number; transactions: number }>;
      topFailureReasons: Array<{ reason: string; count: number }>;
    }>(endpoints.payments.analytics, { params });
  }

  // Admin Operations

  // Get all transactions (Admin)
  async getAllTransactions(params?: SearchParams & PaginationParams & {
    status?: string;
    gateway?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
      ...(params?.gateway && { gateway: params.gateway }),
      ...(params?.dateFrom && { dateFrom: params.dateFrom }),
      ...(params?.dateTo && { dateTo: params.dateTo }),
      ...(params?.userId && { userId: params.userId }),
    };
    
    return this.client.get<Transaction[]>(endpoints.payments.admin.transactions, { params: queryParams });
  }

  // Update transaction status (Admin)
  async updateTransactionStatus(transactionId: string, status: string, notes?: string): Promise<ApiResponse<Transaction>> {
    return this.client.put<Transaction>(endpoints.payments.admin.updateTransaction(transactionId), {
      status,
      notes,
    });
  }

  // Process manual refund (Admin)
  async processManualRefund(refundData: {
    transactionId: string;
    amount: number;
    reason: string;
    notes?: string;
  }): Promise<ApiResponse<{
    refundId: string;
    status: string;
    amount: number;
  }>> {
    return this.client.post<{
      refundId: string;
      status: string;
      amount: number;
    }>(endpoints.payments.admin.manualRefund, refundData);
  }

  // Get payment statistics (Admin)
  async getPaymentStatistics(period?: string): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalRefunds: number;
    refundAmount: number;
    averageOrderValue: number;
    paymentMethodDistribution: Record<string, number>;
    gatewayPerformance: Record<string, {
      transactions: number;
      successRate: number;
      averageAmount: number;
    }>;
    dailyRevenue: Array<{ date: string; revenue: number; transactions: number }>;
  }>> {
    const params = period ? { period } : {};
    return this.client.get<{
      totalRevenue: number;
      totalTransactions: number;
      successfulTransactions: number;
      failedTransactions: number;
      totalRefunds: number;
      refundAmount: number;
      averageOrderValue: number;
      paymentMethodDistribution: Record<string, number>;
      gatewayPerformance: Record<string, {
        transactions: number;
        successRate: number;
        averageAmount: number;
      }>;
      dailyRevenue: Array<{ date: string; revenue: number; transactions: number }>;
    }>(endpoints.payments.admin.statistics, { params });
  }

  // Export payment data (Admin)
  async exportPaymentData(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    gateway?: string;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.payments.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }

  // Configure payment gateway (Admin)
  async configureGateway(gatewayId: string, config: {
    isEnabled: boolean;
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    supportedMethods?: string[];
    fees?: {
      percentage: number;
      fixed: number;
    };
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.payments.admin.configureGateway(gatewayId), config);
  }
}

// Create service instance
const paymentApiService = new PaymentApiService();

// React Query Hooks

// Payment Methods
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.PAYMENT_METHODS],
    queryFn: () => paymentApiService.getPaymentMethods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Transactions
export const useTransactions = (params?: SearchParams & PaginationParams & {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  orderId?: string;
}) => {
  return useQuery({
    queryKey: ['payments', 'transactions', params],
    queryFn: () => paymentApiService.getTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ['payments', 'transaction', transactionId],
    queryFn: () => paymentApiService.getTransactionById(transactionId),
    enabled: !!transactionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTransactionStatus = (transactionId: string) => {
  return useQuery({
    queryKey: ['payments', 'transaction-status', transactionId],
    queryFn: () => paymentApiService.getTransactionStatus(transactionId),
    enabled: !!transactionId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for pending transactions
  });
};

// Refunds
export const useRefunds = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['payments', 'refunds', params],
    queryFn: () => paymentApiService.getRefunds(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRefundStatus = (refundId: string) => {
  return useQuery({
    queryKey: ['payments', 'refund-status', refundId],
    queryFn: () => paymentApiService.getRefundStatus(refundId),
    enabled: !!refundId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute for pending refunds
  });
};

// Configuration
export const useSupportedGateways = () => {
  return useQuery({
    queryKey: ['payments', 'gateways'],
    queryFn: () => paymentApiService.getSupportedGateways(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSupportedBanks = () => {
  return useQuery({
    queryKey: ['payments', 'banks'],
    queryFn: () => paymentApiService.getSupportedBanks(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useSupportedWallets = () => {
  return useQuery({
    queryKey: ['payments', 'wallets'],
    queryFn: () => paymentApiService.getSupportedWallets(),
    staleTime: 30 * 60 * 1000,
  });
};

// Analytics
export const usePaymentAnalytics = (period?: string) => {
  return useQuery({
    queryKey: ['payments', 'analytics', period],
    queryFn: () => paymentApiService.getPaymentAnalytics(period),
    staleTime: 5 * 60 * 1000,
  });
};

// Admin Hooks
export const useAllTransactions = (params?: SearchParams & PaginationParams & {
  status?: string;
  gateway?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ['payments', 'admin', 'transactions', params],
    queryFn: () => paymentApiService.getAllTransactions(params),
    staleTime: 30 * 1000, // 30 seconds for admin data
  });
};

export const usePaymentStatistics = (period?: string) => {
  return useQuery({
    queryKey: ['payments', 'admin', 'statistics', period],
    queryFn: () => paymentApiService.getPaymentStatistics(period),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation Hooks

// Payment Methods
export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodData: {
      type: 'card' | 'wallet' | 'bank_transfer' | 'upi';
      name: string;
      details: {
        cardNumber?: string;
        expiryMonth?: number;
        expiryYear?: number;
        cvv?: string;
        walletProvider?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        upiId?: string;
      };
      isDefault?: boolean;
    }) => paymentApiService.addPaymentMethod(methodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENT_METHODS] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ methodId, updates }: {
      methodId: string;
      updates: {
        name?: string;
        isDefault?: boolean;
        details?: Partial<PaymentMethod['details']>;
      };
    }) => paymentApiService.updatePaymentMethod(methodId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENT_METHODS] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodId: string) => paymentApiService.deletePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENT_METHODS] });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodId: string) => paymentApiService.setDefaultPaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENT_METHODS] });
    },
  });
};

// Payment Processing
export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: (orderData: {
      amount: number;
      currency: string;
      orderId: string;
      customerInfo: {
        name: string;
        email: string;
        phone: string;
      };
      notes?: Record<string, string>;
    }) => paymentApiService.createRazorpayOrder(orderData),
  });
};

export const useVerifyRazorpayPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      orderId: string;
    }) => paymentApiService.verifyRazorpayPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ORDERS] });
    },
  });
};

export const useCreateStripeIntent = () => {
  return useMutation({
    mutationFn: (intentData: {
      amount: number;
      currency: string;
      orderId: string;
      paymentMethodId?: string;
      customerInfo: {
        name: string;
        email: string;
      };
      metadata?: Record<string, string>;
    }) => paymentApiService.createStripeIntent(intentData),
  });
};

export const useConfirmStripePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (confirmData: {
      paymentIntentId: string;
      orderId: string;
    }) => paymentApiService.confirmStripePayment(confirmData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_ORDERS] });
    },
  });
};

export const useProcessUpiPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (upiData: {
      amount: number;
      orderId: string;
      upiId: string;
      description: string;
    }) => paymentApiService.processUpiPayment(upiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
};

export const useProcessWalletPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (walletData: {
      amount: number;
      orderId: string;
      walletProvider: string;
      phone: string;
    }) => paymentApiService.processWalletPayment(walletData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
};

export const useProcessNetBankingPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bankingData: {
      amount: number;
      orderId: string;
      bankCode: string;
    }) => paymentApiService.processNetBankingPayment(bankingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
};

// Refunds
export const useInitiateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (refundData: {
      transactionId: string;
      amount: number;
      reason: string;
      orderId: string;
    }) => paymentApiService.initiateRefund(refundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'refunds'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
};

// Utility
export const useCalculateFees = () => {
  return useMutation({
    mutationFn: (feeData: {
      amount: number;
      paymentMethod: string;
      gateway: string;
    }) => paymentApiService.calculateFees(feeData),
  });
};

// Admin Mutations
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transactionId, status, notes }: {
      transactionId: string;
      status: string;
      notes?: string;
    }) => paymentApiService.updateTransactionStatus(transactionId, status, notes),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'transaction', transactionId] });
    },
  });
};

export const useProcessManualRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (refundData: {
      transactionId: string;
      amount: number;
      reason: string;
      notes?: string;
    }) => paymentApiService.processManualRefund(refundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'refunds'] });
    },
  });
};

export const useExportPaymentData = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'xlsx' | 'json';
      dateFrom?: string;
      dateTo?: string;
      status?: string;
      gateway?: string;
    }) => paymentApiService.exportPaymentData(params),
  });
};

export const useConfigureGateway = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gatewayId, config }: {
      gatewayId: string;
      config: {
        isEnabled: boolean;
        apiKey?: string;
        secretKey?: string;
        webhookUrl?: string;
        supportedMethods?: string[];
        fees?: {
          percentage: number;
          fixed: number;
        };
      };
    }) => paymentApiService.configureGateway(gatewayId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'gateways'] });
    },
  });
};

export default paymentApiService;