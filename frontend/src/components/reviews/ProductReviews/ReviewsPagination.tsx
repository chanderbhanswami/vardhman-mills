'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';

// Types
export interface ReviewsPaginationProps {
  // Pagination data
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  
  // Display options
  variant?: 'default' | 'compact' | 'simple' | 'detailed';
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showTotalItems?: boolean;
  showPageInput?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  
  // Page size options
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  
  // Styling
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  disabledButtonClassName?: string;
  
  // Loading and states
  isLoading?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  
  // Advanced features
  enableJumpToPage?: boolean;
  enableKeyboardNavigation?: boolean;
  showNavigationHints?: boolean;
  compactOnMobile?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  pageAriaLabel?: (page: number) => string;
  nextAriaLabel?: string;
  prevAriaLabel?: string;
  firstAriaLabel?: string;
  lastAriaLabel?: string;
  
  // Callbacks
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onPageRangeChange?: (start: number, end: number) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

export interface PaginationRange {
  type: 'page' | 'ellipsis';
  value: number;
  isActive?: boolean;
}

// Utility function to generate pagination range
const generatePaginationRange = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): PaginationRange[] => {
  const range: PaginationRange[] = [];
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      range.push({
        type: 'page',
        value: i,
        isActive: i === currentPage
      });
    }
  } else {
    // Complex pagination logic
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    } else if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }
    
    // Always show first page
    if (startPage > 1) {
      range.push({
        type: 'page',
        value: 1,
        isActive: currentPage === 1
      });
      
      if (startPage > 2) {
        range.push({
          type: 'ellipsis',
          value: -1
        });
      }
    }
    
    // Add visible page range
    for (let i = startPage; i <= endPage; i++) {
      range.push({
        type: 'page',
        value: i,
        isActive: i === currentPage
      });
    }
    
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        range.push({
          type: 'ellipsis',
          value: -1
        });
      }
      
      range.push({
        type: 'page',
        value: totalPages,
        isActive: currentPage === totalPages
      });
    }
  }
  
  return range;
};

// Page size selector component
const PageSizeSelector: React.FC<{
  pageSize: number;
  options: number[];
  totalItems: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}> = ({ pageSize, options, totalItems, onPageSizeChange, className }) => {
  const selectOptions = options.map(size => ({
    label: `${size} per page`,
    value: size.toString()
  }));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onPageSizeChange(parseInt(value.toString()))}
        options={selectOptions}
      />
      {/* Use totalItems to show context */}
      <Badge variant="secondary" className="text-xs">
        {totalItems} total
      </Badge>
    </div>
  );
};

// Page info component
const PageInfo: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  variant: 'default' | 'compact' | 'detailed';
  className?: string;
}> = ({ currentPage, totalPages, totalItems, pageSize, variant, className }) => {
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (variant === 'compact') {
    return (
      <div className={cn('text-sm text-gray-600', className)}>
        {currentPage} of {totalPages}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="text-sm text-gray-900">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('text-sm text-gray-600', className)}>
      Showing {startItem}-{endItem} of {totalItems}
    </div>
  );
};

// Jump to page component
const JumpToPage: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className }) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue);
    
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
    
    setIsEditing(false);
    setInputValue(currentPage.toString());
  }, [inputValue, totalPages, currentPage, onPageChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(currentPage.toString());
    }
  }, [currentPage]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-600 whitespace-nowrap">Go to:</span>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className="w-16 h-8 text-sm"
            autoFocus
          />
          <span className="text-sm text-gray-500">/ {totalPages}</span>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8 px-2"
        >
          Page {currentPage}
        </Button>
      )}
    </div>
  );
};

// Navigation hints component
const NavigationHints: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <Tooltip
      content={
        <div className="space-y-1 text-xs">
          <div>← → Arrow keys to navigate</div>
          <div>Home/End for first/last page</div>
          <div>Click page number to jump</div>
        </div>
      }
    >
      <div className={cn('flex items-center text-gray-400', className)}>
        <InformationCircleIcon className="w-4 h-4" />
      </div>
    </Tooltip>
  );
};

