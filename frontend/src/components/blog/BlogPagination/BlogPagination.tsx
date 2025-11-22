'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  MoreHorizontal,
  Loader2,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export interface BlogPaginationProps {
  pagination: PaginationInfo;
  variant?: 'default' | 'compact' | 'minimal' | 'infinite' | 'load-more';
  size?: 'sm' | 'md' | 'lg';
  showPageInfo?: boolean;
  showPerPageSelector?: boolean;
  showJumpToPage?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  perPageOptions?: number[];
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onLoadMore?: () => void;
  infiniteScrollThreshold?: number;
  enableUrlSync?: boolean;
  scrollToTop?: boolean;
  showItemRange?: boolean;
  itemName?: string;
  itemNamePlural?: string;
  compactBreakpoint?: number;
  ariaLabel?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    button: 'h-8 w-8 text-sm',
    gap: 'gap-1',
    text: 'text-xs'
  },
  md: {
    button: 'h-10 w-10 text-sm',
    gap: 'gap-2',
    text: 'text-sm'
  },
  lg: {
    button: 'h-12 w-12 text-base',
    gap: 'gap-3',
    text: 'text-base'
  }
};

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  pagination,
  variant = 'default',
  size = 'md',
  showPageInfo = true,
  showPerPageSelector = true,
  showJumpToPage = false,
  showFirstLast = true,
  maxVisiblePages = 7,
  perPageOptions = [10, 20, 50, 100],
  className,
  loading = false,
  disabled = false,
  onPageChange,
  onPerPageChange,
  onLoadMore,
  infiniteScrollThreshold = 200,
  enableUrlSync = true,
  scrollToTop = true,
  showItemRange = true,
  itemName = 'post',
  itemNamePlural = 'posts',
  compactBreakpoint = 768,
  ariaLabel = 'Blog pagination'
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [jumpToPage, setJumpToPage] = useState('');
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex
  } = pagination;

  // Check for compact view based on screen size
  useEffect(() => {
    const checkViewport = () => {
      setIsCompact(window.innerWidth < compactBreakpoint);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [compactBreakpoint]);

  // Infinite scroll effect
  useEffect(() => {
    if (variant !== 'infinite') return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < infiniteScrollThreshold) {
        if (hasNextPage && !loadingMore && onLoadMore) {
          setLoadingMore(true);
          onLoadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant, infiniteScrollThreshold, hasNextPage, loadingMore, onLoadMore]);

  // Generate page numbers
  const visiblePages = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with ellipsis
      const sidePages = Math.floor((maxVisiblePages - 3) / 2);
      
      pages.push(1);
      
      if (currentPage > sidePages + 2) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - sidePages);
      const end = Math.min(totalPages - 1, currentPage + sidePages);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - sidePages - 1) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled || loading) {
      return;
    }

    if (enableUrlSync && searchParams) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', page.toString());
      router.push(`${pathname}?${newSearchParams.toString()}`);
    }

    if (onPageChange) {
      onPageChange(page);
    }

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle per page change
  const handlePerPageChange = (perPage: number) => {
    if (enableUrlSync && searchParams) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('per_page', perPage.toString());
      newSearchParams.set('page', '1');
      router.push(`${pathname}?${newSearchParams.toString()}`);
    }

    if (onPerPageChange) {
      onPerPageChange(perPage);
    }

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);
    if (!isNaN(page)) {
      handlePageChange(page);
      setJumpToPage('');
    }
  };

  // Handle load more
  const handleLoadMoreClick = async () => {
    if (!hasNextPage || loadingMore || !onLoadMore) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  // Page button component
  const PageButton: React.FC<{
    page: number | 'ellipsis';
    isActive?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }> = ({ page, isActive = false, disabled = false, onClick }) => {
    if (page === 'ellipsis') {
      return (
        <div className={cn(
          'flex items-center justify-center',
          sizeConfig[size].button,
          'text-gray-400'
        )}>
          <MoreHorizontal size={16} />
        </div>
      );
    }

    return (
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        className={cn(
          sizeConfig[size].button,
          isActive && 'pointer-events-none'
        )}
        disabled={disabled || loading}
        onClick={onClick}
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </Button>
    );
  };

  // Loading state
  if (loading && variant !== 'infinite' && variant !== 'load-more') {
    return (
      <div className={cn('flex justify-center', className)}>
        <Skeleton className="h-10 w-80" />
      </div>
    );
  }

  // No pagination needed
  if (totalPages <= 1 && variant !== 'infinite' && variant !== 'load-more') {
    return null;
  }

  // Infinite scroll variant
  if (variant === 'infinite') {
    return (
      <div className={cn('text-center py-8', className)}>
        <AnimatePresence>
          {loadingMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center space-x-2"
            >
              <Loader2 size={20} className="animate-spin" />
              <span className={sizeConfig[size].text}>Loading more {itemNamePlural}...</span>
            </motion.div>
          )}
          {!hasNextPage && totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn('text-gray-500 dark:text-gray-400', sizeConfig[size].text)}
            >
              You&apos;ve reached the end of all {itemNamePlural}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Load more variant
  if (variant === 'load-more') {
    return (
      <div className={cn('text-center py-6', className)}>
        {hasNextPage ? (
          <Button
            onClick={handleLoadMoreClick}
            disabled={loadingMore || disabled}
            size={size}
            className="min-w-[140px]"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowDown size={16} className="mr-2" />
                Load More {itemNamePlural}
              </>
            )}
          </Button>
        ) : (
          <div className={cn('text-gray-500 dark:text-gray-400', sizeConfig[size].text)}>
            All {itemNamePlural} loaded
          </div>
        )}
        
        {showItemRange && (
          <div className={cn('mt-2 text-gray-500 dark:text-gray-400', sizeConfig[size].text)}>
            Showing {endIndex} of {totalItems} {totalItems === 1 ? itemName : itemNamePlural}
          </div>
        )}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <Button
          variant="outline"
          size={size}
          disabled={!hasPreviousPage || disabled || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center space-x-2"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </Button>

        <div className={cn('text-gray-600 dark:text-gray-400', sizeConfig[size].text)}>
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size={size}
          disabled={!hasNextPage || disabled || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  }

  // Compact variant or small screen
  if (variant === 'compact' || isCompact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4">
            {/* Previous button */}
            <Button
              variant="outline"
              size={size}
              disabled={!hasPreviousPage || disabled || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page info */}
            <div className="flex items-center space-x-2">
              <span className={cn('font-medium', sizeConfig[size].text)}>
                {currentPage}
              </span>
              <span className={cn('text-gray-500', sizeConfig[size].text)}>
                of {totalPages}
              </span>
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size={size}
              disabled={!hasNextPage || disabled || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Item range */}
          {showItemRange && (
            <div className={cn('text-center mt-3 text-gray-500 dark:text-gray-400', sizeConfig[size].text)}>
              {startIndex}-{endIndex} of {totalItems} {totalItems === 1 ? itemName : itemNamePlural}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      {/* Main pagination */}
      <nav aria-label={ariaLabel} className="flex justify-center">
        <div className={cn('flex items-center', sizeConfig[size].gap)}>
          {/* First page */}
          {showFirstLast && currentPage > 2 && (
            <Button
              variant="outline"
              size="sm"
              className={sizeConfig[size].button}
              disabled={disabled || loading}
              onClick={() => handlePageChange(1)}
              aria-label="Go to first page"
            >
              <ChevronsLeft size={16} />
            </Button>
          )}

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            className={sizeConfig[size].button}
            disabled={!hasPreviousPage || disabled || loading}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Page numbers */}
          {visiblePages.map((page, index) => (
            <PageButton
              key={index}
              page={page}
              isActive={page === currentPage}
              disabled={disabled || loading}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
            />
          ))}

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            className={sizeConfig[size].button}
            disabled={!hasNextPage || disabled || loading}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Go to next page"
          >
            <ChevronRight size={16} />
          </Button>

          {/* Last page */}
          {showFirstLast && currentPage < totalPages - 1 && (
            <Button
              variant="outline"
              size="sm"
              className={sizeConfig[size].button}
              disabled={disabled || loading}
              onClick={() => handlePageChange(totalPages)}
              aria-label="Go to last page"
            >
              <ChevronsRight size={16} />
            </Button>
          )}
        </div>
      </nav>

      {/* Additional controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        {/* Page info */}
        {showPageInfo && showItemRange && (
          <div className={cn('text-gray-600 dark:text-gray-400', sizeConfig[size].text)}>
            Showing {startIndex}-{endIndex} of {totalItems} {totalItems === 1 ? itemName : itemNamePlural}
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Per page selector */}
          {showPerPageSelector && (
            <div className="flex items-center space-x-2">
              <span className={cn('text-gray-600 dark:text-gray-400', sizeConfig[size].text)}>
                Per page:
              </span>
              <select
                value={itemsPerPage.toString()}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
                disabled={disabled || loading}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 min-w-[60px]"
                aria-label="Items per page"
              >
                {perPageOptions.map((option) => (
                  <option key={option} value={option.toString()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Jump to page */}
          {showJumpToPage && totalPages > 10 && (
            <div className="flex items-center space-x-2">
              <span className={cn('text-gray-600 dark:text-gray-400', sizeConfig[size].text)}>
                Go to:
              </span>
              <div className="flex space-x-1">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Page"
                  disabled={disabled || loading}
                />
                <Button
                  size="sm"
                  onClick={handleJumpToPage}
                  disabled={!jumpToPage || disabled || loading}
                >
                  Go
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility components
export const SimplePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className }) => (
  <BlogPagination
    pagination={{
      currentPage,
      totalPages,
      totalItems: totalPages * 10, // Approximate
      itemsPerPage: 10,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: (currentPage - 1) * 10 + 1,
      endIndex: Math.min(currentPage * 10, totalPages * 10)
    }}
    variant="minimal"
    showPageInfo={false}
    showPerPageSelector={false}
    onPageChange={onPageChange}
    className={className}
  />
);

export const InfiniteScrollPagination: React.FC<{
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  className?: string;
}> = ({ hasMore, onLoadMore, loading = false, className }) => (
  <BlogPagination
    pagination={{
      currentPage: 1,
      totalPages: hasMore ? 2 : 1,
      totalItems: 0,
      itemsPerPage: 0,
      hasNextPage: hasMore,
      hasPreviousPage: false,
      startIndex: 0,
      endIndex: 0
    }}
    variant="infinite"
    onLoadMore={onLoadMore}
    loading={loading}
    className={className}
  />
);

export const LoadMorePagination: React.FC<{
  hasMore: boolean;
  onLoadMore: () => void;
  currentCount: number;
  totalCount: number;
  loading?: boolean;
  className?: string;
}> = ({ hasMore, onLoadMore, currentCount, totalCount, loading = false, className }) => (
  <BlogPagination
    pagination={{
      currentPage: 1,
      totalPages: hasMore ? 2 : 1,
      totalItems: totalCount,
      itemsPerPage: currentCount,
      hasNextPage: hasMore,
      hasPreviousPage: false,
      startIndex: 1,
      endIndex: currentCount
    }}
    variant="load-more"
    onLoadMore={onLoadMore}
    loading={loading}
    showItemRange={true}
    className={className}
  />
);

export default BlogPagination;
