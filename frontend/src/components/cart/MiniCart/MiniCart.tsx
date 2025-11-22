/**
 * MiniCart Component - Vardhman Mills Frontend
 * 
 * Compact dropdown cart with:
 * - Recent items preview
 * - Quick item count
 * - Total price
 * - Quick actions
 * - Hover/Click trigger
 * - Animations
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { MiniCartItem } from './MiniCartItem';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MiniCartProps {
  /**
   * Trigger type
   * @default 'hover'
   */
  trigger?: 'hover' | 'click';

  /**
   * Max items to show
   * @default 3
   */
  maxItems?: 3;

  /**
   * Show on mobile
   * @default false
   */
  showOnMobile?: boolean;

  /**
   * Position
   * @default 'right'
   */
  position?: 'left' | 'right';

  /**
   * Custom button text
   */
  buttonText?: string;

  /**
   * Show button text
   * @default false
   */
  showButtonText?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * On click cart icon
   */
  onCartClick?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MiniCart: React.FC<MiniCartProps> = ({
  trigger = 'hover',
  maxItems = 3,
  showOnMobile = false,
  position = 'right',
  buttonText = 'Cart',
  showButtonText = false,
  className,
  onCartClick,
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { state } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isEmpty = state.items.length === 0;
  const itemCount = state.summary.totalQuantity;
  const displayItems = state.items.slice(0, maxItems);
  const remainingCount = Math.max(0, state.items.length - maxItems);
  const cartTotal = state.summary.total;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, trigger]);

  // Show animation when items are added
  useEffect(() => {
    if (state.items.length > 0 && !hasInteracted && !isOpen) {
      // Briefly show the mini cart when item is added
      setIsOpen(true);
      setHasInteracted(true);
      setTimeout(() => setIsOpen(false), 2000);
    }
  }, [state.items.length, hasInteracted, isOpen]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover' && !isEmpty) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsOpen(true);
    }
  }, [trigger, isEmpty]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      timerRef.current = setTimeout(() => setIsOpen(false), 300);
    }
  }, [trigger]);

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
    if (onCartClick) {
      onCartClick();
    }
  }, [trigger, isOpen, onCartClick]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block',
        !showOnMobile && 'hidden md:block',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cart Button */}
      <button
        onClick={handleClick}
        className={cn(
          'relative flex items-center gap-2 p-2 rounded-lg transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
          isOpen && 'bg-gray-100'
        )}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <div className="relative">
          {isEmpty ? (
            <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <ShoppingCartSolidIcon className="h-6 w-6 text-blue-600" />
          )}

          {/* Item Count Badge */}
          {!isEmpty && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <Badge
                variant="destructive"
                size="sm"
                className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {state.syncing && (
            <div className="absolute -bottom-1 -right-1">
              <Spinner size="xs" />
            </div>
          )}
        </div>

        {showButtonText && (
          <span className="text-sm font-medium text-gray-700">
            {buttonText}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50',
              position === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Shopping Cart
                </h3>
                <Badge variant="default" size="sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </div>

            {/* Content */}
            {isEmpty ? (
              <div className="p-8 text-center">
                <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">Your cart is empty</p>
                <Link href="/products" onClick={handleClose}>
                  <Button variant="gradient" size="sm">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {displayItems.map((item) => (
                    <MiniCartItem key={item.id} item={item} />
                  ))}

                  {/* Remaining Items */}
                  {remainingCount > 0 && (
                    <Link
                      href="/cart"
                      onClick={handleClose}
                      className="block text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
                    </Link>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Subtotal:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(cartTotal, 'INR')}
                    </span>
                  </div>

                  {/* Savings */}
                  {state.summary.savings > 0 && (
                    <div className="flex items-center justify-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <SparklesIcon className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Saving {formatCurrency(state.summary.savings, 'INR')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href="/cart" onClick={handleClose} className="flex-1">
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full"
                      >
                        View Cart
                      </Button>
                    </Link>
                    <Link href="/checkout" onClick={handleClose} className="flex-1">
                      <Button
                        variant="gradient"
                        size="md"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                        Checkout
                        <ArrowRightIcon className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MiniCart;
