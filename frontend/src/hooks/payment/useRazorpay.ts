import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export interface RazorpayConfig {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    animation?: boolean;
  };
  subscription_id?: string;
  subscription_card_change?: boolean;
  recurring?: boolean;
  callback_url?: string;
  redirect?: boolean;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrder {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
  description?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface UseRazorpayOptions {
  autoLoadScript?: boolean;
  testMode?: boolean;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  onSuccess?: (response: RazorpaySuccessResponse) => void;
  onError?: (error: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onDismiss?: () => void;
}

export const useRazorpay = (options: UseRazorpayOptions = {}) => {
  const {
    autoLoadScript = true,
    testMode = process.env.NODE_ENV === 'development',
    theme = { color: '#3b82f6' },
    onSuccess,
    onError,
    onDismiss,
  } = options;

  const { user, isAuthenticated } = useAuth();

  // Local state
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
  const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<RazorpayOrder | null>(null);
  const razorpayInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Load Razorpay script
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsScriptLoaded(true);
        resolve(true);
        return;
      }

      if (isScriptLoading) {
        // If already loading, wait for it
        const checkLoaded = () => {
          if (window.Razorpay) {
            setIsScriptLoaded(true);
            resolve(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setIsScriptLoading(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
        resolve(true);
      };

      script.onerror = () => {
        setIsScriptLoading(false);
        toast.error('Failed to load Razorpay SDK', { duration: 4000 });
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, [isScriptLoading]);

  // Auto-load script on mount
  useEffect(() => {
    if (autoLoadScript && !isScriptLoaded && !isScriptLoading) {
      loadRazorpayScript();
    }
  }, [autoLoadScript, isScriptLoaded, isScriptLoading, loadRazorpayScript]);

  // Fetch Razorpay configuration
  const {
    data: razorpayConfig,
    isLoading: isLoadingConfig,
  } = useQuery({
    queryKey: ['razorpayConfig', testMode],
    queryFn: async () => {
      // Simulate API call to get configuration
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        keyId: testMode ? 'rzp_test_xxxxxx' : 'rzp_live_xxxxxx',
        keySecret: testMode ? 'test_secret_key' : 'live_secret_key',
        merchantName: 'Vardhman Mills',
        merchantLogo: '/images/logos/razorpay-logo.png',
        webhookSecret: 'webhook_secret_key',
        callbackUrl: `${window.location.origin}/payment/callback`,
        features: {
          refunds: true,
          partialRefunds: true,
          recurring: true,
          qrCode: true,
          upi: true,
          cards: true,
          netbanking: true,
          wallets: true,
        },
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (request: PaymentRequest): Promise<RazorpayOrder> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Simulate API call to create Razorpay order
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockOrder: RazorpayOrder = {
        id: `order_${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
        entity: 'order',
        amount: request.amount * 100, // Convert to paisa
        amount_paid: 0,
        amount_due: request.amount * 100,
        currency: request.currency,
        receipt: request.receipt || `receipt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: request.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };

      return mockOrder;
    },
    onSuccess: (order) => {
      setCurrentOrder(order);
      toast.success('Payment order created successfully', {
        duration: 3000,
        icon: '✅'
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create payment order',
        { duration: 4000 }
      );
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (verification: PaymentVerification): Promise<{ verified: boolean; message: string }> => {
      // Simulate API call to verify payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, verify signature using razorpay secret
      console.log('Verifying payment:', verification.paymentId);
      const isVerified = Math.random() > 0.1; // 90% success rate for demo

      return {
        verified: isVerified,
        message: isVerified ? 'Payment verified successfully' : 'Payment verification failed',
      };
    },
    onSuccess: (result, verification) => {
      if (result.verified) {
        toast.success(result.message, {
          duration: 4000,
          icon: '🎉'
        });
        onSuccess?.({
          razorpay_payment_id: verification.paymentId,
          razorpay_order_id: verification.orderId,
          razorpay_signature: verification.signature,
        });
      } else {
        toast.error(result.message, { duration: 4000 });
        onError?.(new Error(result.message));
      }
      setPaymentInProgress(false);
      setCurrentOrder(null);
    },
    onError: (error) => {
      setPaymentInProgress(false);
      toast.error(
        error instanceof Error ? error.message : 'Payment verification failed',
        { duration: 4000 }
      );
      onError?.(error);
    },
  });

  // Refund payment mutation
  const refundPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, amount, reason }: {
      paymentId: string;
      amount?: number;
      reason?: string;
    }): Promise<{ refundId: string; status: string; amount: number }> => {
      // Simulate API call
      console.log('Processing refund for payment:', paymentId, 'Amount:', amount, 'Reason:', reason);
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        refundId: `rfnd_${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
        status: 'processed',
        amount: amount || 0,
      };
    },
    onSuccess: (result) => {
      toast.success(
        `Refund processed successfully. Refund ID: ${result.refundId}`,
        { duration: 4000, icon: '💰' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Refund failed',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const openPaymentModal = useCallback(async (paymentConfig: Partial<RazorpayConfig>) => {
    if (!isScriptLoaded) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Unable to load payment gateway', { duration: 4000 });
        return;
      }
    }

    if (!razorpayConfig) {
      toast.error('Payment configuration not loaded', { duration: 3000 });
      return;
    }

    if (!currentOrder) {
      toast.error('No order found. Please create an order first.', { duration: 3000 });
      return;
    }

    setPaymentInProgress(true);

    const config: RazorpayConfig = {
      key: razorpayConfig.keyId,
      amount: currentOrder.amount,
      currency: currentOrder.currency,
      name: razorpayConfig.merchantName,
      description: paymentConfig.description || 'Purchase from Vardhman Mills',
      image: razorpayConfig.merchantLogo,
      order_id: currentOrder.id,
      handler: (response: RazorpaySuccessResponse) => {
        // Verify payment on server
        verifyPaymentMutation.mutate({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : paymentConfig.prefill?.name,
        email: user?.email || paymentConfig.prefill?.email,
        contact: paymentConfig.prefill?.contact,
      },
      notes: paymentConfig.notes || currentOrder.notes,
      theme: {
        color: theme.color,
        backdrop_color: theme.backdrop_color,
        ...paymentConfig.theme,
      },
      modal: {
        ondismiss: () => {
          setPaymentInProgress(false);
          onDismiss?.();
          toast.success('Payment cancelled by user', { duration: 3000 });
        },
        confirm_close: true,
        animation: true,
        ...paymentConfig.modal,
      },
      ...paymentConfig,
    };

    try {
      razorpayInstanceRef.current = new window.Razorpay(config);
      razorpayInstanceRef.current.open();
    } catch (error) {
      setPaymentInProgress(false);
      toast.error('Failed to open payment modal', { duration: 4000 });
      onError?.(error);
    }
  }, [isScriptLoaded, loadRazorpayScript, razorpayConfig, currentOrder, user, theme, onDismiss, onError, verifyPaymentMutation]);

  const initiatePayment = useCallback(async (request: PaymentRequest, config?: Partial<RazorpayConfig>) => {
    try {
      // First create the order
      await createOrderMutation.mutateAsync(request);
      
      // Then open payment modal
      await openPaymentModal(config || {});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to initiate payment',
        { duration: 4000 }
      );
    }
  }, [createOrderMutation, openPaymentModal]);

  const cancelPayment = useCallback(() => {
    if (razorpayInstanceRef.current) {
      razorpayInstanceRef.current.close();
    }
    setPaymentInProgress(false);
    setCurrentOrder(null);
    toast.success('Payment cancelled', { duration: 2000 });
  }, []);

  const processRefund = useCallback(async (paymentId: string, amount?: number, reason?: string) => {
    return refundPaymentMutation.mutateAsync({ paymentId, amount, reason });
  }, [refundPaymentMutation]);

  const getPaymentMethods = useCallback(() => {
    if (!razorpayConfig) return [];

    const methods = [];
    if (razorpayConfig.features.cards) methods.push({ type: 'card', name: 'Credit/Debit Cards' });
    if (razorpayConfig.features.upi) methods.push({ type: 'upi', name: 'UPI' });
    if (razorpayConfig.features.netbanking) methods.push({ type: 'netbanking', name: 'Net Banking' });
    if (razorpayConfig.features.wallets) methods.push({ type: 'wallet', name: 'Wallets' });

    return methods;
  }, [razorpayConfig]);

  const formatAmount = useCallback((amount: number, currency: string = 'INR'): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  }, []);

  return {
    // State
    isScriptLoaded,
    isScriptLoading,
    isLoadingConfig,
    paymentInProgress,
    currentOrder,
    razorpayConfig,
    
    // Actions
    loadRazorpayScript,
    initiatePayment,
    openPaymentModal,
    cancelPayment,
    processRefund,
    
    // Mutations
    createOrder: createOrderMutation.mutateAsync,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    
    // Mutation states
    isCreatingOrder: createOrderMutation.isPending,
    isVerifyingPayment: verifyPaymentMutation.isPending,
    isRefunding: refundPaymentMutation.isPending,
    
    // Helpers
    getPaymentMethods,
    formatAmount,
    
    // Mutation errors
    createOrderError: createOrderMutation.error,
    verifyPaymentError: verifyPaymentMutation.error,
    refundError: refundPaymentMutation.error,
  };
};

export default useRazorpay;
