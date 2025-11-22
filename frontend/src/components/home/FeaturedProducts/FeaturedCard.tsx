/**
 * FeaturedCard Component
 * 
 * Product card specifically designed for featured products with enhanced visuals,
 * quick actions, and interactive elements.
 * 
 * Features:
 * - High-quality image display with zoom on hover
 * - Badge system (New, Sale, Trending, etc.)
 * - Quick add to cart/wishlist
 * - Rating and reviews display
 * - Price with discount information
 * - Stock availability indicator
 * - Color/size preview
 * - Skeleton loading state
 * - Responsive design
 * - Accessibility features
 * - Animation effects
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  ShareIcon,
  CheckIcon,
  TruckIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeaturedCardProps {
  /** Product data */
  product: Product;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show quick actions */
  showQuickActions?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Show stock info */
  showStockInfo?: boolean;
  /** Show color swatches */
  showColorSwatches?: boolean;
  /** Enable image zoom on hover */
  enableImageZoom?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On add to cart callback */
  onAddToCart?: (product: Product) => void;
  /** On add to wishlist callback */
  onAddToWishlist?: (product: Product) => void;
  /** On quick view callback */
  onQuickView?: (product: Product) => void;
  /** On share callback */
  onShare?: (product: Product) => void;
}

interface BadgeInfo {
  text: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ElementType;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VARIANT_CLASSES = {
  default: 'w-full',
  compact: 'w-full max-w-sm',
  detailed: 'w-full max-w-md',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  product,
  variant = 'default',
  showQuickActions = true,
  showBadges = true,
  showStockInfo = true,
  showColorSwatches = true,
  enableImageZoom = true,
  loading = false,
  className,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onShare,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const badges = useMemo((): BadgeInfo[] => {
    const badgeList: BadgeInfo[] = [];

    if (product.isNewArrival) {
      badgeList.push({
        text: 'New',
        variant: 'info',
        icon: SparklesIcon,
        className: 'bg-blue-500 text-white',
      });
    }

    if (product.isOnSale && product.pricing?.salePrice) {
      const discount = product.pricing.basePrice && product.pricing.salePrice 
        ? Math.round(((product.pricing.basePrice.amount - product.pricing.salePrice.amount) / product.pricing.basePrice.amount) * 100)
        : 0;
      
      if (discount > 0) {
        badgeList.push({
          text: `-${discount}%`,
          variant: 'error',
          icon: TagIcon,
          className: 'bg-red-500 text-white',
        });
      }
    }

    if (product.isBestseller) {
      badgeList.push({
        text: 'Bestseller',
        variant: 'warning',
        icon: FireIcon,
        className: 'bg-orange-500 text-white',
      });
    }

    if (product.inventory?.quantity && product.inventory.quantity < 10 && product.inventory.quantity > 0) {
      badgeList.push({
        text: 'Low Stock',
        variant: 'warning',
        icon: BoltIcon,
        className: 'bg-yellow-500 text-white',
      });
    }

    if (product.inventory?.quantity === 0) {
      badgeList.push({
        text: 'Out of Stock',
        variant: 'error',
        className: 'bg-gray-500 text-white',
      });
    }

    return badgeList;
  }, [product]);

  const discountedPrice = useMemo(() => {
    if (!product.pricing?.salePrice || !product.pricing?.basePrice) return null;
    return product.pricing.salePrice.amount;
  }, [product.pricing]);

  const isInStock = useMemo(() => {
    return product.inventory?.quantity && product.inventory.quantity > 0;
  }, [product.inventory]);

  const displayImage = useMemo(() => {
    if (product.colors && product.colors.length > 0 && selectedColorIndex < product.colors.length) {
      return product.colors[selectedColorIndex].image?.url || product.media?.images?.[0]?.url || '/placeholder-product.jpg';
    }
    return product.media?.images?.[0]?.url || '/placeholder-product.jpg';
  }, [product, selectedColorIndex]);

  const colorSwatches = useMemo(() => {
    return product.colors?.slice(0, 5) || [];
  }, [product.colors]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isInStock) return;

      setIsAddingToCart(true);
      console.log('Adding to cart:', product.name);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsAddingToCart(false);
      onAddToCart?.(product);
    },
    [product, isInStock, onAddToCart]
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsWishlisted(!isWishlisted);
      console.log('Toggle wishlist:', product.name, !isWishlisted);
      onAddToWishlist?.(product);
    },
    [product, isWishlisted, onAddToWishlist]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('Quick view:', product.name);
      onQuickView?.(product);
    },
    [product, onQuickView]
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('Share product:', product.name);
      onShare?.(product);
    },
    [product, onShare]
  );

  const handleColorSelect = useCallback((index: number) => {
    setSelectedColorIndex(index);
    console.log('Selected color index:', index);
  }, []);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', VARIANT_CLASSES[variant], className)}>
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Link href={`/products/${product.slug}`} passHref>
      <motion.div
        className={cn('group cursor-pointer', VARIANT_CLASSES[variant], className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* Product Image */}
            <motion.div
              className="relative w-full h-full"
              animate={enableImageZoom && isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <Skeleton className="absolute inset-0" />}
            </motion.div>

            {/* Badges */}
            {showBadges && badges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {badges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge
                      key={index}
                      className={cn(
                        'shadow-lg backdrop-blur-sm flex items-center gap-1',
                        badge.className
                      )}
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {badge.text}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-3 right-3 flex flex-col gap-2 z-10"
                  >
                    <Tooltip content={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleToggleWishlist}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg p-2"
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isWishlisted ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip content="Quick View">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleQuickView}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg p-2"
                        aria-label="Quick view product"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Share">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShare}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg p-2"
                        aria-label="Share product"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Stock Badge */}
            {showStockInfo && isInStock && product.inventory?.quantity && product.inventory.quantity < 20 && (
              <div className="absolute bottom-3 right-3 z-10">
                <Badge variant="warning" className="bg-orange-500/90 backdrop-blur-sm text-white shadow-lg">
                  Only {product.inventory.quantity} left
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                {product.brand.name}
              </p>
            )}

            {/* Product Name */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <StarSolidIcon
                      key={index}
                      className={cn(
                        'h-4 w-4',
                        index < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <StarIcon className="h-3 w-3 hidden" />
                  {product.rating.average?.toFixed(1)} ({product.reviewCount || 0})
                </span>
              </div>
            )}

            {/* Color Swatches */}
            {showColorSwatches && colorSwatches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Colors:</span>
                <div className="flex gap-1">
                  {colorSwatches.map((color, index) => {
                    const colorStyle = { backgroundColor: color.hexCode || '#cccccc' } as React.CSSProperties;
                    console.log('Color swatch rendered:', color.name, colorStyle);
                    
                    return (
                      <Tooltip key={index} content={color.name}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleColorSelect(index);
                          }}
                          className={cn(
                            'w-6 h-6 rounded-full border-2 transition-all overflow-hidden',
                            selectedColorIndex === index
                              ? 'border-blue-500 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                          aria-label={`Select ${color.name} color`}
                        >
                          <span 
                            className="block w-full h-full"
                            {...(colorStyle ? { style: colorStyle } : {})}
                          />
                          {selectedColorIndex === index && (
                            <CheckIcon className="h-4 w-4 text-white absolute inset-0 m-auto" />
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                  {product.colors && product.colors.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center ml-1">
                      +{product.colors.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {discountedPrice && product.pricing?.basePrice ? (
                <>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ${product.pricing.basePrice.amount.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${product.pricing?.basePrice?.amount?.toFixed(2) || '0.00'}
                </span>
              )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="line-clamp-1">{product.features[0]}</span>
              </div>
            )}

            {/* Free Shipping */}
            {product.pricing?.basePrice && product.pricing.basePrice.amount > 50 && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <TruckIcon className="h-4 w-4" />
                <span>Free Shipping</span>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!isInStock || isAddingToCart}
              aria-label={isInStock ? 'Add to cart' : 'Out of stock'}
            >
              {isAddingToCart ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </motion.div>
                  Adding...
                </>
              ) : !isInStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default FeaturedCard;
