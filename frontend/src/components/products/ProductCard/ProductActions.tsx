'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Share2, 
  GitCompare,
  Check,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import { useToggleWishlist } from '@/hooks/wishlist/useToggleWishlist';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Product, ProductVariant } from '@/types/product.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn, getStockStatus } from '@/lib/utils';

export interface ProductActionsProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'overlay' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  showQuantity?: boolean;
  showQuickView?: boolean;
  showShare?: boolean;
  showCompare?: boolean;
  onQuickView?: () => void;
  onAddToCart?: (quantity: number) => void;
  onAddToWishlist?: () => void;
  onCompare?: () => void;
  onShare?: () => void;
  compact?: boolean;
  animated?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  variant,
  className,
  layout = 'horizontal',
  size = 'md',
  showQuantity = false,
  showQuickView = true,
  showShare = true,
  showCompare = true,
  onQuickView,
  onAddToCart,
  onAddToWishlist,
  onCompare,
  onShare,
  compact = false,
  animated = true,
  theme = 'auto',
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding: isAddingToCart } = useAddToCart();
  const { isInWishlist, toggleAsync, isToggling } = useToggleWishlist();

  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const inWishlist = useMemo(() => 
    isInWishlist(product.id, variant?.id),
    [isInWishlist, product.id, variant?.id]
  );

  const isOutOfStock = useMemo(() => {
    const stockStatus = getStockStatus(product, variant);
    return !stockStatus.inStock;
  }, [product, variant]);

  const maxQuantity = useMemo(() => {
    const stockStatus = getStockStatus(product, variant);
    return Math.min(stockStatus.quantity, 10);
  }, [product, variant]);

  // Handle Add to Cart
  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      await addToCart(product.id, quantity, { variantId: variant?.id });

      setIsAddedToCart(true);
      onAddToCart?.(quantity);

      setTimeout(() => setIsAddedToCart(false), 3000);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  }, [product.id, variant?.id, quantity, isOutOfStock, addToCart, onAddToCart]);

  // Handle Wishlist Toggle
  const handleWishlistToggle = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      router.push('/auth/login');
      return;
    }

    try {
      await toggleAsync({
        productId: product.id,
        variantId: variant?.id,
      });

      onAddToWishlist?.();
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  }, [
    isAuthenticated,
    product.id,
    variant?.id,
    toggleAsync,
    router,
    onAddToWishlist,
  ]);

  // Handle Compare
  const handleCompare = useCallback(async () => {
    setIsLoadingCompare(true);

    try {
      // Add to compare logic
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Added to compare list!');
      onCompare?.();
    } catch (error) {
      toast.error('Failed to add to compare');
      console.error('Compare error:', error);
    } finally {
      setIsLoadingCompare(false);
    }
  }, [onCompare]);

  // Handle Quick View
  const handleQuickView = useCallback(() => {
    onQuickView?.();
  }, [onQuickView]);

  // Handle Share
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.origin + `/products/${product.slug}`,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
      onShare?.();
    }
  }, [product, showShareMenu, onShare]);

  // Quantity handlers
  const incrementQuantity = useCallback(() => {
    setQuantity(prev => Math.min(prev + 1, maxQuantity));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  // Layout classes
  const layoutClasses = {
    horizontal: 'flex-row gap-2',
    vertical: 'flex-col gap-2',
    overlay: 'flex-row gap-2 absolute bottom-4 left-1/2 -translate-x-1/2',
    floating: 'flex-col gap-2 fixed right-4 top-1/2 -translate-y-1/2 z-10',
  };

  const containerClasses = cn(
    'flex items-center justify-center',
    layoutClasses[layout],
    theme === 'dark' && 'text-white',
    theme === 'light' && 'text-gray-900',
    className
  );

  const actionButtonClasses = cn(
    'relative flex items-center justify-center rounded-full transition-all duration-200',
    'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size]
  );

  // Animation variants
  const buttonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    tap: { scale: 0.95 },
  };

  const successVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
  };

  const springTransition = {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
  };

  return (
    <div className={containerClasses}>
      {/* Wishlist Button */}
      <Tooltip content={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
        <motion.button
          className={cn(
            actionButtonClasses,
            inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          )}
          onClick={handleWishlistToggle}
          disabled={isToggling}
          whileTap={animated ? 'tap' : undefined}
          variants={animated ? buttonVariants : undefined}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
          )}
        </motion.button>
      </Tooltip>

      {/* Add to Cart Button */}
      {showQuantity ? (
        <div className="flex items-center gap-1 bg-white rounded-full shadow-md px-1">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="px-2 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <Tooltip content={isAddedToCart ? 'Added to cart' : isOutOfStock ? 'Out of stock' : 'Add to cart'}>
        <motion.button
          className={cn(
            actionButtonClasses,
            isAddedToCart 
              ? 'bg-green-500 text-white' 
              : isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          )}
          onClick={handleAddToCart}
          disabled={isAddingToCart || isOutOfStock || isAddedToCart}
          whileTap={animated ? 'tap' : undefined}
          variants={animated ? buttonVariants : undefined}
          aria-label="Add to cart"
        >
          <AnimatePresence mode="wait">
            {isAddingToCart ? (
              <motion.div key="loading" {...successVariants} transition={springTransition}>
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            ) : isAddedToCart ? (
              <motion.div key="success" {...successVariants} transition={springTransition}>
                <Check className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div key="cart" {...successVariants} transition={springTransition}>
                <ShoppingCart className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </Tooltip>

      {/* Quick View Button */}
      {showQuickView && (
        <Tooltip content="Quick view">
          <motion.button
            className={cn(actionButtonClasses, 'bg-white text-gray-600 hover:bg-gray-100')}
            onClick={handleQuickView}
            whileTap={animated ? 'tap' : undefined}
            variants={animated ? buttonVariants : undefined}
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </motion.button>
        </Tooltip>
      )}

      {/* Compare Button */}
      {showCompare && (
        <Tooltip content="Add to compare">
          <motion.button
            className={cn(actionButtonClasses, 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-500')}
            onClick={handleCompare}
            disabled={isLoadingCompare}
            whileTap={animated ? 'tap' : undefined}
            variants={animated ? buttonVariants : undefined}
            aria-label="Add to compare"
          >
            {isLoadingCompare ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
          </motion.button>
        </Tooltip>
      )}

      {/* Share Button */}
      {showShare && (
        <Tooltip content="Share">
          <motion.button
            className={cn(actionButtonClasses, 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-500')}
            onClick={handleShare}
            whileTap={animated ? 'tap' : undefined}
            variants={animated ? buttonVariants : undefined}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </Tooltip>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && !compact && (
        <Badge variant="destructive" className="ml-2">
          Out of Stock
        </Badge>
      )}

      {/* Low Stock Badge */}
      {!isOutOfStock && (variant ? variant.inventory.quantity : product.inventory.quantity) < 5 && !compact && (
        <Badge variant="warning" className="ml-2">
          Only {variant ? variant.inventory.quantity : product.inventory.quantity} left
        </Badge>
      )}
    </div>
  );
};

export default ProductActions;
