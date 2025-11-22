'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import type { CartItem, AppliedCoupon, ShippingMethod } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartSummaryProps {
  /**
   * Cart items
   */
  items: CartItem[];

  /**
   * Applied coupons
   */
  appliedCoupons?: AppliedCoupon[];

  /**
   * Selected shipping method
   */
  selectedShippingMethod?: ShippingMethod;

  /**
   * Callback when checkout is clicked
   */
  onCheckout?: () => void;

  /**
   * Show detailed breakdown
   */
  showDetailed?: boolean;

  /**
   * Processing state
   */
  isProcessing?: boolean;

  /**
   * Minimum order for free shipping
   */
  freeShippingThreshold?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface PricingBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  savings: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAX_RATE = 0.18; // 18% GST
const DEFAULT_FREE_SHIPPING_THRESHOLD = 500;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  appliedCoupons = [],
  selectedShippingMethod,
  onCheckout,
  showDetailed = true,
  isProcessing = false,
  freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
  className,
}) => {
  // Calculate pricing breakdown
  const pricing = useMemo<PricingBreakdown>(() => {
    // Calculate subtotal (sum of all item prices)
    const subtotal = items.reduce((sum, item) => {
      return sum + item.totalPrice.amount;
    }, 0);

    // Calculate discount from coupons
    let discount = 0;
    appliedCoupons.forEach(coupon => {
      discount += coupon.discountAmount.amount;
    });

    // Calculate shipping cost
    let shipping = selectedShippingMethod?.price.amount || 0;
    
    // Free shipping if subtotal exceeds threshold
    if (subtotal >= freeShippingThreshold) {
      shipping = 0;
    }

    // Calculate tax (GST) on subtotal after discount
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * TAX_RATE;

    // Calculate total
    const total = subtotal - discount + shipping + tax;

    // Calculate savings (original price - final price)
    const originalSubtotal = items.reduce((sum, item) => {
      const originalPrice = item.product.pricing?.compareAtPrice?.amount || item.unitPrice.amount;
      return sum + (originalPrice * item.quantity);
    }, 0);
    const savings = originalSubtotal - subtotal + discount;

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      savings,
    };
  }, [items, appliedCoupons, selectedShippingMethod, freeShippingThreshold]);

  // Calculate progress to free shipping
  const freeShippingProgress = useMemo(() => {
    const progress = (pricing.subtotal / freeShippingThreshold) * 100;
    const remaining = Math.max(0, freeShippingThreshold - pricing.subtotal);
    const isEligible = pricing.subtotal >= freeShippingThreshold;

    return {
      progress: Math.min(100, progress),
      remaining,
      isEligible,
    };
  }, [pricing.subtotal, freeShippingThreshold]);

  // Render helpers
  const renderPriceLine = (
    label: string,
    amount: number,
    highlight?: boolean,
    isDiscount?: boolean
  ) => (
    <div className={cn(
      'flex items-center justify-between py-2',
      highlight && 'font-semibold text-lg'
    )}>
      <span className={cn(
        highlight ? 'text-gray-900' : 'text-gray-600'
      )}>
        {label}
      </span>
      <span className={cn(
        highlight ? 'text-gray-900' : 'text-gray-900',
        isDiscount && 'text-green-600'
      )}>
        {isDiscount && '- '}
        {formatCurrency(Math.abs(amount), 'INR')}
      </span>
    </div>
  );

  const renderFreeShippingProgress = () => {
    if (freeShippingProgress.isEligible) {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900">
              You qualify for FREE shipping!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Add {formatCurrency(freeShippingProgress.remaining, 'INR')} more for FREE shipping
          </span>
          <span className="text-blue-600 font-medium">
            {Math.round(freeShippingProgress.progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${freeShippingProgress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
            Order Summary
          </h2>
          <Badge variant="secondary" size="sm">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {/* Free Shipping Progress */}
        <div className="pb-4 border-b border-gray-200">
          {renderFreeShippingProgress()}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1">
          {renderPriceLine('Subtotal', pricing.subtotal)}
          
          {pricing.discount > 0 && (
            <>
              {renderPriceLine('Discount', pricing.discount, false, true)}
              {appliedCoupons.map((coupon) => (
                <div key={coupon.couponId} className="flex items-center gap-2 pl-4 py-1">
                  <TagIcon className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">{coupon.code}</span>
                  <Badge variant="success" size="sm">
                    {formatCurrency(coupon.discountAmount.amount, 'INR')}
                  </Badge>
                </div>
              ))}
            </>
          )}
          
          {renderPriceLine(
            'Shipping',
            pricing.shipping,
            false,
            false
          )}
          
          {pricing.shipping === 0 && selectedShippingMethod && (
            <div className="flex items-center gap-2 pl-4 py-1">
              <TruckIcon className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                FREE {selectedShippingMethod.name}
              </span>
            </div>
          )}
          
          {renderPriceLine('Tax (GST 18%)', pricing.tax)}
        </div>

        {/* Total */}
        <div className="pt-4 border-t-2 border-gray-900">
          {renderPriceLine('Total', pricing.total, true)}
        </div>

        {/* Savings Badge */}
        {pricing.savings > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900">
              You&apos;re saving {formatCurrency(pricing.savings, 'INR')}!
            </span>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          variant="gradient"
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0 || isProcessing}
          className="w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </Button>

        {/* Trust Indicators */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheckIcon className="h-4 w-4 text-green-600" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        {/* Additional Info */}
        {showDetailed && (
          <div className="pt-4 border-t border-gray-200">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                <span className="flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                  Price Details
                </span>
                <span className="group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <p>
                  • Prices include all applicable taxes
                </p>
                <p>
                  • Shipping costs calculated at checkout based on delivery location
                </p>
                <p>
                  • Discounts and coupons applied automatically
                </p>
                <p>
                  • Final price may vary based on payment method
                </p>
              </div>
            </details>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CartSummary;
