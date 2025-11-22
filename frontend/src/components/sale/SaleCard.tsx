'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  TagIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  ArrowRightIcon,
  BookmarkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Sale, SaleType, SaleStatus } from '@/types/sale.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SaleCardProps {
  /**
   * Sale data
   */
  sale: Sale;

  /**
   * Display variant
   * - default: Standard card
   * - featured: Large featured card
   * - compact: Small compact card
   * - list: Horizontal list layout
   * - minimal: Minimal card with basic info
   */
  variant?: 'default' | 'featured' | 'compact' | 'list' | 'minimal';

  /**
   * Show countdown timer
   */
  showCountdown?: boolean;

  /**
   * Show product count
   */
  showProductCount?: boolean;

  /**
   * Show save/wishlist button
   */
  showSaveButton?: boolean;

  /**
   * Show share button
   */
  showShareButton?: boolean;

  /**
   * Show view details button
   */
  showViewButton?: boolean;

  /**
   * Is sale saved/bookmarked
   */
  isSaved?: boolean;

  /**
   * Callback when card is clicked
   */
  onClick?: (sale: Sale) => void;

  /**
   * Callback when save button is toggled
   */
  onSaveToggle?: (sale: Sale, saved: boolean) => void;

  /**
   * Callback when share button is clicked
   */
  onShare?: (sale: Sale) => void;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get sale type label
 */
const getSaleTypeLabel = (type: SaleType): string => {
  const labels: Record<SaleType, string> = {
    flash_sale: 'Flash Sale',
    seasonal_sale: 'Seasonal',
    clearance_sale: 'Clearance',
    end_of_season: 'End of Season',
    festival_sale: 'Festival',
    mega_sale: 'Mega Sale',
    weekend_sale: 'Weekend',
    daily_deals: 'Daily Deal',
    member_sale: 'Members Only',
    brand_sale: 'Brand Sale',
    category_sale: 'Category Sale',
    new_arrival_sale: 'New Arrivals',
    bundle_sale: 'Bundle',
    buy_one_get_one: 'BOGO',
    pre_order_sale: 'Pre-Order',
    warehouse_sale: 'Warehouse',
    liquidation_sale: 'Final Sale',
  };
  return labels[type] || 'Sale';
};

/**
 * Get sale status color
 */
