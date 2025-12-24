/**
 * BrandCard Component
 * 
 * Individual brand display card with multiple variants.
 * 
 * Features:
 * - Multiple card variants (default, compact, featured, minimal, horizontal)
 * - Hover effects with animations
 * - Brand logo display
 * - Product count badge
 * - Follow/favorite functionality
 * - Quick view action
 * - Social proof indicators
 * - Rating display
 * - Responsive design
 * - Link navigation
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
  CheckBadgeIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';
import type { Brand } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BrandCardProps {
  /** Brand data */
  brand: Brand;
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured' | 'minimal' | 'horizontal';
  /** Show product count */
  showProductCount?: boolean;
  /** Show follow button */
  showFollowButton?: boolean;
  /** Show quick view */
  showQuickView?: boolean;
  /** Show rating */
  showRating?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On click handler */
  onClick?: (brand: Brand) => void;
  /** On follow handler */
  onFollow?: (brandId: string) => void;
  /** On quick view handler */
  onQuickView?: (brand: Brand) => void;
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

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  variant = 'default',
  showProductCount = true,
  showFollowButton = true,
  showQuickView = true,
  showRating = true,
  animated = true,
  className,
  onClick,
  onFollow,
  onQuickView,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const brandUrl = useMemo(() => `/brands/${brand.slug}`, [brand.slug]);

  const brandLogo = useMemo(() => {
    return brand.logo?.url || brand.bannerImage?.url || '/images/placeholder-brand.png';
  }, [brand.logo, brand.bannerImage]);

  const averageRating = useMemo(() => {
    // Calculate from brand's product ratings (mock data)
    return 4.5;
  }, []);

  const reviewCount = useMemo(() => {
    // Mock review count
    return 1250;
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        e.preventDefault();
        onClick(brand);
      }
    },
    [onClick, brand]
  );

  const handleFollowClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFollowing(prev => !prev);
      if (onFollow) {
        onFollow(brand.id);
      }
    },
    [brand.id, onFollow]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onQuickView) {
        onQuickView(brand);
      }
    },
    [brand, onQuickView]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = useCallback(() => {
    return (
      <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
        {brand.isFeatured && (
          <Badge variant="default" size="sm" className="bg-blue-600 text-white">
            <CheckBadgeIcon className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {brand.isVisible && showProductCount && (
          <Badge variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
            {formatNumber(brand.productCount)} Products
          </Badge>
        )}
      </div>
    );
  }, [brand, showProductCount]);

  const renderQuickActions = useCallback(() => {
    if (!isHovered) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-3 right-3 flex flex-col gap-2 z-10"
      >
        {showFollowButton && (
          <Tooltip content={isFollowing ? 'Unfollow' : 'Follow'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFollowClick}
              className={cn(
                'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white',
                isFollowing && 'text-red-600'
              )}
              aria-label={isFollowing ? 'Unfollow brand' : 'Follow brand'}
            >
              {isFollowing ? (
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
              aria-label="Quick view brand"
            >
              <EyeIcon className="w-5 h-5" />
            </Button>
          </Tooltip>
        )}
      </motion.div>
    );
  }, [isHovered, isFollowing, showFollowButton, showQuickView, handleFollowClick, handleQuickView]);

  const renderRating = useCallback(() => {
    if (!showRating) return null;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>
              {i < Math.floor(averageRating) ? (
                <StarIconSolid className="w-4 h-4 text-yellow-400" />
              ) : (
                <StarIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              )}
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {averageRating.toFixed(1)} ({formatNumber(reviewCount)})
        </span>
      </div>
    );
  }, [showRating, averageRating, reviewCount]);

  const renderSocialProof = useCallback(() => {
    if (!brand.followersCount) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <UserGroupIcon className="w-4 h-4" />
        <span>{formatNumber(brand.followersCount)} followers</span>
      </div>
    );
  }, [brand.followersCount]);

  const renderContent = useCallback(() => {
    return (
      <>
        <div className="space-y-3">
          {/* Brand Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {brand.name}
          </h3>

          {/* Description */}
          {brand.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {brand.description}
            </p>
          )}

          {/* Rating */}
          {renderRating()}

          {/* Social Proof */}
          {renderSocialProof()}

          {/* Founded Year */}
          {brand.foundedYear && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Est. {brand.foundedYear}
            </p>
          )}
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 group"
          aria-label={`View ${brand.name}`}
        >
          View Brand
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </>
    );
  }, [brand, renderRating, renderSocialProof]);

  // ============================================================================
  // VARIANT RENDERERS
  // ============================================================================

  const renderDefaultVariant = () => (
    <Link href={brandUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-white dark:bg-gray-800 rounded-xl overflow-hidden',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-lg',
          'hover:border-primary-400 dark:hover:border-primary-500',
          'transition-all duration-300',
          className
        )}
      >
        {/* Top Badge - With strong left fade */}
        {brand.isFeatured && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-300/60 via-amber-500 to-orange-600 text-white rounded-full text-xs font-bold shadow-lg">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              Featured
            </div>
          </div>
        )}

        {/* Logo Section */}
        <div className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 border-b border-gray-100 dark:border-gray-700">
          <div className="relative h-32 flex items-center justify-center overflow-hidden">
            <motion.div
              variants={animated ? imageVariants : undefined}
              whileHover={animated ? { scale: 1.1 } : undefined}
              className="relative w-full h-full"
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Image
                src={brandLogo}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Brand Title & Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold" style={{ color: '#1a202c' }}>
              {brand.name}
            </h3>
            {brand.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {brand.description}
              </p>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            {/* Product Count */}
            {showProductCount && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatNumber(brand.productCount)} Products
                </span>
              </div>
            )}

            {/* Rating */}
            {showRating && (
              <div className="flex items-center gap-1.5 ml-auto">
                <StarIconSolid className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({formatNumber(reviewCount)})
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              View Products
              <ArrowRightIcon className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-4 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hover Gradient Overlay on Logo Only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-0 left-0 right-0 h-[calc(8rem+4rem+1px)] bg-gradient-to-b from-transparent via-primary-500/5 to-primary-500/10 pointer-events-none"
          style={{ height: 'calc(8rem + 4rem + 1px)' }}
        />
      </motion.div>
    </Link>
  );

  const renderCompactVariant = () => (
    <Link href={brandUrl} onClick={handleCardClick}>
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
          {/* Logo */}
          <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={brandLogo}
              alt={brand.name}
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {brand.name}
            </h3>
            {showProductCount && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(brand.productCount)} products
              </p>
            )}
          </div>

          {/* Follow Button */}
          {showFollowButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFollowClick}
              className={cn('flex-shrink-0', isFollowing && 'text-red-600')}
              aria-label={isFollowing ? 'Unfollow brand' : 'Follow brand'}
            >
              {isFollowing ? (
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
    <Link href={brandUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
          'rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800',
          'shadow-xl hover:shadow-2xl transition-shadow',
          className
        )}
      >
        {/* Banner Image */}
        {brand.bannerImage && (
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            <Image
              src={brand.bannerImage.url}
              alt={brand.name}
              fill
              className="object-cover opacity-50"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Logo - Overlapping */}
        <div className="relative -mt-12 px-6">
          <div className="relative w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border-4 border-white dark:border-gray-800">
            <Image
              src={brandLogo}
              alt={brand.name}
              fill
              className="object-contain p-1"
              sizes="96px"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 text-center">{renderContent()}</div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 z-10">{renderQuickActions()}</div>
      </motion.div>
    </Link>
  );

  const renderMinimalVariant = () => (
    <Link href={brandUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        className={cn(
          'group p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
          className
        )}
      >
        <div className="text-center space-y-3">
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <Image
              src={brandLogo}
              alt={brand.name}
              fill
              className="object-contain p-3"
              sizes="80px"
            />
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {brand.name}
          </h3>

          {/* Product Count */}
          {showProductCount && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(brand.productCount)} products
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );

  const renderHorizontalVariant = () => (
    <Link href={brandUrl} onClick={handleCardClick}>
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        whileHover={animated ? 'hover' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group bg-white dark:bg-gray-800 rounded-xl overflow-hidden',
          'border border-gray-200 dark:border-gray-700',
          'shadow-lg hover:shadow-xl transition-shadow',
          className
        )}
      >
        <div className="flex">
          {/* Image Side */}
          <div className="relative w-1/3 min-h-[200px] bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <motion.div variants={animated ? imageVariants : undefined}>
              <Image
                src={brandLogo}
                alt={brand.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </motion.div>

            {/* Badges */}
            {renderBadges()}
          </div>

          {/* Content Side */}
          <div className="flex-1 p-6">
            {renderContent()}

            {/* Quick Actions */}
            <div className="absolute top-3 right-3">{renderQuickActions()}</div>
          </div>
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
      {variant === 'horizontal' && renderHorizontalVariant()}
    </>
  );
};

export default BrandCard;
