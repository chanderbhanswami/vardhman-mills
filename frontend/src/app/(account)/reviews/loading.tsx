/**
 * Reviews Loading Skeleton
 * 
 * Loading state for reviews page with skeleton loaders
 * matching the actual page layout.
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export default function ReviewsLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-40 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-80 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Card Skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse" />
        ))}
      </div>

      {/* Reviews List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {/* Product Image Skeleton */}
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />

                {/* Review Content Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-56 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>

                  <div className="flex gap-4">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