// Main pagination component
const ReviewsPagination: React.FC<ReviewsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems = 0,
  pageSize = 10,
  variant = 'default',
  showPageSizeSelector = true,
  showPageInfo = true,
  showTotalItems = true,
  showPageInput = false,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  className,
  buttonClassName,
  activeButtonClassName,
  disabledButtonClassName,
  isLoading = false,
  hasError = false,
  disabled = false,
  enableJumpToPage = false,
  enableKeyboardNavigation = true,
  showNavigationHints = false,
  compactOnMobile = true,
  ariaLabel = 'Pagination Navigation',
  pageAriaLabel = (page: number) => `Go to page ${page}`,
  nextAriaLabel = 'Go to next page',
  prevAriaLabel = 'Go to previous page',
  firstAriaLabel = 'Go to first page',
  lastAriaLabel = 'Go to last page',
  onPageChange,
  onPageSizeChange,
  onPageRangeChange,
  onAnalyticsEvent
}) => {
  // State
  const { value: userPageSize, setValue: setUserPageSize } = useLocalStorage('pagination-page-size', defaultPageSize);

  // Memoized values
  const currentPageSize = pageSize || userPageSize;
  const paginationRange = useMemo(() => 
    generatePaginationRange(currentPage, totalPages, maxVisiblePages),
    [currentPage, totalPages, maxVisiblePages]
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const isDisabled = disabled || isLoading || hasError;

  // Handlers - Define before useEffect to avoid dependency issues
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isDisabled) {
      return;
    }

    onPageChange(page);
    onAnalyticsEvent?.('pagination_page_changed', { 
      from: currentPage, 
      to: page, 
      totalPages 
    });

    // Calculate range for callback
    const startItem = ((page - 1) * currentPageSize) + 1;
    const endItem = Math.min(page * currentPageSize, totalItems);
    onPageRangeChange?.(startItem, endItem);
  }, [currentPage, totalPages, isDisabled, onPageChange, onAnalyticsEvent, onPageRangeChange, currentPageSize, totalItems]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!enableKeyboardNavigation || isDisabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (canGoPrev) {
            e.preventDefault();
            handlePageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          if (canGoNext) {
            e.preventDefault();
            handlePageChange(currentPage + 1);
          }
          break;
        case 'Home':
          if (currentPage !== 1) {
            e.preventDefault();
            handlePageChange(1);
          }
          break;
        case 'End':
          if (currentPage !== totalPages) {
            e.preventDefault();
            handlePageChange(totalPages);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, canGoPrev, canGoNext, isDisabled, enableKeyboardNavigation, handlePageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    setUserPageSize(size);
    onPageSizeChange?.(size);
    onAnalyticsEvent?.('pagination_page_size_changed', { 
      from: currentPageSize, 
      to: size 
    });

    // Calculate new page number to maintain position
    const currentItemStart = ((currentPage - 1) * currentPageSize) + 1;
    const newPage = Math.ceil(currentItemStart / size);
    
    if (newPage !== currentPage && newPage <= Math.ceil(totalItems / size)) {
      handlePageChange(newPage);
    }
  }, [currentPageSize, currentPage, totalItems, setUserPageSize, onPageSizeChange, onAnalyticsEvent, handlePageChange]);

  // Render different variants
  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrev || isDisabled}
          aria-label={prevAriaLabel}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600 px-4">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext || isDisabled}
          aria-label={nextAriaLabel}
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-between',
        compactOnMobile && 'flex-col gap-4 sm:flex-row sm:gap-0',
        className
      )}>
        <div className="flex items-center gap-4">
          {showPageInfo && (
            <PageInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={currentPageSize}
              variant="compact"
            />
          )}
          
          {showPageSizeSelector && onPageSizeChange && (
            <PageSizeSelector
              pageSize={currentPageSize}
              options={pageSizeOptions}
              totalItems={totalItems}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canGoPrev || isDisabled}
            aria-label={prevAriaLabel}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          
          <span className="px-3 py-1 text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canGoNext || isDisabled}
            aria-label={nextAriaLabel}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default and detailed variants
  return (
    <div className={cn('space-y-4', className)}>
      {/* Top row - Page info and controls */}
      <div className={cn(
        'flex items-center justify-between',
        compactOnMobile && 'flex-col gap-4 sm:flex-row sm:gap-0'
      )}>
        <div className="flex items-center gap-4">
          {showPageInfo && (
            <PageInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={currentPageSize}
              variant={variant}
            />
          )}
          
          {/* Use showTotalItems to display additional total count info */}
          {showTotalItems && totalItems > 0 && (
            <Badge variant="outline" className="text-xs">
              <AdjustmentsHorizontalIcon className="w-3 h-3 mr-1" />
              {totalItems} total items
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Use showPageInput to add a jump-to-page input */}
          {showPageInput && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Go to:</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                placeholder="Page"
                className="w-16 h-8 text-xs"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseInt((e.target as HTMLInputElement).value);
                    if (value >= 1 && value <= totalPages) {
                      handlePageChange(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          )}
          
          {enableJumpToPage && (
            <JumpToPage
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          
          {showPageSizeSelector && onPageSizeChange && (
            <PageSizeSelector
              pageSize={currentPageSize}
              options={pageSizeOptions}
              totalItems={totalItems}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
          
          {showNavigationHints && enableKeyboardNavigation && (
            <NavigationHints />
          )}
        </div>
      </div>

      {/* Main pagination controls */}
      <Card className="p-4">
        <nav
          role="navigation"
          aria-label={ariaLabel}
          className="flex items-center justify-center"
        >
          <div className="flex items-center gap-1">
            {/* First page */}
            {showFirstLast && totalPages > maxVisiblePages && currentPage > Math.ceil(maxVisiblePages / 2) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isDisabled}
                  aria-label={firstAriaLabel}
                  className={cn(buttonClassName)}
                >
                  <ChevronDoubleLeftIcon className="w-4 h-4" />
                </Button>
                <div className="px-2">
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400" />
                </div>
              </>
            )}

            {/* Previous page */}
            {showPrevNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrev || isDisabled}
                aria-label={prevAriaLabel}
                className={cn(
                  buttonClassName,
                  !canGoPrev && disabledButtonClassName
                )}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              <AnimatePresence mode="wait">
                {paginationRange.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.value}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.type === 'ellipsis' ? (
                      <div className="px-2">
                        <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : (
                      <Button
                        variant={item.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(item.value)}
                        disabled={item.isActive || isDisabled}
                        aria-label={pageAriaLabel(item.value)}
                        aria-current={item.isActive ? 'page' : undefined}
                        className={cn(
                          'min-w-[2.5rem]',
                          buttonClassName,
                          item.isActive && activeButtonClassName,
                          isDisabled && disabledButtonClassName
                        )}
                      >
                        {item.value}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Next page */}
            {showPrevNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext || isDisabled}
                aria-label={nextAriaLabel}
                className={cn(
                  buttonClassName,
                  !canGoNext && disabledButtonClassName
                )}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            )}

            {/* Last page */}
            {showFirstLast && totalPages > maxVisiblePages && currentPage < totalPages - Math.floor(maxVisiblePages / 2) && (
              <>
                <div className="px-2">
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isDisabled}
                  aria-label={lastAriaLabel}
                  className={cn(buttonClassName)}
                >
                  <ChevronDoubleRightIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Loading/Error states */}
        {(isLoading || hasError) && (
          <div className="mt-4 text-center">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            )}
            
            {hasError && (
              <div className="text-sm text-red-600">
                Unable to load pagination. Please try again.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Bottom summary (detailed variant only) */}
      {variant === 'detailed' && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Viewing {((currentPage - 1) * currentPageSize) + 1} to{' '}
            {Math.min(currentPage * currentPageSize, totalItems)} of{' '}
            {totalItems} total items
          </div>
          
          {enableKeyboardNavigation && (
            <div>
              Use ← → arrow keys to navigate
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsPagination;
