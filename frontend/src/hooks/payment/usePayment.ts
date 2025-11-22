import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'upi' | 'cod' | 'emi';
  name: string;
  details: Record<string, unknown>;
  isDefault: boolean;
  isVerified: boolean;
  expiresAt?: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method: PaymentMethod;
  gateway: string;
  gatewayTransactionId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  webhook?: Record<string, unknown>;
}

export interface PaymentConfig {
  currency: string;
  supportedMethods: PaymentMethod['type'][];
  gateways: PaymentGateway[];
  defaultGateway?: string;
  testMode?: boolean;
  autoRetry?: boolean;
  retryAttempts?: number;
  enableSaveCard?: boolean;
  enableEMI?: boolean;
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  supportedMethods: PaymentMethod['type'][];
  isEnabled: boolean;
  fees?: {
    fixed?: number;
    percentage?: number;
    minimum?: number;
    maximum?: number;
  };
}

export interface PaymentOptions {
  amount: number;
  currency?: string;
  description?: string;
  orderId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
  successUrl?: string;
  failureUrl?: string;
  webhookUrl?: string;
  saveCard?: boolean;
  preferredMethod?: PaymentMethod['type'];
  preferredGateway?: string;
}

export interface PaymentState {
  methods: PaymentMethod[];
  transactions: PaymentTransaction[];
  currentTransaction: PaymentTransaction | null;
  isProcessing: boolean;
  error: string | null;
  config: PaymentConfig | null;
  savedCards: PaymentMethod[];
  defaultMethod: PaymentMethod | null;
}

const defaultPaymentState: PaymentState = {
  methods: [],
  transactions: [],
  currentTransaction: null,
  isProcessing: false,
  error: null,
  config: null,
  savedCards: [],
  defaultMethod: null,
};

