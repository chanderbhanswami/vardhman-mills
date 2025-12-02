/**
 * BestSellersCard Component
 * 
 * Product card component for displaying best-selling items.
 * 
 * Features:
 * - Product image carousel
 * - Quick view modal
 * - Add to cart/wishlist
 * - Rating display
 * - Price with discounts
 * - Size/color selection
 * - Hover effects
 * - Badge overlays
 * - Zoom on hover
 * - Stock indicators
 * - Quick actions
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ShareIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent } from '@/components/ui/Card';
import { formatNumber } from '@/lib/format';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BestSellersCardProps {
  /** Product data */
  product: Product;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  /** Show quick view button */
  showQuickView?: boolean;
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Show add to cart */
  showAddToCart?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Enable image carousel */
  enableCarousel?: boolean;
  /** Enable zoom on hover */
  enableZoom?: boolean;
  /** Is product in wishlist */
  isInWishlist?: boolean;
  /** Is product in cart */
  isInCart?: boolean;
  /** On click handler */
  onClick?: (product: Product) => void;
  /** On add to cart */
  onAddToCart?: (product: Product) => void;
  /** On wishlist toggle */
  onWishlistToggle?: (product: Product) => void;
  /** On quick view */
  onQuickView?: (product: Product) => void;
  /** On share */
  onShare?: (product: Product) => void;
  /** Additional CSS classes */
  className?: string;
}

