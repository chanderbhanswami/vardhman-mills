/**
 * Products Loading State - Vardhman Mills
 * Loading skeleton for products page
 */

'use client';

import { ProductGridSkeleton } from '@/components/products';
import { SkeletonLoader } from '@/components/common';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <SkeletonLoader className="h-4 w-16" />
            <SkeletonLoader className="h-4 w-4" />
            <SkeletonLoader className="h-4 w-24" />
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <SkeletonLoader className="h-8 w-48 mb-2" />
              <SkeletonLoader className="h-5 w-64" />
            </div>
            <SkeletonLoader className="h-10 w-full md:w-96" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar Skeleton */}
          <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
            <Card>
              <CardHeader>
                <SkeletonLoader className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <SkeletonLoader className="h-5 w-24" />
                    <div className="space-y-2">
                      <SkeletonLoader className="h-4 w-full" />
                      <SkeletonLoader className="h-4 w-full" />
                      <SkeletonLoader className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            {/* Toolbar Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <SkeletonLoader className="h-10 w-32" />
                <div className="flex items-center gap-4">
                  <SkeletonLoader className="h-10 w-40" />
                  <SkeletonLoader className="h-10 w-20" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGridSkeleton count={24} layout="grid" />
          </div>
        </div>
      </div>
    </div>
  );
}
