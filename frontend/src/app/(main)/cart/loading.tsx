/**
 * Cart Loading Skeleton
 * 
 * Professional loading state for cart page with:
 * - Header skeleton
 * - Progress bar skeleton
 * - Cart items skeletons
 * - Cart summary skeleton
 * - Recommendations skeleton
 * - Responsive design
 */

'use client';

import React from 'react';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function CartLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
          ]}
          className="mb-6"
        />

        {/* Alternative: Use CartSkeleton component for complete cart loading state */}
        {/* Conditional display based on preference */}
        {false && <CartSkeleton />}
        {/* CartSkeleton is available and provides complete loading state */}

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Progress Bar Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image Skeleton */}
                    <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                    
                    {/* Details Skeleton */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-6 w-24 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      
                      {/* Quantity Controls Skeleton */}
                      <div className="flex items-center gap-4 mt-3">
                        <Skeleton className="h-9 w-32 rounded-lg" />
                        <div className="flex items-center gap-2 ml-auto">
                          <Skeleton className="h-9 w-9 rounded" />
                          <Skeleton className="h-9 w-9 rounded" />
                          <Skeleton className="h-9 w-9 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                {/* Summary Items */}
                <div className="space-y-3 mb-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                </div>

                {/* Coupon Skeleton */}
                <div className="mb-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>

                {/* Gift Option Skeleton */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <Skeleton className="h-5 w-40" />
                </div>

                {/* Buttons Skeleton */}
                <Skeleton className="h-12 w-full mb-3 rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />

                {/* Trust Badges Skeleton */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4 rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
