'use client';

import React, { forwardRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Pagination variants
const paginationVariants = cva(
  'flex items-center space-x-1',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base'
      },
      variant: {
        default: '',
        outlined: 'border rounded-lg p-2',
        minimal: 'space-x-2'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

// Pagination item variants
const paginationItemVariants = cva(
  [
    'inline-flex items-center justify-center transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  ],
  {
    variants: {
      size: {
        sm: 'w-7 h-7 text-xs rounded',
        default: 'w-9 h-9 text-sm rounded-md',
        lg: 'w-11 h-11 text-base rounded-lg'
      },
      variant: {
        default: [
          'border border-border bg-background text-foreground',
          'hover:bg-muted hover:border-muted-foreground',
          'data-[current=true]:bg-primary data-[current=true]:text-primary-foreground data-[current=true]:border-primary'
        ],
        ghost: [
          'border-0 bg-transparent text-muted-foreground',
          'hover:bg-muted hover:text-foreground',
          'data-[current=true]:bg-primary data-[current=true]:text-primary-foreground'
        ],
        outlined: [
          'border-2 border-border bg-transparent text-foreground',
          'hover:border-primary hover:text-primary',
          'data-[current=true]:border-primary data-[current=true]:bg-primary data-[current=true]:text-primary-foreground'
        ]
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

// Base Pagination Props
export interface PaginationProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showEllipsis?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  itemVariant?: VariantProps<typeof paginationItemVariants>['variant'];
}

// Pagination Item Props
export interface PaginationItemProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {
  current?: boolean;
  page?: number;
}

// Simple Pagination Props
export interface SimplePaginationProps 
  extends Omit<PaginationProps, 'totalPages' | 'showFirstLast' | 'showEllipsis' | 'siblingCount' | 'boundaryCount'> {
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Hook for pagination logic
export const usePagination = ({
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1
}: {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
}) => {
  return useMemo(() => {
    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    const startPages = range(1, Math.min(boundaryCount, totalPages));
    const endPages = range(
      Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
      totalPages
    );

    const siblingsStart = Math.max(
      Math.min(
        currentPage - siblingCount,
        totalPages - boundaryCount - siblingCount * 2 - 1
      ),
      boundaryCount + 2
    );

    const siblingsEnd = Math.min(
      Math.max(
        currentPage + siblingCount,
        boundaryCount + siblingCount * 2 + 2
      ),
      endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
    );

    const itemList: (number | 'ellipsis')[] = [
      ...startPages,

      ...(siblingsStart > boundaryCount + 2
        ? ['ellipsis' as const]
        : boundaryCount + 1 < totalPages - boundaryCount
        ? [boundaryCount + 1]
        : []),

      ...range(siblingsStart, siblingsEnd),

      ...(siblingsEnd < totalPages - boundaryCount - 1
        ? ['ellipsis' as const]
        : totalPages - boundaryCount > boundaryCount
        ? [totalPages - boundaryCount]
        : []),

      ...endPages,
    ];

    // Remove duplicates and sort
    const uniqueItems = Array.from(new Set(itemList)).sort((a, b) => {
      if (a === 'ellipsis') return 1;
      if (b === 'ellipsis') return -1;
      return (a as number) - (b as number);
    });

    return uniqueItems;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);
};

// Pagination Item Component
export const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ 
    className, 
    size, 
    variant, 
    current = false, 
    page, 
    children,
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(paginationItemVariants({ size, variant }), className)}
        data-current={current}
        whileHover={{ scale: current ? 1 : 1.05 }}
        whileTap={{ scale: current ? 1 : 0.95 }}
        transition={{ duration: 0.1 }}
        {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>)}
      >
        {children || page}
      </motion.button>
    );
  }
);

PaginationItem.displayName = 'PaginationItem';

// Ellipsis Component
export const PaginationEllipsis = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('flex items-center justify-center w-9 h-9 text-muted-foreground', className)}
        aria-hidden="true"
        {...props}
      >
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </span>
    );
  }
);

PaginationEllipsis.displayName = 'PaginationEllipsis';

