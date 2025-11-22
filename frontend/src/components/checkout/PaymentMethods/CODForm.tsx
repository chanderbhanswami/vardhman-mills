'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Price } from '@/types/common.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CODFormProps {
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
  onSuccess: (response: PaymentSuccessResponse) => void | Promise<void>;
  onError: (error: PaymentError) => void;
  onCancel?: () => void;
  codCharges?: Price;
  maxCodAmount?: number;
  testMode?: boolean;
}

type PaymentMode = 'cash' | 'card' | 'any';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_MODES = [
  {
    id: 'cash' as PaymentMode,
    name: 'Cash',
    description: 'Pay with cash at delivery',
    icon: BanknotesIcon,
    color: 'text-green-600',
  },
  {
    id: 'card' as PaymentMode,
    name: 'Card',
    description: 'Pay with debit/credit card at delivery',
    icon: CreditCardIcon,
    color: 'text-blue-600',
  },
  {
    id: 'any' as PaymentMode,
    name: 'Cash or Card',
    description: 'Decide at the time of delivery',
    icon: ShoppingBagIcon,
    color: 'text-purple-600',
  },
];

const COD_INSTRUCTIONS = [
  'Keep exact change ready for cash payments',
  'Card payment via POS machine available',
  'Order will be verified before delivery',
  'Returns are subject to inspection',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CODForm: React.FC<CODFormProps> = ({
  amount,
  orderId,
  orderDetails,
  onSuccess,
  onError,
  onCancel,
  codCharges,
  maxCodAmount = 50000,
  testMode = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('any');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalAmount = React.useMemo(() => {
    return codCharges
      ? { ...amount, amount: amount.amount + codCharges.amount }
      : amount;
  }, [amount, codCharges]);

  const isAmountValid = amount.amount <= maxCodAmount;

  // Log order details for analytics
  React.useEffect(() => {
    if (orderDetails) {
      console.log('COD Order Details:', {
        orderId,
        items: orderDetails.items,
        customer: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          phone: orderDetails.customerPhone,
        },
        amount: totalAmount,
        testMode,
      });
    }
  }, [orderDetails, orderId, totalAmount, testMode]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!isAmountValid) {
      toast.error(`COD is not available for orders above ${amount.currency} ${maxCodAmount}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response: PaymentSuccessResponse = {
        paymentId: `cod_${Date.now()}`,
        orderId,
        paymentMethod: 'cash_on_delivery',
        amount: totalAmount,
        status: 'pending',
        metadata: {
          paymentMode: selectedMode,
          codCharges: codCharges?.amount || 0,
        },
      };

      await onSuccess(response);
      toast.success('Order placed successfully! Pay on delivery.');

    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'COD_ORDER_FAILED',
        message: err.message || 'Failed to place COD order',
        description: 'Please try again',
        step: 'order_placement',
        metadata: {
          paymentMode: selectedMode,
        },
      };
      
      onError(paymentError);
    } finally {
      setIsProcessing(false);
    }
  }, [agreedToTerms, isAmountValid, amount.currency, maxCodAmount, orderId, totalAmount, selectedMode, codCharges, onSuccess, onError]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPaymentModeCard = (mode: typeof PAYMENT_MODES[0]) => {
    const isSelected = selectedMode === mode.id;
    const Icon = mode.icon;

    return (
      <motion.div
        key={mode.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            'relative cursor-pointer transition-all duration-200 p-4',
            isSelected && 'ring-2 ring-blue-500 shadow-md',
            !isSelected && 'hover:shadow-md'
          )}
          onClick={() => setSelectedMode(mode.id)}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            )}>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-white"
                />
              )}
            </div>

            <div className={cn('flex-shrink-0', mode.color)}>
              <Icon className="h-8 w-8" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {mode.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode.description}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingBagIcon className="h-6 w-6 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cash on Delivery
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pay when you receive your order
          </p>
        </div>
      </div>

      {/* Amount Validation */}
      {!isAmountValid && (
        <Alert variant="warning">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div>
            <p className="font-semibold">COD Not Available</p>
            <p className="text-sm">
              Cash on Delivery is only available for orders up to {amount.currency} {maxCodAmount}
            </p>
          </div>
        </Alert>
      )}

      {/* Payment Mode Selection */}
      {isAmountValid && (
        <>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              How would you like to pay?
            </h4>
            <div className="space-y-3">
              {PAYMENT_MODES.map(mode => renderPaymentModeCard(mode))}
            </div>
          </div>

          {/* COD Charges */}
          {codCharges && codCharges.amount > 0 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    COD Charges
                  </span>
                </div>
                <Badge variant="secondary">
                  + {codCharges.formatted}
                </Badge>
              </div>
            </Card>
          )}

          {/* Order Summary */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Order Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {amount.formatted}
                </span>
              </div>
              {codCharges && codCharges.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">COD Charges</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {codCharges.formatted}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totalAmount.formatted}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  Important Instructions
                </h4>
                <ul className="space-y-1.5">
                  {COD_INSTRUCTIONS.map((instruction, index) => (
                    <li key={index} className="text-xs text-green-800 dark:text-green-200 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Terms and Conditions */}
          <Card className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
                disabled={isProcessing}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I understand that I need to pay{' '}
                <strong className="text-gray-900 dark:text-white">{totalAmount.formatted}</strong>{' '}
                at the time of delivery. I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Terms & Conditions
                </a>.
              </span>
            </label>
          </Card>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!agreedToTerms || !isAmountValid || isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>

      {/* Test Mode Info */}
      {testMode && (
        <Alert variant="info">
          <InformationCircleIcon className="h-5 w-5" />
          <div>
            <p className="text-sm">Test mode: No actual order will be placed</p>
          </div>
        </Alert>
      )}
    </form>
  );
};

export default CODForm;
