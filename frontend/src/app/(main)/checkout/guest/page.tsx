/**
 * Guest Checkout Page - Vardhman Mills Frontend
 * 
 * Streamlined checkout experience for guest users with:
 * - Multi-step flow (contact → shipping → billing → payment → review)
 * - Quick checkout option
 * - No account required
 * - Optional account creation
 * - Secure payment processing
 * - Order tracking via email
 * 
 * @route /checkout/guest
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { GuestCheckout, QuickCheckout } from '@/components/checkout';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type CheckoutMode = 'multi-step' | 'quick';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items: cartItems, isLoading: cartLoading } = useCart();

  // State
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('multi-step');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle order processing updates
   */
  const handleOrderProcess = useCallback(async (processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Redirect to cart if empty
   */
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [cartItems, cartLoading, router]);

  /**
   * Handle processing state updates using handleOrderProcess
   */
  useEffect(() => {
    console.log('Processing state:', isProcessing ? 'Processing order...' : 'Ready');
    // Track processing state changes
    handleOrderProcess(isProcessing);
  }, [isProcessing, handleOrderProcess]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    router.push('/cart');
  };

  /**
   * Handle back to regular checkout
   */
  const handleBackToCheckout = () => {
    router.push('/checkout');
  };

  /**
   * Handle checkout mode toggle
   */
  const handleModeToggle = (mode: CheckoutMode) => {
    setCheckoutMode(mode);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (cartLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", { "animate-pulse": isProcessing })}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EMPTY CART STATE
  // ============================================================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to proceed with checkout.
          </p>
          <Button onClick={() => router.push('/products')} size="lg">
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToCart}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserIcon className="h-8 w-8" />
                Guest Checkout
              </h1>
              <p className="mt-2 text-gray-600">
                Complete your purchase without creating an account
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info" size="lg">
                <LockClosedIcon className="h-4 w-4 mr-1" />
                Secure
              </Badge>
              <Button
                variant="outline"
                onClick={handleBackToCheckout}
                size="sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Checkout Mode Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Choose Your Checkout Experience
              </h3>
              <p className="text-sm text-gray-600">
                Select the checkout flow that works best for you
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={checkoutMode === 'multi-step' ? 'default' : 'outline'}
                onClick={() => handleModeToggle('multi-step')}
                size="sm"
              >
                Multi-Step
              </Button>
              <Button
                variant={checkoutMode === 'quick' ? 'default' : 'outline'}
                onClick={() => handleModeToggle('quick')}
                size="sm"
              >
                Quick Checkout
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Features */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Why Guest Checkout?
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Fast & Easy
                </h4>
                <p className="text-xs text-gray-600">
                  No account required, checkout in minutes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Secure Payment
                </h4>
                <p className="text-xs text-gray-600">
                  Your information is encrypted and protected
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Order Tracking
                </h4>
                <p className="text-xs text-gray-600">
                  Track your order via email without an account
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Checkout Component */}
        <motion.div
          key={checkoutMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {checkoutMode === 'multi-step' ? (
            <GuestCheckout cartItems={cartItems as unknown as import('@/types/cart.types').CartItem[]} />
          ) : (
            <QuickCheckout cartItems={cartItems as unknown as import('@/types/cart.types').CartItem[]} />
          )}
        </motion.div>

        {/* Additional Information */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Guest Checkout Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✓ No Registration Required</h4>
              <p className="text-sm text-gray-600">
                Skip the sign-up process and checkout immediately with just your email address.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✓ Secure & Private</h4>
              <p className="text-sm text-gray-600">
                Your personal information is encrypted and never stored without your permission.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✓ Email Order Tracking</h4>
              <p className="text-sm text-gray-600">
                Receive order confirmation and tracking updates directly to your email.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✓ Create Account Later</h4>
              <p className="text-sm text-gray-600">
                Option to create an account after checkout to track orders and save preferences.
              </p>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Can I track my order without an account?
              </h4>
              <p className="text-sm text-gray-600">
                Yes! We&apos;ll send you an order confirmation email with a tracking link. 
                You can use your order number and email to track your shipment anytime.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Is guest checkout secure?
              </h4>
              <p className="text-sm text-gray-600">
                Absolutely. We use the same 256-bit SSL encryption for guest checkout 
                as we do for registered users. Your payment information is processed 
                securely through trusted payment gateways.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Can I create an account after checkout?
              </h4>
              <p className="text-sm text-gray-600">
                Yes! You&apos;ll have the option to create an account during checkout or 
                after your order is placed. This allows you to track orders and save 
                your preferences for future purchases.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
