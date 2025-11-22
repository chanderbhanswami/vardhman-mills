/**
 * Subcategory Detail Loading Skeleton
 * 
 * Loading state for subcategory product listing page
 * 
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function SubcategoryDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-pulse">
      <Container>
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              {i > 1 && <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />}
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
            </React.Fragment>
          ))}
        </div>

        {/* Banner Skeleton */}
        <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-8" />

        {/* Toolbar Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filter sections */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters Skeleton */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
                ))}
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-4">
                    <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
