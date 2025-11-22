/**
 * FavoritesCard Component
 * 
 * Product card for favorites section with enhanced features.
 * 
 * Features:
 * - Multiple card variants
 * - Quick add to cart
 * - Favorite toggle
 * - Hover animations
 * - Badge overlays
 * - Rating display
 * - Price information
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import { formatNumber, formatCurrency } from '@/lib/format';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FavoritesCardProps {
  /** Product data */
  product: Product;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
  /** Show quick actions */
  showQuickActions?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On click handler */
  onClick?: (product: Product) => void;
  /** On favorite handler */
  onFavorite?: (productId: string) => void;
  /** On add to cart handler */
  onAddToCart?: (product: Product) => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
  hover: {
    y: -8,
    transition: { type: 'spring' as const, stiffness: 400 },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const FavoritesCard: React.FC<FavoritesCardProps> = ({
  product,
  variant = 'default',
  showQuickActions = true,
  showBadges = true,
  animated = true,
  className,
  onClick,
  onFavorite,
  onAddToCart,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const productUrl = `/products/${product.slug}`;
  const basePrice = product.pricing?.basePrice?.amount || 0;
  const salePrice = product.pricing?.salePrice?.amount;
  const hasDiscount = salePrice && salePrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - salePrice!) / basePrice) * 100)
    : 0;
  const stockQuantity = product.inventory?.quantity || 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        e.preventDefault();
        onClick(product);
      }
    },
    [onClick, product]
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFavorited((prev: boolean) => !prev);
      onFavorite?.(product.id);
      console.log('Favorite toggled for product:', product.id);
    },
    [product.id, onFavorite]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product);
    },
    [product, onAddToCart]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = useCallback(() => {
    if (!showBadges) return null;

    console.log('Rendering badges for product:', product.id);

    return (
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {product.isFeatured && (
          <Badge variant="default" size="sm" className="bg-yellow-500 text-white">
            Featured
          </Badge>
        )}
        {product.isNewArrival && (
          <Badge variant="default" size="sm" className="bg-green-600 text-white">
            New
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="default" size="sm" className="bg-red-600 text-white">
            -{discountPercent}%
          </Badge>
        )}
        {stockQuantity === 0 && (
          <Badge variant="default" size="sm" className="bg-gray-500 text-white">
            Out of Stock
          </Badge>
        )}
      </div>
    );
  }, [showBadges, product.id, product.isFeatured, product.isNewArrival, hasDiscount, discountPercent, stockQuantity]);

  const renderQuickActions = useCallback(() => {
    if (!showQuickActions || !isHovered) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute top-3 right-3 flex flex-col gap-2 z-10"
      >
        <Tooltip content={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={cn(
              'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm',
              isFavorited && 'text-red-600'
            )}
          >
            {isFavorited ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
          </Button>
        </Tooltip>
        <Tooltip content="Quick view">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm"
          >
            <EyeIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      </motion.div>
    );
  }, [showQuickActions, isHovered, isFavorited, handleFavorite, handleClick]);

  const renderRating = useCallback(() => {
    if (!product.rating) return null;

    const avgRating = product.rating.average || 0;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < Math.floor(avgRating) ? (
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          ({formatNumber(product.reviewCount || 0)})
        </span>
      </div>
    );
  }, [product.rating, product.reviewCount]);

  const renderPrice = useCallback(() => {
    const finalPrice = salePrice || basePrice;
    const formattedFinalPrice = formatCurrency(finalPrice);
    const formattedBasePrice = formatCurrency(basePrice);

    return (
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formattedFinalPrice}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-500 line-through">
            {formattedBasePrice}
          </span>
        )}
      </div>
    );
  }, [basePrice, salePrice, hasDiscount]);

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderDefaultVariant = () => (
    <Link href={productUrl} onClick={handleClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden',
          'border border-gray-200 dark:border-gray-700',
          'shadow-lg hover:shadow-xl transition-shadow',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image
            src={product.media?.images?.[0]?.url || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {renderBadges()}
          {renderQuickActions()}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {renderRating()}

          {/* Price */}
          <div className="mt-3">{renderPrice()}</div>

          {/* Add to Cart */}
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToCart}
            disabled={stockQuantity === 0}
            className="w-full mt-4"
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            {stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </motion.div>
    </Link>
  );

  const renderCompactVariant = () => (
    <Link href={productUrl} onClick={handleClick}>
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'hover:shadow-lg transition-shadow',
          className
        )}
      >
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={product.media?.images?.[0]?.url || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h4>
          {renderRating()}
          <div className="mt-1">{renderPrice()}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleFavorite}>
          {isFavorited ? <HeartIconSolid className="w-5 h-5 text-red-600" /> : <HeartIcon className="w-5 h-5" />}
        </Button>
      </div>
    </Link>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {variant === 'default' && renderDefaultVariant()}
      {variant === 'compact' && renderCompactVariant()}
      {variant === 'featured' && renderDefaultVariant()}
      {variant === 'minimal' && renderCompactVariant()}
    </>
  );
};

export default FavoritesCard;
