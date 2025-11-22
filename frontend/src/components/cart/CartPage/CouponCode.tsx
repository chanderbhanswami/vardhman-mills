'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TagIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import type { AppliedCoupon } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CouponCodeProps {
  /**
   * Applied coupons
   */
  appliedCoupons?: AppliedCoupon[];

  /**
   * Current cart subtotal
   */
  subtotal: number;

  /**
   * Callback when coupon is applied
   */
  onApplyCoupon: (code: string) => Promise<void>;

  /**
   * Callback when coupon is removed
   */
  onRemoveCoupon: (couponId: string) => Promise<void>;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface PopularCoupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  validUntil?: Date;
  isPopular?: boolean;
}

// ============================================================================
// MOCK DATA (Replace with API)
// ============================================================================

const POPULAR_COUPONS: PopularCoupon[] = [
  {
    code: 'WELCOME10',
    title: 'Welcome Offer',
    description: 'Get 10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    isPopular: true,
  },
  {
    code: 'SAVE200',
    title: 'Flat ₹200 OFF',
    description: 'Save ₹200 on orders above ₹1500',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 1500,
  },
  {
    code: 'MEGA50',
    title: 'Mega Sale',
    description: 'Flat 50% off on selected items',
    discountType: 'percentage',
    discountValue: 50,
    minOrderValue: 1000,
    validUntil: new Date('2025-12-31'),
    isPopular: true,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CouponCode: React.FC<CouponCodeProps> = ({
  appliedCoupons = [],
  subtotal,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading = false,
  className,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle apply coupon
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccess(null);

    try {
      await onApplyCoupon(couponCode.trim().toUpperCase());
      setSuccess(`Coupon "${couponCode}" applied successfully!`);
      setCouponCode('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to apply coupon');
    } finally {
      setIsApplying(false);
    }
  }, [couponCode, onApplyCoupon]);

  // Handle remove coupon
  const handleRemoveCoupon = useCallback(async (couponId: string) => {
    try {
      await onRemoveCoupon(couponId);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to remove coupon');
    }
  }, [onRemoveCoupon]);

  // Handle apply popular coupon
  const handleApplyPopularCoupon = useCallback(async (coupon: PopularCoupon) => {
    // Check min order value
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setError(`Minimum order value of ${formatCurrency(coupon.minOrderValue, 'INR')} required`);
      return;
    }

    setCouponCode(coupon.code);
    await handleApplyCoupon();
  }, [subtotal, handleApplyCoupon]);

  // Check if coupon is already applied
  const isCouponApplied = (code: string) => {
    return appliedCoupons.some(c => c.code.toUpperCase() === code.toUpperCase());
  };

  // Filter available coupons
  const availableCoupons = POPULAR_COUPONS.filter(coupon => {
    return !isCouponApplied(coupon.code) && 
           (!coupon.minOrderValue || subtotal >= coupon.minOrderValue);
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Coupon Input */}
      <div className="space-y-2">
        <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-900">
          Have a coupon code?
        </label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCoupon();
                }
              }}
              placeholder="Enter coupon code"
              disabled={isApplying || isLoading}
              className="pl-10"
            />
          </div>
          
          <Button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || isApplying || isLoading}
            variant="gradient"
            size="md"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-900">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-900">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Applied Coupons */}
      {appliedCoupons.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Applied Coupons</h4>
          <div className="space-y-2">
            {appliedCoupons.map((coupon) => (
              <motion.div
                key={coupon.couponId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TicketIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      You saved {formatCurrency(coupon.discountAmount.amount, 'INR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCoupon(coupon.couponId)}
                  className="flex-shrink-0"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Coupons */}
      {showSuggestions && availableCoupons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
              Available Coupons
            </h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>

          <div className="space-y-2">
            {availableCoupons.map((coupon) => (
              <motion.div
                key={coupon.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer group"
                onClick={() => handleApplyPopularCoupon(coupon)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="font-mono font-bold"
                      >
                        {coupon.code}
                      </Badge>
                      {coupon.isPopular && (
                        <Badge variant="gradient" size="sm">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">
                      {coupon.title}
                    </h5>
                    <p className="text-xs text-gray-600 mb-2">
                      {coupon.description}
                    </p>
                    {coupon.minOrderValue && (
                      <p className="text-xs text-gray-500">
                        Min. order: {formatCurrency(coupon.minOrderValue, 'INR')}
                      </p>
                    )}
                    {coupon.validUntil && (
                      <p className="text-xs text-gray-500">
                        Valid until: {coupon.validUntil.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
                  >
                    Apply
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Show Suggestions Button */}
      {!showSuggestions && availableCoupons.length > 0 && (
        <button
          onClick={() => setShowSuggestions(true)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          <SparklesIcon className="h-4 w-4" />
          View {availableCoupons.length} available {availableCoupons.length === 1 ? 'coupon' : 'coupons'}
        </button>
      )}
    </div>
  );
};

export default CouponCode;
