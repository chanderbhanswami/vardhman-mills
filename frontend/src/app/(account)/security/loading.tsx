/**
 * Security Loading Skeleton
 * 
 * Loading state for security page with skeleton loaders
 * matching the actual page layout.
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export default function SecurityLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-96 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse" />
        ))}
      </div>

      {/* Security Score Card Skeleton */}
      <Card className="mb-6 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card Skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="w-56 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Card Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="w-56 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-64 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-4">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4 animate-pulse" />
        </CardContent>
      </Card>
    </Container>
  );
}
