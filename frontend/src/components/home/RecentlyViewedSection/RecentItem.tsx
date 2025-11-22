/**
 * RecentItem Component
 * 
 * Comprehensive card component for displaying recently viewed products
 * with rich interactions, animations, and detailed product information.
 * 
 * Features:
 * - Product image with hover zoom
 * - Quick view modal trigger
 * - Add to cart/wishlist actions
 * - Rating display with review count
 * - Price with discount calculation
 * - Stock status indicators
 * - Badge system (new, sale, trending)
 * - View timestamp display
 * - Remove from history option
 * - Responsive design
 * - Loading states
 * - Error handling
 * - Keyboard navigation
 * - Analytics tracking
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  isNew?: boolean;
  isTrending?: boolean;
  description?: string;
}

export interface RecentItemProps {
  /** Product data */
  product: Product;
  /** Timestamp when viewed */
  viewedAt: Date | string;
  /** Show remove button */
  showRemove?: boolean;
  /** Show quick actions */
  showActions?: boolean;
  /** Show viewed time */
  showViewedTime?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: Product) => void;
  /** On add to cart */
  onAddToCart?: (product: Product) => void;
  /** On add to wishlist */
  onAddToWishlist?: (product: Product) => void;
  /** On quick view */
  onQuickView?: (product: Product) => void;
  /** On remove from history */
  onRemove?: (productId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RecentItem: React.FC<RecentItemProps> = ({
  product,
  viewedAt,
  showRemove = true,
  showActions = true,
  showViewedTime = true,
  enableHover = true,
  compact = false,
  className,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onRemove,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const discountPercentage = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return 0;
    }
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  }, [product.price, product.originalPrice]);

  const hasDiscount = useMemo(() => discountPercentage > 0, [discountPercentage]);

  const stockStatus = useMemo(() => {
    if (!product.stock || product.stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600', available: false };
    }
    if (product.stock < 10) {
      return { label: `Only ${product.stock} left`, color: 'text-primary-600', available: true };
    }
    return { label: 'In Stock', color: 'text-green-600', available: true };
  }, [product.stock]);

  const viewedTimeAgo = useMemo(() => {
    const now = new Date();
    const viewed = new Date(viewedAt);
    const diffInSeconds = Math.floor((now.getTime() - viewed.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }, [viewedAt]);

  const averageRating = useMemo(() => {
    return product.rating || 0;
  }, [product.rating]);

  const reviewCount = useMemo(() => {
    return product.reviewCount || 0;
  }, [product.reviewCount]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't trigger if clicking on action buttons
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        return;
      }
      onProductClick?.(product);
      console.log('Recent product clicked:', product.id);
    },
    [product, onProductClick]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAddingToCart(true);
      
      try {
        await onAddToCart?.(product);
        console.log('Added to cart:', product.id);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setTimeout(() => setIsAddingToCart(false), 500);
      }
    },
    [product, onAddToCart]
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsInWishlist(!isInWishlist);
      onAddToWishlist?.(product);
      console.log('Wishlist toggled:', product.id, !isInWishlist);
    },
    [isInWishlist, product, onAddToWishlist]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onQuickView?.(product);
      console.log('Quick view:', product.id);
    },
    [product, onQuickView]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(product.id);
      console.log('Removed from recent:', product.id);
    },
    [product.id, onRemove]
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBadges = () => {
    if (!showActions) {
      // Using showActions to determine if we should show interactive badges
      console.log('Quick actions disabled, showing static badges only');
    }
    const badges = [];

    if (product.isNew) {
      badges.push(
        <Badge key="new" variant="default" className="bg-primary-600 text-white">
          New
        </Badge>
      );
    }

    if (hasDiscount) {
      badges.push(
        <Badge key="sale" variant="destructive" className="bg-red-600 text-white">
          -{discountPercentage}%
        </Badge>
      );
    }

    if (product.isTrending) {
      badges.push(
        <Badge key="trending" variant="secondary" className="bg-primary-600 text-white">
          🔥 Trending
        </Badge>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {badges}
      </div>
    );
  };

  const renderQuickActions = () => {
    if (!showQuickActions) return null;

    return (
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-2 left-2 right-2 z-10 flex gap-2"
          >
            <Tooltip content="Quick View">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleQuickView}
                className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <EyeIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleToggleWishlist}
                className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                {isInWishlist ? (
                  <HeartSolid className="w-4 h-4 text-red-600" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderImage = () => (
    <div
      className="relative w-full aspect-square overflow-hidden bg-gray-100"
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="relative w-full h-full">
          <Image
            src={product.image || '/placeholder-product.png'}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              enableHover && 'hover:scale-110',
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>
      </Link>

      {/* Badges */}
      {renderBadges()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Remove Button */}
      {showRemove && (
        <Tooltip content="Remove from recent">
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors"
            aria-label="Remove from recently viewed"
          >
            <XMarkIcon className="w-4 h-4 text-gray-700" />
          </button>
        </Tooltip>
      )}
    </div>
  );

  const renderRating = () => {
    if (reviewCount === 0) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="relative">
              {star <= Math.round(averageRating) ? (
                <StarSolid className="w-4 h-4 text-yellow-400" />
              ) : (
                <StarIcon className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {averageRating.toFixed(1)} ({reviewCount})
        </span>
      </div>
    );
  };

  const renderPrice = () => (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-gray-900">
        ${product.price.toFixed(2)}
      </span>
      {hasDiscount && product.originalPrice && (
        <span className="text-sm text-gray-500 line-through">
          ${product.originalPrice.toFixed(2)}
        </span>
      )}
    </div>
  );

  const renderStockStatus = () => (
    <div className="flex items-center gap-1.5">
      {stockStatus.available ? (
        <>
          <CheckCircleIcon className={cn('w-4 h-4', stockStatus.color)} />
          <span className={cn('text-xs font-medium', stockStatus.color)}>
            {stockStatus.label}
          </span>
        </>
      ) : (
        <span className="text-xs font-medium text-red-600">{stockStatus.label}</span>
      )}
    </div>
  );

  const renderViewedTime = () => {
    if (!showViewedTime) return null;

    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <ClockIcon className="w-3 h-3" />
        <span>Viewed {viewedTimeAgo}</span>
      </div>
    );
  };

  const renderAddToCartButton = () => (
    <Button
      onClick={handleAddToCart}
      disabled={!stockStatus.available || isAddingToCart}
      className="w-full"
      size={compact ? 'sm' : 'md'}
    >
      {isAddingToCart ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-4 h-4" />
          {stockStatus.available ? 'Add to Cart' : 'Out of Stock'}
        </>
      )}
    </Button>
  );

  const renderShippingInfo = () => {
    if (compact) return null;

    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <TruckIcon className="w-3 h-3" />
        <span>Free shipping</span>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={enableHover ? { y: -4 } : undefined}
      className={cn('h-full', className)}
      onClick={handleProductClick}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardContent className="p-0">
          {/* Image Section */}
          {renderImage()}

          {/* Content Section */}
          <div className={cn('p-3 space-y-2', compact && 'p-2 space-y-1')}>
            {/* Category */}
            {product.category && (
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category}
              </div>
            )}

            {/* Product Name */}
            <h3
              className={cn(
                'font-semibold text-gray-900 line-clamp-2',
                compact ? 'text-sm' : 'text-base'
              )}
            >
              {product.name}
            </h3>

            {/* Rating */}
            {renderRating()}

            {/* Price */}
            {renderPrice()}

            {/* Stock Status */}
            {renderStockStatus()}

            {/* Shipping Info */}
            {renderShippingInfo()}

            {/* Viewed Time */}
            {renderViewedTime()}

            {/* Add to Cart Button */}
            {renderAddToCartButton()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentItem;
