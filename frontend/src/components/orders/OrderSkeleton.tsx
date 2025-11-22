'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OrderSkeletonProps {
  variant?: 'card' | 'details' | 'list' | 'tracking' | 'invoice' | 'stats';
  count?: number;
  className?: string;
  animated?: boolean;
}

// Base Skeleton Line Component
const SkeletonLine: React.FC<{
  width?: string;
  height?: string;
  className?: string;
  animated?: boolean;
}> = ({ width = 'w-full', height = 'h-4', className, animated = true }) => (
  <div
    className={cn(
      'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded',
      animated && 'animate-pulse',
      width,
      height,
      className
    )}
  />
);

// Order Card Skeleton
const OrderCardSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <Card className="p-6">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-32" height="h-5" animated={animated} />
          <SkeletonLine width="w-48" height="h-4" animated={animated} />
        </div>
        <SkeletonLine width="w-24" height="h-6" animated={animated} className="rounded-full" />
      </div>

      {/* Items */}
      <div className="space-y-3 pt-4 border-t">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonLine width="w-16" height="h-16" animated={animated} className="rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="w-full" height="h-4" animated={animated} />
              <SkeletonLine width="w-3/4" height="h-3" animated={animated} />
            </div>
            <SkeletonLine width="w-20" height="h-5" animated={animated} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-1">
          <SkeletonLine width="w-16" height="h-3" animated={animated} />
          <SkeletonLine width="w-24" height="h-5" animated={animated} />
        </div>
        <div className="space-y-1">
          <SkeletonLine width="w-16" height="h-3" animated={animated} />
          <SkeletonLine width="w-24" height="h-5" animated={animated} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <SkeletonLine width="w-32" height="h-9" animated={animated} className="rounded-md" />
        <SkeletonLine width="w-28" height="h-9" animated={animated} className="rounded-md" />
        <SkeletonLine width="w-24" height="h-9" animated={animated} className="rounded-md" />
      </div>
    </div>
  </Card>
);

// Order Details Skeleton
const OrderDetailsSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <div className="space-y-6">
    {/* Status Card */}
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonLine width="w-12" height="h-12" animated={animated} className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-40" height="h-6" animated={animated} />
            <SkeletonLine width="w-32" height="h-4" animated={animated} />
          </div>
        </div>
        <SkeletonLine width="w-full" height="h-2" animated={animated} className="rounded-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine width="w-full" height="h-8" animated={animated} className="rounded-full" />
              <SkeletonLine width="w-full" height="h-3" animated={animated} />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Items Card */}
    <Card className="p-6">
      <div className="space-y-4">
        <SkeletonLine width="w-32" height="h-5" animated={animated} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
            <SkeletonLine width="w-20" height="h-20" animated={animated} className="rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="w-full" height="h-5" animated={animated} />
              <SkeletonLine width="w-3/4" height="h-4" animated={animated} />
              <div className="flex gap-2">
                <SkeletonLine width="w-16" height="h-6" animated={animated} className="rounded-full" />
                <SkeletonLine width="w-16" height="h-6" animated={animated} className="rounded-full" />
              </div>
            </div>
            <SkeletonLine width="w-24" height="h-6" animated={animated} />
          </div>
        ))}
      </div>
    </Card>

    {/* Info Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <SkeletonLine width="w-32" height="h-5" animated={animated} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <SkeletonLine width="w-20" height="h-3" animated={animated} />
                  <SkeletonLine width="w-full" height="h-4" animated={animated} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Order List Skeleton
const OrderListSkeleton: React.FC<{ count?: number; animated?: boolean }> = ({ 
  count = 5, 
  animated = true 
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
      >
        <OrderCardSkeleton animated={animated} />
      </motion.div>
    ))}
  </div>
);

// Tracking Skeleton
const TrackingSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <div className="space-y-6">
    {/* Tracking Header */}
    <Card className="p-6">
      <div className="space-y-4">
        <SkeletonLine width="w-32" height="h-5" animated={animated} />
        <div className="flex items-center gap-3">
          <SkeletonLine width="w-full" height="h-12" animated={animated} className="rounded-lg" />
          <SkeletonLine width="w-20" height="h-10" animated={animated} className="rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <SkeletonLine width="w-full" height="h-3" animated={animated} />
              <SkeletonLine width="w-full" height="h-5" animated={animated} />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Timeline */}
    <Card className="p-6">
      <div className="space-y-4">
        <SkeletonLine width="w-40" height="h-5" animated={animated} />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <SkeletonLine width="w-10" height="h-10" animated={animated} className="rounded-full flex-shrink-0" />
                {i < 3 && <SkeletonLine width="w-0.5" height="h-12" animated={animated} />}
              </div>
              <div className="flex-1 space-y-2 pb-6">
                <SkeletonLine width="w-32" height="h-5" animated={animated} />
                <SkeletonLine width="w-full" height="h-4" animated={animated} />
                <SkeletonLine width="w-24" height="h-3" animated={animated} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Map Placeholder */}
    <Card className="p-6">
      <SkeletonLine width="w-full" height="h-64" animated={animated} className="rounded-lg" />
    </Card>
  </div>
);

