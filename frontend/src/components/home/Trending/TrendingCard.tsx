/**
 * TrendingCard Component
 * 
 * Individual card component for displaying trending products with
 * rank indicators, badges, and comprehensive interaction features.
 * 
 * Features:
 * - Product image with hover effects
 * - Trending rank indicator
 * - Fire icon animation
 * - Quick view modal
 * - Add to cart/wishlist
 * - Rating display
 * - Price with discount
 * - Stock status
 * - Badge system (Hot, New, Limited)
 * - Growth percentage
 * - Social proof (views, likes)
 * - Responsive design
 * - Loading states
 * - Analytics tracking
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireIcon,
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrophyIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, FireIcon as FireSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TrendingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string | { _id: string; name: string; slug: string };
  rating?: number;
  reviewCount?: number;
  stock: number;
  rank: number;
  growthRate: number;
  views: number;
  likes: number;
  isHot?: boolean;
  isNew?: boolean;
  isLimited?: boolean;
  description?: string;
}

export interface TrendingCardProps {
  /** Trending product data */
  product: TrendingProduct;
  /** Show rank indicator */
  showRank?: boolean;
  /** Show growth rate */
  showGrowth?: boolean;
  /** Show social proof */
  showSocialProof?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: TrendingProduct) => void;
  /** On add to cart */
  onAddToCart?: (product: TrendingProduct) => void;
  /** On add to wishlist */
  onAddToWishlist?: (product: TrendingProduct) => void;
  /** On quick view */
  onQuickView?: (product: TrendingProduct) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TrendingCard: React.FC<TrendingCardProps> = ({
  product,
  showRank = true,
  showGrowth = true,
  showSocialProof = true,
  enableHover = true,
  compact = false,
  className,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
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
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.price, product.originalPrice]);

  const hasDiscount = discountPercentage > 0;

  const stockStatus = useMemo(() => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (product.stock < 10) return { text: `Only ${product.stock} left!`, color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  }, [product.stock]);

  const averageRating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  const rankColor = useMemo(() => {
    if (product.rank === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-500';
    if (product.rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400';
    if (product.rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700';
    return 'bg-gradient-to-br from-orange-500 to-red-500';
  }, [product.rank]);

  const rankIcon = useMemo(() => {
    if (product.rank <= 3) return TrophyIcon;
    return FireSolid;
  }, [product.rank]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent navigation if clicking on buttons
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      onProductClick?.(product);
      console.log('Trending product clicked:', product.id, 'Rank:', product.rank);
    },
    [product, onProductClick]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsAddingToCart(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        onAddToCart?.(product);
        console.log('Added trending product to cart:', product.id);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [product, onAddToCart]
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsInWishlist(!isInWishlist);
      onAddToWishlist?.(product);
      console.log(
        isInWishlist ? 'Removed from wishlist:' : 'Added to wishlist:',
        product.id
      );
    },
    [isInWishlist, product, onAddToWishlist]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onQuickView?.(product);
      console.log('Quick view trending product:', product.id);
    },
    [product, onQuickView]
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderRankBadge = () => {
    if (!showRank) return null;

    const RankIcon = rankIcon;

    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'absolute top-3 left-3 z-20',
          'rounded-full p-2 shadow-lg',
          'border-2 border-white',
          rankColor
        )}
      >
        <div className="flex items-center justify-center w-8 h-8">
          {product.rank <= 3 ? (
            <RankIcon className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white font-bold text-sm">#{product.rank}</span>
          )}
        </div>
      </motion.div>
    );
  };

  const renderBadges = () => (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
      {product.isHot && (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
          <FireSolid className="w-3 h-3 mr-1 animate-pulse" />
          HOT
        </Badge>
      )}
      {hasDiscount && (
        <Badge className="bg-red-600 text-white shadow-lg">
          -{discountPercentage}%
        </Badge>
      )}
      {product.isNew && (
        <Badge className="bg-blue-600 text-white shadow-lg">
          NEW
        </Badge>
      )}
      {product.isLimited && (
        <Badge className="bg-purple-600 text-white shadow-lg">
          <BoltIcon className="w-3 h-3 mr-1" />
          LIMITED
        </Badge>
      )}
    </div>
  );

  const renderGrowthIndicator = () => {
    if (!showGrowth || product.growthRate <= 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-3 left-3 z-20 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold shadow-md flex items-center gap-1"
      >
        <FireIcon className="w-3 h-3" />
        +{product.growthRate}% growth
      </motion.div>
    );
  };

  const renderSocialProof = () => {
    if (!showSocialProof) return null;

    return (
      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
        <Tooltip content="Total views">
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>{(product.views / 1000).toFixed(1)}k</span>
          </div>
        </Tooltip>
        <Tooltip content="People like this">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{product.likes}</span>
          </div>
        </Tooltip>
      </div>
    );
  };

  const renderQuickActions = () => {
    if (!enableHover) return null;

    return (
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 z-20 bg-white/90 backdrop-blur-sm p-4 flex items-center justify-center gap-2"
          >
            <Tooltip content="Quick View">
              <Button
                size="sm"
                variant="outline"
                onClick={handleQuickView}
                className="hover:bg-blue-50 hover:border-blue-500"
              >
                <EyeIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleWishlist}
                className="hover:bg-pink-50 hover:border-pink-500"
              >
                {isInWishlist ? (
                  <HeartSolid className="w-4 h-4 text-pink-600" />
                ) : (
                  <HeartOutline className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={enableHover ? { y: -5 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn('group', className)}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      <Card className="overflow-hidden border-2 hover:border-orange-500 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
              <motion.div
                whileHover={enableHover ? { scale: 1.1 } : undefined}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    'object-cover transition-opacity duration-500',
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={handleImageLoad}
                />
              </motion.div>
            </Link>

            {/* Rank Badge */}
            {renderRankBadge()}

            {/* Badges */}
            {renderBadges()}

            {/* Growth Indicator */}
            {renderGrowthIndicator()}

            {/* Quick Actions */}
            {renderQuickActions()}

            {/* Loading Skeleton */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>

          {/* Product Info */}
          <div className={cn('p-4', compact && 'p-3')}>
            {/* Category */}
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {typeof product.category === 'object' && product.category?.name
                ? product.category.name
                : typeof product.category === 'string'
                  ? product.category
                  : 'Product'}
            </div>

            {/* Product Name */}
            <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
              <h3
                className={cn(
                  'font-semibold text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors',
                  compact ? 'text-sm' : 'text-base'
                )}
              >
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon
                      key={index}
                      className={cn(
                        'w-4 h-4',
                        index < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">({reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mt-3">
              <span
                className={cn(
                  'font-bold text-gray-900',
                  compact ? 'text-lg' : 'text-xl'
                )}
              >
                ₹{(product.price || 0).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={cn('flex items-center gap-1 mt-2', stockStatus.color)}>
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{stockStatus.text}</span>
            </div>

            {/* Social Proof */}
            {renderSocialProof()}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={cn(
                'w-full mt-4',
                'bg-orange-600 hover:bg-orange-700 text-white',
                'disabled:bg-gray-300'
              )}
              size={compact ? 'sm' : 'md'}
            >
              {isAddingToCart ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                  </motion.div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrendingCard;