interface QuickActionsState {
  showActions: boolean;
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const imageVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BestSellersCard: React.FC<BestSellersCardProps> = ({
  product,
  variant = 'default',
  showQuickView = true,
  showWishlist = true,
  showAddToCart = true,
  showShare = false,
  animated = true,
  enableCarousel = true,
  enableZoom = true,
  isInWishlist = false,
  isInCart = false,
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  onShare,
  className,
}) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quickActions, setQuickActions] = useState<QuickActionsState>({
    showActions: false,
    selectedSize: null,
    selectedColor: null,
    quantity: 1,
  });
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [addedToCart, setAddedToCart] = useState(isInCart);
  const [showNotification, setShowNotification] = useState<'cart' | 'wishlist' | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const images = useMemo(() => {
    return product.media?.images || [];
  }, [product.media]);

  const currentImage = useMemo(() => {
    return images[currentImageIndex] || product.media?.primaryImage || '/images/placeholder.jpg';
  }, [images, currentImageIndex, product.media]);

  const hasDiscount = useMemo(() => {
    return product.pricing?.salePrice &&
      product.pricing.salePrice.amount < product.pricing.basePrice.amount;
  }, [product.pricing]);

  const discountedPrice = useMemo(() => {
    if (!hasDiscount || !product.pricing) return product.pricing?.basePrice.amount || 0;
    return product.pricing.salePrice?.amount || product.pricing.basePrice.amount;
  }, [hasDiscount, product.pricing]);

  const discountPercentage = useMemo(() => {
    if (!hasDiscount || !product.pricing) return 0;
    const base = product.pricing.basePrice.amount;
    const sale = product.pricing.salePrice?.amount || base;
    return Math.round(((base - sale) / base) * 100);
  }, [hasDiscount, product.pricing]);

  const badges = useMemo(() => {
    const badgeList: { text: string; variant: 'default' | 'destructive' | 'secondary'; icon: React.ReactNode }[] = [];

    if (product.isBestseller) {
      badgeList.push({ text: 'Best Seller', variant: 'secondary', icon: <FireIcon className="w-3 h-3" /> });
    }
    if (product.isNewArrival) {
      badgeList.push({ text: 'New', variant: 'default', icon: <SparklesIcon className="w-3 h-3" /> });
    }
    if (hasDiscount && discountPercentage > 0) {
      badgeList.push({
        text: `-${discountPercentage}%`,
        variant: 'destructive',
        icon: <TagIcon className="w-3 h-3" />
      });
    }
    if (product.inventory?.quantity === 0) {
      badgeList.push({ text: 'Out of Stock', variant: 'destructive', icon: <XMarkIcon className="w-3 h-3" /> });
    } else if (product.inventory?.quantity && product.inventory.quantity < 5) {
      badgeList.push({ text: 'Low Stock', variant: 'destructive', icon: null });
    }

    return badgeList;
  }, [product, hasDiscount, discountPercentage]);

  const availableSizes = useMemo(() => {
    return product.sizes?.filter(size => size.isAvailable) || [];
  }, [product.sizes]);

  const availableColors = useMemo(() => {
    return product.colors?.filter(color => color.isAvailable) || [];
  }, [product.colors]);

  const isOutOfStock = useMemo(() => {
    return product.inventory?.quantity === 0;
  }, [product.inventory]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleAddToCart = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isOutOfStock) return;

    setAddedToCart(true);
    setShowNotification('cart');

    if (onAddToCart) {
      onAddToCart(product);
    }

    setTimeout(() => {
      setShowNotification(null);
    }, 2000);
  }, [isOutOfStock, onAddToCart, product]);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted((prev) => !prev);
    setShowNotification('wishlist');

    if (onWishlistToggle) {
      onWishlistToggle(product);
    }

    setTimeout(() => {
      setShowNotification(null);
    }, 2000);
  }, [onWishlistToggle, product]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onQuickView) {
      onQuickView(product);
    }
  }, [onQuickView, product]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onShare) {
      onShare(product);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.origin + `/products/${product.slug}`,
        });
      } catch (err) {
        // Share cancelled or failed
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + `/products/${product.slug}`;
      navigator.clipboard.writeText(url);
      setShowNotification('wishlist'); // Reuse notification
      setTimeout(() => setShowNotification(null), 2000);
    }
  }, [onShare, product]);

  const handleSizeSelect = useCallback((size: string) => {
    setQuickActions((prev) => ({
      ...prev,
      selectedSize: size,
    }));
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setQuickActions((prev) => ({
      ...prev,
      selectedColor: color,
    }));
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = useCallback(() => {
    if (badges.length === 0) return null;

    return (
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {badges.map((badge, index) => (
          <Badge key={index} variant={badge.variant} className="text-xs">
            {badge.icon}
            <span className={cn(badge.icon && 'ml-1')}>{badge.text}</span>
          </Badge>
        ))}
      </div>
    );
  }, [badges]);

  const renderQuickActions = useCallback(() => {
    if (!isHovered && !quickActions.showActions) return null;

    return (
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center gap-2"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {showQuickView && (
          <Tooltip content="Quick View">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickView}
              className="bg-background hover:bg-accent"
            >
              <EyeIcon className="w-5 h-5" />
            </Button>
          </Tooltip>
        )}

        {showWishlist && (
          <Tooltip content={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlistToggle}
              className="bg-white hover:bg-gray-100"
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </Button>
          </Tooltip>
        )}

        {showShare && (
          <Tooltip content="Share">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="bg-white hover:bg-gray-100"
            >
              <ShareIcon className="w-5 h-5" />
            </Button>
          </Tooltip>
        )}
      </motion.div>
    );
  }, [
    isHovered,
    quickActions.showActions,
    showQuickView,
    showWishlist,
    showShare,
    isWishlisted,
    handleQuickView,
    handleWishlistToggle,
    handleShare,
  ]);

  const renderCarouselControls = useCallback(() => {
    if (!enableCarousel || images.length <= 1 || !isHovered) return null;

    return (
      <>
        <button
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/90 rounded-full p-1 hover:bg-background shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 rounded-full p-1 hover:bg-white shadow-lg"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Image indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                index === currentImageIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              )}
            />
          ))}
        </div>
      </>
    );
  }, [enableCarousel, images, isHovered, currentImageIndex, handlePrevImage, handleNextImage]);

  const renderRating = useCallback(() => {
    const rating = product.rating?.average || 0;
    const reviewCount = product.reviewCount || 0;

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <StarIconSolid
              key={index}
              className={cn(
                'w-4 h-4',
                index < Math.floor(rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
        {reviewCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            ({formatNumber(reviewCount)})
          </span>
        )}
      </div>
    );
  }, [product.rating, product.reviewCount]);

  const renderPrice = useCallback(() => {
    const basePrice = product.pricing?.basePrice.amount || 0;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          ${discountedPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
            ${basePrice.toFixed(2)}
          </span>
        )}
      </div>
    );
  }, [discountedPrice, hasDiscount, product.pricing]);

  const renderSizeSelector = useCallback(() => {
    if (availableSizes.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
        <div className="flex flex-wrap gap-2">
          {availableSizes.slice(0, 5).map((size) => (
            <Button
              key={size.id}
              variant={quickActions.selectedSize === size.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSizeSelect(size.name)}
              className="min-w-[2.5rem]"
            >
              {size.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }, [availableSizes, quickActions.selectedSize, handleSizeSelect]);

  const renderColorSelector = useCallback(() => {
    if (availableColors.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
        <div className="flex flex-wrap gap-2">
          {availableColors.slice(0, 5).map((color) => {
            // Use predefined color classes or fallback
            const colorClasses = {
              red: 'bg-red-500',
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              yellow: 'bg-yellow-500',
              purple: 'bg-purple-500',
              pink: 'bg-pink-500',
              black: 'bg-black',
              white: 'bg-white border-gray-300',
              gray: 'bg-gray-500',
              orange: 'bg-orange-500',
            };

            const colorName = color.name.toLowerCase();
            const colorClass = colorClasses[colorName as keyof typeof colorClasses] || 'bg-gray-400';

            return (
              <Tooltip key={color.id} content={color.name}>
                <button
                  onClick={() => handleColorSelect(color.name)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    colorClass,
                    quickActions.selectedColor === color.name
                      ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  )}
                  aria-label={color.name}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  }, [availableColors, quickActions.selectedColor, handleColorSelect]);

  const renderNotification = useCallback(() => {
    if (!showNotification) return null;

    const message = showNotification === 'cart'
      ? 'Added to cart!'
      : isWishlisted
        ? 'Added to wishlist!'
        : 'Removed from wishlist!';

    return (
      <motion.div
        className="absolute top-4 right-4 z-30 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <CheckIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
      </motion.div>
    );
  }, [showNotification, isWishlisted]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={cardRef}
      className={cn('group', className)}
      variants={animated ? cardVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <Link href={`/products/${product.slug}`} className="relative">
          <motion.div
            className="relative aspect-square overflow-hidden bg-muted"
            variants={enableZoom ? imageVariants : undefined}
            initial="initial"
            whileHover={enableZoom ? 'hover' : undefined}
          >
            <Image
              src={typeof currentImage === 'string' ? currentImage : currentImage.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Badges */}
            {renderBadges()}

            {/* Quick Actions Overlay */}
            <AnimatePresence>
              {renderQuickActions()}
            </AnimatePresence>

            {/* Carousel Controls */}
            {renderCarouselControls()}
          </motion.div>
        </Link>

        {/* Content */}
        <CardContent className="flex flex-col flex-grow p-4">
          {/* Category */}
          {product.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {product.category.name}
            </span>
          )}

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {renderRating()}

          {/* Price */}
          <div className="mt-auto pt-3">
            {renderPrice()}
          </div>

          {/* Size Selector (Compact variants only) */}
          {variant === 'detailed' && renderSizeSelector()}

          {/* Color Selector (Compact variants only) */}
          {variant === 'detailed' && renderColorSelector()}

          {/* Add to Cart Button */}
          {showAddToCart && (
            <Button
              className="mt-3 w-full group"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {addedToCart ? (
                <>
                  <ShoppingCartIconSolid className="w-5 h-5 mr-2" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>
          )}
        </CardContent>

        {/* Notification */}
        <AnimatePresence>
          {renderNotification()}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default BestSellersCard;
