import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod' | 'emi';
  name: string;
  displayName: string;
  isEnabled: boolean;
  isDefault: boolean;
  icon: string;
  description?: string;
  processingFee?: number;
  processingFeeType?: 'fixed' | 'percentage';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  configuration?: {
    merchantId?: string;
    gatewayId?: string;
    publicKey?: string;
    webhookUrl?: string;
    callbackUrl?: string;
    [key: string]: unknown;
  };
  features?: {
    refunds: boolean;
    partialRefunds: boolean;
    recurring: boolean;
    international: boolean;
    instantSettlement: boolean;
  };
  availability?: {
    countries?: string[];
    excludedCountries?: string[];
    businessHours?: {
      start: string;
      end: string;
      timezone: string;
    };
    maintenanceWindows?: {
      start: Date;
      end: Date;
      description: string;
    }[];
  };
  statistics?: {
    successRate: number;
    averageProcessingTime: number; // in seconds
    totalTransactions: number;
    totalVolume: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: 'razorpay' | 'stripe' | 'payu' | 'ccavenue' | 'instamojo';
  isActive: boolean;
  configuration: {
    apiKey: string;
    secretKey: string;
    merchantId: string;
    webhookSecret?: string;
  };
  supportedMethods: PaymentMethod['type'][];
  fees: {
    domestic: {
      percentage: number;
      fixed: number;
    };
    international: {
      percentage: number;
      fixed: number;
    };
  };
}

export interface UsePaymentMethodsOptions {
  enableCache?: boolean;
  cacheTime?: number;
  includeDisabled?: boolean;
  autoRefresh?: boolean;
}

