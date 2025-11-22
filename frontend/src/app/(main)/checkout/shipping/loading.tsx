/**
 * Checkout Shipping Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for shipping address and method selection page
 * 
 * @route /checkout/shipping (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutShippingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Shipping Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
              
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-5 w-32" />
                          {i === 1 && <Skeleton className="h-5 w-16" />}
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-4 w-2/5" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Method Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-6 w-6" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-40" />
                          {i === 1 && <Skeleton className="h-5 w-24" />}
                        </div>
                        <Skeleton className="h-4 w-56" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-16 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Info Alert Skeleton */}
            <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Skeleton className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <Skeleton className="h-7 w-40 mb-4" />
              
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-6">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Skeleton className="h-5 w-48" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
