/**
 * CartSummary Component (CartDrawer) - Vardhman Mills Frontend
 * 
 * Cart price summary with:
 * - Subtotal
 * - Discounts
 * - Shipping
 * - Tax
 * - Total
 * - Savings display
 * - Compact mode
 * 
 * @component
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ReceiptPercentIcon,
  TruckIcon,
  SparklesIcon,
  InformationCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartSummaryProps {
  /**
   * Show in compact mode
   * @default false
   */
  compact?: boolean;

  /**
   * Show detailed breakdown
   * @default true
   */
  showDetails?: boolean;

  /**
   * Show savings
   * @default true
   */
  showSavings?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartSummary: React.FC<CartSummaryProps> = ({
  compact = false,
  showDetails = true,
  showSavings = true,
  className,
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { state } = useCart();
  const summary = state.summary;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasCoupon = !!state.couponCode;
  const hasShipping = summary.shipping > 0;
  const hasTax = summary.tax > 0;
  const hasSavings = summary.savings > 0 || (state.couponDiscount && state.couponDiscount > 0);
  const totalSavings = summary.savings + (state.couponDiscount || 0);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSummaryRow = (
    label: string,
    value: number,
    icon?: React.ReactNode,
    tooltip?: string,
    highlight?: boolean,
    isFree?: boolean
  ) => (
    <div
      className={cn(
        'flex items-center justify-between',
        compact ? 'text-sm' : 'text-base',
        highlight && 'font-semibold'
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn(highlight ? 'text-gray-900' : 'text-gray-700')}>
          {label}
        </span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
          </Tooltip>
        )}
      </div>
      <span className={cn(highlight ? 'text-gray-900' : 'text-gray-700')}>
        {isFree ? (
          <Badge variant="success" size="sm">
            FREE
          </Badge>
        ) : (
          formatCurrency(value, 'INR')
        )}
      </span>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {renderSummaryRow('Subtotal', summary.subtotal, undefined, undefined, false)}
        
        {hasCoupon && state.couponDiscount && state.couponDiscount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              <span>Coupon ({state.couponCode})</span>
            </div>
            <span>-{formatCurrency(state.couponDiscount, 'INR')}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          {renderSummaryRow('Total', summary.total, undefined, undefined, true)}
        </div>

        {hasSavings && showSavings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
          >
            <SparklesIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              You&apos;re saving {formatCurrency(totalSavings, 'INR')}!
            </span>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Subtotal */}
      {renderSummaryRow(
        'Subtotal',
        summary.subtotal,
        undefined,
        `${summary.itemCount} ${summary.itemCount === 1 ? 'item' : 'items'}`
      )}

      {/* Discount */}
      {summary.discount > 0 && (
        <div className="flex items-center justify-between text-green-600">
          <div className="flex items-center gap-2">
            <ReceiptPercentIcon className="h-4 w-4" />
            <span>Discount</span>
          </div>
          <span>-{formatCurrency(summary.discount, 'INR')}</span>
        </div>
      )}

      {/* Coupon */}
      {hasCoupon && state.couponDiscount && state.couponDiscount > 0 && (
        <div className="flex items-center justify-between text-green-600">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            <span>Coupon ({state.couponCode})</span>
          </div>
          <span>-{formatCurrency(state.couponDiscount, 'INR')}</span>
        </div>
      )}

      {showDetails && (
        <>
          {/* Shipping */}
          {renderSummaryRow(
            'Shipping',
            summary.shipping,
            <TruckIcon className="h-4 w-4" />,
            'Calculated at checkout',
            false,
            !hasShipping
          )}

          {/* Tax */}
          {hasTax &&
            renderSummaryRow(
              'Tax',
              summary.tax,
              undefined,
              'Includes GST',
              false
            )}
        </>
      )}

      {/* Total */}
      <div className="pt-3 border-t-2 border-gray-200">
        {renderSummaryRow('Total', summary.total, undefined, undefined, true)}
      </div>

      {/* Savings Banner */}
      {hasSavings && showSavings && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
        >
          <SparklesIcon className="h-5 w-5 text-green-600" />
          <div className="text-center">
            <p className="text-sm font-semibold text-green-700">
              Total Savings: {formatCurrency(totalSavings, 'INR')}
            </p>
            <p className="text-xs text-green-600">
              You&apos;re getting a great deal!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CartSummary;
