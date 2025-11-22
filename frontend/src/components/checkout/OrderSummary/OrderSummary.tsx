'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  TagIcon,
  CalculatorIcon,
  TruckIcon,
  CreditCardIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { OrderItems } from './OrderItems';
import { OrderTotals, type OrderTaxBreakdown, type AdditionalCharge } from './OrderTotals';
import { OrderDiscounts, type Coupon } from './OrderDiscounts';
import type { Order, OrderItem, Cart, CartItem, AppliedCoupon, AppliedDiscount } from '@/types/cart.types';
import type { ID, Price } from '@/types/common.types';

interface OrderSummaryProps {
  order?: Order;
  cart?: Cart;
  items: CartItem[] | OrderItem[];
  context: 'cart' | 'checkout' | 'confirmation';
  editable?: boolean;
  compact?: boolean;
  sticky?: boolean;
  onUpdateItem?: (itemId: ID, quantity: number) => void;
  onRemoveItem?: (itemId: ID) => void;
  onApplyCoupon?: (code: string) => Promise<{ success: boolean; message: string; discount?: AppliedDiscount }>;
  onRemoveCoupon?: (couponId: ID) => void;
  onSaveForLater?: (itemId: ID) => void;
  onMoveToWishlist?: (itemId: ID) => void;
  availableCoupons?: Coupon[];
  showGiftOptions?: boolean;
  className?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  cart,
  items,
  context,
  editable = false,
  compact = false,
  sticky = false,
  onUpdateItem,
  onRemoveItem,
  onApplyCoupon,
  onRemoveCoupon,
  onSaveForLater,
  onMoveToWishlist,
  availableCoupons = [],
  showGiftOptions = false,
  className = ''
}) => {
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [discountsExpanded, setDiscountsExpanded] = useState(true);
  const [totalsExpanded, setTotalsExpanded] = useState(true);

  // Get data source (order or cart)
  const dataSource = order || cart;
  
  if (!dataSource) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No order or cart data available</p>
      </Card>
    );
  }

  // Extract pricing data
  const subtotal: Price = dataSource.subtotal;
  const shipping: Price = dataSource.shippingAmount;
  const tax: Price = dataSource.taxAmount;
  const discount: Price = dataSource.discountAmount;
  const total: Price = dataSource.total;
  const currency = dataSource.currency;

  // Get applied coupons and discounts
  const appliedCoupons: AppliedCoupon[] = dataSource.appliedCoupons || [];
  const appliedDiscounts: AppliedDiscount[] = dataSource.appliedDiscounts || [];

  // Get order metadata
  const orderNumber = order?.orderNumber;
  const orderDate = order?.createdAt || dataSource.createdAt;
  const paymentMethod = order?.paymentMethod;
  const shippingMethod = dataSource.shippingMethod;

  // Calculate tax breakdown
  const taxBreakdown: OrderTaxBreakdown[] = [];
  if (tax.amount > 0) {
    // For Indian GST (assuming 18% total: 9% CGST + 9% SGST)
    const taxableAmount = subtotal.amount - discount.amount;
    const cgstRate = 9;
    const sgstRate = 9;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;

    taxBreakdown.push({
      name: 'CGST',
      type: 'cgst',
      rate: cgstRate,
      amount: {
        amount: cgstAmount,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(cgstAmount)
      },
      taxableAmount: {
        amount: taxableAmount,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(taxableAmount)
      }
    });

    taxBreakdown.push({
      name: 'SGST',
      type: 'sgst',
      rate: sgstRate,
      amount: {
        amount: sgstAmount,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(sgstAmount)
      },
      taxableAmount: {
        amount: taxableAmount,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(taxableAmount)
      }
    });
  }

  // Calculate additional charges
  const additionalCharges: AdditionalCharge[] = [];
  
  // Check for gift wrap charges
  const giftWrapCharge = items.reduce((total, item) => {
    if (item.giftWrap && item.giftWrap.price) {
      return total + (item.giftWrap.price.amount * item.quantity);
    }
    return total;
  }, 0);

  if (giftWrapCharge > 0) {
    additionalCharges.push({
      name: 'Gift Wrap',
      amount: {
        amount: giftWrapCharge,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(giftWrapCharge)
      },
      description: 'Special gift wrapping service'
    });
  }

  // Check for COD charges
  if (paymentMethod?.type === 'cash_on_delivery') {
    const codCharge = 50; // Example COD charge
    additionalCharges.push({
      name: 'COD Charges',
      amount: {
        amount: codCharge,
        currency: currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency
        }).format(codCharge)
      },
      description: 'Cash on Delivery handling fee'
    });
  }

  // Get payment method display
  const getPaymentMethodDisplay = (): string => {
    if (!paymentMethod) return 'Not selected';
    
    const typeMap: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      digital_wallet: 'Digital Wallet',
      bank_transfer: 'Bank Transfer',
      cash_on_delivery: 'Cash on Delivery',
      emi: 'EMI',
      gift_card: 'Gift Card'
    };

    return typeMap[paymentMethod.type] || paymentMethod.type;
  };

  const isReadOnly = context === 'confirmation';
  const showEditableFeatures = editable && !isReadOnly;

  return (
    <div className={`${sticky ? 'sticky top-8' : ''} ${className}`}>
      <Card className={`overflow-hidden ${compact ? 'p-4' : 'p-6'}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className={`font-bold text-gray-900 flex items-center gap-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
              <ShoppingBagIcon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
              {context === 'cart' ? 'Shopping Cart' : context === 'checkout' ? 'Order Summary' : 'Order Details'}
            </h2>
            
            {orderNumber && (
              <Badge variant="info" size={compact ? 'sm' : 'md'}>
                #{orderNumber}
              </Badge>
            )}
          </div>

          {/* Order Metadata */}
          {(orderDate || paymentMethod || shippingMethod) && (
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-3">
              {orderDate && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(orderDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {paymentMethod && (
                <div className="flex items-center gap-1">
                  <CreditCardIcon className="h-4 w-4" />
                  <span>{getPaymentMethodDisplay()}</span>
                </div>
              )}
              
              {shippingMethod && (
                <div className="flex items-center gap-1">
                  <TruckIcon className="h-4 w-4" />
                  <span>{shippingMethod.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Items Section */}
        <div className="mb-6">
          <button
            onClick={() => setItemsExpanded(!itemsExpanded)}
            className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5" />
              Items ({items.length})
            </span>
            {itemsExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>

          <AnimatePresence>
            {itemsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <OrderItems
                  items={items}
                  editable={showEditableFeatures}
                  onUpdateQuantity={onUpdateItem ? async (itemId, quantity) => onUpdateItem(itemId, quantity) : undefined}
                  onRemove={onRemoveItem ? async (itemId) => onRemoveItem(itemId) : undefined}
                  onSaveForLater={onSaveForLater ? async (itemId) => onSaveForLater(itemId) : undefined}
                  onMoveToWishlist={onMoveToWishlist ? async (itemId) => onMoveToWishlist(itemId) : undefined}
                  showImages={!compact}
                  compact={compact}
                  maxItems={compact ? 3 : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discounts Section */}
        {(appliedCoupons.length > 0 || appliedDiscounts.length > 0 || showEditableFeatures) && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <button
              onClick={() => setDiscountsExpanded(!discountsExpanded)}
              className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <TagIcon className="h-5 w-5" />
                Discounts & Offers
                {(appliedCoupons.length + appliedDiscounts.length) > 0 && (
                  <Badge variant="success" size="sm">
                    {appliedCoupons.length + appliedDiscounts.length}
                  </Badge>
                )}
              </span>
              {discountsExpanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>

            <AnimatePresence>
              {discountsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <OrderDiscounts
                    appliedDiscounts={appliedDiscounts}
                    appliedCoupons={appliedCoupons}
                    onApplyCoupon={onApplyCoupon}
                    onRemoveCoupon={onRemoveCoupon ? async (couponId) => onRemoveCoupon(couponId) : undefined}
                    availableCoupons={availableCoupons}
                    editable={showEditableFeatures}
                    totalSavings={discount}
                    context={context}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Gift Options */}
        {showGiftOptions && showEditableFeatures && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <GiftIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Make it special</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Add gift wrapping and a personalized message to your order
                  </p>
                  <Button variant="outline" size="sm">
                    Add Gift Options
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Totals Section */}
        <div>
          <button
            onClick={() => setTotalsExpanded(!totalsExpanded)}
            className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-4"
          >
            <span className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5" />
              Order Total
            </span>
            {totalsExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>

          <AnimatePresence>
            {totalsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OrderTotals
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={discount}
                  total={total}
                  taxBreakdown={taxBreakdown}
                  additionalCharges={additionalCharges}
                  showDetails={!compact}
                  currency={currency}
                  itemCount={items.length}
                  freeShippingThreshold={context === 'cart' ? 2000 : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Additional Info */}
        {context !== 'confirmation' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>All prices are inclusive of applicable taxes</p>
                {context === 'cart' && (
                  <p>Items in your cart are not reserved. Complete checkout to confirm your order.</p>
                )}
                {context === 'checkout' && (
                  <p>By placing your order, you agree to our Terms & Conditions and Privacy Policy.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Security Badge */}
      {context === 'checkout' && (
        <div className="mt-4 text-center">
          <Tooltip content="Your payment information is secure and encrypted">
            <div className="inline-flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Checkout</span>
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
