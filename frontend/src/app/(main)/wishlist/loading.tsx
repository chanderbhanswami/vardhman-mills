/**
 * Wishlist Loading Skeleton
 * 
 * Professional loading state for wishlist page with:
 * - Header skeleton
 * - Stats cards skeletons
 * - Toolbar skeleton
 * - Wishlist items grid skeleton
 * - Responsive design
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function WishlistLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="pt-0 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar Skeleton */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>

        {/* Wishlist Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                {/* Image Skeleton */}
                <div className="relative mb-4">
                  <Skeleton className="w-full h-64 rounded-lg" />
                  <Skeleton className="absolute top-2 right-2 w-8 h-8 rounded-full" />
                </div>

                {/* Product Details Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-24" />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>

                  <Skeleton className="h-5 w-20 rounded-full mt-2" />

                  {/* Alert Badges Skeleton */}
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex items-center gap-2 pt-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
