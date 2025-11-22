'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  TagIcon,
  FireIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { SaleProduct, Sale } from '@/types/sale.types';

/**
 * SaleProductCard Component Props
 */
interface SaleProductCardProps {
  /**
   * Sale product data
   */
  saleProduct: SaleProduct;

  /**
   * Parent sale information (for countdown, type, etc.)
   */
  sale: Sale;

  /**
   * Display variant
   * - default: Standard card with all features
   * - compact: Smaller card with minimal info
   * - featured: Large featured card with emphasis
   * - list: Horizontal list layout
   * - minimal: Minimal card with basic info only
   */
  variant?: 'default' | 'compact' | 'featured' | 'list' | 'minimal';

  /**
   * Show/hide specific elements
   */
  showWishlist?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  showDiscount?: boolean;
  showCountdown?: boolean;
  showBadges?: boolean;
  showRating?: boolean;
  showStock?: boolean;

  /**
   * Wishlist state (controlled component)
   */
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;

  /**
   * Action callbacks
   */
  onAddToCart?: (saleProduct: SaleProduct, quantity: number) => void;
  onQuickView?: (saleProduct: SaleProduct) => void;
  onClick?: (saleProduct: SaleProduct) => void;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Format price for display
 */
const formatPrice = (price: { amount: number; currency: string }): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: price.currency || 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price.amount);
};

/**
 * Calculate time remaining
 */
