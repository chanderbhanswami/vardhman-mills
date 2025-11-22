/**
 * DealCard Component
 * 
 * Product card for deals with countdown timer and discount information.
 * 
 * Features:
 * - Multiple card variants
 * - Countdown timer integration
 * - Discount badges
 * - Stock availability
 * - Hover animations
 * - Quick actions
 * - Price comparison
 * - Savings calculation
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  FireIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '@/lib/utils/utils';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DealCardProps {
  /** Product data */
  product: Product;
  /** Deal end date */
  dealEndDate: Date | string;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured' | 'minimal' | 'horizontal';
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Show quick actions */
  showQuickActions?: boolean;
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { type: 'spring' as const, stiffness: 400 },
  },
};

const badgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 200 },
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DealCard: React.FC<DealCardProps> = ({
  product,
  dealEndDate,
  variant = 'default',
  showCountdown = true,
  showQuickActions = true,
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
  const salePrice = product.pricing?.salePrice?.amount || basePrice;
  const hasDiscount = salePrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;
  const savings = basePrice - salePrice;
  const stockQuantity = product.inventory?.quantity || 0;
  const isLowStock = product.inventory?.isLowStock || false;
  const isInStock = product.inventory?.isInStock || true;

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
      console.log('Deal favorited:', product.id);
    },
    [product.id, onFavorite]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product);
      console.log('Deal added to cart:', product.id);
    },
    [product, onAddToCart]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = useMemo(
    () => (
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        <motion.div variants={badgeVariants} initial="initial" animate="pulse">
          <Badge variant="default" size="sm" className="bg-red-600 text-white font-bold">
            <FireIcon className="w-4 h-4 mr-1" />
            Hot Deal
          </Badge>
        </motion.div>

        {hasDiscount && (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge variant="default" size="sm" className="bg-orange-600 text-white font-bold">
              <TagIcon className="w-4 h-4 mr-1" />
              {discountPercent}% OFF
            </Badge>
          </motion.div>
        )}

        {isLowStock && isInStock && (
          <Badge variant="default" size="sm" className="bg-yellow-600 text-white">
            Limited Stock
          </Badge>
        )}

        {!isInStock && (
          <Badge variant="default" size="sm" className="bg-gray-500 text-white">
            Sold Out
          </Badge>
        )}
      </div>
    ),
    [hasDiscount, discountPercent, isLowStock, isInStock]
  );

  const renderQuickActions = useMemo(
    () => {
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
    },
    [showQuickActions, isHovered, isFavorited, handleFavorite, handleClick]
  );

  const renderCountdown = useMemo(
    () => {
      if (!showCountdown) return null;

      return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Deal ends in:
          </p>
          <CountdownTimer endDate={dealEndDate} variant="compact" showLabels={false} showIcon={false} />
        </div>
      );
    },
    [showCountdown, dealEndDate]
  );

  const renderSavings = useMemo(
    () => {
      if (!hasDiscount) return null;

      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 dark:text-green-400 font-semibold">
            Save {formatCurrency(savings)}
          </span>
          <Badge variant="default" size="sm" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {discountPercent}% OFF
          </Badge>
        </div>
      );
    },
    [hasDiscount, savings, discountPercent]
  );

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
          'border-2 border-red-200 dark:border-red-800',
          'shadow-xl hover:shadow-2xl transition-all',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-72 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image
            src={product.media?.images?.[0]?.url || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {renderBadges}
          {renderQuickActions}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {product.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
            {product.name}
          </h3>

          {/* Countdown */}
          {renderCountdown}

          {/* Price */}
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(salePrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(basePrice)}
                </span>
              )}
            </div>
            {renderSavings}
          </div>

          {/* Stock Info */}
          {isLowStock && isInStock && (
            <p className="mt-3 text-sm text-orange-600 dark:text-orange-400 font-medium">
              Only {stockQuantity} left in stock!
            </p>
          )}

          {/* Add to Cart */}
          <Button
            variant="default"
            size="lg"
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={cn(
              'w-full mt-4',
              isInStock
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            {isInStock ? 'Grab This Deal' : 'Sold Out'}
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
          'border-2 border-red-200 dark:border-red-800',
          'hover:shadow-xl transition-all',
          className
        )}
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={product.media?.images?.[0]?.url || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
          {hasDiscount && (
            <Badge
              variant="default"
              size="sm"
              className="absolute top-1 left-1 bg-red-600 text-white text-xs"
            >
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1">{product.name}</h4>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(salePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(basePrice)}
              </span>
            )}
          </div>
          {showCountdown && (
            <CountdownTimer endDate={dealEndDate} variant="minimal" showLabels={false} showIcon={false} />
          )}
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
      {variant === 'horizontal' && renderCompactVariant()}
    </>
  );
};

export default DealCard;
