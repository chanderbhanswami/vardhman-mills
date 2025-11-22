/**
 * Sale Page Loading State
 */

'use client';

import { ProductGridSkeleton } from '@/components/products';

export default function SaleLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 h-16 bg-gray-200 rounded animate-pulse"></div>

        {/* Products Grid Skeleton */}
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
