/**
 * NewArrivalsCard Component
 * 
 * Product card specifically designed for new arrivals with enhanced features,
 * badges, quick actions, and interactive elements.
 * 
 * Features:
 * - Product image with hover effects
 * - Multiple badge system (New, Sale, Limited, etc.)
 * - Quick action buttons (wishlist, quick view, compare)
 * - Color swatches selection
 * - Size selection
 * - Star rating display
 * - Price with discount
 * - Stock indicator
 * - Add to cart
 * - Countdown for limited offers
 * - Animation on hover
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  StarIcon as StarOutline,
  ClockIcon,
  CheckIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image?: string;
}

export interface ProductSize {
  id: string;
  name: string;
  available: boolean;
}

export interface NewArrivalsCardProps {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Product slug */
  slug: string;
  /** Product image URL */
  image: string;
  /** Hover image URL */
  hoverImage?: string;
  /** Product price */
  price: number;
  /** Original price (for discount) */
  originalPrice?: number;
  /** Product rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Available colors */
  colors?: ProductColor[];
  /** Available sizes */
  sizes?: ProductSize[];
  /** Stock quantity */
  stock?: number;
  /** Low stock threshold */
  lowStockThreshold?: number;
  /** Is new product */
  isNew?: boolean;
  /** Is on sale */
  isSale?: boolean;
  /** Is limited edition */
  isLimited?: boolean;
  /** Is trending */
  isTrending?: boolean;
  /** Countdown end date for limited offers */
  countdownDate?: Date;
  /** Additional CSS classes */
  className?: string;
  /** On add to cart */
  onAddToCart?: (productId: string, colorId?: string, sizeId?: string) => void;
  /** On add to wishlist */
  onAddToWishlist?: (productId: string) => void;
  /** On quick view */
  onQuickView?: (productId: string) => void;
  /** On compare */
  onCompare?: (productId: string) => void;
  /** Is in wishlist */
  isInWishlist?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NewArrivalsCard: React.FC<NewArrivalsCardProps> = ({
  id,
  name,
  slug,
  image,
  hoverImage,
  price,
  originalPrice,
  rating = 0,
  reviewCount = 0,
  colors = [],
  sizes = [],
  stock = 0,
  lowStockThreshold = 10,
  isNew = false,
  isSale = false,
  isLimited = false,
  isTrending = false,
  countdownDate,
  className,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onCompare,
  isInWishlist = false,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colors[0]?.id
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes.find((s) => s.available)?.id
  );
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const discount = useMemo(() => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [price, originalPrice]);

  const isLowStock = useMemo(() => {
    return stock > 0 && stock <= lowStockThreshold;
  }, [stock, lowStockThreshold]);

  const isOutOfStock = useMemo(() => stock === 0, [stock]);

  const displayImage = useMemo(() => {
    if (isHovered && hoverImage) return hoverImage;
    if (selectedColor) {
      const color = colors.find((c) => c.id === selectedColor);
      if (color?.image) return color.image;
    }
    return image;
  }, [isHovered, hoverImage, selectedColor, colors, image]);

  const badges = useMemo(() => {
    const badgeList = [];
    if (isNew) badgeList.push({ id: 'new', label: 'New', variant: 'default' as const, icon: <SparklesIcon className="h-3 w-3" />, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' });
    if (isSale && discount > 0) badgeList.push({ id: 'sale', label: `-${discount}%`, variant: 'default' as const, icon: <TagIcon className="h-3 w-3" />, color: 'bg-gradient-to-r from-red-500 to-pink-500' });
    if (isLimited) badgeList.push({ id: 'limited', label: 'Limited', variant: 'default' as const, icon: <BoltIcon className="h-3 w-3" />, color: 'bg-gradient-to-r from-blue-500 to-purple-500' });
    if (isTrending) badgeList.push({ id: 'trending', label: 'Hot', variant: 'default' as const, icon: <FireIcon className="h-3 w-3" />, color: 'bg-gradient-to-r from-orange-500 to-red-500' });
    return badgeList;
  }, [isNew, isSale, discount, isLimited, isTrending]);

  // ============================================================================
  // COUNTDOWN
  // ============================================================================

  React.useEffect(() => {
    if (!countdownDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate.getTime() - now;

      if (distance < 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [countdownDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    await onAddToCart?.(id, selectedColor, selectedSize);
    setTimeout(() => setIsAddingToCart(false), 1000);
    console.log('Added to cart:', { id, selectedColor, selectedSize });
  }, [id, selectedColor, selectedSize, onAddToCart]);

  const handleToggleWishlist = useCallback(() => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(id);
    console.log('Wishlist toggled:', id);
  }, [id, isWishlisted, onAddToWishlist]);

  const handleQuickView = useCallback(() => {
    onQuickView?.(id);
    console.log('Quick view:', id);
  }, [id, onQuickView]);

  const handleCompare = useCallback(() => {
    onCompare?.(id);
    console.log('Compare:', id);
  }, [id, onCompare]);

  const handleColorChange = useCallback((colorId: string) => {
    setSelectedColor(colorId);
    console.log('Color selected:', colorId);
  }, []);

  const handleSizeChange = useCallback((sizeId: string) => {
    setSelectedSize(sizeId);
    console.log('Size selected:', sizeId);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBadges = () => {
    if (badges.length === 0) return null;

    return (
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant={badge.variant}
              className={cn(
                'text-white border-0 text-xs font-bold shadow-lg',
                badge.color
              )}
            >
              {badge.icon}
              <span className="ml-1">{badge.label}</span>
            </Badge>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderQuickActions = () => (
    <AnimatePresence>
      {(isHovered || showQuickActions) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-3 right-3 z-10 flex flex-col gap-2"
        >
          <Tooltip content={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={cn(
                'p-2 rounded-full backdrop-blur-md transition-colors',
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-900 hover:bg-white'
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? (
                <HeartSolid className="h-5 w-5" />
              ) : (
                <HeartOutline className="h-5 w-5" />
              )}
            </motion.button>
          </Tooltip>

          <Tooltip content="Quick view">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full backdrop-blur-md transition-colors"
              aria-label="Quick view"
            >
              <EyeIcon className="h-5 w-5" />
            </motion.button>
          </Tooltip>

          <Tooltip content="Compare">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full backdrop-blur-md transition-colors"
              aria-label="Compare"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
            </motion.button>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderRating = () => {
    if (rating === 0) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}>
              {star <= rating ? (
                <StarSolid className="h-4 w-4 text-yellow-400" />
              ) : (
                <StarOutline className="h-4 w-4 text-gray-300" />
              )}
            </span>
          ))}
        </div>
        {reviewCount > 0 && (
          <span className="text-sm text-gray-500">({reviewCount})</span>
        )}
      </div>
    );
  };

  const renderColorSwatches = () => {
    if (colors.length === 0) return null;

    return (
      <div className="flex gap-2">
        {colors.slice(0, 5).map((color) => (
          <Tooltip key={color.id} content={color.name}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleColorChange(color.id)}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                selectedColor === color.id
                  ? 'border-gray-900 ring-2 ring-gray-300'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.name} color`}
            >
              {selectedColor === color.id && (
                <CheckIcon className="h-4 w-4 text-white drop-shadow" />
              )}
            </motion.button>
          </Tooltip>
        ))}
        {colors.length > 5 && (
          <span className="text-xs text-gray-500 self-center">
            +{colors.length - 5}
          </span>
        )}
      </div>
    );
  };

  const renderSizeSelection = () => {
    if (sizes.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Tooltip
            key={size.id}
            content={size.available ? size.name : 'Out of stock'}
          >
            <motion.button
              whileHover={size.available ? { scale: 1.05 } : {}}
              whileTap={size.available ? { scale: 0.95 } : {}}
              onClick={() => size.available && handleSizeChange(size.id)}
              disabled={!size.available}
              className={cn(
                'px-3 py-1 text-sm rounded border transition-all',
                selectedSize === size.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : size.available
                  ? 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              )}
              aria-label={`Select size ${size.name}`}
            >
              {size.name}
            </motion.button>
          </Tooltip>
        ))}
      </div>
    );
  };

  const renderCountdown = () => {
    if (!countdownDate || (countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0)) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 text-xs text-red-600">
        <ClockIcon className="h-4 w-4 animate-pulse" />
        <span className="font-semibold">
          {countdown.hours}h {countdown.minutes}m {countdown.seconds}s left
        </span>
      </div>
    );
  };

  const renderStockIndicator = () => {
    if (isOutOfStock) {
      return (
        <Badge variant="destructive" className="text-xs">
          Out of Stock
        </Badge>
      );
    }

    if (isLowStock) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-primary-600">
            <span className="font-semibold">Only {stock} left!</span>
          </div>
          <Progress value={(stock / lowStockThreshold) * 100} className="h-1 bg-gray-200" />
        </div>
      );
    }

    return null;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowQuickActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickActions(false);
      }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <CardContent className="p-0">
          {/* Image Section */}
          <Link href={`/products/${slug}`}>
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={displayImage}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Badges */}
              {renderBadges()}

              {/* Quick Actions */}
              {renderQuickActions()}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-lg font-bold">Out of Stock</span>
                </div>
              )}
            </div>
          </Link>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Product Name */}
            <Link href={`/products/${slug}`}>
              <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>

            {/* Rating */}
            {renderRating()}

            {/* Colors */}
            {renderColorSwatches()}

            {/* Sizes */}
            {renderSizeSelection()}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Countdown */}
            {renderCountdown()}

            {/* Stock Indicator */}
            {renderStockIndicator()}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={cn(
                'w-full transition-all duration-300',
                isAddingToCart && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isAddingToCart ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Added!
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewArrivalsCard;
