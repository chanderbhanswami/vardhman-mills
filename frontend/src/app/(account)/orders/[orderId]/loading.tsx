/**
 * Order Details Loading Skeleton - Vardhman Mills
 * 
 * Loading state for order details page with:
 * - Header skeleton
 * - Order tracking skeleton
 * - Order items skeleton
 * - Sidebar with order info, summary, and payment skeletons
 * - Action buttons skeleton
 * - Proper layout matching the main page
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-32 mb-4" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <div className="flex items-center gap-3 mb-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-40 mb-6" />
            
            {/* Tracking Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-64 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Estimate Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          {/* Order Items Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <Skeleton className="h-24 w-24 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Addresses Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>

          {/* Actions Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </div>

          {/* Payment Info Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Order Status Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Tracking Info Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <div>
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-9 w-full rounded mt-4" />
            </div>
          </div>

          {/* Invoice Download Skeleton */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    </Container>
  );
}
