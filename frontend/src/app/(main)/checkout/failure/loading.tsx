/**
 * Checkout Failure Loading State - Vardhman Mills Frontend
 * 
 * Skeleton UI for payment failure page
 * 
 * @route /checkout/failure (loading)
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutFailureLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Error Hero Skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4 animate-pulse" />
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-7 w-32" />
          </div>
        </div>

        {/* Error Details Skeleton */}
        <Card className="p-6 mb-6">
          <div className="flex gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Suggested Actions Skeleton */}
          <div>
            <Skeleton className="h-6 w-40 mb-3" />
            <ul className="space-y-2">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Alternative Payment Methods Skeleton */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-5 w-24 mx-auto mb-1" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Troubleshooting Guide Skeleton */}
        <Card className="p-6 mb-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-56" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-white rounded-lg">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Support Skeleton */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-32 mx-auto mb-1" />
                <Skeleton className="h-4 w-40 mx-auto mb-2" />
                <Skeleton className="h-3 w-36 mx-auto" />
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-12 w-full sm:w-40" />
          <Skeleton className="h-12 w-full sm:w-40" />
          <Skeleton className="h-12 w-full sm:w-40" />
        </div>
      </div>
    </div>
  );
}
