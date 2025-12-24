/**
 * AddToCartButton Component - Vardhman Mills Frontend
 * 
 * A comprehensive button component for adding products to cart with:
 * - Multiple button variants and sizes
 * - Loading and disabled states
 * - Quantity selector integration
 * - Variant selection
 * - Stock validation
 * - Optimistic updates
 * - Animation effects
 * - Toast notifications
 * - Analytics tracking
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  ArrowPathIcon,
  MinusIcon,
  PlusIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import type { Product, ProductVariant } from '@/types/product.types';
import type { Price } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddToCartButtonProps {
  /**
   * Product to add to cart
   */
  product: Product;

  /**
   * Selected variant (if applicable)
   */
  variant?: ProductVariant;

  /**
   * Initial quantity
   * @default 1
   */
  initialQuantity?: number;

  /**
   * Button variant
   * @default 'default'
   */
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'success';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Show quantity selector
   * @default false
   */
  showQuantitySelector?: boolean;

  /**
   * Show price in button
   * @default false
   */
  showPrice?: boolean;

  /**
   * Show icon in button
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom button text
   */
  customText?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Show stock indicator
   */
  showStock?: boolean;

  /**
   * Enable quick add (no quantity selector)
   */
  quickAdd?: boolean;

  /**
   * Show success animation
   * @default true
   */
  showSuccessAnimation?: boolean;

  /**
   * Redirect to cart after adding
   */
  redirectToCart?: boolean;

  /**
   * Custom callback after adding to cart
   */
  onAddSuccess?: (quantity: number) => void;

  /**
   * Custom callback on error
   */
  onError?: (error: Error) => void;

  /**
   * Enable wishlist quick add
   */
  showWishlistButton?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Track analytics
   * @default true
   */
  trackAnalytics?: boolean;
}

interface CartButtonState {
  quantity: number;
  isAdding: boolean;
  isSuccess: boolean;
  error: string | null;
  isInCart: boolean;
  cartQuantity: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_VARIANTS = {
  initial: { scale: 1, opacity: 1 },
  adding: { scale: 0.95, opacity: 0.8 },
  success: { scale: [1, 1.1, 1], opacity: 1 },
  error: { scale: [1, 0.95, 1], opacity: 1 },
};

const SUCCESS_DISPLAY_DURATION = 2000;
const MIN_QUANTITY = 1;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant,
  initialQuantity = 1,
  buttonVariant = 'default',
  size = 'md',
  showQuantitySelector = false,
  showPrice = false,
  showIcon = true,
  customText,
  disabled = false,
  fullWidth = false,
  showStock = false,
  quickAdd = false,
  showSuccessAnimation = true,
  redirectToCart = false,
  onAddSuccess,
  onError,
  showWishlistButton = false,
  className,
  trackAnalytics = true,
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { items: cartItems, addToCart, updateQuantity } = useCart();

  const [buttonState, setButtonState] = useState<CartButtonState>({
    quantity: initialQuantity,
    isAdding: false,
    isSuccess: false,
    error: null,
    isInCart: false,
    cartQuantity: 0,
  });

  const [showQuantityInput, setShowQuantityInput] = useState(showQuantitySelector);
  const [isWishlistAdding, setIsWishlistAdding] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Helper function to get item from cart
  const getItemFromCart = useCallback((productId: string, variantId?: string) => {
    return cartItems.find(item =>
      item.productId === productId &&
      (variantId ? item.variantId === variantId : true)
    );
  }, [cartItems]);

  const itemInCart = useMemo(() => {
    return getItemFromCart(product.id, variant?.id);
  }, [product.id, variant?.id, getItemFromCart]);

  // Toggle quantity selector when needed
  useEffect(() => {
    if (itemInCart && !showQuantitySelector) {
      setShowQuantityInput(true);
    }
  }, [itemInCart, showQuantitySelector]);

