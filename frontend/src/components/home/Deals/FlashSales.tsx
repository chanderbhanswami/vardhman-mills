/**
 * FlashSales Component
 * 
 * Flash sale component with urgency elements and real-time updates.
 * 
 * Features:
 * - Large countdown timer display
 * - Product grid with availability indicators
 * - Stock level indicators (progress bars)
 * - Auto-refresh for stock updates
 * - Urgency badges (limited stock, ending soon)
 * - Grid/list view toggle
 * - Filtering and sorting
 * - Pagination
 * - Sold out indicators
 * - Real-time inventory updates
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoltIcon,
  FireIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DealCard } from './DealCard';
import { CountdownTimer } from './CountdownTimer';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FlashSaleItem {
  product: Product;
  saleEndDate: Date | string;
  discountPercent: number;
  originalStock: number;
  remainingStock: number;
  soldCount: number;
}

export interface FlashSalesProps {
  /** Flash sale items */
  items: FlashSaleItem[];
  /** Sale end date */
  saleEndDate: Date | string;
  /** Items per page */
  itemsPerPage?: number;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Show filters */
  showFilters?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On item click handler */
  onItemClick?: (product: Product) => void;
  /** On refresh handler */
  onRefresh?: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'ending-soon' | 'stock-low' | 'discount-high' | 'popular';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_PAGE = 8;
const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'stock-low', label: 'Low Stock First' },
  { value: 'discount-high', label: 'Highest Discount' },
  { value: 'popular', label: 'Most Popular' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const FlashSales: React.FC<FlashSalesProps> = ({
  items,
  saleEndDate,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  showFilters = true,
  className,
  onItemClick,
  onRefresh,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('ending-soon');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showSoldOut, setShowSoldOut] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!showSoldOut && item.remainingStock === 0) {
        return false;
      }
      return true;
    });
  }, [items, showSoldOut]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    switch (sortBy) {
      case 'ending-soon':
        sorted.sort((a, b) => {
          const dateA = new Date(a.saleEndDate).getTime();
          const dateB = new Date(b.saleEndDate).getTime();
          return dateA - dateB;
        });
        break;
      case 'stock-low':
        sorted.sort((a, b) => {
          const percentA = (a.remainingStock / a.originalStock) * 100;
          const percentB = (b.remainingStock / b.originalStock) * 100;
          return percentA - percentB;
        });
        break;
      case 'discount-high':
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'popular':
        sorted.sort((a, b) => b.soldCount - a.soldCount);
        break;
    }

    console.log('Sorted flash sale items by:', sortBy);
    return sorted;
  }, [filteredItems, sortBy]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const availableItems = items.filter((i) => i.remainingStock > 0).length;
    const soldOutItems = totalItems - availableItems;
    const totalSold = items.reduce((sum, i) => sum + i.soldCount, 0);

    return { totalItems, availableItems, soldOutItems, totalSold };
  }, [items]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setLastRefresh(new Date());
    onRefresh?.();
    setTimeout(() => setLoading(false), 1000);
    console.log('Flash sale data refreshed');
  }, [onRefresh]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode changed to:', mode);
  }, []);

  const handleSortChange = useCallback((sort: SortBy) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('Page changed to:', page, 'Total pages:', totalPages);
  }, [totalPages]);

  const calculateStockPercent = useCallback((item: FlashSaleItem): number => {
    return (item.remainingStock / item.originalStock) * 100;
  }, []);

  const getUrgencyBadge = useCallback((item: FlashSaleItem) => {
    const stockPercent = calculateStockPercent(item);

    if (item.remainingStock === 0) {
      return { text: 'Sold Out', color: 'bg-gray-500', icon: ExclamationTriangleIcon };
    } else if (stockPercent <= 10) {
      return { text: 'Almost Gone!', color: 'bg-red-600', icon: FireIcon };
    } else if (stockPercent <= 30) {
      return { text: 'Low Stock', color: 'bg-orange-500', icon: ExclamationTriangleIcon };
    } else {
      return { text: 'In Stock', color: 'bg-green-600', icon: CheckCircleIcon };
    }
  }, [calculateStockPercent]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, handleRefresh]);

  useEffect(() => {
    console.log('Flash sale stats:', stats);
  }, [stats]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-2xl p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BoltIcon className="w-10 h-10" />
              <h2 className="text-4xl md:text-5xl font-black uppercase">Flash Sale</h2>
            </div>
            <p className="text-xl font-semibold">Limited quantities available - Act fast!</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant="default" size="lg" className="bg-white text-red-600 text-lg px-6 py-3 font-bold">
              {stats.availableItems} / {stats.totalItems} Items Available
            </Badge>
            <p className="text-sm opacity-90">{stats.totalSold} items sold</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ClockIcon className="w-6 h-6" />
            <p className="text-xl font-bold uppercase">Sale Ends In:</p>
          </div>
          <CountdownTimer
            endDate={saleEndDate}
            variant="large"
            showLabels={true}
            showIcon={false}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {/* Sort */}
        {showFilters && (
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            aria-label="Sort flash sale items"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Show Sold Out Toggle */}
        <Button
          variant="outline"
          size="sm"
          className={cn(showSoldOut && 'bg-gray-100 dark:bg-gray-700')}
          onClick={() => {
            setShowSoldOut((prev: boolean) => !prev);
            console.log('Show sold out toggled:', !showSoldOut);
          }}
        >
          {showSoldOut ? 'Hide' : 'Show'} Sold Out
        </Button>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className={cn(loading && 'opacity-50 cursor-not-allowed')}
        >
          <ArrowPathIcon className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewModeChange('grid')}
          className={cn(viewMode === 'grid' && 'bg-gray-100 dark:bg-gray-700')}
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewModeChange('list')}
          className={cn(viewMode === 'list' && 'bg-gray-100 dark:bg-gray-700')}
        >
          <ListBulletIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  const renderItems = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div
              key={i}
              className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (paginatedItems.length === 0) {
      return (
        <div className="text-center py-20">
          <BoltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            No flash sale items available
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Check back soon for new deals!
          </p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          )}
        >
          {paginatedItems.map((item) => {
            const stockPercent = calculateStockPercent(item);
            const urgency = getUrgencyBadge(item);

            return (
              <div key={item.product.id} className="relative">
                <DealCard
                  product={item.product}
                  dealEndDate={item.saleEndDate}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  showCountdown={true}
                  onClick={onItemClick}
                />

                {/* Stock Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-3 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="default"
                      size="sm"
                      className={cn(urgency.color, 'text-white')}
                    >
                      <urgency.icon className="w-4 h-4 mr-1" />
                      {urgency.text}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.remainingStock} / {item.originalStock}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' as const }}
                      className={cn(
                        'h-full rounded-full',
                        stockPercent <= 10
                          ? 'bg-red-600'
                          : stockPercent <= 30
                          ? 'bg-orange-500'
                          : 'bg-green-600'
                      )}
                    />
                  </div>

                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                    {item.soldCount} sold • {stockPercent.toFixed(0)}% remaining
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn(
                  'min-w-[40px]',
                  currentPage === page && 'bg-red-600 text-white'
                )}
              >
                {page}
              </Button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page}>...</span>;
          }
          return null;
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('w-full', className)}>
      {renderHeader()}
      {renderControls()}
      {renderItems()}
      {renderPagination()}
    </div>
  );
};

export default FlashSales;
