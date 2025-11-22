/**
 * Payment Methods Loading Skeleton
 * 
 * Loading state for payment methods page with skeleton loaders
 * matching the actual page layout.
 * 
 * @component
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';

export default function PaymentMethodsLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="w-96 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alert Skeleton */}
      <Card className="mb-6 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
