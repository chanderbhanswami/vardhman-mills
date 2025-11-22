/**
 * Search Loading Skeleton
 * 
 * Professional loading state for search page with:
 * - Header skeleton
 * - Toolbar skeleton
 * - Filters sidebar skeleton
 * - Product grid skeleton
 * - Responsive design
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SearchLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-9 w-96 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>

          {/* Toolbar Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-28 lg:hidden" />
            <div className="flex items-center gap-2 ml-auto">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:col-span-1 hidden lg:block space-y-6">
            {[...Array(5)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    {/* Image Skeleton */}
                    <Skeleton className="w-full h-64 mb-4 rounded-lg" />
                    
                    {/* Details Skeleton */}
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    
                    {/* Price Skeleton */}
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>

                    {/* Rating Skeleton */}
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Button Skeleton */}
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
