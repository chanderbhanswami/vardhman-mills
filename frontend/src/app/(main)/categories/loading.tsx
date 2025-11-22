/**
 * Categories Loading Skeleton
 * 
 * Loading state for categories listing page
 * 
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-pulse">
      <Container>
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              {i > 1 && <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />}
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
            </React.Fragment>
          ))}
        </div>

        {/* Hero Banner Skeleton */}
        <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-6" />

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Showcase Skeleton */}
        <div className="mb-12">
          <div className="mb-6 space-y-2">
            <div className="h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-5 w-64 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search Bar Skeleton */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-4">
                  <div className="h-10 flex-1 max-w-md bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded hidden sm:block" />
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                  <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Category Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
