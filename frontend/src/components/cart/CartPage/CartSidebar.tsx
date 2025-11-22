'use client';

import React from 'react';
import {
  ShieldCheckIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import CartSummary from './CartSummary';
import CouponCode from './CouponCode';
import ShippingCalculator from './ShippingCalculator';
import type { CartItem, AppliedCoupon, ShippingMethod } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartSidebarProps {
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
   * Callback when continue shopping is clicked
   */
  onContinueShopping?: () => void;

  /**
   * Callback when coupon is applied
   */
  onApplyCoupon?: (code: string) => Promise<void>;

  /**
   * Callback when coupon is removed
   */
  onRemoveCoupon?: (couponId: string) => Promise<void>;

  /**
   * Callback when shipping method is selected
   */
  onSelectShippingMethod?: (method: ShippingMethod) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Processing checkout
   */
  isProcessing?: boolean;

  /**
   * Free shipping threshold
   */
  freeShippingThreshold?: number;

  /**
   * Sticky on desktop
   */
  sticky?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// PAYMENT METHOD ICONS
// ============================================================================

const PAYMENT_METHODS = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'UPI', icon: '📱' },
  { name: 'Paytm', icon: '💰' },
  { name: 'GPay', icon: '💳' },
  { name: 'PhonePe', icon: '📱' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartSidebar: React.FC<CartSidebarProps> = ({
  items,
  appliedCoupons = [],
  selectedShippingMethod,
  onCheckout,
  onContinueShopping,
  onApplyCoupon,
  onRemoveCoupon,
  onSelectShippingMethod,
  isLoading = false,
  isProcessing = false,
  freeShippingThreshold = 500,
  sticky = true,
  className,
}) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice.amount, 0);

  // Handle checkout
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      window.location.href = '/products';
    }
  };

  return (
    <aside
      className={cn(
        'w-full lg:w-96 space-y-6',
        sticky && 'lg:sticky lg:top-24',
        className
      )}
    >
      {/* Cart Summary */}
      <CartSummary
        items={items}
        appliedCoupons={appliedCoupons}
        selectedShippingMethod={selectedShippingMethod}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
        freeShippingThreshold={freeShippingThreshold}
      />

      {/* Coupon Code */}
      {onApplyCoupon && onRemoveCoupon && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <CouponCode
            appliedCoupons={appliedCoupons}
            subtotal={subtotal}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Shipping Calculator */}
      {onSelectShippingMethod && (
        <ShippingCalculator
          subtotal={subtotal}
          selectedMethod={selectedShippingMethod}
          onSelectMethod={onSelectShippingMethod}
          freeShippingThreshold={freeShippingThreshold}
        />
      )}

      {/* Continue Shopping Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleContinueShopping}
        className="w-full flex items-center justify-center gap-2"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Continue Shopping
      </Button>

      {/* Trust Badges */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          Why Shop With Us?
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Secure Checkout</h4>
              <p className="text-xs text-gray-600">
                SSL encrypted payment gateway
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Free Shipping</h4>
              <p className="text-xs text-gray-600">
                On orders above ₹{freeShippingThreshold}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCardIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Easy Returns</h4>
              <p className="text-xs text-gray-600">
                30-day hassle-free returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          We Accept
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {PAYMENT_METHODS.map((method, index) => (
            <Badge
              key={index}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
            >
              <span>{method.icon}</span>
              <span className="text-xs">{method.name}</span>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          All major payment methods accepted
        </p>
      </div>

      {/* Help & Support */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-600">
          Need help? Contact our support team
        </p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <a
            href="tel:+911234567890"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            📞 Call Us
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="mailto:support@vardhmanmills.com"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ✉️ Email
          </a>
        </div>
      </div>
    </aside>
  );
};

export default CartSidebar;
