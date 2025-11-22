/**
 * Best Sellers Loading State
 * 
 * Skeleton loader for the best sellers page that matches the main page layout.
 * Provides visual feedback while content is loading.
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function BestSellersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-pulse">
      <Container>
        {/* Breadcrumbs Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>

        {/* Banner Skeleton */}
        <div className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-12">
          <div className="max-w-2xl">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
            <div className="h-6 w-64 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Selling Carousel Skeleton */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Filters and Sort Bar Skeleton */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded lg:hidden" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i}>
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2 pt-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
