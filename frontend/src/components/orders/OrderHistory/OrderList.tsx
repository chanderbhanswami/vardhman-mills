'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { OrderCard } from './OrderCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Order, OrderFilters } from '@/types/order.types';
import { cn } from '@/lib/utils';

interface OrderListProps {
  orders: Order[];
  filters?: OrderFilters;
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  onOrderClick?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showPagination?: boolean;
  showSkeleton?: boolean;
  infiniteScroll?: boolean;
  className?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  filters,
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onOrderClick,
  onTrackOrder,
  onCancelOrder,
  onReorder,
  variant = 'default',
  showPagination = true,
  showSkeleton = true,
  infiniteScroll = false,
  className,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  // Handle page navigation
  const handlePreviousPage = useCallback(() => {
    if (page > 1 && onPageChange) {
      onPageChange(page - 1);
    }
  }, [page, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages && onPageChange) {
      onPageChange(page + 1);
    }
  }, [page, totalPages, onPageChange]);

  const handleGoToPage = useCallback((targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages && onPageChange) {
      onPageChange(targetPage);
    }
  }, [totalPages, onPageChange]);

  // Handle infinite scroll
  useEffect(() => {
    if (!infiniteScroll || loading || !hasMore) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        setIsLoadingMore(true);
        if (onPageChange) {
          onPageChange(page + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, loading, hasMore, page, onPageChange]);

  // Update hasMore state
  useEffect(() => {
    setHasMore(orders.length < total);
    setIsLoadingMore(false);
  }, [orders.length, total]);

  // Render loading skeleton
  const renderSkeleton = () => {
    const skeletonCount = variant === 'compact' ? 10 : 5;
    
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>

              {variant !== 'compact' && (
                <>
                  {/* Items skeleton */}
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>

                  {/* Footer skeleton */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render error state
  const renderError = () => (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-red-100 p-3">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Failed to load orders
          </h3>
          <p className="text-sm text-gray-600">
            {error || 'An error occurred while fetching orders. Please try again.'}
          </p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Retry
          </Button>
        )}
      </div>
    </Card>
  );

  // Render empty state
  const renderEmpty = () => (
    <Card className="p-8 sm:p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-gray-100 p-4">
          <InboxIcon className="h-12 w-12 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No orders found
          </h3>
          <p className="text-sm text-gray-600">
            {filters && Object.keys(filters).length > 0
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'You haven\'t placed any orders yet. Start shopping to see your orders here.'}
          </p>
        </div>
        {filters && Object.keys(filters).length > 0 && onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );

  // Render pagination
  const renderPagination = () => {
    if (!showPagination || infiniteScroll) return null;

    const pageNumbers = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1); // Ellipsis
        pageNumbers.push(totalPages);
      } else if (page >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-2); // Second ellipsis
        pageNumbers.push(totalPages);
      }
    }

    return (
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results info */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{startIndex}</span> to{' '}
            <span className="font-medium text-gray-900">{endIndex}</span> of{' '}
            <span className="font-medium text-gray-900">{total}</span> results
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1 || loading}
              leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === -1 || pageNum === -2) {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleGoToPage(pageNum)}
                    disabled={loading}
                    className={cn(
                      'min-w-[36px]',
                      page === pageNum && 'pointer-events-none'
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === totalPages || loading}
              rightIcon={<ChevronRightIcon className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>

          {/* Page size selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' },
                ]}
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
                className="w-20"
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Main render
  return (
    <div className={cn('space-y-4', className)}>
      {/* Error state */}
      {error && renderError()}

      {/* Loading skeleton */}
      {loading && showSkeleton && !error && renderSkeleton()}

      {/* Orders list */}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            renderEmpty()
          ) : (
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <OrderCard
                    order={order}
                    variant={variant}
                    onViewDetails={onOrderClick}
                    onTrackOrder={onTrackOrder}
                    onCancelOrder={onCancelOrder}
                    onReorder={onReorder}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Pagination */}
          {orders.length > 0 && renderPagination()}

          {/* Infinite scroll loading indicator */}
          {infiniteScroll && isLoadingMore && hasMore && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Loading more orders...
              </div>
            </div>
          )}

          {/* End of list indicator */}
          {infiniteScroll && !hasMore && orders.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600">
                You&apos;ve reached the end of your orders
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