// Invoice Skeleton
const InvoiceSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <Card className="p-8">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b">
        <div className="space-y-2">
          <SkeletonLine width="w-32" height="h-8" animated={animated} />
          <SkeletonLine width="w-48" height="h-4" animated={animated} />
        </div>
        <SkeletonLine width="w-24" height="h-24" animated={animated} className="rounded-lg" />
      </div>

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <SkeletonLine width="w-24" height="h-5" animated={animated} />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <SkeletonLine key={j} width="w-full" height="h-4" animated={animated} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4 pb-2 border-b">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLine key={i} width="w-full" height="h-4" animated={animated} />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <SkeletonLine key={j} width="w-full" height="h-4" animated={animated} />
            ))}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <SkeletonLine width="w-24" height="h-4" animated={animated} />
              <SkeletonLine width="w-20" height="h-4" animated={animated} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t space-y-2">
        <SkeletonLine width="w-full" height="h-3" animated={animated} />
        <SkeletonLine width="w-3/4" height="h-3" animated={animated} />
      </div>
    </div>
  </Card>
);

// Stats Skeleton
const StatsSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonLine width="w-24" height="h-4" animated={animated} />
              <SkeletonLine width="w-10" height="h-10" animated={animated} className="rounded-lg" />
            </div>
            <SkeletonLine width="w-32" height="h-8" animated={animated} />
            <div className="flex items-center gap-2">
              <SkeletonLine width="w-16" height="h-4" animated={animated} className="rounded-full" />
              <SkeletonLine width="w-20" height="h-3" animated={animated} />
            </div>
          </div>
        </Card>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonLine width="w-40" height="h-5" animated={animated} />
              <SkeletonLine width="w-24" height="h-8" animated={animated} className="rounded-md" />
            </div>
            <SkeletonLine width="w-full" height="h-64" animated={animated} className="rounded-lg" />
          </div>
        </Card>
      ))}
    </div>

    {/* Table */}
    <Card className="p-6">
      <div className="space-y-4">
        <SkeletonLine width="w-32" height="h-5" animated={animated} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonLine width="w-12" height="h-12" animated={animated} className="rounded-full flex-shrink-0" />
              <div className="flex-1 grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <SkeletonLine key={j} width="w-full" height="h-4" animated={animated} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// Main OrderSkeleton Component
export const OrderSkeleton: React.FC<OrderSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className,
  animated = true,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return count === 1 ? (
          <OrderCardSkeleton animated={animated} />
        ) : (
          <OrderListSkeleton count={count} animated={animated} />
        );
      case 'details':
        return <OrderDetailsSkeleton animated={animated} />;
      case 'list':
        return <OrderListSkeleton count={count} animated={animated} />;
      case 'tracking':
        return <TrackingSkeleton animated={animated} />;
      case 'invoice':
        return <InvoiceSkeleton animated={animated} />;
      case 'stats':
        return <StatsSkeleton animated={animated} />;
      default:
        return <OrderCardSkeleton animated={animated} />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {renderSkeleton()}
    </div>
  );
};

export default OrderSkeleton;
