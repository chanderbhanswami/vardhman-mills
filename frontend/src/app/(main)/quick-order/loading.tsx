/**
 * Quick Order Loading Skeleton
 * Professional loading state for quick order page
 */

'use client';

import { SkeletonLoader } from '@/components/common';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

export default function QuickOrderLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-4">
            <SkeletonLoader className="h-4 w-12" />
            <SkeletonLoader className="h-4 w-1" />
            <SkeletonLoader className="h-4 w-24" />
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <SkeletonLoader className="h-8 w-48" />
              <SkeletonLoader className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <SkeletonLoader className="h-10 w-28" />
              <SkeletonLoader className="h-10 w-28" />
              <SkeletonLoader className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Form Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <SkeletonLoader className="h-6 w-32" />
                  <div className="flex gap-2">
                    <SkeletonLoader className="h-6 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b mb-4">
                  <SkeletonLoader className="h-4 w-full col-span-2" />
                  <SkeletonLoader className="h-4 w-full col-span-4" />
                  <SkeletonLoader className="h-4 w-full col-span-2" />
                  <SkeletonLoader className="h-4 w-full col-span-2" />
                  <SkeletonLoader className="h-4 w-full col-span-2" />
                </div>

                {/* Order Item Rows */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border"
                    >
                      <div className="md:col-span-2">
                        <SkeletonLoader className="h-10 w-full" />
                      </div>
                      <div className="md:col-span-4">
                        <SkeletonLoader className="h-10 w-full" />
                      </div>
                      <div className="md:col-span-2">
                        <SkeletonLoader className="h-5 w-20" />
                      </div>
                      <div className="md:col-span-2">
                        <SkeletonLoader className="h-10 w-full" />
                      </div>
                      <div className="md:col-span-1">
                        <SkeletonLoader className="h-5 w-20" />
                      </div>
                      <div className="md:col-span-1">
                        <SkeletonLoader className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Button */}
                <div className="mt-4">
                  <SkeletonLoader className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Order Notes Card */}
            <Card>
              <CardHeader>
                <SkeletonLoader className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <SkeletonLoader className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <SkeletonLoader className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <SkeletonLoader className="h-4 w-16" />
                      <SkeletonLoader className="h-6 w-12" />
                    </div>
                    <div className="space-y-2">
                      <SkeletonLoader className="h-4 w-16" />
                      <SkeletonLoader className="h-6 w-12" />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <SkeletonLoader className="h-4 w-16" />
                      <SkeletonLoader className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <SkeletonLoader className="h-4 w-16" />
                      <SkeletonLoader className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <SkeletonLoader className="h-4 w-16" />
                      <SkeletonLoader className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <SkeletonLoader className="h-6 w-16" />
                      <SkeletonLoader className="h-6 w-24" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-4">
                    <SkeletonLoader className="h-12 w-full" />
                    <SkeletonLoader className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card>
                <CardHeader>
                  <SkeletonLoader className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <SkeletonLoader className="h-4 w-32" />
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between">
                          <SkeletonLoader className="h-3 w-16" />
                          <SkeletonLoader className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <SkeletonLoader className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