const calculateTimeRemaining = (endDate: Date | string) => {
  const end = new Date(endDate);
  const now = new Date();
  const totalSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

  if (totalSeconds <= 0) {
    return { expired: true, urgent: false, timeText: 'Expired' };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const urgent = totalSeconds < 3600; // Less than 1 hour
  const timeText =
    hours > 24
      ? `${Math.floor(hours / 24)}d left`
      : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

  return { expired: false, urgent, timeText };
};

/**
 * Stock Status Component
 */
const StockStatus: React.FC<{
  availableQuantity: number;
  saleQuantity: number;
  className?: string;
}> = ({ availableQuantity, saleQuantity, className }) => {
  const stockPercentage = (availableQuantity / saleQuantity) * 100;
  const isLow = stockPercentage < 20;
  const isMedium = stockPercentage < 50;

  if (availableQuantity === 0) {
    return (
      <Badge variant="destructive" className={cn('gap-1.5', className)}>
        <XCircleIcon className="h-3 w-3" />
        Out of Stock
      </Badge>
    );
  }

  if (isLow) {
    return (
      <Badge variant="warning" className={cn('gap-1.5 animate-pulse', className)}>
        <FireIcon className="h-3 w-3" />
        Only {availableQuantity} left!
      </Badge>
    );
  }

  if (isMedium) {
    return (
      <Badge variant="secondary" className={cn('gap-1.5', className)}>
        <ClockIcon className="h-3 w-3" />
        {availableQuantity} in stock
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={cn('gap-1.5', className)}>
      <CheckCircleIcon className="h-3 w-3" />
      In Stock
    </Badge>
  );
};

// Fix: Import missing icon
import { XCircleIcon } from '@heroicons/react/24/outline';

/**
 * SaleProductCard Component
 * 
 * Comprehensive product card for sale items with multiple variants.
 * Features:
 * - 5 display variants (default, compact, featured, list, minimal)
 * - Price display with original/sale/discount
 * - Countdown timer integration
 * - Wishlist toggle with animation
 * - Quick view functionality
 * - Add to cart with quantity
 * - Stock status indicators
 * - Discount badges
 * - Hover effects and animations
 * - Responsive image handling
 * 
 * @example
 * ```tsx
 * <SaleProductCard
 *   saleProduct={saleProduct}
 *   sale={sale}
 *   variant="default"
 *   onAddToCart={(product, qty) => addToCart(product, qty)}
 * />
 * ```
 */
const SaleProductCard: React.FC<SaleProductCardProps> = ({
  saleProduct,
  sale,
  variant = 'default',
  showWishlist = true,
  showQuickView = true,
  showAddToCart = true,
  showDiscount = true,
  showCountdown = true,
  showBadges = true,
  showStock = true,
  isInWishlist = false,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onClick,
  animated = true,
  className,
}) => {
  const [quantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const { product } = saleProduct;
  if (!product) return null;

  const timeRemaining = showCountdown
    ? calculateTimeRemaining(sale.schedule.endDate)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(saleProduct, quantity);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(saleProduct.productId);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(saleProduct);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(saleProduct);
    }
  };

  // Calculate stock availability
  const isOutOfStock = saleProduct.availableQuantity === 0;

  // Get primary product image
  const primaryImage =
    product.media?.primaryImage ||
    (product.media?.images && product.media.images.length > 0
      ? product.media.images[0]
      : null);

  const imageUrl = primaryImage?.url || '/placeholder-product.png';

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    hover: {
      y: -4,
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
  };

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-shadow hover:shadow-md',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Image */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
              {showDiscount && (
                <Badge
                  variant="destructive"
                  className="absolute left-1 top-1 text-xs px-1.5 py-0.5"
                >
                  -{Math.round(saleProduct.discountPercentage)}%
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {formatPrice(saleProduct.salePrice)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(saleProduct.originalPrice)}
                </span>
              </div>
              {showStock && (
                <div className="mt-1">
                  <StockStatus
                    availableQuantity={saleProduct.availableQuantity}
                    saleQuantity={saleProduct.saleQuantity}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render compact variant
  if (variant === 'compact') {
    const CompactContainer = animated ? motion.div : Card;
    const compactProps = animated
      ? {
          variants: cardVariants,
          initial: 'initial',
          animate: 'animate',
          whileHover: 'hover',
        }
      : {};

    return (
      <CompactContainer
        {...compactProps}
        className={cn(
          'group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {/* Image Container */}
          <div
            className="relative aspect-square overflow-hidden bg-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Badges */}
            {showBadges && (
              <div className="absolute left-2 top-2 flex flex-col gap-1.5">
                {showDiscount && (
                  <Badge variant="destructive" className="gap-1">
                    <TagIcon className="h-3 w-3" />
                    {Math.round(saleProduct.discountPercentage)}% OFF
                  </Badge>
                )}
                {saleProduct.featured && (
                  <Badge variant="warning" className="gap-1">
                    <SparklesIcon className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {timeRemaining && timeRemaining.urgent && !timeRemaining.expired && (
                  <Badge variant="destructive" className="gap-1 animate-pulse">
                    <FireIcon className="h-3 w-3" />
                    {timeRemaining.timeText}
                  </Badge>
                )}
              </div>
            )}

            {/* Wishlist Button */}
            {showWishlist && (
              <button
                onClick={handleWishlistToggle}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-700" />
                )}
              </button>
            )}

            {/* Quick View Button (visible on hover) */}
            <AnimatePresence>
              {isHovered && showQuickView && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleQuickView}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg transition-transform hover:scale-105"
                  aria-label="Quick view"
                  title="Quick view"
                >
                  <EyeIcon className="inline h-4 w-4 mr-1.5" />
                  Quick View
                </motion.button>
              )}
            </AnimatePresence>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Badge variant="destructive" className="text-sm px-3 py-1.5">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(saleProduct.salePrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(saleProduct.originalPrice)}
              </span>
            </div>

            {/* Stock Status */}
            {showStock && (
              <StockStatus
                availableQuantity={saleProduct.availableQuantity}
                saleQuantity={saleProduct.saleQuantity}
                className="mb-2"
              />
            )}

            {/* Add to Cart Button */}
            {showAddToCart && !isOutOfStock && (
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="w-full"
                leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
              >
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </CompactContainer>
    );
  }

  // Render list variant (horizontal)
  if (variant === 'list') {
    return (
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {showDiscount && (
                <Badge
                  variant="destructive"
                  className="absolute left-2 top-2 gap-1"
                >
                  {Math.round(saleProduct.discountPercentage)}% OFF
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Wishlist */}
                {showWishlist && (
                  <button
                    onClick={handleWishlistToggle}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(saleProduct.salePrice)}
                    </span>
                    <span className="text-base text-gray-500 line-through">
                      {formatPrice(saleProduct.originalPrice)}
                    </span>
                    <Badge variant="success" className="ml-2">
                      Save {formatPrice(saleProduct.discountAmount)}
                    </Badge>
                  </div>

                  {/* Stock */}
                  {showStock && (
                    <StockStatus
                      availableQuantity={saleProduct.availableQuantity}
                      saleQuantity={saleProduct.saleQuantity}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {showQuickView && (
                    <Button
                      onClick={handleQuickView}
                      variant="outline"
                      size="sm"
                      leftIcon={<EyeIcon className="h-4 w-4" />}
                    >
                      Quick View
                    </Button>
                  )}
                  {showAddToCart && !isOutOfStock && (
                    <Button
                      onClick={handleAddToCart}
                      size="sm"
                      leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render featured variant (large prominent card)
  if (variant === 'featured') {
    const FeaturedContainer = animated ? motion.div : Card;
    const featuredProps = animated
      ? {
          variants: cardVariants,
          initial: 'initial',
          animate: 'animate',
          whileHover: 'hover',
        }
      : {};

    return (
      <FeaturedContainer
        {...featuredProps}
        className={cn(
          'group cursor-pointer overflow-hidden transition-shadow hover:shadow-2xl',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {/* Image Container */}
          <div
            className="relative aspect-[4/3] overflow-hidden bg-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1200px) 100vw, 50vw"
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            {showBadges && (
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {showDiscount && (
                  <Badge variant="destructive" className="gap-1.5 text-sm px-3 py-1.5">
                    <TagIcon className="h-4 w-4" />
                    {Math.round(saleProduct.discountPercentage)}% OFF
                  </Badge>
                )}
                {saleProduct.featured && (
                  <Badge variant="warning" className="gap-1.5 text-sm px-3 py-1.5">
                    <SparklesIcon className="h-4 w-4" />
                    Featured Deal
                  </Badge>
                )}
              </div>
            )}

            {/* Countdown */}
            {showCountdown && timeRemaining && !timeRemaining.expired && (
              <div className="absolute right-4 top-4">
                <Badge
                  variant={timeRemaining.urgent ? 'destructive' : 'secondary'}
                  className={cn(
                    'gap-1.5 text-sm px-3 py-1.5 backdrop-blur-sm',
                    timeRemaining.urgent && 'animate-pulse'
                  )}
                >
                  <ClockIcon className="h-4 w-4" />
                  {timeRemaining.timeText}
                </Badge>
              </div>
            )}

            {/* Wishlist */}
            {showWishlist && (
              <button
                onClick={handleWishlistToggle}
                className="absolute right-4 bottom-4 rounded-full bg-white/95 p-3 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            )}

            {/* Quick View */}
            <AnimatePresence>
              {isHovered && showQuickView && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Button
                    onClick={handleQuickView}
                    size="lg"
                    className="shadow-2xl"
                    leftIcon={<EyeIcon className="h-5 w-5" />}
                  >
                    Quick View
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {product.description}
              </p>
            )}

            {/* Price Section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(saleProduct.salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(saleProduct.originalPrice)}
                </span>
              </div>
              <Badge variant="success" className="text-sm px-3 py-1.5">
                Save {formatPrice(saleProduct.discountAmount)}
              </Badge>
            </div>

            {/* Stock Status */}
            {showStock && (
              <div className="mb-4">
                <StockStatus
                  availableQuantity={saleProduct.availableQuantity}
                  saleQuantity={saleProduct.saleQuantity}
                />
              </div>
            )}

            {/* Add to Cart */}
            {showAddToCart && !isOutOfStock && (
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
                leftIcon={<ShoppingCartIcon className="h-5 w-5" />}
              >
                Add to Cart
              </Button>
            )}

            {isOutOfStock && (
              <Button disabled size="lg" className="w-full">
                Out of Stock
              </Button>
            )}
          </div>
        </CardContent>
      </FeaturedContainer>
    );
  }

  // Render default variant
  const DefaultContainer = animated ? motion.div : Card;
  const defaultProps = animated
    ? {
        variants: cardVariants,
        initial: 'initial',
        animate: 'animate',
        whileHover: 'hover',
      }
    : {};

  return (
    <DefaultContainer
      {...defaultProps}
      className={cn(
        'group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div
          className="relative aspect-square overflow-hidden bg-gray-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Badges */}
          {showBadges && (
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {showDiscount && (
                <Badge variant="destructive" className="gap-1">
                  <TagIcon className="h-3.5 w-3.5" />
                  {Math.round(saleProduct.discountPercentage)}% OFF
                </Badge>
              )}
              {saleProduct.featured && (
                <Badge variant="warning" className="gap-1">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Featured
                </Badge>
              )}
              {saleProduct.badgeText && (
                <Badge variant="info" className="gap-1">
                  {saleProduct.badgeText}
                </Badge>
              )}
            </div>
          )}

          {/* Countdown */}
          {showCountdown && timeRemaining && !timeRemaining.expired && (
            <div className="absolute right-3 top-3">
              <Badge
                variant={timeRemaining.urgent ? 'destructive' : 'secondary'}
                className={cn(
                  'gap-1 backdrop-blur-sm',
                  timeRemaining.urgent && 'animate-pulse'
                )}
              >
                <ClockIcon className="h-3.5 w-3.5" />
                {timeRemaining.timeText}
              </Badge>
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className="absolute right-3 bottom-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlist ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          )}

          {/* Quick View Button */}
          <AnimatePresence>
            {isHovered && showQuickView && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleQuickView}
                className="absolute left-3 bottom-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-lg transition-transform hover:scale-105"
                aria-label="Quick view"
                title="Quick view"
              >
                <EyeIcon className="inline h-4 w-4 mr-1" />
                Quick View
              </motion.button>
            )}
          </AnimatePresence>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Badge variant="destructive" className="text-base px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(saleProduct.salePrice)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(saleProduct.originalPrice)}
            </span>
          </div>

          {/* Discount Badge */}
          {showDiscount && (
            <Badge variant="success" className="mb-3">
              Save {formatPrice(saleProduct.discountAmount)}
            </Badge>
          )}

          {/* Stock Status */}
          {showStock && (
            <div className="mb-3">
              <StockStatus
                availableQuantity={saleProduct.availableQuantity}
                saleQuantity={saleProduct.saleQuantity}
              />
            </div>
          )}

          {/* Add to Cart Button */}
          {showAddToCart && !isOutOfStock && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full"
              leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
            >
              Add to Cart
            </Button>
          )}

          {isOutOfStock && (
            <Button disabled size="sm" className="w-full">
              Out of Stock
            </Button>
          )}
        </div>
      </CardContent>
    </DefaultContainer>
  );
};

export default SaleProductCard;
