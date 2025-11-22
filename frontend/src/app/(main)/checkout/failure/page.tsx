/**
 * Checkout Failure Page - Vardhman Mills Frontend
 * 
 * Payment failure/error page with:
 * - Error information
 * - Retry payment option
 * - Alternative payment methods
 * - Support contact
 * - Order preservation
 * - Troubleshooting guide
 * 
 * @route /checkout/failure
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  PhoneIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PaymentError {
  code: string;
  message: string;
  reason?: string;
  suggestions?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ERROR_TYPES: Record<string, PaymentError> = {
  CARD_DECLINED: {
    code: 'CARD_DECLINED',
    message: 'Card Declined',
    reason: 'Your card was declined by your bank',
    suggestions: [
      'Check if you have sufficient funds',
      'Verify card details are correct',
      'Contact your bank for assistance',
      'Try a different payment method',
    ],
  },
  INSUFFICIENT_FUNDS: {
    code: 'INSUFFICIENT_FUNDS',
    message: 'Insufficient Funds',
    reason: 'The card does not have sufficient balance',
    suggestions: [
      'Add funds to your account',
      'Try a different card',
      'Use alternative payment method (UPI/Net Banking)',
    ],
  },
  CARD_EXPIRED: {
    code: 'CARD_EXPIRED',
    message: 'Card Expired',
    reason: 'The card you are trying to use has expired',
    suggestions: [
      'Check card expiry date',
      'Use a different valid card',
      'Contact your bank for a new card',
    ],
  },
  INVALID_CVV: {
    code: 'INVALID_CVV',
    message: 'Invalid CVV',
    reason: 'The CVV you entered is incorrect',
    suggestions: [
      'Check the CVV on the back of your card',
      'Ensure you are entering the correct 3-digit code',
      'Try again with the correct CVV',
    ],
  },
  PAYMENT_TIMEOUT: {
    code: 'PAYMENT_TIMEOUT',
    message: 'Payment Timeout',
    reason: 'The payment session expired',
    suggestions: [
      'Return to checkout and try again',
      'Ensure stable internet connection',
      'Complete payment within the time limit',
    ],
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network Error',
    reason: 'There was a problem connecting to the payment gateway',
    suggestions: [
      'Check your internet connection',
      'Try again after a few minutes',
      'Contact support if the problem persists',
    ],
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'Payment Failed',
    reason: 'An unexpected error occurred',
    suggestions: [
      'Try the payment again',
      'Use a different payment method',
      'Contact our support team for assistance',
    ],
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Failure page content wrapper
 */
function FailurePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const errorCode = searchParams?.get('error') || 'UNKNOWN_ERROR';
  const orderId = searchParams?.get('orderId');
  const transactionId = searchParams?.get('transactionId');

  // State
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<PaymentError>(
    ERROR_TYPES[errorCode] || ERROR_TYPES.UNKNOWN_ERROR
  );

  // Update error when errorCode changes
  useEffect(() => {
    const newError = ERROR_TYPES[errorCode] || ERROR_TYPES.UNKNOWN_ERROR;
    setError(newError);
    console.log('Payment error:', newError);
  }, [errorCode]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle retry payment
   */
  const handleRetryPayment = async () => {
    setIsRetrying(true);

    try {
      // Preserve order data and return to payment step
      if (orderId) {
        router.push(`/checkout/payment?orderId=${orderId}&retry=true`);
      } else {
        router.push('/checkout');
      }
    } catch (err) {
      console.error('Error retrying payment:', err);
      toast.error('Failed to retry payment');
      setIsRetrying(false);
    }
  };

  /**
   * Handle try different payment method
   */
  const handleTryDifferentMethod = () => {
    if (orderId) {
      router.push(`/checkout/payment?orderId=${orderId}&changeMethod=true`);
    } else {
      router.push('/checkout');
    }
  };

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    router.push('/cart');
  };

  /**
   * Handle contact support
   */
  const handleContactSupport = () => {
    router.push('/contact?subject=payment-issue&orderId=' + (orderId || ''));
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-red-50 to-white py-8 px-4 sm:px-6 lg:px-8")}>
      <div className="max-w-3xl mx-auto">
        {/* Error Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={cn("text-center mb-8", isRetrying && "opacity-50")}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-4"
          >
            <ExclamationTriangleIcon className="h-12 w-12" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {error.message}
          </p>
          
          {(orderId || transactionId) && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {orderId && (
                <>
                  <Badge variant="default" size="lg">
                    Order #{orderId}
                  </Badge>
                  <span className="text-gray-400">•</span>
                </>
              )}
              {transactionId && (
                <span className="text-sm text-gray-600">
                  Transaction: {transactionId}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Error Details */}
        <Card className="p-6 mb-6">
          <Alert className="mb-4">
            <InformationCircleIcon className="h-5 w-5" />
            <AlertDescription>
              <strong>{error.reason}</strong>
              <p className="mt-1 text-sm text-gray-600">
                Don&apos;t worry, your order is saved. You can retry the payment with the same or a different method.
              </p>
            </AlertDescription>
          </Alert>

          {/* Suggested Actions */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What You Can Do:
              </h3>
              <ul className="space-y-2">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleRetryPayment}
            size="lg"
            className="w-full"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Retrying...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Retry Payment
              </>
            )}
          </Button>
          
          <Button
            onClick={handleTryDifferentMethod}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Try Different Method
          </Button>
        </div>

        {/* Alternative Payment Methods */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Try These Alternative Payment Methods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">₹</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">UPI</h4>
                <p className="text-xs text-gray-600">Instant & Secure</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">🏦</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Net Banking</h4>
                <p className="text-xs text-gray-600">All Major Banks</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">💳</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Wallets</h4>
                <p className="text-xs text-gray-600">Paytm, PhonePe & More</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="p-6 mb-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
            Common Issues & Solutions
          </h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between p-3 bg-white rounded-lg">
                <span>Why was my payment declined?</span>
                <span className="transition group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 px-3">
                Payments can be declined for various reasons including insufficient funds, incorrect card details, 
                or security restrictions. Contact your bank if you believe the decline was in error.
              </div>
            </details>

            <details className="group">
              <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between p-3 bg-white rounded-lg">
                <span>Was money deducted from my account?</span>
                <span className="transition group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 px-3">
                If the payment failed, no amount should be deducted. In case of any discrepancy, 
                the amount will be automatically refunded within 5-7 business days.
              </div>
            </details>

            <details className="group">
              <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between p-3 bg-white rounded-lg">
                <span>How long is my order saved?</span>
                <span className="transition group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 px-3">
                Your order details are saved for 24 hours. You can complete the payment within this time 
                without losing your cart items.
              </div>
            </details>
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
            Need Help? We&apos;re Here for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
                <EnvelopeIcon className="h-6 w-6" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
              <p className="text-sm text-gray-600 mb-2">support@vardhmanmills.com</p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                <PhoneIcon className="h-6 w-6" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
              <p className="text-sm text-gray-600 mb-2">+91 1234567890</p>
              <p className="text-xs text-gray-500">Mon-Sat, 9 AM - 6 PM</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-3">
                <InformationCircleIcon className="h-6 w-6" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Help Center</h4>
              <Button variant="link" onClick={() => router.push('/help')} className="p-0">
                Visit Help Center
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleBackToCart}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </Button>
          <Button
            onClick={handleContactSupport}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Contact Support
          </Button>
          <Button
            onClick={() => router.push('/products')}
            variant="link"
            size="lg"
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <FailurePageContent />
    </Suspense>
  );
}
