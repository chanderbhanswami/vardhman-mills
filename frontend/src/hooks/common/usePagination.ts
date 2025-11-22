import { useState, useCallback, useMemo, useEffect } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  showPrevButton?: boolean;
  showNextButton?: boolean;
  disabled?: boolean;
}

export interface PaginationReturn extends PaginationState {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
  paginationRange: (number | string)[];
  getPageData: <T>(data: T[]) => T[];
  getSliceIndices: () => { start: number; end: number };
}

const DOTS = '...';

export const usePagination = (options: PaginationOptions = {}): PaginationReturn => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems = 0,
    siblingCount = 1,
    boundaryCount = 1,
    disabled = false,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItemsState, setTotalItemsState] = useState(totalItems);

  const state = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalItemsState / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItemsState - 1);
    
    return {
      currentPage,
      pageSize,
      totalItems: totalItemsState,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [currentPage, pageSize, totalItemsState]);

  const paginationRange = useMemo((): (number | string)[] => {
    const { totalPages } = state;
    const totalPageNumbers = siblingCount + 5;
    
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount;
    
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }
    
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, DOTS, ...rightRange];
    }
    
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, DOTS, ...middleRange, DOTS, totalPages];
    }
    
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [state, currentPage, siblingCount, boundaryCount]);

  const goToPage = useCallback(
    (page: number) => {
      if (disabled) return;
      const validPage = Math.max(1, Math.min(page, state.totalPages));
      setCurrentPage(validPage);
    },
    [disabled, state.totalPages]
  );

  const nextPage = useCallback(() => {
    if (state.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, state.hasNextPage, goToPage]);

  const prevPage = useCallback(() => {
    if (state.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, state.hasPrevPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(state.totalPages);
  }, [goToPage, state.totalPages]);

  const setPageSize = useCallback(
    (size: number) => {
      const newPageSize = Math.max(1, size);
      setPageSizeState(newPageSize);
      const currentStartIndex = (currentPage - 1) * pageSize;
      const newPage = Math.floor(currentStartIndex / newPageSize) + 1;
      setCurrentPage(newPage);
    },
    [currentPage, pageSize]
  );

  const setTotalItems = useCallback((total: number) => {
    const newTotal = Math.max(0, total);
    setTotalItemsState(newTotal);
    const newTotalPages = Math.ceil(newTotal / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [currentPage, pageSize]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItemsState(totalItems);
  }, [initialPage, initialPageSize, totalItems]);

  const getPageData = useCallback(
    <T>(data: T[]): T[] => {
      return data.slice(state.startIndex, state.endIndex + 1);
    },
    [state.startIndex, state.endIndex]
  );

  const getSliceIndices = useCallback(() => {
    return {
      start: state.startIndex,
      end: state.endIndex + 1,
    };
  }, [state.startIndex, state.endIndex]);

  useEffect(() => {
    if (totalItems !== totalItemsState) {
      setTotalItems(totalItems);
    }
  }, [totalItems, totalItemsState, setTotalItems]);

  return {
    ...state,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    setTotalItems,
    reset,
    paginationRange,
    getPageData,
    getSliceIndices,
  };
};

export default usePagination;