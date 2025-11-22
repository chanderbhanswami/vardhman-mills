/**
 * MiniCartSkeleton Component
 * 
 * Loading skeleton for mini cart dropdown
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MiniCartSkeletonProps {
  items?: number;
  className?: string;
}

export const MiniCartSkeleton: React.FC<MiniCartSkeletonProps> = ({
  items = 2,
  className,
}) => {
  return (
    <div className={cn('mini-cart-skeleton space-y-3 p-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse flex gap-3">
          {/* Image Skeleton */}
          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}

      {/* Summary Skeleton */}
      <div className="border-t pt-3 mt-3 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

export default MiniCartSkeleton;
