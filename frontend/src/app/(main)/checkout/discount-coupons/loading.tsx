/**
 * Discount Coupons Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for discount coupons page
 * 
 * @route /checkout/discount-coupons (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DiscountCouponsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-56" />
          </div>
          <Skeleton className="h-5 w-96 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Search Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Categories Skeleton */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </Card>

            {/* Cart Summary Skeleton */}
            <Card className="p-6 mt-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Coupons List Skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon Skeleton */}
                    <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>

                      {/* Code Skeleton */}
                      <Skeleton className="h-10 w-40 rounded-lg" />

                      {/* Validity & Discount Skeleton */}
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>

                      {/* Terms Skeleton */}
                      <Skeleton className="h-4 w-48" />

                      {/* Button Skeleton */}
                      <Skeleton className="h-9 w-32 rounded-lg" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
