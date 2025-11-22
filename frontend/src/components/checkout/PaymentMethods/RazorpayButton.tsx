'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRazorpay } from '@/hooks/payment/useRazorpay';
import { toast } from 'react-hot-toast';
import type { Price } from '@/types/common.types';
import type { PaymentMethodType } from '@/types/payment.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RazorpayButtonProps {
  amount: Price;
  orderId: string;
  orderDetails?: {
    items: Array<{
      name: string;
      quantity: number;
      price: Price;
    }>;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
  };
  paymentMethod: PaymentMethodType;
  onSuccess: (response: PaymentSuccessResponse) => void | Promise<void>;
  onError: (error: PaymentError) => void;
  disabled?: boolean;
  testMode?: boolean;
  className?: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  amount,
  orderId,
  orderDetails,
  paymentMethod,
  onSuccess,
  onError,
  disabled = false,
  testMode = false,
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    isScriptLoaded,
    isScriptLoading,
    createOrder,
    openPaymentModal,
    createOrderError,
  } = useRazorpay({
    testMode,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isScriptLoaded) {
      setIsInitialized(true);
      setInitError(null);
    } else if (createOrderError) {
      setInitError(createOrderError.message);
    }
  }, [isScriptLoaded, createOrderError]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePaymentSuccess = useCallback(async (response: RazorpayResponse) => {
    try {
      const paymentResponse: PaymentSuccessResponse = {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        paymentMethod,
        amount,
        status: 'success',
        transactionId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        metadata: {
          provider: 'razorpay',
          testMode,
        },
      };

      await onSuccess(paymentResponse);
      toast.success('Payment successful!');
    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'PAYMENT_VERIFICATION_FAILED',
        message: err.message || 'Failed to verify payment',
        description: 'Payment was successful but verification failed',
        step: 'verification',
      };
      onError(paymentError);
    }
  }, [paymentMethod, amount, testMode, onSuccess, onError]);

  const handlePaymentError = useCallback((error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  }) => {
    const paymentError: PaymentError = {
      code: error.code || 'RAZORPAY_ERROR',
      message: error.description || 'Payment failed',
      description: error.reason || 'Please try again',
      step: error.step || 'payment',
      metadata: error.metadata,
    };

    onError(paymentError);
    toast.error(paymentError.message);
  }, [onError]);

  const handlePayment = useCallback(async () => {
    if (!isInitialized) {
      toast.error('Payment gateway is not initialized');
      return;
    }

    try {
      // Create Razorpay order
      const order = await createOrder({
        amount: amount.amount, // Amount in rupees
        currency: amount.currency,
        receipt: orderId,
        notes: {
          orderId,
          paymentMethod,
        },
      });

      if (!order) {
        throw new Error('Failed to create payment order');
      }

      // Open Razorpay checkout
      await openPaymentModal({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Vardhman Mills',
        description: `Order ${orderId}`,
        order_id: order.id,
        handler: handlePaymentSuccess,
        prefill: {
          name: orderDetails?.customerName || '',
          email: orderDetails?.customerEmail || '',
          contact: orderDetails?.customerPhone || '',
        },
        notes: {
          orderId,
          paymentMethod,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            toast.success('Payment cancelled', { duration: 2000 });
          },
        },
      });

    } catch (error) {
      const err = error as Error;
      handlePaymentError({
        code: 'PAYMENT_INITIATION_FAILED',
        description: err.message || 'Failed to initiate payment',
        source: 'razorpay',
        step: 'initiation',
        reason: 'Could not create payment order',
        metadata: {
          order_id: orderId,
          payment_id: '',
        },
      });
    }
  }, [
    isInitialized,
    createOrder,
    amount,
    orderId,
    paymentMethod,
    openPaymentModal,
    orderDetails,
    handlePaymentSuccess,
    handlePaymentError,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isInitialized && isScriptLoading) {
    return (
      <Alert variant="info" className={className}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <ShieldCheckIcon className="h-5 w-5" />
        </motion.div>
        <div>
          <p className="text-sm">Loading payment gateway...</p>
        </div>
      </Alert>
    );
  }

  if (initError) {
    return (
      <Alert variant="warning" className={className}>
        <ExclamationTriangleIcon className="h-5 w-5" />
        <div>
          <p className="font-semibold">Payment Gateway Error</p>
          <p className="text-sm">{initError}</p>
        </div>
      </Alert>
    );
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <div className={className}>
      {testMode && (
        <Alert variant="info" className="mb-4">
          <CheckCircleIcon className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Test Mode Active</p>
            <p className="text-xs">
              Use test card: 4111 1111 1111 1111 (any future date, any CVV)
            </p>
          </div>
        </Alert>
      )}

      <Button
        type="button"
        onClick={handlePayment}
        disabled={disabled || !isInitialized}
        className="w-full"
        size="lg"
      >
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        Secure Payment with Razorpay
      </Button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <ShieldCheckIcon className="h-4 w-4" />
        <span>Secured by Razorpay • PCI DSS Compliant</span>
      </div>
    </div>
  );
};

export default RazorpayButton;
