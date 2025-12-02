/**
 * DealsSection Component
 * 
 * Main deals section with filtering, sorting, and grid layout.
 * 
 * Features:
 * - Responsive grid layout for deals
 * - Filtering (category, discount range, expiration)
 * - Sorting (discount percentage, price, ending soon)
 * - Countdown display for each deal
 * - Pagination with page numbers
 * - Loading states
 * - Empty states
 * - Active deals count badge
 * - Deal categories
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  ClockIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DealCard } from './DealCard';
import { DealsBanner } from './DealsBanner';
import { cn } from '@/lib/utils/utils';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Deal {
  product: Product;
  dealEndDate: Date | string;
  discountPercent: number;
  originalPrice: number;
  dealPrice: number;
}

export interface DealsSectionProps {
  /** Array of deals */
  deals: Deal[];
  /** Items per page */
  itemsPerPage?: number;
  /** Show banner */
  showBanner?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show sorting */
  showSorting?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On deal click handler */
  onDealClick?: (product: Product) => void;
}

type SortBy = 'ending-soon' | 'discount-high' | 'discount-low' | 'price-low' | 'price-high';

interface Filters {
  category: string;
  discountRange: number;
  expiringIn: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'discount-high', label: 'Highest Discount' },
  { value: 'discount-low', label: 'Lowest Discount' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const DISCOUNT_RANGES = [
  { value: 0, label: 'All Discounts' },
  { value: 20, label: '20% and above' },
  { value: 30, label: '30% and above' },
  { value: 50, label: '50% and above' },
  { value: 70, label: '70% and above' },
];

const EXPIRY_OPTIONS = [
  { value: 'all', label: 'All Deals' },
  { value: '24h', label: 'Ending in 24 hours' },
  { value: '3d', label: 'Ending in 3 days' },
  { value: '7d', label: 'Ending in 7 days' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const DealsSection: React.FC<DealsSectionProps> = ({
  deals,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  showBanner = true,
  showFilters = true,
  showSorting = true,
  className,
  onDealClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [sortBy, setSortBy] = useState<SortBy>('ending-soon');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    discountRange: 0,
    expiringIn: 'all',
  });

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const filteredDeals = useMemo(() => {
    console.log('Filtering deals with:', filters);

    return deals.filter((deal) => {
      // Category filter
      if (filters.category !== 'all' && deal.product.category?.name !== filters.category) {
        return false;
      }

      // Discount range filter
      if (deal.discountPercent < filters.discountRange) {
        return false;
      }

      // Expiring filter
      if (filters.expiringIn !== 'all') {
        const now = new Date();
        const endDate = new Date(deal.dealEndDate);
        const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (filters.expiringIn === '24h' && hoursRemaining > 24) return false;
        if (filters.expiringIn === '3d' && hoursRemaining > 72) return false;
        if (filters.expiringIn === '7d' && hoursRemaining > 168) return false;
      }

      return true;
    });
  }, [deals, filters]);

  const sortedDeals = useMemo(() => {
    const sorted = [...filteredDeals];

    switch (sortBy) {
      case 'ending-soon':
        sorted.sort((a, b) => {
          const dateA = new Date(a.dealEndDate).getTime();
          const dateB = new Date(b.dealEndDate).getTime();
          return dateA - dateB;
        });
        break;
      case 'discount-high':
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'discount-low':
        sorted.sort((a, b) => a.discountPercent - b.discountPercent);
        break;
      case 'price-low':
        sorted.sort((a, b) => a.dealPrice - b.dealPrice);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.dealPrice - a.dealPrice);
        break;
    }

    console.log('Sorted deals by:', sortBy);
    return sorted;
  }, [filteredDeals, sortBy]);

  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedDeals.slice(start, end);
  }, [sortedDeals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedDeals.length / itemsPerPage);

  const activeDealCount = deals.length;

  const categories = useMemo(() => {
    const cats = new Set(deals.map((d) => d.product.category?.name).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [deals]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSortChange = useCallback((sort: SortBy) => {
    setSortBy(sort);
    setCurrentPage(1);
    console.log('Sort changed to:', sort);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterChange = useCallback((key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    console.log('Filter changed:', key, value);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    console.log('Deals updated:', deals.length, 'active deals');
  }, [deals]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
          <FireIcon className="inline-block w-8 h-8 text-red-600 mr-2" />
          Hot Deals
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Don&apos;t miss out on these amazing limited-time offers
        </p>
      </div>
      <Badge variant="default" size="lg" className="bg-red-600 text-white text-lg px-6 py-3">
        <FireIcon className="w-5 h-5 mr-2" />
        {activeDealCount} Active Deals
      </Badge>
    </div>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap items-center gap-4 mb-8 p-6 bg-muted rounded-xl">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          aria-label="Filter by category"
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        {/* Discount Range Filter */}
        <select
          value={filters.discountRange}
          onChange={(e) => handleFilterChange('discountRange', Number(e.target.value))}
          aria-label="Filter by discount range"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
        >
          {DISCOUNT_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              <TagIcon className="w-4 h-4 mr-2 inline" />
              {range.label}
            </option>
          ))}
        </select>

        {/* Expiry Filter */}
        <select
          value={filters.expiringIn}
          onChange={(e) => handleFilterChange('expiringIn', e.target.value)}
          aria-label="Filter by expiration time"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
        >
          {EXPIRY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              <ClockIcon className="w-4 h-4 mr-2 inline" />
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilters({ category: 'all', discountRange: 0, expiringIn: 'all' });
            console.log('Filters cleared');
          }}
        >
          Clear All
        </Button>
      </div>
    );
  };

  const renderControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedDeals.length} of {sortedDeals.length} deals
      </p>

      {showSorting && (
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortBy)}
          aria-label="Sort deals"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  const renderDeals = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div
              key={i}
              className="h-[500px] bg-muted rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (paginatedDeals.length === 0) {
      return (
        <div className="text-center py-20">
          <FireIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            No deals found
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your filters to see more deals
          </p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {paginatedDeals.map((deal) => (
            <DealCard
              key={deal.product.id}
              product={deal.product}
              dealEndDate={deal.dealEndDate}
              variant="default"
              onClick={onDealClick}
            />
          ))}
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
                  currentPage === page && 'bg-red-600 text-white hover:bg-red-700'
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
      {showBanner && (
        <DealsBanner
          title="Limited Time Deals"
          subtitle="Save Big Today!"
          description="Grab incredible discounts on our best products before time runs out"
          dealEndDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
          discountPercent={50}
          variant="urgent"
          className="mb-12"
        />
      )}

      {renderHeader()}
      {renderFilters()}
      {renderControls()}
      {renderDeals()}
      {renderPagination()}
    </div>
  );
};

export default DealsSection;
