/**
 * Profile Loading Skeleton
 * 
 * Loading state for profile page with skeleton loaders
 * matching the actual page layout.
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export default function ProfileLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            
            {/* User Info Skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-56 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>

        {/* Profile Completion Skeleton */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-2">
                <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Profile Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
                  <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
