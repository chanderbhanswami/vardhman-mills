/**
 * Checkout Payment Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for payment method selection page
 * 
 * @route /checkout/payment (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutPaymentLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-7 w-56 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-6 w-6" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-16 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Details Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-5 w-64" />
              </div>
            </Card>

            {/* Security Features Skeleton */}
            <div className="flex items-center justify-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <Skeleton className="h-7 w-40 mb-4" />
              
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