export const usePayment = (initialConfig?: Partial<PaymentConfig>) => {
  const [state, setState] = useState<PaymentState>(() => {
    let savedData = defaultPaymentState;

    // Load saved payment methods from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedMethods = localStorage.getItem('payment_methods');
        if (savedMethods) {
          const methods = JSON.parse(savedMethods);
          savedData = {
            ...defaultPaymentState,
            methods: methods.map((method: PaymentMethod) => ({
              ...method,
              createdAt: new Date(method.createdAt),
              expiresAt: method.expiresAt ? new Date(method.expiresAt) : undefined,
              lastUsedAt: method.lastUsedAt ? new Date(method.lastUsedAt) : undefined,
            })),
          };
          savedData.savedCards = savedData.methods.filter(m => m.type === 'card');
          savedData.defaultMethod = savedData.methods.find(m => m.isDefault) || null;
        }
      } catch (error) {
        console.warn('Failed to load payment methods:', error);
      }
    }

    return savedData;
  });

  // Initialize configuration
  useEffect(() => {
    if (initialConfig) {
      setState(prev => ({
        ...prev,
        config: {
          currency: 'INR',
          supportedMethods: ['card', 'upi', 'wallet', 'bank'],
          gateways: [],
          testMode: true,
          autoRetry: true,
          retryAttempts: 3,
          enableSaveCard: true,
          enableEMI: false,
          minimumAmount: 1,
          maximumAmount: 100000,
          ...initialConfig,
        },
      }));
    }
  }, [initialConfig]);

  // Persist payment methods
  const persistMethods = useCallback((methods: PaymentMethod[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('payment_methods', JSON.stringify(methods));
      } catch (error) {
        console.warn('Failed to persist payment methods:', error);
      }
    }
  }, []);

  // Add payment method
  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setState(prev => {
      let updatedMethods = [...prev.methods];

      // If this is set as default, remove default from others
      if (newMethod.isDefault) {
        updatedMethods = updatedMethods.map(m => ({ ...m, isDefault: false }));
      }

      updatedMethods.push(newMethod);
      persistMethods(updatedMethods);

      return {
        ...prev,
        methods: updatedMethods,
        savedCards: updatedMethods.filter(m => m.type === 'card'),
        defaultMethod: newMethod.isDefault ? newMethod : prev.defaultMethod,
      };
    });

    toast.success('Payment method added successfully');
    return newMethod;
  }, [persistMethods]);

  // Remove payment method
  const removePaymentMethod = useCallback((methodId: string) => {
    setState(prev => {
      const updatedMethods = prev.methods.filter(m => m.id !== methodId);
      const removedMethod = prev.methods.find(m => m.id === methodId);
      
      let newDefaultMethod = prev.defaultMethod;
      if (removedMethod?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
        newDefaultMethod = updatedMethods[0];
      } else if (removedMethod?.isDefault) {
        newDefaultMethod = null;
      }

      persistMethods(updatedMethods);

      return {
        ...prev,
        methods: updatedMethods,
        savedCards: updatedMethods.filter(m => m.type === 'card'),
        defaultMethod: newDefaultMethod,
      };
    });

    toast.success('Payment method removed');
  }, [persistMethods]);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback((methodId: string) => {
    setState(prev => {
      const updatedMethods = prev.methods.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }));

      const defaultMethod = updatedMethods.find(m => m.isDefault) || null;
      persistMethods(updatedMethods);

      return {
        ...prev,
        methods: updatedMethods,
        savedCards: updatedMethods.filter(m => m.type === 'card'),
        defaultMethod,
      };
    });

    toast.success('Default payment method updated');
  }, [persistMethods]);

  // Create payment transaction
  const createPayment = useCallback(async (
    options: PaymentOptions,
    method?: PaymentMethod
  ): Promise<PaymentTransaction | null> => {
    if (!state.config) {
      toast.error('Payment configuration not initialized');
      return null;
    }

    if (options.amount < (state.config.minimumAmount || 0)) {
      toast.error(`Minimum amount is ${state.config.currency} ${state.config.minimumAmount}`);
      return null;
    }

    if (options.amount > (state.config.maximumAmount || Infinity)) {
      toast.error(`Maximum amount is ${state.config.currency} ${state.config.maximumAmount}`);
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Use provided method or default method
      const paymentMethod = method || state.defaultMethod;
      if (!paymentMethod) {
        throw new Error('No payment method selected');
      }

      // Select gateway
      const gateway = state.config.gateways.find(g => 
        g.id === (options.preferredGateway || state.config?.defaultGateway) &&
        g.isEnabled &&
        g.supportedMethods.includes(paymentMethod.type)
      ) || state.config.gateways.find(g => 
        g.isEnabled && g.supportedMethods.includes(paymentMethod.type)
      );

      if (!gateway) {
        throw new Error('No suitable payment gateway available');
      }

      // Create transaction
      const transaction: PaymentTransaction = {
        id: Date.now().toString(),
        amount: options.amount,
        currency: options.currency || state.config.currency,
        status: 'pending',
        method: paymentMethod,
        gateway: gateway.id,
        description: options.description,
        metadata: options.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        currentTransaction: transaction,
        transactions: [transaction, ...prev.transactions],
      }));

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment result (in real app, this would be handled by payment gateway)
      const isSuccess = Math.random() > 0.2; // 80% success rate
      
      if (isSuccess) {
        const successTransaction: PaymentTransaction = {
          ...transaction,
          status: 'completed',
          gatewayTransactionId: `txn_${Date.now()}`,
          completedAt: new Date(),
          updatedAt: new Date(),
        };

        setState(prev => ({
          ...prev,
          currentTransaction: successTransaction,
          isProcessing: false,
          transactions: prev.transactions.map(t => 
            t.id === transaction.id ? successTransaction : t
          ),
          methods: prev.methods.map(m =>
            m.id === paymentMethod.id ? { ...m, lastUsedAt: new Date() } : m
          ),
        }));

        toast.success('Payment completed successfully');
        return successTransaction;
      } else {
        const failedTransaction: PaymentTransaction = {
          ...transaction,
          status: 'failed',
          failureReason: 'Payment declined by bank',
          updatedAt: new Date(),
        };

        setState(prev => ({
          ...prev,
          currentTransaction: failedTransaction,
          isProcessing: false,
          error: failedTransaction.failureReason || 'Payment failed',
          transactions: prev.transactions.map(t => 
            t.id === transaction.id ? failedTransaction : t
          ),
        }));

        toast.error('Payment failed. Please try again.');
        return failedTransaction;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      return null;
    }
  }, [state.config, state.defaultMethod]);

  // Retry payment
  const retryPayment = useCallback(async (transactionId: string): Promise<PaymentTransaction | null> => {
    const transaction = state.transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'failed') {
      toast.error('Transaction not found or cannot be retried');
      return null;
    }

    return createPayment({
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      metadata: transaction.metadata,
    }, transaction.method);
  }, [state.transactions, createPayment]);

  // Refund payment
  const refundPayment = useCallback(async (
    transactionId: string, 
    amount?: number, 
    reason?: string
  ): Promise<boolean> => {
    const transaction = state.transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'completed') {
      toast.error('Transaction not found or cannot be refunded');
      return false;
    }

    const refundAmount = amount || transaction.amount;
    if (refundAmount > transaction.amount) {
      toast.error('Refund amount cannot exceed transaction amount');
      return false;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const refundedTransaction: PaymentTransaction = {
        ...transaction,
        status: 'refunded',
        refundAmount,
        refundReason: reason,
        updatedAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        isProcessing: false,
        transactions: prev.transactions.map(t => 
          t.id === transactionId ? refundedTransaction : t
        ),
      }));

      toast.success('Refund processed successfully');
      return true;

    } catch {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error('Refund failed. Please try again.');
      return false;
    }
  }, [state.transactions]);

  // Get transaction by ID
  const getTransaction = useCallback((transactionId: string) => {
    return state.transactions.find(t => t.id === transactionId) || null;
  }, [state.transactions]);

  // Get transactions by status
  const getTransactionsByStatus = useCallback((status: PaymentTransaction['status']) => {
    return state.transactions.filter(t => t.status === status);
  }, [state.transactions]);

  // Calculate payment statistics
  const getPaymentStats = useCallback(() => {
    const transactions = state.transactions;
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const failedTransactions = transactions.filter(t => t.status === 'failed');
    const totalAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = completedTransactions.length > 0 ? totalAmount / completedTransactions.length : 0;

    return {
      totalTransactions,
      completedTransactions: completedTransactions.length,
      failedTransactions: failedTransactions.length,
      totalAmount,
      averageAmount,
      successRate: totalTransactions > 0 ? (completedTransactions.length / totalTransactions) * 100 : 0,
      methodUsage: state.methods.map(method => ({
        method,
        count: transactions.filter(t => t.method.id === method.id).length,
      })).sort((a, b) => b.count - a.count),
    };
  }, [state.transactions, state.methods]);

  // Validate payment method
  const validatePaymentMethod = useCallback((method: PaymentMethod): boolean => {
    if (method.type === 'card' && method.expiresAt && method.expiresAt < new Date()) {
      return false;
    }
    return method.isVerified;
  }, []);

  // Clear payment history
  const clearPaymentHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      transactions: [],
      currentTransaction: null,
      error: null,
    }));
    toast.success('Payment history cleared');
  }, []);

  // Reset payment state
  const reset = useCallback(() => {
    setState({
      ...defaultPaymentState,
      config: state.config,
    });
  }, [state.config]);

  // Computed values
  const computed = useMemo(() => {
    const stats = getPaymentStats();
    return {
      hasPaymentMethods: state.methods.length > 0,
      hasTransactions: state.transactions.length > 0,
      canPay: !state.isProcessing && state.defaultMethod !== null,
      recentTransactions: state.transactions.slice(0, 5),
      activeCards: state.savedCards.filter(card => validatePaymentMethod(card)),
      expiredCards: state.savedCards.filter(card => !validatePaymentMethod(card)),
      ...stats,
    };
  }, [state, getPaymentStats, validatePaymentMethod]);

  return {
    // State
    ...state,
    
    // Payment methods
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    
    // Transactions
    createPayment,
    retryPayment,
    refundPayment,
    getTransaction,
    getTransactionsByStatus,
    
    // Utilities
    validatePaymentMethod,
    getPaymentStats,
    clearPaymentHistory,
    reset,
    
    // Computed values
    ...computed,
    
    // Configuration
    isConfigured: state.config !== null,
    testMode: state.config?.testMode || false,
  };
};

export default usePayment;
