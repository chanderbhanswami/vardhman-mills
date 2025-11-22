/**
 * Preferences Loading Skeleton
 * 
 * Loading state for preferences page with skeleton loaders
 * matching the actual page layout.
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export default function PreferencesLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-40 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="w-96 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Notification Settings Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="space-y-2">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="space-y-2">
                    <div className="w-36 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-56 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="space-y-2">
                    <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
