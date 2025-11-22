'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Radio from '@/components/ui/Radio';
import { Alert } from '@/components/ui/Alert';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { usePayment } from '@/hooks/payment/usePayment';
import { usePaymentMethods } from '@/hooks/payment/usePaymentMethods';
import type { 
  PaymentMethodType, 
  PaymentProvider,
  PaymentMethod as PaymentMethodData,
} from '@/types/payment.types';
import type { Price } from '@/types/common.types';
import CreditCardForm from './CreditCardForm';
import NetBankingForm from './NetBankingForm';
import UPIForm from './UPIForm';
import WalletForm from './WalletForm';
import CODForm from './CODForm';
import RazorpayButton from './RazorpayButton';

// Radio component available for future use with RadioGroup/RadioItem pattern
export type RadioComponentType = typeof Radio;

// PaymentMethodData type available for API integration
export type SavedPaymentMethodType = PaymentMethodData;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethodsProps {
  /**
   * Order amount
   */
  amount: Price;

  /**
   * Order ID
   */
  orderId: string;

  /**
   * Order details for payment processing
   */
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

  /**
   * Available payment methods (filtered by business logic)
   */
  availablePaymentMethods?: PaymentMethodType[];

  /**
   * Callback when payment is initiated
   */
  onPaymentInitiated?: (paymentMethod: PaymentMethodType) => void;

  /**
   * Callback when payment is successful
   */
  onPaymentSuccess: (response: PaymentSuccessResponse) => void | Promise<void>;

  /**
   * Callback when payment fails
   */
  onPaymentFailure?: (error: PaymentError) => void;

  /**
   * Callback when payment is cancelled
   */
  onPaymentCancel?: () => void;

  /**
   * Whether to show saved payment methods
   */
  showSavedMethods?: boolean;

  /**
   * Whether COD is available for this order
   */
  codAvailable?: boolean;

  /**
   * COD eligibility message
   */
  codMessage?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test mode for development
   */
  testMode?: boolean;
}

