/**
 * Addresses Loading Skeleton - Vardhman Mills
 * 
 * Loading state for addresses page with:
 * - Header skeleton
 * - Filter buttons skeleton
 * - Address cards skeleton (grid layout)
 * - Proper spacing and animations
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AddressesLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Address Cards Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Name */}
            <Skeleton className="h-5 w-32" />

            {/* Address Lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
