/**
 * CollectionCard Component
 * 
 * Individual collection display card with multiple variants.
 * 
 * Features:
 * - Multiple card variants (default, compact, featured, minimal, overlay)
 * - Hover effects with animations
 * - Collection image display
 * - Product count badge
 * - Favorite functionality
 * - Quick view action
 * - Type indicators
 * - Date display
 * - Responsive design
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
  EyeIcon,
  ArrowRightIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';
import type { Collection } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollectionCardProps {
  /** Collection data */
  collection: Collection;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured' | 'minimal' | 'overlay';
  /** Show product count */
  showProductCount?: boolean;
  /** Show favorite button */
  showFavoriteButton?: boolean;
  /** Show quick view */
  showQuickView?: boolean;
  /** Show dates */
  showDates?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On click handler */
  onClick?: (collection: Collection) => void;
  /** On favorite handler */
  onFavorite?: (collectionId: string) => void;
  /** On quick view handler */
  onQuickView?: (collection: Collection) => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
  hover: {
    y: -8,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17,
    },
  },
};

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  variant = 'default',
  showProductCount = true,
  showFavoriteButton = true,
  showQuickView = true,
  showDates = true,
  animated = true,
  className,
  onClick,
  onFavorite,
  onQuickView,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const collectionUrl = useMemo(() => `/collections/${collection.slug}`, [collection.slug]);

  const collectionImage = useMemo(() => {
    return collection.image?.url || collection.bannerImage?.url || '/images/placeholder-collection.png';
  }, [collection.image, collection.bannerImage]);

  const collectionType = useMemo(() => {
    const types: Record<string, string> = {
      manual: 'Curated',
      automatic: 'Smart',
      seasonal: 'Seasonal',
      promotional: 'Promo',
    };
    return types[collection.type] || collection.type;
  }, [collection.type]);

  const isActive = useMemo(() => {
    if (!collection.startDate && !collection.endDate) return true;

    const now = new Date();
    const start = collection.startDate ? new Date(collection.startDate) : null;
    const end = collection.endDate ? new Date(collection.endDate) : null;

    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [collection.startDate, collection.endDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        e.preventDefault();
        onClick(collection);
      }
    },
    [onClick, collection]
  );

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFavorited(prev => !prev);
      if (onFavorite) {
        onFavorite(collection.id);
      }
    },
    [collection.id, onFavorite]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onQuickView) {
        onQuickView(collection);
      }
    },
    [collection, onQuickView]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = useCallback(() => {
    return (
      <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
        {collection.isFeatured && (
          <Badge variant="default" size="sm" className="bg-blue-600 text-white">
            <SparklesIcon className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {!isActive && (
          <Badge variant="default" size="sm" className="bg-gray-500 text-white">
            Inactive
          </Badge>
        )}
        {collectionType && (
          <Badge variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
            {collectionType}
          </Badge>
        )}
      </div>
    );
  }, [collection.isFeatured, isActive, collectionType]);

  const renderQuickActions = useCallback(() => {
    if (!isHovered) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-3 right-3 flex flex-col gap-2 z-10"
      >
        {showFavoriteButton && (
          <Tooltip content={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={cn(
                'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white',
                isFavorited && 'text-red-600'
              )}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? (
                <HeartIconSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </Button>
          </Tooltip>
        )}
        {showQuickView && (
          <Tooltip content="Quick View">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickView}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
              aria-label="Quick view collection"
            >
              <EyeIcon className="w-5 h-5" />
            </Button>
          </Tooltip>
        )}
      </motion.div>
    );
  }, [isHovered, isFavorited, showFavoriteButton, showQuickView, handleFavoriteClick, handleQuickView]);

  const renderInfo = useCallback(() => {
    return (
      <div className="space-y-3">
        {/* Collection Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {collection.name}
        </h3>

        {/* Description */}
        {collection.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Product Count */}
        {showProductCount && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TagIcon className="w-4 h-4" />
            <span>{formatNumber(collection.productCount || 0)} products</span>
          </div>
        )}

        {/* Dates */}
        {showDates && (collection.startDate || collection.endDate) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <CalendarIcon className="w-4 h-4" />
            {collection.startDate && (
              <span>From {new Date(collection.startDate).toLocaleDateString()}</span>
            )}
            {collection.endDate && (
              <span>To {new Date(collection.endDate).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>
    );
  }, [collection, showProductCount, showDates]);

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderDefaultVariant = () => (
    <Link href={collectionUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-lg transition-all duration-300',
          className
        )}
      >
        {/* Image Container */}
        <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <motion.div
            variants={animated ? imageVariants : undefined}
            className="relative w-full h-full"
          >
            <Image
              src={collectionImage}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured Badge */}
          {collection.isFeatured && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="default"
                size="sm"
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 shadow-sm font-semibold px-3"
              >
                <span className="flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Featured</span>
                </span>
              </Badge>
            </div>
          )}

          {/* Product Count Pill - Bottom Left */}
          {showProductCount && (
            <div className="absolute bottom-3 left-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-gray-900 shadow-sm border border-gray-100">
                <TagIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold">
                  {formatNumber(collection.productCount || 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Below Image */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-2">
            {/* Type Badge */}
            {collectionType && (
              <Badge
                variant="secondary"
                size="sm"
                className="mb-3 text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-0"
              >
                {collectionType}
              </Badge>
            )}

            {/* Collection Name */}
            <h3 className="text-xl font-semibold text-black dark:text-white leading-tight mb-2 group-hover:text-primary-600 transition-colors">
              {collection.name}
            </h3>
          </div>

          {/* Description */}
          {collection.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-5">
              {collection.description}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
            {/* Dates */}
            {showDates && (collection.startDate || collection.endDate) && (
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 mb-4">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {collection.startDate && new Date(collection.startDate).toLocaleDateString()}
                  {collection.startDate && collection.endDate && ' - '}
                  {collection.endDate && new Date(collection.endDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* CTA Button */}
            <Button
              variant="default"
              size="sm"
              className="w-full bg-gray-900 hover:bg-black text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 font-bold tracking-wide py-5"
              aria-label={`View ${collection.name}`}
            >
              <span>View Collection</span>
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  const renderCompactVariant = () => (
    <Link href={collectionUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden',
          'border border-gray-200 dark:border-gray-700',
          'p-4 hover:shadow-lg transition-shadow',
          className
        )}
      >
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={collectionImage}
              alt={collection.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {collection.name}
            </h3>
            {showProductCount && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(collection.productCount || 0)} products
              </p>
            )}
          </div>

          {/* Favorite Button */}
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={cn('flex-shrink-0', isFavorited && 'text-red-600')}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? (
                <HeartIconSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </Link>
  );

  const renderFeaturedVariant = () => (
    <Link href={collectionUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          'rounded-2xl overflow-hidden border-2 border-purple-200 dark:border-purple-800',
          'shadow-xl hover:shadow-2xl transition-shadow',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-80 overflow-hidden">
          <Image
            src={collectionImage}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges */}
          {renderBadges()}

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 z-10">{renderQuickActions()}</div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {renderInfo()}

            {/* CTA */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 border-white text-white hover:bg-white hover:text-gray-900"
              aria-label={`View ${collection.name}`}
            >
              View Collection
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  const renderMinimalVariant = () => (
    <Link href={collectionUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        className={cn(
          'group p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center',
          className
        )}
      >
        {/* Image */}
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={collectionImage}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {collection.name}
        </h3>

        {/* Product Count */}
        {showProductCount && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatNumber(collection.productCount || 0)} products
          </p>
        )}
      </motion.div>
    </Link>
  );

  const renderOverlayVariant = () => (
    <Link href={collectionUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group rounded-xl overflow-hidden h-96',
          'shadow-lg hover:shadow-xl transition-shadow',
          className
        )}
      >
        {/* Background Image */}
        <Image
          src={collectionImage}
          alt={collection.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-colors" />

        {/* Badges */}
        {renderBadges()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {renderInfo()}

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 border-white text-white hover:bg-white hover:text-gray-900"
            aria-label={`View ${collection.name}`}
          >
            Explore Now
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </Link>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {variant === 'default' && renderDefaultVariant()}
      {variant === 'compact' && renderCompactVariant()}
      {variant === 'featured' && renderFeaturedVariant()}
      {variant === 'minimal' && renderMinimalVariant()}
      {variant === 'overlay' && renderOverlayVariant()}
    </>
  );
};

export default CollectionCard;
