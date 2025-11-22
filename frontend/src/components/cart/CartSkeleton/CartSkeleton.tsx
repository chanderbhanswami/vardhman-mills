/**
 * CartSkeleton Component
 * 
 * Loading skeleton for cart page components
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CartSkeletonProps {
  items?: number;
  className?: string;
}

export const CartSkeleton: React.FC<CartSkeletonProps> = ({
  items = 3,
  className,
}) => {
  return (
    <div className={cn('cart-skeleton space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex gap-4">
            {/* Image Skeleton */}
            <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="flex items-center gap-4">
                <div className="h-8 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>

            {/* Price Skeleton */}
            <div className="text-right space-y-2">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartSkeleton;