  const isOutOfStock = useMemo(() => {
    if (variant) {
      return !variant.inventory?.isInStock || (variant.inventory?.quantity ?? 0) === 0;
    }
    return !product.inventory?.isInStock || (product.inventory?.quantity ?? 0) === 0;
  }, [product, variant]);

  const maxQuantity = useMemo(() => {
    if (variant) {
      return variant.inventory?.quantity ?? 0;
    }
    return product.inventory?.quantity ?? 0;
  }, [product, variant]);

  const isLowStock = useMemo(() => {
    if (variant) {
      return variant.inventory?.isLowStock ?? false;
    }
    return product.inventory?.isLowStock ?? false;
  }, [product, variant]);

  const effectivePrice: Price = useMemo(() => {
    if (variant && variant.pricing) {
      return variant.pricing.salePrice || variant.pricing.basePrice;
    }
    return product.pricing?.salePrice || product.pricing?.basePrice || { amount: 0, currency: 'INR' };
  }, [product, variant]);

  const isDisabled = useMemo(() => {
    return disabled || isOutOfStock || buttonState.isAdding;
  }, [disabled, isOutOfStock, buttonState.isAdding]);

  const buttonText = useMemo(() => {
    if (buttonState.isSuccess) return 'Added to Cart!';
    if (buttonState.isAdding) return 'Adding...';
    if (isOutOfStock) return 'Out of Stock';
    if (itemInCart) return 'Update Cart';
    if (customText) return customText;
    return 'Add to Cart';
  }, [buttonState, isOutOfStock, itemInCart, customText]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (itemInCart) {
      setButtonState(prev => ({
        ...prev,
        isInCart: true,
        cartQuantity: itemInCart.quantity,
      }));
    } else {
      setButtonState(prev => ({
        ...prev,
        isInCart: false,
        cartQuantity: 0,
      }));
    }
  }, [itemInCart]);

  useEffect(() => {
    if (buttonState.isSuccess) {
      const timer = setTimeout(() => {
        setButtonState(prev => ({ ...prev, isSuccess: false }));
      }, SUCCESS_DISPLAY_DURATION);

      return () => clearTimeout(timer);
    }
  }, [buttonState.isSuccess]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const validateQuantity = useCallback((qty: number): { valid: boolean; error?: string } => {
    if (qty < MIN_QUANTITY) {
      return { valid: false, error: 'Quantity must be at least 1' };
    }

    if (qty > maxQuantity) {
      return { valid: false, error: `Only ${maxQuantity} items available in stock` };
    }

    const currentCartQuantity = itemInCart?.quantity || 0;
    const totalQuantity = currentCartQuantity + qty;

    if (totalQuantity > maxQuantity) {
      return {
        valid: false,
        error: `Cannot add more. You already have ${currentCartQuantity} in cart`,
      };
    }

    return { valid: true };
  }, [maxQuantity, itemInCart]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < MIN_QUANTITY) return;

    const validation = validateQuantity(newQuantity);
    if (!validation.valid) {
      setButtonState(prev => ({ ...prev, error: validation.error || null }));
      toast.error(validation.error || 'Invalid quantity');
      return;
    }

    setButtonState(prev => ({
      ...prev,
      quantity: newQuantity,
      error: null,
    }));
  }, [validateQuantity]);

  const handleIncrement = useCallback(() => {
    handleQuantityChange(buttonState.quantity + 1);
  }, [buttonState.quantity, handleQuantityChange]);

  const handleDecrement = useCallback(() => {
    handleQuantityChange(buttonState.quantity - 1);
  }, [buttonState.quantity, handleQuantityChange]);

  const trackAddToCart = useCallback((quantity: number) => {
    if (!trackAnalytics) return;

    try {
      // Track with analytics service
      interface GtagWindow extends Window {
        gtag?: (...args: unknown[]) => void;
      }

      if (typeof window !== 'undefined' && (window as GtagWindow).gtag) {
        (window as GtagWindow).gtag?.('event', 'add_to_cart', {
          currency: effectivePrice.currency,
          value: effectivePrice.amount * quantity,
          items: [
            {
              item_id: variant?.sku || product.sku,
              item_name: product.name,
              item_variant: variant?.name,
              price: effectivePrice.amount,
              quantity: quantity,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [trackAnalytics, product, variant, effectivePrice]);

  const handleAddToCart = useCallback(async () => {
    // Validation
    const validation = validateQuantity(buttonState.quantity);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid quantity');
      setButtonState(prev => ({ ...prev, error: validation.error || null }));
      return;
    }

    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    // If item exists in cart, update quantity instead
    if (itemInCart) {
      try {
        await updateQuantity(itemInCart.id, itemInCart.quantity + buttonState.quantity);
        toast.success(`Updated quantity in cart`);
        return;
      } catch (error) {
        // Fall through to add new item
        console.warn('Update failed, adding new item:', error);
      }
    }

    // Start adding
    setButtonState(prev => ({ ...prev, isAdding: true, error: null }));

    try {
      // Extract variant info for the provider
      const variantInfo = variant ? {
        color: variant.options?.find(opt => opt.value.toLowerCase().includes('color'))?.value,
        size: variant.options?.find(opt => opt.value.toLowerCase().includes('size'))?.value,
        material: product.materials?.[0]?.name,
      } : undefined;

      // Add to cart using the provider
      const result = await addToCart(product.id, buttonState.quantity, variantInfo);

      if (result.success) {
        // Track analytics
        trackAddToCart(buttonState.quantity);

        // Success state
        setButtonState(prev => ({
          ...prev,
          isAdding: false,
          isSuccess: showSuccessAnimation,
          isInCart: true,
          cartQuantity: (prev.cartQuantity || 0) + buttonState.quantity,
        }));

        // Reset quantity if quick add
        if (quickAdd) {
          setButtonState(prev => ({ ...prev, quantity: initialQuantity }));
        }

        // Redirect to cart if needed
        if (redirectToCart) {
          setTimeout(() => {
            window.location.href = '/cart';
          }, 500);
        }

        // Custom callback
        if (onAddSuccess) {
          onAddSuccess(buttonState.quantity);
        }
      } else {
        throw new Error(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';

      setButtonState(prev => ({
        ...prev,
        isAdding: false,
        isSuccess: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  }, [
    product,
    variant,
    buttonState.quantity,
    effectivePrice,
    maxQuantity,
    isOutOfStock,
    validateQuantity,
    addToCart,
    updateQuantity,
    trackAddToCart,
    showSuccessAnimation,
    quickAdd,
    redirectToCart,
    initialQuantity,
    onAddSuccess,
    onError,
    itemInCart,
  ]);

  const handleAddToWishlist = useCallback(async () => {
    setIsWishlistAdding(true);

    try {
      // Simulate wishlist add API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(
        <div className="flex items-center gap-2">
          <HeartIcon className="h-5 w-5 text-red-500" />
          <span>Added to wishlist</span>
        </div>
      );
    } catch (error) {
      toast.error('Failed to add to wishlist');
      console.error('Wishlist error:', error);
    } finally {
      setIsWishlistAdding(false);
    }
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderIcon = () => {
    if (!showIcon) return null;

    if (buttonState.isSuccess) {
      return <CheckIcon className="h-5 w-5" />;
    }

    if (buttonState.isAdding) {
      return <ArrowPathIcon className="h-5 w-5 animate-spin" />;
    }

    if (isOutOfStock) {
      return <ExclamationTriangleIcon className="h-5 w-5" />;
    }

    if (itemInCart) {
      return <ShoppingCartSolidIcon className="h-5 w-5" />;
    }

    return <ShoppingCartIcon className="h-5 w-5" />;
  };

  const renderQuantitySelector = () => {
    if (!showQuantityInput) return null;

    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={buttonState.quantity <= MIN_QUANTITY || isDisabled}
            className="px-3 py-1 rounded-none hover:bg-gray-100"
          >
            <MinusIcon className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min={MIN_QUANTITY}
            max={maxQuantity}
            value={buttonState.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || MIN_QUANTITY)}
            disabled={isDisabled}
            className="w-16 text-center border-0 border-x border-gray-300 rounded-none focus:ring-0 px-2"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={buttonState.quantity >= maxQuantity || isDisabled}
            className="px-3 py-1 rounded-none hover:bg-gray-100"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {isLowStock && (
          <Tooltip content={`Only ${maxQuantity} left in stock`}>
            <Badge variant="warning" size="sm" className="flex items-center gap-1">
              <BoltIcon className="h-3 w-3" />
              Low Stock
            </Badge>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderStockIndicator = () => {
    if (!showStock) return null;

    return (
      <div className="flex items-center gap-2 mb-2">
        {isOutOfStock ? (
          <Badge variant="destructive" size="sm">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="warning" size="sm" className="flex items-center gap-1">
            <BoltIcon className="h-3 w-3" />
            Only {maxQuantity} left
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            In Stock
          </Badge>
        )}

        {itemInCart && (
          <Tooltip content={`${itemInCart.quantity} already in your cart`}>
            <Badge variant="default" size="sm" className="flex items-center gap-1">
              <ShoppingCartSolidIcon className="h-3 w-3" />
              {itemInCart.quantity} in cart
            </Badge>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderPriceInfo = () => {
    if (!showPrice) return null;

    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(effectivePrice.amount * buttonState.quantity, effectivePrice.currency)}
        </span>

        {product.pricing.salePrice && (
          <>
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(
                product.pricing.basePrice.amount * buttonState.quantity,
                product.pricing.basePrice.currency
              )}
            </span>
            <Badge variant="success" size="sm" className="flex items-center gap-1">
              <SparklesIcon className="h-3 w-3" />
              Save{' '}
              {formatCurrency(
                (product.pricing.basePrice.amount - effectivePrice.amount) * buttonState.quantity,
                effectivePrice.currency
              )}
            </Badge>
          </>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      {renderStockIndicator()}
      {renderPriceInfo()}
      {renderQuantitySelector()}

      <div className="flex items-center gap-2">
        <motion.div
          variants={ANIMATION_VARIANTS}
          initial="initial"
          animate={
            buttonState.isAdding
              ? 'adding'
              : buttonState.isSuccess
                ? 'success'
                : buttonState.error
                  ? 'error'
                  : 'initial'
          }
          transition={{ duration: 0.2 }}
          className={cn(fullWidth && 'flex-1')}
        >
          <Button
            variant={buttonState.isSuccess ? 'success' : buttonVariant}
            size={size}
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={cn(
              'relative overflow-hidden',
              fullWidth && 'w-full',
              buttonState.isSuccess && 'bg-green-600 hover:bg-green-700'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={buttonState.isSuccess ? 'success' : 'default'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-2"
              >
                {renderIcon()}
                <span>{buttonText}</span>
              </motion.div>
            </AnimatePresence>

            {/* Success animation overlay */}
            {buttonState.isSuccess && showSuccessAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-green-400 rounded-lg"
              />
            )}
          </Button>
        </motion.div>

        {showWishlistButton && (
          <Tooltip content="Add to wishlist">
            <Button
              variant="outline"
              size={size}
              onClick={handleAddToWishlist}
              disabled={isWishlistAdding}
              className="flex items-center gap-2"
            >
              {isWishlistAdding ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </Button>
          </Tooltip>
        )}

        {itemInCart && !showQuantitySelector && (
          <Tooltip content={`${itemInCart.quantity} in cart. Click to view cart.`}>
            <Button
              variant="outline"
              size={size}
              onClick={() => (window.location.href = '/cart')}
              className="flex items-center gap-2"
            >
              <InformationCircleIcon className="h-5 w-5" />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Error message */}
      {buttonState.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          {buttonState.error}
        </motion.div>
      )}
    </div>
  );
};

export default AddToCartButton;
