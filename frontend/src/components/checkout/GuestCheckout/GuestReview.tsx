'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PencilIcon,
  TagIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import type { Address } from '@/types/common.types';
import Image from 'next/image';

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createAccount?: boolean;
}

interface ShippingInfo {
  address: Address;
  method: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  deliveryInstructions?: string;
  giftWrap?: boolean;
  giftMessage?: string;
}

interface BillingInfo {
  address: Address;
  sameAsShipping: boolean;
}

interface PaymentInfo {
  method: string;
  last4?: string;
  brand?: string;
  upiId?: string;
  bankName?: string;
  walletName?: string;
}

interface CartItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

interface GuestReviewProps {
  contactInfo: ContactInfo;
  shippingInfo: ShippingInfo;
  billingInfo: BillingInfo;
  paymentInfo: PaymentInfo;
  cartItems: CartItem[];
  orderSummary: OrderSummary;
  onEdit: (section: 'contact' | 'shipping' | 'billing' | 'payment') => void;
  onPlaceOrder: () => void;
  onBack?: () => void;
  isProcessing?: boolean;
}

export const GuestReview: React.FC<GuestReviewProps> = ({
  contactInfo,
  shippingInfo,
  billingInfo,
  paymentInfo,
  cartItems,
  orderSummary,
  onEdit,
  onPlaceOrder,
  onBack,
  isProcessing = false,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // This should call an actual API to validate and apply coupon
    toast.success('Coupon applied successfully!');
    setIsApplyingCoupon(false);
  };

  const handlePlaceOrder = () => {
    if (!acceptedTerms) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    if (!acceptedPrivacy) {
      toast.error('Please accept the Privacy Policy');
      return;
    }

    onPlaceOrder();
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentInfo.method) {
      case 'card':
        return `${paymentInfo.brand || 'Card'} ending in ${paymentInfo.last4}`;
      case 'upi':
        return `UPI: ${paymentInfo.upiId}`;
      case 'netbanking':
        return `Net Banking: ${paymentInfo.bankName}`;
      case 'wallet':
        return `${paymentInfo.walletName} Wallet`;
      case 'emi':
        return `EMI: ${paymentInfo.bankName}`;
      case 'cod':
        return 'Cash on Delivery';
      default:
        return paymentInfo.method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <p className="text-sm text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          <Badge variant="info" size="sm">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total
          </Badge>
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              {item.image && (
                <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                {item.variant && (
                  <p className="text-xs text-gray-600 mt-1">{item.variant}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" size="sm">
                    Qty: {item.quantity}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Unit Price</p>
                <p className="text-sm font-medium text-gray-900">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit('contact')}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Name</p>
            <p className="text-sm font-medium text-gray-900">
              {contactInfo.firstName} {contactInfo.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{contactInfo.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Phone</p>
            <p className="text-sm font-medium text-gray-900">{contactInfo.phone}</p>
          </div>
          {contactInfo.createAccount && (
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">Account will be created</span>
            </div>
          )}
        </div>
      </Card>

      {/* Shipping Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Shipping Details</h3>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit('shipping')}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Shipping Address</p>
            <p className="text-sm font-medium text-gray-900">
              {shippingInfo.address.firstName} {shippingInfo.address.lastName}
            </p>
            <p className="text-sm text-gray-700">{shippingInfo.address.addressLine1}</p>
            {shippingInfo.address.addressLine2 && (
              <p className="text-sm text-gray-700">{shippingInfo.address.addressLine2}</p>
            )}
            <p className="text-sm text-gray-700">
              {shippingInfo.address.city}, {shippingInfo.address.state}{' '}
              {shippingInfo.address.postalCode}
            </p>
            <p className="text-sm text-gray-700">{shippingInfo.address.country}</p>
            <p className="text-sm text-gray-700 mt-1">Phone: {shippingInfo.address.phone}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Shipping Method</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{shippingInfo.method.name}</p>
              {shippingInfo.method.price === 0 ? (
                <Badge variant="success" size="sm">
                  FREE
                </Badge>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  ₹{shippingInfo.method.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Estimated delivery: {shippingInfo.method.estimatedDays}
            </p>
          </div>

          {shippingInfo.deliveryInstructions && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Delivery Instructions</p>
              <p className="text-sm text-gray-700">{shippingInfo.deliveryInstructions}</p>
            </div>
          )}

          {shippingInfo.giftWrap && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Gift Wrapped</span>
              </div>
              {shippingInfo.giftMessage && (
                <div className="pl-7">
                  <p className="text-xs text-gray-600 mb-1">Gift Message</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{shippingInfo.giftMessage}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Billing Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit('billing')}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {billingInfo.sameAsShipping ? (
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-900">Same as shipping address</span>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {billingInfo.address.firstName} {billingInfo.address.lastName}
            </p>
            <p className="text-sm text-gray-700">{billingInfo.address.addressLine1}</p>
            {billingInfo.address.addressLine2 && (
              <p className="text-sm text-gray-700">{billingInfo.address.addressLine2}</p>
            )}
            <p className="text-sm text-gray-700">
              {billingInfo.address.city}, {billingInfo.address.state}{' '}
              {billingInfo.address.postalCode}
            </p>
            <p className="text-sm text-gray-700">{billingInfo.address.country}</p>
            <p className="text-sm text-gray-700 mt-1">Phone: {billingInfo.address.phone}</p>
          </div>
        )}
      </Card>

      {/* Payment Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit('payment')}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {getPaymentMethodDisplay()}
            </span>
          </div>
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
        </div>
      </Card>

      {/* Coupon Code */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TagIcon className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Apply Coupon</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isApplyingCoupon}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon || !couponCode.trim()}
          >
            {isApplyingCoupon ? 'Applying...' : 'Apply'}
          </Button>
        </div>

        {orderSummary.discount > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Coupon Applied!</span>
            </div>
            <span className="text-sm font-semibold text-green-700">
              -₹{orderSummary.discount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </Card>

      {/* Order Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              ₹{orderSummary.subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            {orderSummary.shipping === 0 ? (
              <Badge variant="success" size="sm">
                FREE
              </Badge>
            ) : (
              <span className="font-medium text-gray-900">
                ₹{orderSummary.shipping.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tax (GST)</span>
            <span className="font-medium text-gray-900">
              ₹{orderSummary.tax.toLocaleString('en-IN')}
            </span>
          </div>

          {orderSummary.discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="font-medium text-green-600">
                -₹{orderSummary.discount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{orderSummary.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {orderSummary.discount > 0 && (
            <div className="pt-2">
              <p className="text-sm text-green-700 font-medium text-center">
                You saved ₹{orderSummary.discount.toLocaleString('en-IN')} on this order!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Terms and Conditions */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
              I accept the{' '}
              <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="marketing"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="marketing" className="text-sm text-gray-700 cursor-pointer">
              I want to receive exclusive offers and updates via email
            </label>
          </div>

          {(!acceptedTerms || !acceptedPrivacy) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <ExclamationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please accept the Terms & Conditions and Privacy Policy to place your order
              </p>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Place Order Button */}
      <div className="flex items-center justify-between gap-4">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 md:flex-none">
            Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          variant="default"
          onClick={handlePlaceOrder}
          disabled={isProcessing || !acceptedTerms || !acceptedPrivacy}
          className="flex-1 md:flex-none min-w-[250px] bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing Order...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              Place Order - ₹{orderSummary.total.toLocaleString('en-IN')}
            </span>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Your order is secure</p>
            <p className="text-blue-700">
              We use industry-standard encryption to protect your personal information. An order
              confirmation will be sent to {contactInfo.email} after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
