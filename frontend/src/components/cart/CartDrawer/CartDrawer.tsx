/**
 * CartDrawer Component - Vardhman Mills Frontend
 * 
 * A comprehensive slide-out cart drawer with:
 * - Smooth animations
 * - Cart item list
 * - Cart summary
 * - Quick actions
 * - Empty state
 * - Loading states
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TruckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { CartActions } from './CartActions';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartDrawerProps {
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;

  /**
   * Callback when drawer should close
   */
  onClose: () => void;

  /**
   * Show drawer from right side
   * @default true
   */
  fromRight?: boolean;

  /**
   * Enable backdrop blur
   * @default true
   */
  enableBackdropBlur?: boolean;

  /**
   * Show item count badge
   * @default true
   */
  showItemCount?: boolean;

  /**
   * Enable quick checkout
   * @default true
   */
  enableQuickCheckout?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  fromRight = true,
  enableBackdropBlur = true,
  showItemCount = true,
  enableQuickCheckout = true,
  className,
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { items, summary, removeFromCart, updateQuantity, isLoading, isUpdating } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Use isClosing for smooth transitions
  const drawerState = isClosing ? 'closing' : 'open';

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isEmpty = items.length === 0;
  const itemCount = summary.itemCount;
  const totalQuantity = summary.totalQuantity;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose]);

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      setRemovingItemId(itemId);
      try {
        await removeFromCart(itemId);
      } catch (error) {
        console.error('Remove item error:', error);
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeFromCart]
  );

  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await updateQuantity(itemId, quantity);
      } catch (error) {
        console.error('Update quantity error:', error);
      }
    },
    [updateQuantity]
  );

  const handleCheckout = useCallback(() => {
    handleClose();
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 300);
  }, [handleClose]);

  const handleContinueShopping = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleViewCart = useCallback(() => {
    handleClose();
    setTimeout(() => {
      window.location.href = '/cart';
    }, 300);
  }, [handleClose]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
          {showItemCount && !isEmpty && (
            <Badge
              variant="default"
              size="sm"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalQuantity}
            </Badge>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
          {showItemCount && !isEmpty && (
            <p className="text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalQuantity} total)
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isUpdating && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Spinner size="sm" />
            <span>Syncing...</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 rounded-full"
          aria-label="Close cart"
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400" />
        </div>
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute top-0 right-0"
        >
          <SparklesIcon className="h-6 w-6 text-yellow-500" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-600 mb-6 max-w-sm">
        Start adding items to your cart and they will appear here.
      </p>

      <Button
        variant="gradient"
        size="lg"
        onClick={handleContinueShopping}
        className="min-w-[200px]"
      >
        Start Shopping
      </Button>

      {/* Trust Badges */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg">
          <TruckIcon className="h-6 w-6 text-green-600" />
          <span className="text-xs font-medium text-green-700">Free Shipping</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <SparklesIcon className="h-6 w-6 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Secure Payment</span>
        </div>
      </div>
    </div>
  );

  const renderCartItems = () => (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="px-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: fromRight ? 20 : -20 }}
              animate={{
                opacity: drawerState === 'closing' ? 0 : 1,
                x: drawerState === 'closing' ? (fromRight ? 20 : -20) : 0,
              }}
              exit={{ opacity: 0, x: fromRight ? 20 : -20, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <CartItem
                item={item}
                onRemove={() => handleRemoveItem(item.id)}
                onUpdateQuantity={(quantity: number) => handleUpdateQuantity(item.id, quantity)}
                isRemoving={removingItemId === item.id}
                compact
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {/* Low stock warnings */}
        {items.some((item) => (item.maxQuantity || 100) < 5 && (item.maxQuantity || 100) > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Some items are low in stock</p>
              <p className="text-xs">Complete your purchase soon to avoid missing out.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="border-t border-gray-200 bg-white">
      {/* Summary */}
      <div className="p-4 border-b border-gray-200">
        <CartSummary compact />
      </div>

      {/* Actions */}
      <div className="p-4">
        <CartActions
          onCheckout={handleCheckout}
          onContinueShopping={handleContinueShopping}
          onViewCart={handleViewCart}
          showClearCart
          showCoupon={enableQuickCheckout}
          showShipping={false}
          disableCheckout={isEmpty}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={cn(
              'fixed inset-0 bg-black/30 transition-opacity',
              enableBackdropBlur && 'backdrop-blur-sm'
            )}
          />
        </Transition.Child>

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={cn(
                'pointer-events-none fixed inset-y-0 flex max-w-full',
                fromRight ? 'right-0 pl-10' : 'left-0 pr-10'
              )}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom={fromRight ? 'translate-x-full' : '-translate-x-full'}
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo={fromRight ? 'translate-x-full' : '-translate-x-full'}
              >
                <Dialog.Panel
                  className={cn(
                    'pointer-events-auto w-screen max-w-md',
                    className
                  )}
                >
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    {renderHeader()}

                    {/* Content */}
                    {isEmpty ? renderEmptyState() : renderCartItems()}

                    {/* Footer */}
                    {!isEmpty && renderFooter()}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartDrawer;
