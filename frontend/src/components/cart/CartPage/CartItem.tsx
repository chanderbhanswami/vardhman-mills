'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrashIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TagIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  SparklesIcon,
  GiftIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { CartItem as CartItemType } from '@/types/cart.types';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartItemProps {
  /**
   * Cart item data
   */
  item: CartItemType;

  /**
   * Callback when quantity changes
   */
  onQuantityChange?: (itemId: string, quantity: number) => void | Promise<void>;

  /**
   * Callback when item is removed
   */
  onRemove?: (itemId: string) => void | Promise<void>;

  /**
   * Callback when item is moved to wishlist
   */
  onMoveToWishlist?: (itemId: string) => void | Promise<void>;

  /**
   * Callback when item is saved for later
   */
  onSaveForLater?: (itemId: string) => void | Promise<void>;

  /**
   * Show detailed view
   */
  showDetails?: boolean;

  /**
   * Disable interactions
   */
  disabled?: boolean;

  /**
   * Show save for later option
   */
  showSaveForLater?: boolean;

  /**
   * Show move to wishlist option
   */
  showMoveToWishlist?: boolean;

  /**
   * Compact view for mobile
   */
  compact?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUANTITY_LIMITS = {
  min: 1,
  max: 10,
  bulkThreshold: 5,
};

const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStockStatus = (stockQuantity: number) => {
  if (stockQuantity === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'red' };
  if (stockQuantity < 5) return { status: 'low_stock', label: `Only ${stockQuantity} left`, color: 'orange' };
  if (stockQuantity < 10) return { status: 'limited', label: 'Limited Stock', color: 'yellow' };
  return { status: 'in_stock', label: 'In Stock', color: 'green' };
};

const calculateDiscount = (originalPrice: number, currentPrice: number) => {
  if (originalPrice <= currentPrice) return null;
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  onMoveToWishlist,
  onSaveForLater,
  showDetails = true,
  disabled = false,
  showSaveForLater = true,
  showMoveToWishlist = true,
  compact = false,
  className,
}) => {
  // State
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Memoized values
  const productImage = useMemo(() => {
    return item.product.media?.primaryImage?.url || 
           item.product.media?.images?.[0]?.url || 
           '/placeholder-product.png';
  }, [item.product.media]);

  const stockStatus = useMemo(() => {
    return getStockStatus(item.product.inventory?.quantity || 0);
  }, [item.product.inventory]);

  const discountPercentage = useMemo(() => {
    if (item.product.pricing?.compareAtPrice) {
      return calculateDiscount(
        item.product.pricing.compareAtPrice.amount,
        item.unitPrice.amount
      );
    }
    return null;
  }, [item.product.pricing, item.unitPrice]);

  const isOnSale = useMemo(() => {
    return item.product.isOnSale && discountPercentage && discountPercentage > 0;
  }, [item.product.isOnSale, discountPercentage]);

  const canIncrease = useMemo(() => {
    const maxQuantity = Math.min(
      QUANTITY_LIMITS.max,
      item.product.inventory?.quantity || QUANTITY_LIMITS.max
    );
    return quantity < maxQuantity;
  }, [quantity, item.product.inventory]);

  const canDecrease = useMemo(() => {
    return quantity > QUANTITY_LIMITS.min;
  }, [quantity]);

  const isBulkOrder = useMemo(() => {
    return quantity >= QUANTITY_LIMITS.bulkThreshold;
  }, [quantity]);

  // Handlers
  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (disabled || isUpdating) return;

    const maxQuantity = Math.min(
      QUANTITY_LIMITS.max,
      item.product.inventory?.quantity || QUANTITY_LIMITS.max
    );

    const validQuantity = Math.max(QUANTITY_LIMITS.min, Math.min(maxQuantity, newQuantity));

    if (validQuantity === quantity) return;

    setIsUpdating(true);
    setQuantity(validQuantity);

    try {
      if (onQuantityChange) {
        await onQuantityChange(item.id, validQuantity);
      }
      toast.success(`Updated quantity to ${validQuantity}`);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setQuantity(item.quantity); // Revert on error
      toast.error('Failed to update quantity. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [disabled, isUpdating, quantity, item, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    if (canIncrease) {
      handleQuantityChange(quantity + 1);
    }
  }, [canIncrease, quantity, handleQuantityChange]);

  const handleDecrease = useCallback(() => {
    if (canDecrease) {
      handleQuantityChange(quantity - 1);
    }
  }, [canDecrease, quantity, handleQuantityChange]);

  const handleRemove = useCallback(async () => {
    if (disabled || isRemoving) return;

    setIsRemoving(true);

    try {
      if (onRemove) {
        await onRemove(item.id);
      }
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item. Please try again.');
      setIsRemoving(false);
    }
  }, [disabled, isRemoving, item.id, onRemove]);

  const handleMoveToWishlist = useCallback(async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);

    try {
      if (onMoveToWishlist) {
        await onMoveToWishlist(item.id);
      }
      setIsInWishlist(true);
      toast.success('Moved to wishlist');
    } catch (error) {
      console.error('Failed to move to wishlist:', error);
      toast.error('Failed to move to wishlist. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [disabled, isUpdating, item.id, onMoveToWishlist]);

  const handleSaveForLater = useCallback(async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);

    try {
      if (onSaveForLater) {
        await onSaveForLater(item.id);
      }
      toast.success('Saved for later');
    } catch (error) {
      console.error('Failed to save for later:', error);
      toast.error('Failed to save for later. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [disabled, isUpdating, item.id, onSaveForLater]);

  // Render helpers
  const renderStockBadge = () => {
    if (stockStatus.status === 'in_stock') return null;

    return (
      <Badge
        variant={stockStatus.status === 'out_of_stock' ? 'destructive' : 'warning'}
        size="sm"
        className="flex items-center gap-1"
      >
        {stockStatus.status === 'out_of_stock' ? (
          <XMarkIcon className="h-3 w-3" />
        ) : (
          <ExclamationCircleIcon className="h-3 w-3" />
        )}
        {stockStatus.label}
      </Badge>
    );
  };

  const renderPriceSection = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-lg font-bold text-gray-900">
        {formatCurrency(item.totalPrice.amount, item.totalPrice.currency)}
      </span>
      {isOnSale && item.product.pricing?.compareAtPrice && (
        <>
          <span className="text-sm text-gray-500 line-through">
            {formatCurrency(
              item.product.pricing.compareAtPrice.amount * quantity,
              item.product.pricing.compareAtPrice.currency
            )}
          </span>
          <Badge variant="destructive" size="sm">
            {discountPercentage}% OFF
          </Badge>
        </>
      )}
      {isBulkOrder && (
        <Badge variant="default" size="sm" className="flex items-center gap-1">
          <SparklesIcon className="h-3 w-3" />
          Bulk Discount Applied
        </Badge>
      )}
    </div>
  );

  const renderQuantityControls = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={!canDecrease || disabled || isUpdating}
          className={cn(
            'p-2 hover:bg-gray-100 transition-colors',
            (!canDecrease || disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Decrease quantity"
        >
          <MinusIcon className="h-4 w-4 text-gray-600" />
        </button>

        <input
          type="number"
          min={QUANTITY_LIMITS.min}
          max={Math.min(
            QUANTITY_LIMITS.max,
            item.product.inventory?.quantity || QUANTITY_LIMITS.max
          )}
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || QUANTITY_LIMITS.min)}
          disabled={disabled || isUpdating}
          className="w-12 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Item quantity"
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={!canIncrease || disabled || isUpdating}
          className={cn(
            'p-2 hover:bg-gray-100 transition-colors',
            (!canIncrease || disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Increase quantity"
        >
          <PlusIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {isUpdating && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      )}
    </div>
  );

  const renderActionButtons = () => (
    <Card className="p-2">
      <div className="flex items-center gap-3 flex-wrap">
        {showMoveToWishlist && (
          <Tooltip content={isInWishlist ? 'Already in wishlist' : 'Move to wishlist'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveToWishlist}
              disabled={disabled || isUpdating || isInWishlist}
              aria-label="Move to wishlist"
            >
              {isInWishlist ? (
                <HeartSolidIcon className="h-4 w-4 text-red-600" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Wishlist</span>
            </Button>
          </Tooltip>
        )}

        {showSaveForLater && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveForLater}
            disabled={disabled || isUpdating}
            aria-label="Save for later"
          >
            <ClockIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Save for Later</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={disabled || isRemoving}
          aria-label="Remove item"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Remove</span>
        </Button>
      </div>
    </Card>
  );

  const renderProductDetails = () => (
    <div className="space-y-2">
      {/* Variant Information */}
      {item.variant && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Variant:</span>
          <span>{item.variant.name}</span>
          <Tooltip content="Product variant details">
            <InformationCircleIcon className="h-4 w-4 text-gray-400" />
          </Tooltip>
        </div>
      )}

      {/* Sale Badge */}
      {isOnSale && discountPercentage && (
        <Badge variant="gradient" size="sm" className="flex items-center gap-1">
          <TagIcon className="h-3 w-3" />
          {discountPercentage}% OFF
        </Badge>
      )}

      {/* Stock Status Badge */}
      {stockStatus.status === 'in_stock' && (
        <Badge variant="success" size="sm" className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3" />
          In Stock
        </Badge>
      )}

      {/* SKU */}
      {item.product.sku && (
        <p className="text-xs text-gray-500">
          SKU: <span className="font-mono">{item.product.sku}</span>
        </p>
      )}

      {/* Features */}
      {showDetails && item.product.features && item.product.features.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Key Features:</p>
          <ul className="list-disc list-inside space-y-1">
            {item.product.features.slice(0, showFullDescription ? undefined : 3).map((feature, index) => (
              <li key={index} className="text-xs text-gray-600">
                {feature}
              </li>
            ))}
          </ul>
          {item.product.features.length > 3 && (
            <button
              type="button"
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Shipping Info */}
      {item.isAvailable && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <TruckIcon className="h-4 w-4" />
          <span>Free shipping on orders over ₹500</span>
        </div>
      )}

      {/* Gift Wrap Available */}
      {item.giftWrap && (
        <div className="flex items-center gap-2 text-xs text-purple-600">
          <GiftIcon className="h-4 w-4" />
          <span>Gift wrap: {item.giftWrap.name}</span>
        </div>
      )}

      {/* Return Policy */}
      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>30-day return policy</span>
        </div>
      )}
    </div>
  );

  // Main render
  if (compact) {
    return (
      <motion.div
        variants={ANIMATION_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'flex gap-3 p-3 bg-white rounded-lg border border-gray-200',
          disabled && 'opacity-60',
          className
        )}
      >
        {/* Image */}
        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
            {!imageError ? (
              <Image
                src={productImage}
                alt={item.product.name}
                fill
                className={cn(
                  'object-cover transition-opacity',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoadingComplete={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.slug}`}
            className="font-medium text-sm text-gray-900 hover:text-blue-600 line-clamp-1"
          >
            {item.product.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {renderPriceSection()}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex-shrink-0">
          {renderQuantityControls()}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.id}
        variants={ANIMATION_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-4 sm:p-6',
          disabled && 'opacity-60',
          isRemoving && 'pointer-events-none',
          className
        )}
      >
      <div className="flex gap-4 sm:gap-6">
        {/* Product Image */}
        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
            {isOnSale && (
              <Badge
                variant="destructive"
                className="absolute top-2 left-2 z-10"
                size="sm"
              >
                {discountPercentage}% OFF
              </Badge>
            )}
            {!imageError ? (
              <Image
                src={productImage}
                alt={item.product.name}
                fill
                className={cn(
                  'object-cover transition-opacity',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoadingComplete={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <Link
                href={`/products/${item.product.slug}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
              >
                {item.product.name}
              </Link>

              {/* Brand */}
              {item.product.brand && (
                <p className="text-sm text-gray-600 mt-1">
                  by <span className="font-medium">{item.product.brand.name}</span>
                </p>
              )}

              {/* Stock Status */}
              <div className="mt-2">
                {renderStockBadge()}
              </div>
            </div>

            {/* Remove Button (Desktop) */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isRemoving}
              className={cn(
                'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors',
                (disabled || isRemoving) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Remove item"
            >
              {isRemoving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
              ) : (
                <XMarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Product Details */}
          <div className="mt-4">
            {renderProductDetails()}
          </div>

          {/* Price and Actions */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Price */}
            <div>{renderPriceSection()}</div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-4">
              {renderQuantityControls()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {renderActionButtons()}
          </div>
        </div>
      </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartItem;
