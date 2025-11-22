'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TagIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  TicketIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import type { AppliedDiscount, AppliedCoupon } from '@/types/cart.types';
import type { Price, Timestamp, ID } from '@/types/common.types';

// Extended Coupon interface for available coupons
export interface Coupon {
  id: ID;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'shipping' | 'buy_x_get_y';
  discountValue: number;
  minimumAmount?: Price;
  maximumDiscount?: Price;
  validFrom: Timestamp;
  validUntil?: Timestamp;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  isApplicable?: boolean;
}

interface OrderDiscountsProps {
  appliedDiscounts: AppliedDiscount[];
  appliedCoupons: AppliedCoupon[];
  onApplyCoupon?: (couponCode: string) => Promise<{ success: boolean; message?: string }>;
  onRemoveCoupon?: (couponId: ID) => Promise<void>;
  availableCoupons?: Coupon[];
  editable?: boolean;
  totalSavings: Price;
  context?: 'cart' | 'checkout' | 'confirmation';
  className?: string;
}

export function OrderDiscounts({
  appliedDiscounts,
  appliedCoupons,
  onApplyCoupon,
  onRemoveCoupon,
  availableCoupons = [],
  editable = true,
  totalSavings,
  context = 'cart',
  className = '',
}: OrderDiscountsProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [removingCoupon, setRemovingCoupon] = useState<ID | null>(null);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAvailable, setShowAvailable] = useState(false);

  const handleApplyCoupon = async (code: string) => {
    if (!onApplyCoupon || !code.trim()) {
      setValidationMessage({ type: 'error', message: 'Please enter a coupon code' });
      return;
    }

    setIsApplying(true);
    setValidationMessage(null);

    try {
      const result = await onApplyCoupon(code.trim().toUpperCase());
      
      if (result.success) {
        setValidationMessage({ type: 'success', message: result.message || 'Coupon applied successfully!' });
        setCouponCode('');
        toast.success('Coupon applied!');
      } else {
        setValidationMessage({ type: 'error', message: result.message || 'Invalid or expired coupon code' });
        toast.error(result.message || 'Failed to apply coupon');
      }
    } catch (error) {
      setValidationMessage({ type: 'error', message: 'Failed to apply coupon. Please try again.' });
      toast.error('Failed to apply coupon');
      console.error('Apply coupon error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async (couponId: ID) => {
    if (!onRemoveCoupon) return;

    setRemovingCoupon(couponId);
    try {
      await onRemoveCoupon(couponId);
      toast.success('Coupon removed');
    } catch (error) {
      toast.error('Failed to remove coupon');
      console.error('Remove coupon error:', error);
    } finally {
      setRemovingCoupon(null);
    }
  };

  const isCouponExpired = (coupon: Coupon): boolean => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const isCouponApplicable = (coupon: Coupon): boolean => {
    return coupon.isActive && !isCouponExpired(coupon) && 
           (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);
  };

  const getDiscountTypeDisplay = (type: AppliedDiscount['type']): string => {
    const typeMap: Record<AppliedDiscount['type'], string> = {
      automatic: 'Automatic Discount',
      coupon: 'Coupon Discount',
      loyalty: 'Loyalty Reward',
      bulk: 'Bulk Discount',
      member: 'Member Discount',
    };
    return typeMap[type] || type;
  };

  const getDiscountDescription = (discount: AppliedDiscount): string => {
    if (discount.percentage) {
      return `${discount.percentage}% off`;
    } else if (discount.amount) {
      return discount.description || `${discount.amount.formatted} discount`;
    }
    return discount.description || 'Discount applied';
  };

  const hasDiscounts = appliedDiscounts.length > 0 || appliedCoupons.length > 0;
  const isReadOnly = context === 'confirmation' || !editable;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Applied Coupons */}
      {appliedCoupons.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-green-600" />
            Applied Coupons
          </h3>
          
          <AnimatePresence mode="popLayout">
            {appliedCoupons.map((coupon) => (
              <motion.div
                key={coupon.couponId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="success" size="sm" className="font-mono">
                        {coupon.code}
                      </Badge>
                      <span className="text-sm font-semibold text-green-900">
                        {coupon.title}
                      </span>
                    </div>
                    
                    <p className="text-sm font-bold text-green-600 mt-1">
                      -{coupon.discountAmount.formatted} saved
                    </p>
                  </div>
                </div>

                {!isReadOnly && onRemoveCoupon && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCoupon(coupon.couponId)}
                    disabled={removingCoupon === coupon.couponId}
                    className="flex-shrink-0 ml-2 text-red-600 hover:bg-red-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Applied Discounts (Auto-applied) */}
      {appliedDiscounts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            Applied Discounts
          </h3>
          
          <div className="space-y-2">
            {appliedDiscounts.map((discount, index) => (
              <motion.div
                key={discount.discountId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-blue-900">
                        {discount.name}
                      </span>
                      <Badge variant="info" size="sm">
                        {getDiscountTypeDisplay(discount.type)}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1">
                      {getDiscountDescription(discount)}
                    </p>
                    
                    <p className="text-sm font-bold text-blue-600">
                      -{discount.amount.formatted} saved
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Coupon Form */}
      {!isReadOnly && onApplyCoupon && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Have a Coupon Code?</h3>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyCoupon(couponCode);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setValidationMessage(null);
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono text-sm"
              disabled={isApplying}
            />
            <Button
              type="submit"
              variant="gradient"
              size="md"
              disabled={isApplying || !couponCode.trim()}
              className="px-6"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          </form>

          {/* Validation Message */}
          {validationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                validationMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {validationMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{validationMessage.message}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Available Coupons */}
      {!isReadOnly && availableCoupons.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowAvailable(!showAvailable)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>Available Coupons ({availableCoupons.length})</span>
            <motion.div
              animate={{ rotate: showAvailable ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {showAvailable && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                {availableCoupons.map((coupon) => {
                  const isExpired = isCouponExpired(coupon);
                  const applicable = isCouponApplicable(coupon);

                  return (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 border-2 border-dashed rounded-lg ${
                        applicable
                          ? 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant={applicable ? 'outline' : 'secondary'}
                              size="sm"
                              className="font-mono"
                            >
                              {coupon.code}
                            </Badge>
                            {isExpired && (
                              <Badge variant="destructive" size="sm">Expired</Badge>
                            )}
                            {!coupon.isActive && (
                              <Badge variant="secondary" size="sm">Inactive</Badge>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {coupon.name}
                          </p>

                          {coupon.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {coupon.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            {coupon.minimumAmount && (
                              <span>Min: {coupon.minimumAmount.formatted}</span>
                            )}
                            {coupon.maximumDiscount && (
                              <span>Max discount: {coupon.maximumDiscount.formatted}</span>
                            )}
                            {coupon.validUntil && (
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Valid until {new Date(coupon.validUntil).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {applicable && onApplyCoupon && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={isApplying}
                            className="flex-shrink-0"
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Total Savings Display */}
      {hasDiscounts && totalSavings.amount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6" />
              <div>
                <p className="text-sm font-medium opacity-90">Total Savings</p>
                <p className="text-2xl font-bold">{totalSavings.formatted}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">
                {appliedCoupons.length + appliedDiscounts.length} {
                  appliedCoupons.length + appliedDiscounts.length === 1 ? 'offer' : 'offers'
                } applied
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!hasDiscounts && isReadOnly && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-3">
            <TagIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No discounts or coupons applied</p>
        </div>
      )}
    </div>
  );
}
