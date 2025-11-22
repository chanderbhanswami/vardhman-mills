'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  TagIcon,
  InformationCircleIcon,
  PencilIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { UserAddress } from '@/types/address.types';
import type { CartItem } from '@/types/cart.types';
import type { PaymentMethodType } from '@/types/payment.types';
import type { ContactFormData } from './ContactForm';
import type { ShippingFormData } from './ShippingForm';
import type { BillingFormData } from './BillingForm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OrderReviewProps {
  /**
   * Cart items
   */
  cartItems: CartItem[];

  /**
   * Contact information
   */
  contactInfo: ContactFormData;

  /**
   * Shipping information
   */
  shippingInfo: ShippingFormData;

  /**
   * Billing information
   */
  billingInfo: BillingFormData;

  /**
   * Payment method
   */
  paymentMethod: PaymentMethodType;

  /**
   * Order totals
   */
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };

  /**
   * Applied coupon code
   */
  appliedCoupon?: string;

  /**
   * Callback when edit is clicked
   */
  onEditSection?: (section: 'contact' | 'shipping' | 'billing' | 'payment') => void;

  /**
   * Callback when coupon is applied
   */
  onApplyCoupon?: (code: string) => Promise<boolean>;

  /**
   * Callback when coupon is removed
   */
  onRemoveCoupon?: () => void;

  /**
   * Callback when order is placed
   */
  onPlaceOrder: () => void | Promise<void>;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format address for display
 */
const formatAddress = (address: UserAddress): string => {
  return `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}${address.city}, ${address.state} ${address.postalCode}`;
};;

/**
 * Format payment method for display
 */
