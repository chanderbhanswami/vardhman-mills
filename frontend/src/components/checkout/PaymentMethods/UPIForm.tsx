'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
// Tabs component available for future use in complex tab scenarios
import type { Tabs as TabsComponent } from '@/components/ui/Tabs';
import type { Price } from '@/types/common.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UPIFormProps {
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
  testMode?: boolean;
}

type UPIMethod = 'upi_id' | 'qr_code' | 'intent';

interface UPIFormData {
  upiId: string;
}

// TabsComponent type available for future complex tab implementations
export type TabsType = typeof TabsComponent;

/**
 * UPI Form component for UPI payment processing
 * Custom tab implementation used for payment methods
 * @see TabsType - Available for future integration with Tabs component
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '📱', color: 'bg-blue-600' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: 'bg-purple-600' },
  { id: 'paytm', name: 'Paytm', icon: '💙', color: 'bg-cyan-600' },
  { id: 'bhim', name: 'BHIM', icon: '🇮🇳', color: 'bg-orange-600' },
];

const TIMEOUT_DURATION = 300; // 5 minutes in seconds

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UPIForm: React.FC<UPIFormProps> = ({
  amount,
  orderId,
  orderDetails,
  onSuccess,
  onError,
  onCancel,
  testMode = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedMethod, setSelectedMethod] = useState<UPIMethod>('upi_id');
  const [formData, setFormData] = useState<UPIFormData>({
    upiId: testMode ? 'test@upi' : '',
  });
  const [upiError, setUpiError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMEOUT_DURATION);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Log order details for analytics
  React.useEffect(() => {
    if (orderDetails) {
      console.log('UPI Payment Order Details:', {
        orderId,
        items: orderDetails.items,
        customer: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          phone: orderDetails.customerPhone,
        },
        amount,
        method: selectedMethod,
      });
    }
  }, [orderDetails, orderId, amount, selectedMethod]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isUPIIdValid = useMemo(() => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(formData.upiId);
  }, [formData.upiId]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // ============================================================================
  // HANDLERS (Defined early to use in useEffect)
  // ============================================================================

  const handlePaymentSuccess = useCallback(async () => {
    setPaymentStatus('success');
    setIsWaitingForPayment(false);

    const response: PaymentSuccessResponse = {
      paymentId: `upi_${Date.now()}`,
      orderId,
      paymentMethod: 'upi',
      amount,
      status: 'success',
      transactionId: `txn_${Date.now()}`,
      metadata: {
        upiId: formData.upiId,
        method: selectedMethod,
      },
    };

    await onSuccess(response);
    toast.success('Payment successful!');
  }, [orderId, amount, formData.upiId, selectedMethod, onSuccess]);

  const handlePaymentTimeout = useCallback(() => {
    setPaymentStatus('failed');
    setIsWaitingForPayment(false);

    const error: PaymentError = {
      code: 'UPI_TIMEOUT',
      message: 'Payment timeout',
      description: 'Payment was not completed within the time limit',
      step: 'verification',
    };
    
    onError(error);
    toast.error('Payment timeout. Please try again.');
  }, [onError]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Generate QR code
  useEffect(() => {
    if (selectedMethod === 'qr_code') {
      // Generate UPI deep link for QR code
      const upiLink = `upi://pay?pa=merchant@upi&pn=VardhmanMills&am=${amount.amount}&cu=${amount.currency}&tn=Order${orderId}`;
      setQrCodeValue(upiLink);
    }
  }, [selectedMethod, amount, orderId]);

  // Payment timeout timer
  useEffect(() => {
    if (!isWaitingForPayment) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWaitingForPayment, handlePaymentTimeout]);

  // Simulate payment verification
  useEffect(() => {
    if (!isWaitingForPayment) return;

    const checkPayment = setInterval(async () => {
      // In real implementation, check payment status from backend
      // For now, simulate random success after some time
      if (testMode && Math.random() > 0.9) {
        await handlePaymentSuccess();
        clearInterval(checkPayment);
      }
    }, 3000);

    return () => clearInterval(checkPayment);
  }, [isWaitingForPayment, testMode, handlePaymentSuccess]);

  // ============================================================================
  // HANDLERS (Continued)
  // ============================================================================

  const handleUPIIdChange = useCallback((value: string) => {
    setFormData({ upiId: value.trim().toLowerCase() });
    setUpiError('');
  }, []);

  const validateUPIId = useCallback((): boolean => {
    if (!formData.upiId) {
      setUpiError('UPI ID is required');
      return false;
    }

    if (!isUPIIdValid) {
      setUpiError('Invalid UPI ID format (e.g., username@bank)');
      return false;
    }

    setUpiError('');
    return true;
  }, [formData.upiId, isUPIIdValid]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (selectedMethod === 'upi_id' && !validateUPIId()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment initiation
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selectedMethod === 'intent') {
        // Open UPI app (would use deep links in production)
        toast.success('Opening UPI app...');
      }

      setIsWaitingForPayment(true);
      setPaymentStatus('pending');
      setTimeRemaining(TIMEOUT_DURATION);

      toast.success('Payment request sent. Please complete on your UPI app.');

    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'UPI_INITIATION_FAILED',
        message: err.message || 'Failed to initiate UPI payment',
        description: 'Please try again',
        step: 'initiation',
      };
      onError(paymentError);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMethod, validateUPIId, onError]);

  const handleRetry = useCallback(() => {
    setIsWaitingForPayment(false);
    setPaymentStatus('pending');
    setTimeRemaining(TIMEOUT_DURATION);
    setUpiError('');
  }, []);

  const handleUPIAppClick = useCallback((appId: string) => {
    // In production, would open specific UPI app with deep link
    toast.success(`Opening ${appId}...`);
    handleSubmit();
  }, [handleSubmit]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderUPIIdMethod = () => (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DevicePhoneMobileIcon className="h-5 w-5" />
          Enter Your UPI ID *
        </label>
        <Input
          type="text"
          value={formData.upiId}
          onChange={(e) => handleUPIIdChange(e.target.value)}
          placeholder="yourname@upi"
          error={upiError}
          disabled={isProcessing || isWaitingForPayment}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          E.g., 9876543210@paytm, username@okaxis
        </p>
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={!isUPIIdValid || isProcessing || isWaitingForPayment}
        loading={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay ${amount.formatted}`}
      </Button>
    </div>
  );

  const renderQRCodeMethod = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg">
            {qrCodeValue && (
              <QRCode
                value={qrCodeValue}
                size={200}
                level="H"
              />
            )}
          </div>
          
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Scan QR Code to Pay
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use any UPI app to scan and pay
            </p>
          </div>

          <Badge variant="secondary">
            Amount: {amount.formatted}
          </Badge>
        </div>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isProcessing || isWaitingForPayment}
        loading={isProcessing}
        className="w-full"
      >
        {isWaitingForPayment ? 'Waiting for Payment...' : 'I have Scanned the QR Code'}
      </Button>
    </div>
  );

  const renderIntentMethod = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose your preferred UPI app to complete the payment
      </p>

      <div className="grid grid-cols-2 gap-3">
        {UPI_APPS.map((app) => (
          <motion.button
            key={app.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUPIAppClick(app.id)}
            disabled={isProcessing || isWaitingForPayment}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              'hover:border-blue-500 hover:shadow-md',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className={cn('text-4xl w-12 h-12 rounded-full flex items-center justify-center', app.color)}>
              {app.icon}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {app.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderWaitingForPayment = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {paymentStatus === 'pending' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <ArrowPathIcon className="h-12 w-12 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Waiting for Payment Confirmation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please complete the payment on your UPI app
                </p>
              </div>

              <div className="flex items-center gap-2 text-2xl font-mono font-bold text-gray-900 dark:text-white">
                <ClockIcon className="h-6 w-6" />
                {formattedTime}
              </div>

              <Badge variant="warning">
                Payment pending
              </Badge>
            </>
          )}

          {paymentStatus === 'success' && (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Payment Successful!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your payment has been confirmed
                </p>
              </div>
            </>
          )}

          {paymentStatus === 'failed' && (
            <>
              <XCircleIcon className="h-12 w-12 text-red-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Payment Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  The payment was not completed
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {paymentStatus === 'pending' && (
        <Alert variant="info">
          <DevicePhoneMobileIcon className="h-5 w-5" />
          <div>
            <p className="text-sm">
              Open your UPI app and approve the payment request
            </p>
          </div>
        </Alert>
      )}

      {paymentStatus === 'failed' && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="flex-1"
          >
            Retry Payment
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isWaitingForPayment || paymentStatus !== 'pending') {
    return renderWaitingForPayment();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            UPI Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fast & secure payment using UPI
          </p>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {[
            { value: 'upi_id', label: 'UPI ID', icon: DevicePhoneMobileIcon },
            { value: 'qr_code', label: 'QR Code', icon: QrCodeIcon },
            { value: 'intent', label: 'UPI Apps', icon: DevicePhoneMobileIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedMethod === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedMethod(tab.value as UPIMethod)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Method Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedMethod === 'upi_id' && renderUPIIdMethod()}
          {selectedMethod === 'qr_code' && renderQRCodeMethod()}
          {selectedMethod === 'intent' && renderIntentMethod()}
        </motion.div>
      </AnimatePresence>

      {/* Cancel Button */}
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </form>
  );
};

export default UPIForm;