const getSaleStatusColor = (status: SaleStatus): string => {
  const colors: Record<SaleStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-red-100 text-red-800',
    sold_out: 'bg-primary-100 text-primary-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Calculate time remaining
 */
const calculateTimeRemaining = (endDate: Date | string) => {
  const end = new Date(endDate);
  const now = new Date();
  const totalSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

  if (totalSeconds <= 0) return { expired: true, timeText: 'Ended' };

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return { expired: false, timeText: `${days}d ${hours}h left` };
  if (hours > 0) return { expired: false, timeText: `${hours}h ${minutes}m left` };
  return { expired: false, timeText: `${minutes}m left` };
};

/**
 * Format date
 */
const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Get discount percentage (if available)
 */
const getDiscountPercentage = (sale: Sale): number | null => {
  if (!sale.discountRules || sale.discountRules.length === 0) return null;
  
  const rule = sale.discountRules[0];
  if (rule.type === 'percentage' && rule.discount.value) {
    return rule.discount.value;
  }
  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SaleCard Component
 * 
 * Comprehensive sale event card with multiple display variants.
 * Features:
 * - 5 display variants (default, featured, compact, list, minimal)
 * - Countdown timer
 * - Save/bookmark functionality
 * - Share functionality
 * - Product count display
 * - Discount badge
 * - Status indicators
 * - Animated transitions
 * - Responsive images
 * 
 * @example
 * ```tsx
 * <SaleCard
 *   sale={saleData}
 *   variant="featured"
 *   showCountdown
 *   onClick={(sale) => router.push(`/sales/${sale.slug}`)}
 *   onSaveToggle={(sale, saved) => handleSaveToggle(sale, saved)}
 * />
 * ```
 */
export const SaleCard: React.FC<SaleCardProps> = ({
  sale,
  variant = 'default',
  showCountdown = true,
  showProductCount = true,
  showSaveButton = true,
  showShareButton = true,
  showViewButton = true,
  isSaved = false,
  onClick,
  onSaveToggle,
  onShare,
  animated = true,
  className,
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [imageError, setImageError] = useState(false);

  const timeRemaining = showCountdown
    ? calculateTimeRemaining(sale.schedule.endDate)
    : null;
  const discountPercent = getDiscountPercentage(sale);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = !saved;
    setSaved(newSaved);
    onSaveToggle?.(sale, newSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(sale);
  };

  const handleClick = () => {
    onClick?.(sale);
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { y: -4, transition: { duration: 0.2 } },
  };

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div
            className={cn(
              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:border-primary-300 hover:shadow-sm',
              className
            )}
            onClick={handleClick}
          >
            {/* Image */}
            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {!imageError && sale.thumbnailImage?.url ? (
                <Image
                  src={sale.thumbnailImage.url}
                  alt={sale.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TagIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{sale.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getSaleTypeLabel(sale.type)}
                </Badge>
                {timeRemaining && !timeRemaining.expired && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {timeRemaining.timeText}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        );

      case 'compact':
        return (
          <Card
            className={cn('cursor-pointer transition-all hover:shadow-md', className)}
            onClick={handleClick}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                {!imageError && sale.thumbnailImage?.url ? (
                  <Image
                    src={sale.thumbnailImage.url}
                    alt={sale.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TagIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <Badge variant="destructive" className="text-xs">
                    {getSaleTypeLabel(sale.type)}
                  </Badge>
                  {discountPercent && (
                    <Badge variant="warning" className="text-xs">
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>

                {/* Save Button */}
                {showSaveButton && (
                  <button
                    onClick={handleSaveToggle}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title={saved ? 'Remove from saved' : 'Save sale'}
                    aria-label={saved ? 'Remove from saved' : 'Save sale'}
                  >
                    {saved ? (
                      <BookmarkSolidIcon className="h-4 w-4 text-primary-600" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {sale.name}
                </h4>

                {timeRemaining && !timeRemaining.expired && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <FireIcon className="h-3 w-3" />
                    <span>{timeRemaining.timeText}</span>
                  </div>
                )}

                {showProductCount && (
                  <p className="text-xs text-gray-500">
                    {sale.productCount} products
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <Card
            className={cn('cursor-pointer transition-all hover:shadow-md', className)}
            onClick={handleClick}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {!imageError && sale.thumbnailImage?.url ? (
                    <Image
                      src={sale.thumbnailImage.url}
                      alt={sale.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TagIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discountPercent && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-xs font-bold">
                        {discountPercent}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {sale.name}
                      </h3>
                      {showSaveButton && (
                        <button
                          onClick={handleSaveToggle}
                          className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          title={saved ? 'Remove from saved' : 'Save sale'}
                          aria-label={saved ? 'Remove from saved' : 'Save sale'}
                        >
                          {saved ? (
                            <BookmarkSolidIcon className="h-5 w-5 text-primary-600" />
                          ) : (
                            <BookmarkIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {sale.shortDescription || sale.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{getSaleTypeLabel(sale.type)}</Badge>
                    <Badge className={getSaleStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                    {sale.featured && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <SparklesIcon className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {timeRemaining && !timeRemaining.expired && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{timeRemaining.timeText}</span>
                      </div>
                    )}
                    {showProductCount && (
                      <div className="flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        <span>{sale.productCount} products</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(sale.schedule.startDate)} - {formatDate(sale.schedule.endDate)}</span>
                    </div>
                  </div>

                  {showViewButton && (
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'featured':
        return (
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-xl',
              className
            )}
            onClick={handleClick}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-64 md:h-80 bg-gray-100 rounded-t-lg overflow-hidden">
                {!imageError && sale.bannerImage?.url ? (
                  <Image
                    src={sale.bannerImage.url}
                    alt={sale.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TagIcon className="h-20 w-20 text-gray-400" />
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge variant="destructive" className="text-sm font-bold">
                    {getSaleTypeLabel(sale.type)}
                  </Badge>
                  {discountPercent && (
                    <Badge variant="warning" className="text-sm font-bold">
                      UP TO {discountPercent}% OFF
                    </Badge>
                  )}
                  {sale.featured && (
                    <Badge variant="info" className="text-sm flex items-center gap-1">
                      <SparklesIcon className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Bottom Content Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{sale.name}</h2>
                  {sale.shortDescription && (
                    <p className="text-sm md:text-base text-white/90 line-clamp-2">
                      {sale.shortDescription}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {showShareButton && (
                    <button
                      onClick={handleShare}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Share sale"
                      aria-label="Share sale"
                    >
                      <ShareIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                  {showSaveButton && (
                    <button
                      onClick={handleSaveToggle}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title={saved ? 'Remove from saved' : 'Save sale'}
                      aria-label={saved ? 'Remove from saved' : 'Save sale'}
                    >
                      {saved ? (
                        <BookmarkSolidIcon className="h-5 w-5 text-primary-600" />
                      ) : (
                        <BookmarkIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Content */}
              <div className="p-6 space-y-4">
                {timeRemaining && !timeRemaining.expired && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <FireIcon className="h-5 w-5 text-red-600 animate-pulse" />
                    <span className="text-sm font-semibold text-red-700">
                      {timeRemaining.timeText}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {showProductCount && (
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      <span className="font-medium">{sale.productCount} Products</span>
                    </div>
                  )}
                  {sale.analytics?.basic?.totalParticipants && (
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {sale.analytics.basic.totalParticipants.toLocaleString()} Shoppers
                      </span>
                    </div>
                  )}
                </div>

                {showViewButton && (
                  <Button variant="default" className="w-full" size="lg">
                    Shop Now
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'default':
      default:
        return (
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              className
            )}
            onClick={handleClick}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {!imageError && sale.bannerImage?.url ? (
                  <Image
                    src={sale.bannerImage.url}
                    alt={sale.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TagIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <Badge variant="destructive">
                    {getSaleTypeLabel(sale.type)}
                  </Badge>
                  {discountPercent && (
                    <Badge variant="warning">{discountPercent}% OFF</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {showShareButton && (
                    <button
                      onClick={handleShare}
                      className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Share sale"
                      aria-label="Share sale"
                    >
                      <ShareIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                  {showSaveButton && (
                    <button
                      onClick={handleSaveToggle}
                      className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title={saved ? 'Remove from saved' : 'Save sale'}
                      aria-label={saved ? 'Remove from saved' : 'Save sale'}
                    >
                      {saved ? (
                        <BookmarkSolidIcon className="h-4 w-4 text-primary-600" />
                      ) : (
                        <BookmarkIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {sale.name}
                  </h3>
                  {sale.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {sale.shortDescription}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{getSaleTypeLabel(sale.type)}</Badge>
                  {sale.featured && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <SparklesIcon className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>

                {timeRemaining && !timeRemaining.expired && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <FireIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">
                      {timeRemaining.timeText}
                    </span>
                  </div>
                )}

                {showProductCount && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <TagIcon className="h-4 w-4" />
                    <span>{sale.productCount} products</span>
                  </div>
                )}

                {showViewButton && (
                  <Button variant="outline" className="w-full">
                    View Details
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Wrap with animation if enabled
  if (animated && variant !== 'minimal') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        {renderContent()}
      </motion.div>
    );
  }

  return <>{renderContent()}</>;
};

export default SaleCard;
