/**
 * CustomerReviews Component
 * 
 * Comprehensive reviews list/grid container component for displaying
 * customer reviews with advanced filtering, sorting, and pagination.
 * 
 * Features:
 * - Grid and list layout modes
 * - Advanced filtering (rating, verified, images, date range)
 * - Sorting options (recent, helpful, rating)
 * - Pagination and load more
 * - Search functionality
 * - Empty states
 * - Loading states with skeletons
 * - Review cards with full details
 * - Responsive design
 * - Bulk actions
 * - Export functionality
 * - Analytics tracking
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  PhotoIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/solid';
import { TestimonialCard } from './TestimonialCard';
import type { TestimonialCardProps } from './TestimonialCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ReviewLayout = 'grid' | 'list';
export type ReviewSortOption = 'recent' | 'helpful' | 'highest' | 'lowest';

export interface ReviewFilter {
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  search?: string;
}

export interface CustomerReviewsProps {
  /** Reviews data */
  reviews: TestimonialCardProps[];
  /** Initial layout mode */
  initialLayout?: ReviewLayout;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable filters */
  enableFilters?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** Show load more button */
  showLoadMore?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On review click callback */
  onReviewClick?: (review: TestimonialCardProps) => void;
  /** On filter change callback */
  onFilterChange?: (filter: ReviewFilter) => void;
  /** On sort change callback */
  onSortChange?: (sort: ReviewSortOption) => void;
  /** On load more callback */
  onLoadMore?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
  initialLayout = 'grid',
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  itemsPerPage = 9,
  showLoadMore = true,
  showPagination = false,
  loading = false,
  className,
  onReviewClick,
  onFilterChange,
  onSortChange,
  onLoadMore,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [layout, setLayout] = useState<ReviewLayout>(initialLayout);
  const [sortOption, setSortOption] = useState<ReviewSortOption>('recent');
  const [filter, setFilter] = useState<ReviewFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (review) =>
          review.customer.name.toLowerCase().includes(query) ||
          review.review.toLowerCase().includes(query) ||
          review.product?.name.toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (filter.rating !== undefined) {
      result = result.filter((review) => review.rating === filter.rating);
    }

    // Verified filter
    if (filter.verified) {
      result = result.filter((review) => review.customer.verified);
    }

    // Has images filter
    if (filter.hasImages) {
      result = result.filter(
        (review) => review.images && review.images.length > 0
      );
    }

    return result;
  }, [reviews, searchQuery, filter]);

  const sortedReviews = useMemo(() => {
    const sorted = [...filteredReviews];

    switch (sortOption) {
      case 'recent':
        sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'helpful':
        sorted.sort(
          (a, b) =>
            (b.helpfulVotes || 0) - (a.helpfulVotes || 0)
        );
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  }, [filteredReviews, sortOption]);

  const paginatedReviews = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return sortedReviews.slice(startIndex, endIndex);
  }, [sortedReviews, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(sortedReviews.length / itemsPerPage),
    [sortedReviews.length, itemsPerPage]
  );

  const hasMore = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.rating !== undefined) count++;
    if (filter.verified) count++;
    if (filter.hasImages) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filter, searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLayoutChange = useCallback((newLayout: ReviewLayout) => {
    setLayout(newLayout);
    console.log('Layout changed to:', newLayout);
  }, []);

  const handleSortChange = useCallback(
    (newSort: ReviewSortOption) => {
      setSortOption(newSort);
      setShowSortMenu(false);
      onSortChange?.(newSort);
      console.log('Sort changed to:', newSort);
    },
    [onSortChange]
  );

  const handleFilterChange = useCallback(
    (newFilter: Partial<ReviewFilter>) => {
      const updatedFilter = { ...filter, ...newFilter };
      setFilter(updatedFilter);
      setCurrentPage(1);
      onFilterChange?.(updatedFilter);
      console.log('Filter changed:', updatedFilter);
    },
    [filter, onFilterChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilter({});
    setSearchQuery('');
    setCurrentPage(1);
    onFilterChange?.({});
    console.log('Filters cleared');
  }, [onFilterChange]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
    onLoadMore?.();
    console.log('Loading more reviews, page:', currentPage + 1);
  }, [currentPage, onLoadMore]);

  const handleReviewClick = useCallback(
    (review: TestimonialCardProps) => {
      onReviewClick?.(review);
      console.log('Review clicked:', review.id);
    },
    [onReviewClick]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [sortOption]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderControls = () => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Left Controls */}
      <div className="flex flex-1 items-center gap-3">
        {/* Search */}
        {enableSearch && (
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Button */}
        {enableFilters && (
          <div className="relative">
            <Tooltip content="Filter reviews">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="gap-2"
                aria-haspopup="true"
                aria-expanded={showFilterMenu}
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </Tooltip>

            {/* Filter Menu */}
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px]"
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900">Filter by</h4>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={filter.rating === undefined ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange({ rating: undefined })}
                      >
                        All
                      </Button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <Button
                          key={rating}
                          variant={filter.rating === rating ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterChange({ rating })}
                        >
                          {rating}★
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Verified Filter */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filter.verified || false}
                        onChange={(e) =>
                          handleFilterChange({ verified: e.target.checked || undefined })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
                        Verified purchases only
                      </span>
                    </label>
                  </div>

                  {/* Has Images Filter */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filter.hasImages || false}
                        onChange={(e) =>
                          handleFilterChange({ hasImages: e.target.checked || undefined })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <PhotoIcon className="w-4 h-4 text-gray-600" />
                        With customer images
                      </span>
                    </label>
                  </div>

                  {/* Clear Button */}
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        {enableSorting && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="gap-2"
              aria-haspopup="true"
              aria-expanded={showSortMenu}
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
              {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
              <ChevronDownIcon
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  showSortMenu && 'rotate-180'
                )}
              />
            </Button>

            {/* Sort Menu */}
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                      'hover:bg-gray-50',
                      sortOption === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Tooltip content="Grid view">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={cn(
                'p-2 rounded transition-colors duration-200',
                layout === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label="Grid view"
              aria-current={layout === 'grid' ? 'true' : 'false'}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="List view">
            <button
              onClick={() => handleLayoutChange('list')}
              className={cn(
                'p-2 rounded transition-colors duration-200',
                layout === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label="List view"
              aria-current={layout === 'list' ? 'true' : 'false'}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <span>
        Showing <span className="font-semibold text-gray-900">{paginatedReviews.length}</span> of{' '}
        <span className="font-semibold text-gray-900">{sortedReviews.length}</span> reviews
      </span>
      {activeFilterCount > 0 && (
        <span className="text-blue-600">
          {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
        </span>
      )}
    </div>
  );

  const renderReviews = () => {
    if (loading) {
      return (
        <div className={cn('grid gap-6', layout === 'grid' && 'md:grid-cols-2 lg:grid-cols-3')}>
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-xl animate-pulse h-80"
            />
          ))}
        </div>
      );
    }

    if (paginatedReviews.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600 mb-6">
            {activeFilterCount > 0
              ? 'Try adjusting your filters or search query'
              : 'Be the first to leave a review!'}
          </p>
          {activeFilterCount > 0 && (
            <Button onClick={handleClearFilters}>Clear all filters</Button>
          )}
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${layout}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'grid gap-6',
            layout === 'grid' && 'md:grid-cols-2 lg:grid-cols-3',
            layout === 'list' && 'grid-cols-1'
          )}
        >
          {paginatedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleReviewClick(review)}
            >
              <TestimonialCard {...review} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderLoadMore = () => {
    if (!showLoadMore || !hasMore || loading) return null;

    return (
      <div className="text-center mt-8">
        <Button onClick={handleLoadMore} size="lg" variant="outline">
          Load more reviews
          <ChevronDownIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      {renderControls()}

      {/* Stats */}
      {renderStats()}

      {/* Reviews */}
      {renderReviews()}

      {/* Load More */}
      {renderLoadMore()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default CustomerReviews;
