'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { GridLayout } from './ProductGrid';

export interface ProductGridSkeletonProps {
  count?: number;
  layout?: GridLayout;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridColumns = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
};

const gapSizes = {
  sm: 'gap-3',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8',
};

const ProductCardSkeleton: React.FC<{ variant?: 'grid' | 'list' | 'compact' }> = ({
  variant = 'grid',
}) => {
  if (variant === 'list') {
    return (
      <div className="flex gap-6 p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="flex-shrink-0 w-48 h-48 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200">
        <div className="absolute top-3 left-3 space-y-2">
          <div className="h-6 w-16 bg-gray-300 rounded" />
        </div>
        <div className="absolute top-3 right-3 space-y-2">
          <div className="h-8 w-8 bg-gray-300 rounded-full" />
          <div className="h-8 w-8 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <div className="h-3 bg-gray-200 rounded w-1/3" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 12,
  layout = 'grid',
  columns = 4,
  gap = 'md',
  className,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (layout === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {items.map((i) => (
          <ProductCardSkeleton key={i} variant="list" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid w-full', gridColumns[columns], gapSizes[gap], className)}>
      {items.map((i) => (
        <ProductCardSkeleton key={i} variant={layout === 'compact' ? 'compact' : 'grid'} />
      ))}
    </div>
  );
};

export default ProductGridSkeleton;