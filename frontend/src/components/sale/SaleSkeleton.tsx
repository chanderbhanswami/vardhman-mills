'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * SaleSkeleton Component Props
 */
interface SaleSkeletonProps {
  /**
   * Skeleton variant
   * - banner: Sale banner skeleton
   * - product-card: Product card in grid
   * - product-list: Product card in list layout
   * - countdown: Countdown timer skeleton
   * - card: Generic card skeleton
   * - grid: Grid of cards
   */
  variant?:
    | 'banner'
    | 'product-card'
    | 'product-list'
    | 'countdown'
    | 'card'
    | 'grid';

  /**
   * Number of skeleton items (for grid variant or repeated items)
   */
  count?: number;

  /**
   * Grid columns (for grid variant)
   */
  gridColumns?: 2 | 3 | 4 | 5;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SaleSkeleton Component
 * 
 * Loading skeleton component for sale-related UI elements.
 * Features:
 * - 6 skeleton variants (banner, product-card, product-list, countdown, card, grid)
 * - Animated pulse effect
 * - Responsive layouts
 * - Customizable count and grid columns
 * - Mimics actual component structure
 * 
 * @example
 * ```tsx
 * <SaleSkeleton variant="product-card" count={8} />
 * <SaleSkeleton variant="banner" />
 * <SaleSkeleton variant="grid" gridColumns={4} count={12} />
 * ```
 */
const SaleSkeleton: React.FC<SaleSkeletonProps> = ({
  variant = 'card',
  count = 1,
  gridColumns = 4,
  className,
}) => {
  // Render banner skeleton
  const renderBannerSkeleton = () => (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="relative h-64 md:h-80 lg:h-96 bg-gray-200 animate-pulse">
          {/* Badges skeleton */}
          <div className="absolute left-4 top-4 space-y-2">
            <div className="h-6 w-24 bg-gray-300 rounded-full" />
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
          </div>

          {/* Countdown skeleton */}
          <div className="absolute right-4 top-4">
            <div className="h-6 w-32 bg-gray-300 rounded-full" />
          </div>

          {/* Content skeleton */}
          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            <div className="h-8 w-3/4 bg-gray-300 rounded" />
            <div className="h-6 w-1/2 bg-gray-300 rounded" />
            <div className="h-10 w-32 bg-gray-300 rounded-lg mt-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render product card skeleton (grid layout)
  const renderProductCardSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-200 animate-pulse relative">
          {/* Badge skeleton */}
          <div className="absolute left-3 top-3 space-y-2">
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
          </div>
          {/* Wishlist button skeleton */}
          <div className="absolute right-3 bottom-3 h-10 w-10 bg-gray-300 rounded-full" />
        </div>

        {/* Info skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Badge */}
          <div className="h-5 w-28 bg-gray-200 rounded-full animate-pulse" />

          {/* Button */}
          <div className="h-9 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );

  // Render product list skeleton (horizontal layout)
  const renderProductListSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image skeleton */}
          <div className="h-32 w-32 flex-shrink-0 bg-gray-200 rounded-lg animate-pulse" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            </div>

            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse" />
              </div>

              <div className="flex gap-2">
                <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render countdown skeleton
  const renderCountdownSkeleton = () => (
    <div className={cn('inline-flex gap-2', className)}>
      <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
      <span className="text-gray-300">:</span>
      <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
      <span className="text-gray-300">:</span>
      <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
    </div>
  );

  // Render generic card skeleton
  const renderCardSkeleton = () => (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>

        {/* Content blocks */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* Action button */}
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse mt-4" />
      </CardContent>
    </Card>
  );

  // Render grid skeleton
  const renderGridSkeleton = () => {
    const gridColumnClasses = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    };

    return (
      <div
        className={cn(
          'grid gap-4 md:gap-6',
          gridColumnClasses[gridColumns],
          className
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{renderProductCardSkeleton()}</div>
        ))}
      </div>
    );
  };

  // Main render logic
  switch (variant) {
    case 'banner':
      return renderBannerSkeleton();

    case 'product-card':
      if (count === 1) {
        return renderProductCardSkeleton();
      }
      return (
        <div className={cn('grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>{renderProductCardSkeleton()}</div>
          ))}
        </div>
      );

    case 'product-list':
      if (count === 1) {
        return renderProductListSkeleton();
      }
      return (
        <div className={cn('space-y-4', className)}>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>{renderProductListSkeleton()}</div>
          ))}
        </div>
      );

    case 'countdown':
      return renderCountdownSkeleton();

    case 'grid':
      return renderGridSkeleton();

    case 'card':
    default:
      if (count === 1) {
        return renderCardSkeleton();
      }
      return (
        <div className={cn('space-y-4', className)}>
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>{renderCardSkeleton()}</div>
          ))}
        </div>
      );
  }
};

export default SaleSkeleton;
