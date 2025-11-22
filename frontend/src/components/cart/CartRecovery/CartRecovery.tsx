/**
 * CartRecovery Component - Vardhman Mills Frontend
 * 
 * Abandoned cart recovery with:
 * - Save cart for later
 * - Email cart to self
 * - Share cart link
 * - Restore previous cart
 * - Cart expiry countdown
 * - Recovery incentives
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  EnvelopeIcon,
  LinkIcon,
  ArrowPathIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SavedCart {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  savedAt: string;
  expiresAt: string;
  couponCode?: string;
  incentive?: {
    type: 'discount' | 'free_shipping' | 'gift';
    value: string;
    description: string;
  };
}

export interface CartRecoveryProps {
  /**
   * Current cart data
   */
  currentCart?: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
  };

  /**
   * Saved carts
   */
  savedCarts?: SavedCart[];

  /**
   * On restore cart
   */
  onRestoreCart?: (cartId: string) => Promise<void>;

  /**
   * On save cart
   */
  onSaveCart?: () => Promise<{ cartId: string; expiresAt: string }>;

  /**
   * On email cart
   */
  onEmailCart?: (email: string) => Promise<void>;

  /**
   * On share cart
   */
  onShareCart?: () => Promise<{ shareUrl: string }>;

  /**
   * Show incentives
   * @default true
   */
  showIncentives?: boolean;

  /**
   * Auto-save interval (minutes)
   * @default 5
   */
  autoSaveInterval?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTimeRemaining = (expiresAt: string) => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const remaining = expiry - now;

  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, total: remaining };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartRecovery: React.FC<CartRecoveryProps> = ({
  currentCart,
  savedCarts = [],
  onRestoreCart,
  onSaveCart,
  onEmailCart,
  onShareCart,
  showIncentives = true,
  autoSaveInterval = 5,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [timeUntilNextSave, setTimeUntilNextSave] = useState(autoSaveInterval * 60);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const hasCurrentCart = currentCart && currentCart.items.length > 0;
  const hasSavedCarts = savedCarts.length > 0;

  // ============================================================================
  // EMAIL VALIDATION
  // ============================================================================

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSaveCart = useCallback(
    async (isAutoSave = false) => {
      if (!onSaveCart) return;

      setIsSaving(true);
      try {
        const result = await onSaveCart();
        setLastAutoSave(new Date());
        
        if (!isAutoSave) {
          toast.success('Cart saved successfully!');
        }
        
        return result;
      } catch (error) {
        console.error('Save cart error:', error);
        if (!isAutoSave) {
          toast.error('Failed to save cart');
        }
      } finally {
        setIsSaving(false);
      }
    },
    [onSaveCart]
  );

  // ============================================================================
  // AUTO-SAVE COUNTDOWN
  // ============================================================================

  useEffect(() => {
    if (!hasCurrentCart || !onSaveCart) return;

    const interval = setInterval(() => {
      setTimeUntilNextSave((prev) => {
        if (prev <= 1) {
          // Trigger auto-save
          handleSaveCart(true);
          return autoSaveInterval * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasCurrentCart, onSaveCart, autoSaveInterval, handleSaveCart]);

  const handleEmailCart = useCallback(async () => {
    if (!onEmailCart || !isEmailValid) return;

    setIsEmailing(true);
    try {
      await onEmailCart(email);
      toast.success(`Cart sent to ${email}`);
      setEmail('');
      setShowEmailInput(false);
    } catch (error) {
      console.error('Email cart error:', error);
      toast.error('Failed to email cart');
    } finally {
      setIsEmailing(false);
    }
  }, [onEmailCart, email, isEmailValid]);

  const handleShareCart = useCallback(async () => {
    if (!onShareCart) return;

    setIsSharing(true);
    try {
      const result = await onShareCart();
      setShareUrl(result.shareUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success('Cart link copied to clipboard!');
    } catch (error) {
      console.error('Share cart error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  }, [onShareCart]);

  const handleRestoreCart = useCallback(
    async (cartId: string) => {
      if (!onRestoreCart) return;

      setIsRestoring(cartId);
      try {
        await onRestoreCart(cartId);
        toast.success('Cart restored successfully!');
      } catch (error) {
        console.error('Restore cart error:', error);
        toast.error('Failed to restore cart');
      } finally {
        setIsRestoring(null);
      }
    },
    [onRestoreCart]
  );

  // ============================================================================
  // FORMAT TIME
  // ============================================================================

  const formatAutoSaveTime = useMemo(() => {
    const minutes = Math.floor(timeUntilNextSave / 60);
    const seconds = timeUntilNextSave % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeUntilNextSave]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current Cart Actions */}
      {hasCurrentCart && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Save Your Cart</h3>
            {lastAutoSave && (
              <Badge variant="success" size="sm">
                Last saved: {lastAutoSave.toLocaleTimeString()}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Save your cart to continue shopping later or share it with others.
          </p>

          {/* Auto-save countdown */}
          {onSaveCart && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>Auto-save in {formatAutoSaveTime}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Save Cart */}
            {onSaveCart && (
              <Button
                variant="default"
                size="md"
                onClick={() => handleSaveCart(false)}
                loading={isSaving}
                className="w-full"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Save Cart
              </Button>
            )}

            {/* Email Cart */}
            {onEmailCart && (
              <Tooltip content="Email cart to yourself">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowEmailInput(!showEmailInput)}
                  className="w-full"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email Cart
                </Button>
              </Tooltip>
            )}

            {/* Share Cart */}
            {onShareCart && (
              <Tooltip content="Generate shareable link">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleShareCart}
                  loading={isSharing}
                  className="w-full"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Share Cart
                </Button>
              </Tooltip>
            )}
          </div>

          {/* Email Input */}
          <AnimatePresence>
            {showEmailInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleEmailCart}
                    disabled={!isEmailValid}
                    loading={isEmailing}
                  >
                    Send
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share URL */}
          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900">Link copied!</p>
                  <p className="text-xs text-green-700 truncate">{shareUrl}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Saved Carts */}
      {hasSavedCarts && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Carts ({savedCarts.length})
          </h3>

          <div className="space-y-4">
            {savedCarts.map((cart) => {
              const timeRemaining = getTimeRemaining(cart.expiresAt);
              const isExpiring = timeRemaining && timeRemaining.total < 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={cart.id}
                  layout
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                        </p>
                        {isExpiring && (
                          <Badge variant="warning" size="sm">
                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Saved {new Date(cart.savedAt).toLocaleDateString()}
                      </p>
                      {timeRemaining && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expires in {timeRemaining.hours}h {timeRemaining.minutes}m
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(cart.total, 'INR')}
                      </p>
                    </div>
                  </div>

                  {/* Incentive */}
                  {showIncentives && cart.incentive && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-purple-600" />
                        <p className="text-sm font-medium text-purple-900">
                          {cart.incentive.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Items Preview */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                    {cart.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                      >
                        {item.name}
                      </div>
                    ))}
                    {cart.items.length > 4 && (
                      <span className="flex-shrink-0 text-xs text-gray-500">
                        +{cart.items.length - 4} more
                      </span>
                    )}
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRestoreCart(cart.id)}
                    loading={isRestoring === cart.id}
                    className="w-full"
                  >
                    Restore Cart
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasCurrentCart && !hasSavedCarts && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved carts</h3>
          <p className="text-sm text-gray-600">
            Your saved carts will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default CartRecovery;
