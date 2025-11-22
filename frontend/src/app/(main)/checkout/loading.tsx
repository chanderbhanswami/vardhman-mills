/**
 * Checkout Loading State - Vardhman Mills Frontend
 * 
 * Loading skeleton for checkout page
 * 
 * @route /checkout (loading state)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShoppingBagIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                <Skeleton className="h-9 w-64" />
              </div>
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <LockClosedIcon className="h-4 w-4 text-gray-400" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <Skeleton className="h-10 w-10 rounded-full mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {step < 5 && (
                  <div className="flex-1">
                    <Skeleton className="h-1 w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Security Badges */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((badge) => (
              <div key={badge} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Form Header */}
              <div className="mb-6">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {[1, 2, 3, 4].map((field) => (
                  <div key={field}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              {/* Address Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((card) => (
                  <Card key={card} className="p-4">
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-6" />

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>

              {/* Totals */}
              <div className="space-y-3 py-4 border-t">
                {[1, 2, 3, 4].map((total) => (
                  <div key={total} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>

              {/* Checkout Button */}
              <Skeleton className="h-12 w-full mt-6" />
            </Card>

            {/* Trust Badges */}
            <Card className="p-6 mt-6">
              <div className="space-y-3">
                {[1, 2, 3].map((badge) => (
                  <div key={badge} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="p-6 mt-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((info) => (
              <div key={info} className="text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
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