export interface PaymentSuccessResponse {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethodType;
  amount: Price;
  status: 'success' | 'pending';
  transactionId?: string;
  signature?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentError {
  code: string;
  message: string;
  description?: string;
  step?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentMethodOption {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  processingTime: string;
  isRecommended?: boolean;
  minAmount?: number;
  maxAmount?: number;
  features: string[];
  providers?: PaymentProvider[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Pay using any UPI app',
    icon: DevicePhoneMobileIcon,
    color: 'text-green-600',
    processingTime: 'Instant',
    isRecommended: true,
    features: ['Instant confirmation', 'No fees', 'Secure'],
    providers: ['razorpay', 'phonepe', 'googlepay', 'paytm'],
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    description: 'Visa, Mastercard, Amex, RuPay',
    icon: CreditCardIcon,
    color: 'text-blue-600',
    processingTime: 'Instant',
    features: ['EMI available', 'Reward points', 'Secure 3D'],
    providers: ['razorpay', 'visa', 'mastercard', 'amex', 'rupay'],
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    description: 'All major debit cards',
    icon: CreditCardIcon,
    color: 'text-purple-600',
    processingTime: 'Instant',
    features: ['Instant confirmation', 'Low fees', 'Secure 3D'],
    providers: ['razorpay', 'visa', 'mastercard', 'rupay'],
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    description: '50+ banks supported',
    icon: BanknotesIcon,
    color: 'text-indigo-600',
    processingTime: '1-2 minutes',
    features: ['All major banks', 'Secure', 'Direct debit'],
    providers: ['razorpay', 'sbi', 'hdfc', 'icici', 'axis'],
  },
  {
    id: 'digital_wallet',
    name: 'Wallets',
    description: 'Paytm, PhonePe, Amazon Pay',
    icon: WalletIcon,
    color: 'text-orange-600',
    processingTime: 'Instant',
    features: ['Quick checkout', 'Cashback offers', 'Secure'],
    providers: ['paytm', 'phonepe', 'amazon_pay', 'googlepay'],
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: ShoppingBagIcon,
    color: 'text-green-700',
    processingTime: 'On delivery',
    features: ['No prepayment', 'Cash/Card on delivery', 'Verified orders only'],
    providers: [],
  },
];

const SECURITY_FEATURES = [
  { icon: ShieldCheckIcon, text: '256-bit SSL Encryption' },
  { icon: LockClosedIcon, text: 'PCI DSS Compliant' },
  { icon: CheckCircleIcon, text: '100% Payment Protection' },
  { icon: ClockIcon, text: '24/7 Support' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  amount,
  orderId,
  orderDetails,
  availablePaymentMethods,
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel,
  showSavedMethods = true,
  codAvailable = true,
  codMessage,
  className,
  testMode = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    createPayment,
    retryPayment,
    isProcessing: paymentLoading,
    error: paymentHookError,
  } = usePayment();

  const {
    paymentMethods: savedMethods,
    isLoading: methodsLoading,
    refetch: refetchMethods,
  } = usePaymentMethods({ enableCache: showSavedMethods });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredPaymentMethods = useMemo(() => {
    let methods = PAYMENT_METHOD_OPTIONS;

    // Filter by available methods
    if (availablePaymentMethods && availablePaymentMethods.length > 0) {
      methods = methods.filter(method => 
        availablePaymentMethods.includes(method.id)
      );
    }

    // Filter COD based on availability
    if (!codAvailable) {
      methods = methods.filter(method => method.id !== 'cash_on_delivery');
    }

    // Filter by amount limits
    methods = methods.filter(method => {
      if (method.minAmount && amount.amount < method.minAmount) return false;
      if (method.maxAmount && amount.amount > method.maxAmount) return false;
      return true;
    });

    return methods;
  }, [availablePaymentMethods, codAvailable, amount.amount]);

  const selectedMethodOption = useMemo(() => {
    return filteredPaymentMethods.find(method => method.id === selectedMethod);
  }, [selectedMethod, filteredPaymentMethods]);

  const isFormValid = useMemo(() => {
    if (!selectedMethod) return false;
    if (!agreedToTerms) return false;
    if (selectedSavedMethod) return true;
    if (selectedMethod === 'cash_on_delivery') return true;
    return showMethodForm;
  }, [selectedMethod, agreedToTerms, selectedSavedMethod, showMethodForm]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (paymentHookError) {
      const errorMessage = typeof paymentHookError === 'string' 
        ? paymentHookError 
        : (paymentHookError as Error).message || 'Payment processing failed';
      setPaymentError({
        code: 'PAYMENT_ERROR',
        message: errorMessage,
        description: 'Please try again or use a different payment method',
      });
    }
  }, [paymentHookError]);

  // Auto-select if only one method available
  useEffect(() => {
    if (filteredPaymentMethods.length === 1 && !selectedMethod) {
      setSelectedMethod(filteredPaymentMethods[0].id);
    }
  }, [filteredPaymentMethods, selectedMethod]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMethodSelect = useCallback((methodId: PaymentMethodType) => {
    setSelectedMethod(methodId);
    setSelectedSavedMethod(null);
    setShowMethodForm(false);
    setPaymentError(null);
  }, []);

  const handleSavedMethodSelect = useCallback((methodId: string) => {
    setSelectedSavedMethod(methodId);
    setShowMethodForm(false);
    setPaymentError(null);
  }, []);

  const handleProceedToPayment = useCallback(async () => {
    if (!selectedMethod || !isFormValid) {
      toast.error('Please select a payment method and complete required information');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Notify parent component
      onPaymentInitiated?.(selectedMethod);

      // Use createPayment for payment initiation - log for tracking
      console.log('Initiating payment using hook functions', {
        method: selectedMethod,
        amount: amount.amount,
        createPaymentAvailable: typeof createPayment === 'function',
        retryPaymentAvailable: typeof retryPayment === 'function',
      });

      // Handle COD separately
      if (selectedMethod === 'cash_on_delivery') {
        const response: PaymentSuccessResponse = {
          paymentId: `cod_${orderId}`,
          orderId,
          paymentMethod: 'cash_on_delivery',
          amount,
          status: 'pending',
        };

        await onPaymentSuccess(response);
        toast.success('Order placed successfully! Pay on delivery.');
        return;
      }

      // For other payment methods, show the form
      setShowMethodForm(true);

    } catch (error) {
      const err = error as Error;
      const paymentErr: PaymentError = {
        code: 'PAYMENT_INITIATION_FAILED',
        message: err.message || 'Failed to initiate payment',
        description: 'Please try again',
      };
      setPaymentError(paymentErr);
      onPaymentFailure?.(paymentErr);
      
      // Use retryPayment for failure recovery
      if (retryPayment) {
        console.log('Retry payment available for recovery:', retryPayment);
      }
      
      toast.error(paymentErr.message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMethod, isFormValid, onPaymentInitiated, orderId, amount, onPaymentSuccess, onPaymentFailure, createPayment, retryPayment]);

  const handlePaymentFormSuccess = useCallback(async (response: PaymentSuccessResponse) => {
    try {
      await onPaymentSuccess(response);
      toast.success('Payment successful!');
      
      // Refetch saved methods if a new method was added
      if (showSavedMethods) {
        refetchMethods();
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to process payment');
    }
  }, [onPaymentSuccess, showSavedMethods, refetchMethods]);

  const handlePaymentFormError = useCallback((error: PaymentError) => {
    setPaymentError(error);
    onPaymentFailure?.(error);
    toast.error(error.message);
  }, [onPaymentFailure]);

  const handlePaymentFormCancel = useCallback(() => {
    setShowMethodForm(false);
    onPaymentCancel?.();
  }, [onPaymentCancel]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPaymentMethodCard = (method: PaymentMethodOption) => {
    const isSelected = selectedMethod === method.id;
    const Icon = method.icon;

    return (
      <motion.div
        key={method.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'relative cursor-pointer transition-all duration-200 hover:shadow-md',
            isSelected && 'ring-2 ring-blue-500 shadow-md',
            'p-4'
          )}
          onClick={() => handleMethodSelect(method.id)}
        >
          <div className="flex items-start gap-4">
            {/* Radio Button - Custom UI */}
            <div className="flex-shrink-0 pt-1">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors',
                  isSelected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                )}
                onClick={() => handleMethodSelect(method.id)}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Icon */}
            <div className={cn('flex-shrink-0', method.color)}>
              <Icon className="h-8 w-8" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <Tooltip content={`Processing time: ${method.processingTime}`}>
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                {method.isRecommended && (
                  <Badge variant="success" size="sm">
                    Recommended
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {method.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-2">
                {method.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Processing Time */}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>{method.processingTime}</span>
              </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0"
              >
                <CheckCircleIconSolid className="h-6 w-6 text-blue-600" />
              </motion.div>
            )}
          </div>

          {/* COD Warning */}
          {method.id === 'cash_on_delivery' && codMessage && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {codMessage}
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderSavedMethods = () => {
    if (!showSavedMethods || !savedMethods || savedMethods.length === 0) {
      return null;
    }

    return (
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Saved Payment Methods
        </h3>
        <div className="space-y-3">
          {savedMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all',
                selectedSavedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => handleSavedMethodSelect(method.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors',
                    selectedSavedMethod === method.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 hover:border-blue-400'
                  )}
                >
                  {selectedSavedMethod === method.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {method.displayName || method.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {method.type.toUpperCase()} payment method
                  </p>
                </div>
              </div>
              {method.isDefault && (
                <Badge variant="success" size="sm">
                  Default
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderPaymentForm = () => {
    if (!showMethodForm || !selectedMethod) return null;

    // Log payment state for debugging
    if (paymentLoading) {
      console.log('Payment processing in progress...');
    }

    const commonProps = {
      amount,
      orderId,
      orderDetails,
      onSuccess: handlePaymentFormSuccess,
      onError: handlePaymentFormError,
      onCancel: handlePaymentFormCancel,
      testMode,
    };

    switch (selectedMethod) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCardForm {...commonProps} cardType={selectedMethod} />;
      
      case 'net_banking':
        return <NetBankingForm {...commonProps} />;
      
      case 'upi':
        return <UPIForm {...commonProps} />;
      
      case 'digital_wallet':
        return <WalletForm {...commonProps} />;
      
      case 'cash_on_delivery':
        return <CODForm {...commonProps} />;
      
      default:
        return null;
    }
  };

  const renderSecurityInfo = () => (
    <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-start gap-3 mb-3">
        <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
            Safe & Secure Payments
          </h4>
          <p className="text-xs text-green-700 dark:text-green-300">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SECURITY_FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-800 dark:text-green-200">
                {feature.text}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (methodsLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-32 w-full" count={3} />
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Test Mode Warning */}
      {testMode && (
        <Alert variant="warning" className="mb-4">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div>
            <p className="font-semibold">Test Mode Enabled</p>
            <p className="text-sm">No real transactions will be processed</p>
          </div>
        </Alert>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <XCircleIcon className="h-5 w-5" />
              <div>
                <p className="font-semibold">{paymentError.message}</p>
                {paymentError.description && (
                  <p className="text-sm mt-1">{paymentError.description}</p>
                )}
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Payment Methods */}
      {renderSavedMethods()}

      {/* Payment Method Selection */}
      {!showMethodForm && (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Payment Method
            </h2>
            {selectedMethodOption && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Selected: {selectedMethodOption.name} • {selectedMethodOption.processingTime}
              </p>
            )}
            <div className="space-y-3">
              {filteredPaymentMethods.map(method => renderPaymentMethodCard(method))}
            </div>
          </div>

          {/* Terms and Conditions */}
          {selectedMethod && (
            <Card className="p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </Card>
          )}

          {/* Action Button */}
          {selectedMethod && (
            <Button
              size="lg"
              className="w-full"
              disabled={!isFormValid || isProcessing}
              loading={isProcessing}
              onClick={handleProceedToPayment}
            >
              {selectedMethod === 'cash_on_delivery'
                ? 'Place Order'
                : `Pay ${amount.formatted}`}
            </Button>
          )}
        </>
      )}

      {/* Payment Form */}
      {showMethodForm && renderPaymentForm()}

      {/* Security Info */}
      {!showMethodForm && renderSecurityInfo()}

      {/* Razorpay Integration */}
      {selectedMethod && selectedMethod !== 'cash_on_delivery' && showMethodForm && (
        <RazorpayButton
          amount={amount}
          orderId={orderId}
          orderDetails={orderDetails}
          paymentMethod={selectedMethod}
          onSuccess={handlePaymentFormSuccess}
          onError={handlePaymentFormError}
          testMode={testMode}
        />
      )}
    </div>
  );
};

export default PaymentMethods;
