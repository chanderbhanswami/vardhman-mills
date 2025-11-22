'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareSkeletonProps {
  /**
   * Number of product cards to show
   */
  count?: number;

  /**
   * Skeleton variant
   */
  variant?: 'card' | 'table' | 'compact';

  /**
   * Show action buttons skeleton
   */
  showActions?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Product card skeleton
 */
const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-4">
        {/* Image skeleton */}
        <Skeleton className="aspect-square mb-4 rounded-lg" />

        {/* Brand skeleton */}
        <Skeleton className="h-3 w-20 mb-3" />

        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Price skeleton */}
        <div className="flex items-baseline gap-2 mb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Availability skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Quick specs skeleton */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
};

/**
 * Table row skeleton
 */
const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Skeleton className="h-4 w-32 flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
};

/**
 * Compact skeleton
 */
const CompactSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      <Skeleton className="w-20 h-20 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareSkeleton Component
 * 
 * Loading skeleton for comparison views.
 * Features:
 * - Multiple variants (card, table, compact)
 * - Configurable count
 * - Optional action buttons
 * - Responsive grid layout
 * - Animated pulse effect
 * 
 * @example
 * ```tsx
 * <CompareSkeleton
 *   count={4}
 *   variant="card"
 *   showActions={true}
 * />
 * ```
 */
export const CompareSkeleton: React.FC<CompareSkeletonProps> = ({
  count = 4,
  variant = 'card',
  showActions = true,
  className,
}) => {
  // Table variant
  if (variant === 'table') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Header skeleton */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 border-b-2 border-gray-300">
          <Skeleton className="h-5 w-32 flex-shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Row skeletons */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>

        {/* Actions skeleton */}
        {showActions && (
          <div className="flex justify-center gap-3">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <CompactSkeleton key={i} />
        ))}
        {showActions && (
          <div className="flex justify-center gap-2 pt-4">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        )}
      </div>

      {/* Product cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

      {/* Actions skeleton */}
      {showActions && (
        <div className="flex justify-center gap-3 pt-4">
          <Skeleton className="h-12 w-40 rounded-md" />
          <Skeleton className="h-12 w-32 rounded-md" />
          <Skeleton className="h-12 w-28 rounded-md" />
        </div>
      )}
    </div>
  );
};

export default CompareSkeleton;