/**
 * Brand Detail Loading State
 * 
 * Skeleton loader for the brand detail page
 * 
 * @loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Container } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function BrandDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-pulse">
      <Container>
        {/* Header Skeleton - using CardHeader for structural consistency */}
        <CardHeader className="mb-6 p-0">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        </CardHeader>

        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Banner Skeleton */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl h-96 mb-6" />

        {/* Actions Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
