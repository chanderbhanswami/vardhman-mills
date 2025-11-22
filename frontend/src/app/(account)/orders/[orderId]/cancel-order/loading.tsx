/**
 * Cancel Order Loading - Vardhman Mills
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CancelOrderLoading() {
  return (
    <Container className="py-8 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <Skeleton className="h-9 w-24 mb-4" />
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-40 mb-6" />

      {/* Warning Alert Skeleton */}
      <div className="rounded-lg border p-4 mb-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1">
            <Skeleton className="h-5 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Order Info Skeleton */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-24 w-full rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="flex justify-end gap-4">
        <Skeleton className="h-11 w-24" />
        <Skeleton className="h-11 w-32" />
      </div>
    </Container>
  );
}
