/**
 * Product Detail Loading State - Vardhman Mills
 * Loading skeleton for product detail page
 */

'use client';

import { SkeletonLoader } from '@/components/common';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <SkeletonLoader className="h-4 w-16" />
          <SkeletonLoader className="h-4 w-4" />
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-4 w-4" />
          <SkeletonLoader className="h-4 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <SkeletonLoader className="w-full aspect-square rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div>
              <SkeletonLoader className="h-4 w-24 mb-4" />
              <SkeletonLoader className="h-10 w-full mb-4" />
              <div className="flex items-center gap-4 mb-4">
                <SkeletonLoader className="h-5 w-32" />
                <SkeletonLoader className="h-5 w-40" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <SkeletonLoader className="h-8 w-32" />
                <SkeletonLoader className="h-6 w-24" />
                <SkeletonLoader className="h-6 w-28" />
              </div>
            </div>

            <div className="space-y-4">
              <SkeletonLoader className="h-20 w-full" />
              <SkeletonLoader className="h-12 w-full" />
              <div className="flex gap-3">
                <SkeletonLoader className="h-12 flex-1" />
                <SkeletonLoader className="h-12 w-12" />
                <SkeletonLoader className="h-12 w-12" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <SkeletonLoader className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <SkeletonLoader className="h-4 w-32" />
                    <SkeletonLoader className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section Skeleton */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6 border-b pb-4">
              <SkeletonLoader className="h-10 w-32" />
              <SkeletonLoader className="h-10 w-32" />
              <SkeletonLoader className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-3/4" />
              <SkeletonLoader className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>

        {/* Related Products Skeleton */}
        <div>
          <SkeletonLoader className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <SkeletonLoader className="w-full aspect-square rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <SkeletonLoader className="h-5 w-3/4" />
                    <SkeletonLoader className="h-4 w-1/2" />
                    <SkeletonLoader className="h-6 w-full" />
                    <SkeletonLoader className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