export const usePaymentMethods = (options: UsePaymentMethodsOptions = {}) => {
  const {
    enableCache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    includeDisabled = false,
    autoRefresh = false,
  } = options;

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [testModeEnabled, setTestModeEnabled] = useState<boolean>(false);

  // Fetch payment methods
  const {
    data: paymentMethods = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['paymentMethods', { includeDisabled }],
    queryFn: async (): Promise<PaymentMethod[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockMethods: PaymentMethod[] = [
        {
          id: 'card_payments',
          type: 'card',
          name: 'card_payments',
          displayName: 'Credit/Debit Cards',
          isEnabled: true,
          isDefault: true,
          icon: '💳',
          description: 'Visa, MasterCard, American Express, RuPay',
          processingFee: 2.4,
          processingFeeType: 'percentage',
          minAmount: 1,
          maxAmount: 200000,
          supportedCurrencies: ['INR', 'USD', 'EUR'],
          configuration: {
            merchantId: 'CARD_MERCHANT_001',
            gatewayId: 'razorpay',
            publicKey: 'rzp_test_xxxxxx',
          },
          features: {
            refunds: true,
            partialRefunds: true,
            recurring: true,
            international: true,
            instantSettlement: false,
          },
          statistics: {
            successRate: 94.2,
            averageProcessingTime: 12,
            totalTransactions: 15847,
            totalVolume: 2890540.50,
          },
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'upi_payments',
          type: 'upi',
          name: 'upi_payments',
          displayName: 'UPI Payments',
          isEnabled: true,
          isDefault: false,
          icon: '📱',
          description: 'Google Pay, PhonePe, Paytm, BHIM',
          processingFee: 0,
          processingFeeType: 'fixed',
          minAmount: 1,
          maxAmount: 100000,
          supportedCurrencies: ['INR'],
          configuration: {
            merchantId: 'UPI_MERCHANT_001',
            gatewayId: 'razorpay',
          },
          features: {
            refunds: true,
            partialRefunds: false,
            recurring: false,
            international: false,
            instantSettlement: true,
          },
          availability: {
            countries: ['IN'],
            businessHours: {
              start: '00:00',
              end: '23:59',
              timezone: 'Asia/Kolkata',
            },
          },
          statistics: {
            successRate: 97.8,
            averageProcessingTime: 5,
            totalTransactions: 28934,
            totalVolume: 1245890.25,
          },
          createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'netbanking',
          type: 'netbanking',
          name: 'netbanking',
          displayName: 'Net Banking',
          isEnabled: true,
          isDefault: false,
          icon: '🏦',
          description: 'All major banks supported',
          processingFee: 15,
          processingFeeType: 'fixed',
          minAmount: 100,
          maxAmount: 500000,
          supportedCurrencies: ['INR'],
          features: {
            refunds: true,
            partialRefunds: true,
            recurring: false,
            international: false,
            instantSettlement: false,
          },
          statistics: {
            successRate: 92.1,
            averageProcessingTime: 25,
            totalTransactions: 8743,
            totalVolume: 1890420.75,
          },
          createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'wallet_payments',
          type: 'wallet',
          name: 'wallet_payments',
          displayName: 'Digital Wallets',
          isEnabled: true,
          isDefault: false,
          icon: '👛',
          description: 'Paytm, Amazon Pay, MobiKwik, Freecharge',
          processingFee: 1.8,
          processingFeeType: 'percentage',
          minAmount: 1,
          maxAmount: 50000,
          supportedCurrencies: ['INR'],
          features: {
            refunds: true,
            partialRefunds: false,
            recurring: false,
            international: false,
            instantSettlement: true,
          },
          statistics: {
            successRate: 89.5,
            averageProcessingTime: 8,
            totalTransactions: 12456,
            totalVolume: 456780.30,
          },
          createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'cod_payments',
          type: 'cod',
          name: 'cod_payments',
          displayName: 'Cash on Delivery',
          isEnabled: false,
          isDefault: false,
          icon: '💵',
          description: 'Pay when your order is delivered',
          processingFee: 30,
          processingFeeType: 'fixed',
          minAmount: 100,
          maxAmount: 10000,
          supportedCurrencies: ['INR'],
          features: {
            refunds: false,
            partialRefunds: false,
            recurring: false,
            international: false,
            instantSettlement: false,
          },
          availability: {
            countries: ['IN'],
          },
          statistics: {
            successRate: 85.2,
            averageProcessingTime: 0, // No processing time
            totalTransactions: 3421,
            totalVolume: 198750.00,
          },
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ];

      // Filter based on options
      return includeDisabled ? mockMethods : mockMethods.filter(method => method.isEnabled);
    },
    enabled: enableCache,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
    refetchInterval: autoRefresh ? 60000 : false, // 1 minute
  });

  // Fetch payment gateways
  const {
    data: paymentGateways = [],
    isLoading: isLoadingGateways,
  } = useQuery({
    queryKey: ['paymentGateways'],
    queryFn: async (): Promise<PaymentGateway[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockGateways: PaymentGateway[] = [
        {
          id: 'razorpay',
          name: 'Razorpay',
          provider: 'razorpay',
          isActive: true,
          configuration: {
            apiKey: 'rzp_test_xxxxxx',
            secretKey: 'xxxxxx',
            merchantId: 'merchant_001',
            webhookSecret: 'webhook_secret_001',
          },
          supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
          fees: {
            domestic: { percentage: 2.0, fixed: 0 },
            international: { percentage: 3.0, fixed: 0 },
          },
        },
        {
          id: 'stripe',
          name: 'Stripe',
          provider: 'stripe',
          isActive: false,
          configuration: {
            apiKey: 'sk_test_xxxxxx',
            secretKey: 'xxxxxx',
            merchantId: 'acct_xxxxxx',
          },
          supportedMethods: ['card'],
          fees: {
            domestic: { percentage: 2.9, fixed: 30 },
            international: { percentage: 3.9, fixed: 30 },
          },
        },
      ];

      return mockGateways;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Toggle payment method mutation
  const toggleMethodMutation = useMutation({
    mutationFn: async ({ methodId, enabled }: { methodId: string; enabled: boolean }): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${enabled ? 'Enabling' : 'Disabling'} payment method: ${methodId}`);
    },
    onSuccess: (_, { methodId, enabled }) => {
      queryClient.setQueryData(['paymentMethods', { includeDisabled }], (oldMethods: PaymentMethod[] | undefined) => {
        return oldMethods?.map(method => ({
          ...method,
          isEnabled: method.id === methodId ? enabled : method.isEnabled,
        })) || [];
      });
      
      const method = paymentMethods.find(m => m.id === methodId);
      toast.success(
        `${method?.displayName} ${enabled ? 'enabled' : 'disabled'} successfully`,
        { duration: 3000, icon: enabled ? '✅' : '❌' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update payment method',
        { duration: 4000 }
      );
    },
  });

  // Set default payment method mutation
  const setDefaultMethodMutation = useMutation({
    mutationFn: async (methodId: string): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Setting default payment method: ${methodId}`);
    },
    onSuccess: (_, methodId) => {
      queryClient.setQueryData(['paymentMethods', { includeDisabled }], (oldMethods: PaymentMethod[] | undefined) => {
        return oldMethods?.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        })) || [];
      });
      
      const method = paymentMethods.find(m => m.id === methodId);
      toast.success(
        `${method?.displayName} set as default payment method`,
        { duration: 3000, icon: '🎯' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to set default method',
        { duration: 4000 }
      );
    },
  });

  // Update method configuration mutation
  const updateConfigurationMutation = useMutation({
    mutationFn: async ({ methodId, configuration }: { 
      methodId: string; 
      configuration: Partial<PaymentMethod['configuration']> 
    }): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log(`Updating configuration for method: ${methodId}`, configuration);
    },
    onSuccess: (_, { methodId, configuration }) => {
      queryClient.setQueryData(['paymentMethods', { includeDisabled }], (oldMethods: PaymentMethod[] | undefined) => {
        return oldMethods?.map(method => ({
          ...method,
          configuration: method.id === methodId ? { ...method.configuration, ...configuration } : method.configuration,
          updatedAt: method.id === methodId ? new Date() : method.updatedAt,
        })) || [];
      });
      
      toast.success('Configuration updated successfully', {
        duration: 3000,
        icon: '⚙️'
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update configuration',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const getDefaultMethod = useCallback((): PaymentMethod | undefined => {
    return paymentMethods.find(method => method.isDefault && method.isEnabled);
  }, [paymentMethods]);

  const getMethodsByType = useCallback((type: PaymentMethod['type']): PaymentMethod[] => {
    return paymentMethods.filter(method => method.type === type && method.isEnabled);
  }, [paymentMethods]);

  const getEnabledMethods = useCallback((): PaymentMethod[] => {
    return paymentMethods.filter(method => method.isEnabled);
  }, [paymentMethods]);

  const getMethodForAmount = useCallback((amount: number, currency: string = 'INR'): PaymentMethod[] => {
    return paymentMethods.filter(method => {
      if (!method.isEnabled) return false;
      if (!method.supportedCurrencies.includes(currency)) return false;
      if (method.minAmount && amount < method.minAmount) return false;
      if (method.maxAmount && amount > method.maxAmount) return false;
      return true;
    });
  }, [paymentMethods]);

  const calculateProcessingFee = useCallback((method: PaymentMethod, amount: number): number => {
    if (!method.processingFee) return 0;
    
    return method.processingFeeType === 'percentage' 
      ? (amount * method.processingFee) / 100
      : method.processingFee;
  }, []);

  const getMethodStatistics = useCallback(() => {
    const enabled = paymentMethods.filter(method => method.isEnabled);
    const totalTransactions = enabled.reduce((sum, method) => sum + (method.statistics?.totalTransactions || 0), 0);
    const totalVolume = enabled.reduce((sum, method) => sum + (method.statistics?.totalVolume || 0), 0);
    const avgSuccessRate = enabled.reduce((sum, method) => sum + (method.statistics?.successRate || 0), 0) / enabled.length;

    return {
      enabledMethods: enabled.length,
      totalMethods: paymentMethods.length,
      totalTransactions,
      totalVolume,
      averageSuccessRate: avgSuccessRate || 0,
    };
  }, [paymentMethods]);

  const isMethodAvailable = useCallback((methodId: string, amount?: number, currency?: string): boolean => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method || !method.isEnabled) return false;
    
    if (amount && currency) {
      return getMethodForAmount(amount, currency).some(m => m.id === methodId);
    }
    
    return true;
  }, [paymentMethods, getMethodForAmount]);

  const validateMethodConfiguration = useCallback((method: PaymentMethod): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!method.configuration?.merchantId) {
      errors.push('Merchant ID is required');
    }
    
    if (method.type === 'card' && !method.configuration?.publicKey) {
      errors.push('Public key is required for card payments');
    }
    
    if (!method.supportedCurrencies.length) {
      errors.push('At least one supported currency is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  // Actions
  const toggleMethod = useCallback(async (methodId: string, enabled: boolean) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) {
      toast.error('Payment method not found', { duration: 3000 });
      return;
    }

    if (!enabled && method.isDefault) {
      toast.error('Cannot disable the default payment method. Please set another method as default first.', {
        duration: 4000
      });
      return;
    }

    return toggleMethodMutation.mutateAsync({ methodId, enabled });
  }, [toggleMethodMutation, paymentMethods]);

  const setDefaultMethod = useCallback(async (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) {
      toast.error('Payment method not found', { duration: 3000 });
      return;
    }

    if (!method.isEnabled) {
      toast.error('Cannot set disabled method as default', { duration: 3000 });
      return;
    }

    return setDefaultMethodMutation.mutateAsync(methodId);
  }, [setDefaultMethodMutation, paymentMethods]);

  const updateConfiguration = useCallback(async (methodId: string, configuration: Partial<PaymentMethod['configuration']>) => {
    return updateConfigurationMutation.mutateAsync({ methodId, configuration });
  }, [updateConfigurationMutation]);

  const selectMethod = useCallback((method: PaymentMethod | null) => {
    setSelectedMethod(method);
    if (method) {
      toast.success(`Selected: ${method.displayName}`, {
        duration: 2000,
        icon: method.icon,
      });
    }
  }, []);

  return {
    // Data
    paymentMethods,
    paymentGateways,
    selectedMethod,
    defaultMethod: getDefaultMethod(),
    testModeEnabled,
    
    // State
    isLoading,
    isLoadingGateways,
    error,
    
    // Mutations state
    isTogglingMethod: toggleMethodMutation.isPending,
    isSettingDefault: setDefaultMethodMutation.isPending,
    isUpdatingConfig: updateConfigurationMutation.isPending,
    
    // Actions
    toggleMethod,
    setDefaultMethod,
    updateConfiguration,
    selectMethod,
    setTestModeEnabled,
    refetch,
    
    // Computed values
    enabledMethods: getEnabledMethods(),
    statistics: getMethodStatistics(),
    
    // Helpers
    getMethodsByType,
    getMethodForAmount,
    calculateProcessingFee,
    isMethodAvailable,
    validateMethodConfiguration,
    
    // Mutation errors
    toggleError: toggleMethodMutation.error,
    defaultError: setDefaultMethodMutation.error,
    configError: updateConfigurationMutation.error,
  };
};

export default usePaymentMethods;
