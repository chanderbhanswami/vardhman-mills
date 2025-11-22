/**
 * Guest Checkout Loading State - Vardhman Mills Frontend
 * 
 * @route /checkout/guest (loading state)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function GuestCheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="h-8 w-8 text-gray-400" />
                <Skeleton className="h-9 w-64" />
              </div>
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <LockClosedIcon className="h-4 w-4 text-gray-400" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </Card>

        {/* Security Features */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Checkout Form */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <Skeleton className="h-10 w-10 rounded-full mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {idx < 4 && (
                    <div className="flex-1">
                      <Skeleton className="h-1 w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Fields */}
            {[1, 2, 3, 4].map((field) => (
              <div key={field}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-6 mt-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((benefit) => (
              <div key={benefit}>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-6 mt-8">
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((faq) => (
              <div key={faq}>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
