/**
 * CartActions Component - Vardhman Mills Frontend
 * 
 * Action buttons for cart drawer including:
 * - Checkout button
 * - Continue shopping button
 * - View full cart button
 * - Clear cart button
 * - Apply coupon button
 * - Shipping calculator
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  TrashIcon,
  TagIcon,
  TruckIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartActionsProps {
  /**
   * Callback when checkout is clicked
   */
  onCheckout?: () => void;

  /**
   * Callback when continue shopping is clicked
   */
  onContinueShopping?: () => void;

  /**
   * Callback when view cart is clicked
   */
  onViewCart?: () => void;

  /**
   * Show clear cart button
   * @default true
   */
  showClearCart?: boolean;

  /**
   * Show coupon input
   * @default true
   */
  showCoupon?: boolean;

  /**
   * Show shipping calculator
   * @default false
   */
  showShipping?: boolean;

  /**
   * Disable checkout button
   */
  disableCheckout?: boolean;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartActions: React.FC<CartActionsProps> = ({
  onCheckout,
  onContinueShopping,
  onViewCart,
  showClearCart = true,
  showCoupon = true,
  showShipping = false,
  disableCheckout = false,
  isLoading = false,
  className,
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { state, clearCart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [showShippingCalc, setShowShippingCalc] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canCheckout = state.items.length > 0 && !disableCheckout;
  const hasCoupon = !!state.couponCode;
  const cartTotal = state.summary.total;
  const freeShippingThreshold = 500; // Can be configured
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - state.summary.subtotal);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCheckout = useCallback(() => {
    if (!canCheckout) {
      toast.error('Your cart is empty');
      return;
    }

    if (onCheckout) {
      onCheckout();
    } else {
      window.location.href = '/checkout';
    }
  }, [canCheckout, onCheckout]);

  const handleContinueShopping = useCallback(() => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      window.location.href = '/products';
    }
  }, [onContinueShopping]);

  const handleViewCart = useCallback(() => {
    if (onViewCart) {
      onViewCart();
    } else {
      window.location.href = '/cart';
    }
  }, [onViewCart]);

  const handleClearCart = useCallback(async () => {
    const confirmed = window.confirm(
      `Are you sure you want to remove all ${state.items.length} items from your cart?`
    );

    if (!confirmed) return;

    try {
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    }
  }, [state.items.length, clearCart]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplying(true);

    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
      setShowCouponInput(false);
      toast.success(
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-green-500" />
          <span>Coupon applied successfully!</span>
        </div>
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid coupon code');
      console.error('Apply coupon error:', error);
    } finally {
      setIsApplying(false);
    }
  }, [couponCode, applyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    toast.success('Coupon removed');
  }, [removeCoupon]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFreeShippingProgress = () => {
    if (amountForFreeShipping <= 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4"
        >
          <TruckIcon className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            You qualify for FREE shipping!
          </span>
        </motion.div>
      );
    }

    const progress = ((freeShippingThreshold - amountForFreeShipping) / freeShippingThreshold) * 100;

    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Add {formatCurrency(amountForFreeShipping, 'INR')} for FREE shipping
            </span>
          </div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 h-2 rounded-full"
          />
        </div>
      </div>
    );
  };

  const renderCouponSection = () => {
    if (!showCoupon) return null;

    if (hasCoupon) {
      return (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">
                Coupon Applied: {state.couponCode}
              </p>
              <p className="text-xs text-green-600">
                You saved {formatCurrency(state.couponDiscount || 0, 'INR')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-800"
          >
            Remove
          </Button>
        </div>
      );
    }

    if (!showCouponInput) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCouponInput(true)}
          className="w-full mb-4 flex items-center justify-center gap-2"
        >
          <TagIcon className="h-4 w-4" />
          Have a coupon code?
        </Button>
      );
    }

    return (
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            disabled={isApplying}
            className="flex-1"
          />
          <Button
            variant="gradient"
            onClick={handleApplyCoupon}
            disabled={isApplying || !couponCode.trim()}
            loading={isApplying}
          >
            Apply
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowCouponInput(false);
            setCouponCode('');
          }}
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  };

  const renderShippingCalculator = () => {
    if (!showShipping) return null;

    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShippingCalc(!showShippingCalc)}
          className="w-full flex items-center justify-center gap-2"
        >
          <TruckIcon className="h-4 w-4" />
          Calculate Shipping
        </Button>

        {showShippingCalc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-50 rounded-lg"
          >
            <p className="text-sm text-gray-600">
              Shipping will be calculated at checkout based on your location.
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-3', className)}>
      {/* Free Shipping Progress */}
      {renderFreeShippingProgress()}

      {/* Coupon Section */}
      {renderCouponSection()}

      {/* Shipping Calculator */}
      {renderShippingCalculator()}

      {/* Primary Actions */}
      <div className="space-y-2">
        {/* Checkout Button */}
        <Tooltip
          content={!canCheckout ? 'Add items to cart to checkout' : 'Proceed to checkout'}
        >
          <Button
            variant="gradient"
            size="lg"
            onClick={handleCheckout}
            disabled={!canCheckout || isLoading}
            loading={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>Checkout</span>
            {cartTotal > 0 && (
              <Badge variant="default" className="ml-2 bg-white text-blue-600">
                {formatCurrency(cartTotal, 'INR')}
              </Badge>
            )}
            <ArrowRightIcon className="h-4 w-4 ml-auto" />
          </Button>
        </Tooltip>

        {/* View Cart Button */}
        <Button
          variant="outline"
          size="md"
          onClick={handleViewCart}
          className="w-full"
        >
          View Full Cart
        </Button>

        {/* Continue Shopping Button */}
        <Button
          variant="ghost"
          size="md"
          onClick={handleContinueShopping}
          className="w-full"
        >
          Continue Shopping
        </Button>
      </div>

      {/* Clear Cart Button */}
      {showClearCart && state.items.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Clear Cart
          </Button>
        </div>
      )}

      {/* Trust Badges */}
      <div className="pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <TruckIcon className="h-4 w-4 text-green-600" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-1">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>

      {/* Warning for empty cart */}
      {state.items.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          <span className="text-sm text-yellow-700">Your cart is empty</span>
        </div>
      )}
    </div>
  );
};

export default CartActions;
