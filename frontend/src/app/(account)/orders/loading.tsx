/**
 * Orders Loading Skeleton - Vardhman Mills
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderSkeleton } from '@/components/orders';

export default function OrdersLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Order List Skeleton */}
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <OrderSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
