/**
 * Support Tickets Loading State
 * 
 * Loading skeleton for support tickets page
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { SkeletonLoader } from '@/components/common';

export default function SupportTicketsLoading() {
  return (
    <Container className="py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg mb-6 animate-pulse" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <SkeletonLoader className="h-8 w-64 mb-2" />
            <SkeletonLoader className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonLoader className="h-10 w-24" />
            <SkeletonLoader className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <SkeletonLoader className="h-10 w-16 mx-auto mb-2" />
                  <SkeletonLoader className="h-4 w-24 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Categories Skeleton */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <SkeletonLoader className="h-12 w-12 rounded-lg mb-3" />
                <SkeletonLoader className="h-5 w-32 mb-2" />
                <SkeletonLoader className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <SkeletonLoader className="h-10 w-full max-w-2xl" />
      </div>

      {/* Filters Skeleton */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SkeletonLoader className="h-10 w-full" />
            </div>
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Tickets List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <SkeletonLoader className="w-12 h-12 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <SkeletonLoader className="h-6 w-3/4 mb-2" />
                      <SkeletonLoader className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <SkeletonLoader className="h-6 w-16" />
                      <SkeletonLoader className="h-6 w-20" />
                    </div>
                  </div>
                  <SkeletonLoader className="h-4 w-full mb-1" />
                  <SkeletonLoader className="h-4 w-2/3 mb-3" />
                  <div className="flex gap-4">
                    <SkeletonLoader className="h-4 w-24" />
                    <SkeletonLoader className="h-4 w-28" />
                    <SkeletonLoader className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