const formatPaymentMethod = (method: PaymentMethodType): string => {
  const map: Record<PaymentMethodType, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI',
    net_banking: 'Net Banking',
    digital_wallet: 'Digital Wallet',
    emi: 'EMI / Pay Later',
    cash_on_delivery: 'Cash on Delivery',
    gift_card: 'Gift Card',
    store_credit: 'Store Credit',
    bank_transfer: 'Bank Transfer',
    cryptocurrency: 'Cryptocurrency',
    buy_now_pay_later: 'Buy Now Pay Later',
  };
  return map[method] || method;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * OrderReview Component
 * 
 * Comprehensive order review with all checkout details.
 * Features:
 * - Cart items summary with images
 * - Contact information display
 * - Shipping and billing addresses
 * - Payment method display
 * - Order totals breakdown
 * - Coupon code application
 * - Edit buttons for each section
 * - Terms and conditions acceptance
 * - Place order button
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <OrderReview
 *   cartItems={items}
 *   contactInfo={contact}
 *   shippingInfo={shipping}
 *   billingInfo={billing}
 *   paymentMethod="credit_card"
 *   totals={totals}
 *   onPlaceOrder={handlePlaceOrder}
 * />
 * ```
 */
export const OrderReview: React.FC<OrderReviewProps> = ({
  cartItems,
  contactInfo,
  shippingInfo,
  billingInfo,
  paymentMethod,
  totals,
  appliedCoupon,
  onEditSection,
  onApplyCoupon,
  onRemoveCoupon,
  onPlaceOrder,
  onCancel,
  isLoading = false,
  className,
}) => {
  // State
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (!onApplyCoupon) return;

    setIsCouponApplying(true);
    try {
      const success = await onApplyCoupon(couponCode.trim());
      if (success) {
        toast.success('Coupon applied successfully!');
        setCouponCode('');
      } else {
        toast.error('Invalid or expired coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setIsCouponApplying(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon();
      toast.success('Coupon removed');
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!acceptTerms) {
      toast.error('Please accept terms and conditions');
      return;
    }

    if (!acceptPrivacy) {
      toast.error('Please accept privacy policy');
      return;
    }

    try {
      await onPlaceOrder();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  // Calculate savings
  const savings = totals.discount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {/* Order Items */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <ShoppingBagIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h3>
                <p className="text-sm text-gray-600">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div
                key={item.id || index}
                className="flex gap-4 p-3 bg-gray-50 rounded-lg"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.product.media.primaryImage?.url || item.product.media.images[0]?.url || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  {item.variant && (
                    <p className="text-sm text-gray-600 mt-1">
                      Variant: {item.variant.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <div className="font-semibold text-gray-900">
                    ₹{(typeof item.totalPrice === 'number' ? item.totalPrice : 0).toLocaleString('en-IN')}
                  </div>
                  {item.originalPrice && item.originalPrice > item.totalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{(typeof item.originalPrice === 'number' ? item.originalPrice : 0).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h3>
              </div>
            </div>
            {onEditSection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditSection('contact')}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Name:</span>{' '}
              <span className="text-gray-900">
                {contactInfo.firstName} {contactInfo.lastName}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Email:</span>{' '}
              <span className="text-gray-900">{contactInfo.email}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Phone:</span>{' '}
              <span className="text-gray-900">{contactInfo.phone}</span>
            </p>
            {contactInfo.company && (
              <p className="text-sm">
                <span className="font-medium text-gray-700">Company:</span>{' '}
                <span className="text-gray-900">{contactInfo.company}</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Shipping Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping Details
                </h3>
              </div>
            </div>
            {onEditSection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditSection('shipping')}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {/* Address */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Delivery Address
              </p>
              <p className="text-sm text-gray-900">
                {formatAddress(shippingInfo.shippingAddress)}
              </p>
            </div>

            {/* Shipping Method */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Shipping Method
              </p>
              <p className="text-sm text-gray-900">
                {shippingInfo.shippingMethod.name} - ₹{(typeof shippingInfo.shippingMethod.price === 'number' ? shippingInfo.shippingMethod.price : 0).toLocaleString('en-IN')}
              </p>
              {shippingInfo.shippingMethod.estimatedDays && (
                <p className="text-xs text-gray-600 mt-1">
                  Estimated delivery in {shippingInfo.shippingMethod.estimatedDays.min}-
                  {shippingInfo.shippingMethod.estimatedDays.max} days
                </p>
              )}
            </div>

            {/* Delivery Instructions */}
            {shippingInfo.deliveryInstructions && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </p>
                <p className="text-sm text-gray-900">
                  {shippingInfo.deliveryInstructions}
                </p>
              </div>
            )}

            {/* Gift Options */}
            {shippingInfo.giftWrap && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <GiftIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Gift Wrapped
                  </p>
                  {shippingInfo.giftMessage && (
                    <p className="text-sm text-purple-700 mt-1">
                      Message: &quot;{shippingInfo.giftMessage}&quot;
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Billing Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Billing Details
                </h3>
              </div>
            </div>
            {onEditSection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditSection('billing')}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {billingInfo.sameAsShipping ? (
              <p className="text-sm text-gray-900">
                Same as shipping address
              </p>
            ) : (
              <p className="text-sm text-gray-900">
                {formatAddress(billingInfo.billingAddress)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Method
                </h3>
              </div>
            </div>
            {onEditSection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditSection('payment')}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-900">
              {formatPaymentMethod(paymentMethod)}
            </p>
          </div>
        </div>
      </Card>

      {/* Coupon Code */}
      {onApplyCoupon && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TagIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Coupon Code
                </h3>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {appliedCoupon}
                  </span>
                  <Badge variant="default" className="bg-green-600">
                    Applied
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1"
                  disabled={isCouponApplying || isLoading}
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isCouponApplying || isLoading || !couponCode.trim()}
                >
                  {isCouponApplying ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Order Totals */}
      <Card className="p-6 bg-gray-50">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">
            Order Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </span>
              <span className="text-gray-900">
                ₹{totals.subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Shipping</span>
              <span className="text-gray-900">
                {totals.shipping === 0 ? (
                  <Badge variant="default" className="bg-green-600">FREE</Badge>
                ) : (
                  `₹${totals.shipping.toLocaleString('en-IN')}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax</span>
              <span className="text-gray-900">
                ₹{totals.tax.toLocaleString('en-IN')}
              </span>
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Discount</span>
                <span className="text-green-700">
                  -₹{totals.discount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₹{totals.total.toLocaleString('en-IN')}
                </span>
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-600 text-right mt-1">
                  You save ₹{savings.toLocaleString('en-IN')}!
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Terms and Conditions */}
      <Card className="p-6">
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
              aria-label="Accept terms and conditions"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                I accept the{' '}
                <a href="/terms" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-gray-500 mt-1">
                By placing this order, you agree to our terms of service
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
              aria-label="Accept privacy policy"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                I accept the{' '}
                <a href="/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-gray-500 mt-1">
                We respect your privacy and protect your data
              </p>
            </div>
          </label>

          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Your order will be processed securely. You&apos;ll receive a confirmation email once payment is successful.
            </p>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isLoading || !acceptTerms || !acceptPrivacy}
          className="min-w-[250px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Placing Order...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Place Order - ₹{totals.total.toLocaleString('en-IN')}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default OrderReview;
