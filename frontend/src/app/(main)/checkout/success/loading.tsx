/**
 * Checkout Success Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for order success/confirmation page
 * 
 * @route /checkout/success (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Hero Skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4 animate-pulse" />
          <Skeleton className="h-10 w-80 mx-auto mb-2" />
          <Skeleton className="h-6 w-64 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-7 w-32" />
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Email Confirmation Alert Skeleton */}
        <div className="mb-6">
          <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </Card>

        {/* Order Summary Skeleton */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-6 w-48 mb-6" />
          
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="space-y-3 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </Card>

        {/* Delivery & Payment Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Delivery Info Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="pt-3 border-t">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </Card>

          {/* Payment Info Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </Card>
        </div>

        {/* What Happens Next Timeline Skeleton */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-6 w-56 mb-6" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  {i < 3 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Help Section Skeleton */}
        <Card className="p-6 bg-gray-50">
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