// Main Pagination Component
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ 
    className,
    size,
    variant,
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    showPrevNext = true,
    showEllipsis = true,
    siblingCount = 1,
    boundaryCount = 1,
    disabled = false,
    showPageNumbers = true,
    showInfo = false,
    itemVariant = 'default',
    ...props 
  }, ref) => {
    const items = usePagination({
      currentPage,
      totalPages,
      siblingCount,
      boundaryCount
    });

    const handlePageChange = useCallback((page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
        onPageChange(page);
      }
    }, [currentPage, totalPages, onPageChange, disabled]);

    const canGoFirst = currentPage > 1 && !disabled;
    const canGoPrev = currentPage > 1 && !disabled;
    const canGoNext = currentPage < totalPages && !disabled;
    const canGoLast = currentPage < totalPages && !disabled;

    if (totalPages <= 1 && !showInfo) {
      return null;
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination navigation"
        className={cn(paginationVariants({ size, variant }), className)}
        {...props}
      >
        {showFirstLast && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(1)}
            disabled={!canGoFirst}
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </PaginationItem>
        )}

        {showPrevNext && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canGoPrev}
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </PaginationItem>
        )}

        {showPageNumbers && items.map((item, index) => {
          if (item === 'ellipsis') {
            return showEllipsis ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : null;
          }

          const page = item as number;
          const isCurrent = page === currentPage;

          return (
            <PaginationItem
              key={page}
              size={size}
              variant={itemVariant}
              current={isCurrent}
              page={page}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              aria-label={isCurrent ? `Current page, page ${page}` : `Go to page ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
            />
          );
        })}

        {showPrevNext && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </PaginationItem>
        )}

        {showFirstLast && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(totalPages)}
            disabled={!canGoLast}
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </PaginationItem>
        )}

        {showInfo && (
          <div className="ml-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

// Simple Pagination Component
export const SimplePagination = forwardRef<HTMLElement, SimplePaginationProps>(
  ({ 
    className,
    size,
    variant,
    currentPage,
    onPageChange,
    hasNextPage,
    hasPrevPage,
    showPrevNext = true,
    disabled = false,
    showInfo = false,
    itemVariant = 'default',
    ...props 
  }, ref) => {
    const handlePageChange = useCallback((page: number) => {
      if (page !== currentPage && !disabled) {
        onPageChange(page);
      }
    }, [currentPage, onPageChange, disabled]);

    const canGoPrev = hasPrevPage && !disabled;
    const canGoNext = hasNextPage && !disabled;

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Simple pagination navigation"
        className={cn(paginationVariants({ size, variant }), className)}
        {...props}
      >
        {showPrevNext && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canGoPrev}
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </PaginationItem>
        )}

        {showInfo && (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Page {currentPage}
          </div>
        )}

        {showPrevNext && (
          <PaginationItem
            size={size}
            variant={itemVariant}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
            title="Next page"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </PaginationItem>
        )}
      </nav>
    );
  }
);

SimplePagination.displayName = 'SimplePagination';

// Pagination with Input Component
export interface PaginationWithInputProps extends PaginationProps {
  showJumpToPage?: boolean;
}

export const PaginationWithInput = forwardRef<HTMLElement, PaginationWithInputProps>(
  ({ showJumpToPage = false, onPageChange, currentPage, totalPages, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleJumpToPage = useCallback(() => {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
        setInputValue('');
      }
    }, [inputValue, onPageChange, totalPages]);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleJumpToPage();
      }
    }, [handleJumpToPage]);

    return (
      <div className="flex items-center space-x-4">
        <Pagination
          ref={ref}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          {...props}
        />

        {showJumpToPage && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">Go to:</span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-16 px-2 py-1 text-center border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              min={1}
              max={totalPages}
              placeholder="1"
              aria-label="Jump to page"
            />
            <button
              onClick={handleJumpToPage}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              disabled={!inputValue || isNaN(parseInt(inputValue, 10))}
            >
              Go
            </button>
          </div>
        )}
      </div>
    );
  }
);

PaginationWithInput.displayName = 'PaginationWithInput';

export default Pagination;

