/**
 * Category Detail Loading Skeleton
 * 
 * Loading state for category detail page
 * 
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';

export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-pulse">
      <Container>
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              {i > 1 && <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />}
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
            </React.Fragment>
          ))}
        </div>

        {/* Banner Skeleton */}
        <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-8" />

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Related Categories Skeleton */}
        <div className="space-y-6">
          <div className="h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                  <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
