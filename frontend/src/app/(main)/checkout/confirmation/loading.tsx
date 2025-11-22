/**
 * Checkout Confirmation Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for order confirmation page
 * 
 * @route /checkout/confirmation (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutConfirmationLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Important Notice Skeleton */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
          <Skeleton className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b">
                    <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address Skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>

            {/* Shipping Method Skeleton */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>

            {/* Payment Method Skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </Card>

            {/* Terms and Conditions Skeleton */}
            <Card className="p-6 bg-gray-50">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <Skeleton className="h-7 w-40 mb-6" />
              
              {/* Price Breakdown Skeleton */}
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Total Skeleton */}
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-6">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-24" />
                </div>

                <Skeleton className="h-12 w-full rounded-lg mb-4" />

                {/* Security Badges Skeleton */}
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Additional Info Skeleton */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
