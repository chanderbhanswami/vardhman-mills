/**
 * CustomerRatings Component
 * 
 * Comprehensive rating statistics and distribution component for displaying
 * customer feedback metrics, star distribution, and filtering options.
 * 
 * Features:
 * - Overall rating display with large number
 * - Star distribution bars with percentages
 * - Total review count
 * - Rating breakdown by star level
 * - Verified reviews count
 * - Filter by rating
 * - Sort options (Most recent, Highest, Lowest, Most helpful)
 * - Rating trends (up/down indicators)
 * - Responsive layout
 * - Interactive filter buttons
 * - Progress bars with animations
 * - Tooltips for context
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon as StarSolid,
  CheckBadgeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RatingDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface RatingStats {
  overall: number;
  totalReviews: number;
  verifiedReviews: number;
  distribution: RatingDistribution[];
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

export type SortOption = 'recent' | 'highest' | 'lowest' | 'helpful';

export interface CustomerRatingsProps {
  /** Rating statistics */
  stats: RatingStats;
  /** Show filter buttons */
  showFilters?: boolean;
  /** Show sort dropdown */
  showSort?: boolean;
  /** Show verified badge */
  showVerified?: boolean;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On filter change callback */
  onFilterChange?: (rating: number | null) => void;
  /** On sort change callback */
  onSortChange?: (sort: SortOption) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomerRatings: React.FC<CustomerRatingsProps> = ({
  stats,
  showFilters = true,
  showSort = true,
  showVerified = true,
  showTrend = true,
  animated = true,
  className,
  onFilterChange,
  onSortChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const verifiedPercentage = useMemo(() => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.verifiedReviews / stats.totalReviews) * 100);
  }, [stats.totalReviews, stats.verifiedReviews]);

  const maxCount = useMemo(() => {
    return Math.max(...stats.distribution.map((d) => d.count), 1);
  }, [stats.distribution]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback(
    (rating: number | null) => {
      setSelectedRating(rating);
      onFilterChange?.(rating);
      console.log('Filter changed to rating:', rating);
    },
    [onFilterChange]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setSelectedSort(sort);
      setShowSortMenu(false);
      onSortChange?.(sort);
      console.log('Sort changed to:', sort);
    },
    [onSortChange]
  );

  const toggleSortMenu = useCallback(() => {
    setShowSortMenu((prev) => !prev);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass =
      size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(rating);

          return (
            <div key={star} className="relative">
              {filled ? (
                <StarSolid className={cn(sizeClass, 'text-yellow-400')} />
              ) : (
                <StarOutline className={cn(sizeClass, 'text-gray-300')} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOverallRating = () => (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-2 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl"
    >
      <div className="text-5xl font-bold text-gray-900">
        {stats.overall.toFixed(1)}
      </div>
      {renderStars(stats.overall, 'lg')}
      <div className="text-sm text-gray-600">
        Based on {stats.totalReviews.toLocaleString()}{' '}
        {stats.totalReviews === 1 ? 'review' : 'reviews'}
      </div>
      {showVerified && stats.verifiedReviews > 0 && (
        <Tooltip content={`${stats.verifiedReviews.toLocaleString()} verified purchases`}>
          <Badge variant="secondary" className="gap-1">
            <CheckBadgeIcon className="w-3 h-3 text-primary-600" />
            {verifiedPercentage}% verified
          </Badge>
        </Tooltip>
      )}
      {showTrend && stats.trend && stats.trendPercentage && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            stats.trend === 'up' && 'text-green-600',
            stats.trend === 'down' && 'text-red-600',
            stats.trend === 'stable' && 'text-gray-600'
          )}
        >
          {stats.trend === 'up' && <ChevronUpIcon className="w-4 h-4" />}
          {stats.trend === 'down' && <ChevronDownIcon className="w-4 h-4" />}
          {stats.trendPercentage.toFixed(1)}% from last month
        </div>
      )}
    </motion.div>
  );

  const renderDistributionBar = (item: RatingDistribution, index: number) => {
    const isSelected = selectedRating === item.star;
    const widthPercentage = (item.count / maxCount) * 100;

    return (
      <motion.button
        key={item.star}
        initial={animated ? { opacity: 0, x: -20 } : undefined}
        animate={animated ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onClick={() => handleFilterChange(isSelected ? null : item.star)}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-50 group',
          isSelected && 'bg-blue-50 ring-2 ring-blue-500'
        )}
        aria-label={`Filter by ${item.star} star reviews`}
        aria-pressed={isSelected}
      >
        {/* Star Label */}
        <div className="flex items-center gap-1 w-16 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">{item.star}</span>
          <StarSolid className="w-4 h-4 text-yellow-400" />
        </div>

        {/* Progress Bar */}
        <div className="flex-1 relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={animated ? { width: 0 } : undefined}
              animate={animated ? { width: `${widthPercentage}%` } : undefined}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
              className={cn(
                'h-full rounded-full transition-colors duration-200',
                item.star >= 4 ? 'bg-green-500' : item.star >= 3 ? 'bg-yellow-500' : 'bg-orange-500',
                'group-hover:opacity-80'
              )}
              style={{ width: `${widthPercentage}%` }}
            />
          </div>
        </div>

        {/* Count and Percentage */}
        <div className="flex items-center gap-2 w-24 flex-shrink-0 justify-end">
          <span className="text-sm text-gray-600">
            {item.count.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 w-10 text-right">
            ({item.percentage.toFixed(0)}%)
          </span>
        </div>
      </motion.button>
    );
  };

  const renderDistribution = () => (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-2"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Rating Distribution
      </h3>
      <div className="space-y-2">
        {stats.distribution
          .slice()
          .sort((a, b) => b.star - a.star)
          .map((item, index) => renderDistributionBar(item, index))}
      </div>
    </motion.div>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <FunnelIcon className="w-4 h-4" />
          Filter by:
        </span>
        <Button
          variant={selectedRating === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange(null)}
        >
          All
        </Button>
        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            variant={selectedRating === star ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(star)}
            className="gap-1"
          >
            {star} <StarSolid className="w-3 h-3 text-yellow-400" />
          </Button>
        ))}
      </motion.div>
    );
  };

  const renderSort = () => {
    if (!showSort) return null;

    const selectedOption = SORT_OPTIONS.find((opt) => opt.value === selectedSort);

    return (
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortMenu}
          className="gap-2"
          aria-haspopup="true"
          aria-expanded={showSortMenu}
        >
          Sort: {selectedOption?.label}
          <ChevronDownIcon
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              showSortMenu && 'rotate-180'
            )}
          />
        </Button>

        {showSortMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                  'hover:bg-gray-50',
                  selectedSort === option.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderSummary = () => (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {stats.distribution.find((d) => d.star === 5)?.count.toLocaleString() || 0}
        </div>
        <div className="text-xs text-gray-600 flex items-center justify-center gap-0.5">
          5 <StarSolid className="w-3 h-3 text-yellow-400" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {stats.distribution.find((d) => d.star === 4)?.count.toLocaleString() || 0}
        </div>
        <div className="text-xs text-gray-600 flex items-center justify-center gap-0.5">
          4 <StarSolid className="w-3 h-3 text-yellow-400" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {stats.totalReviews.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600">Total</div>
      </div>
    </motion.div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Rating */}
      {renderOverallRating()}

      {/* Distribution */}
      {renderDistribution()}

      {/* Summary Stats */}
      {renderSummary()}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
        {/* Filters */}
        {renderFilters()}

        {/* Sort */}
        {renderSort()}
      </div>

      {/* Active Filter Badge */}
      {selectedRating !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
        >
          <span className="text-sm text-blue-900">
            Showing {selectedRating}-star reviews
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange(null)}
            className="text-blue-700 hover:text-blue-900"
          >
            Clear filter
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerRatings;
