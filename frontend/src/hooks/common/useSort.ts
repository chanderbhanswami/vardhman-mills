import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortAlgorithm = 'native' | 'quicksort' | 'mergesort' | 'heapsort';

export interface SortConfig<T> {
  key?: keyof T | string;
  direction: SortDirection;
  algorithm?: SortAlgorithm;
  customCompare?: (a: T, b: T) => number;
}

export interface MultiSortConfig<T> {
  sorts: Array<{
    key: keyof T | string;
    direction: SortDirection;
    priority?: number;
  }>;
  algorithm?: SortAlgorithm;
}

export interface SortReturn<T> {
  sortedData: T[];
  sortConfig: SortConfig<T> | null;
  sortBy: (key: keyof T | string, direction?: SortDirection, customCompare?: (a: T, b: T) => number) => void;
  sortByCustom: (compareFn: (a: T, b: T) => number) => void;
  clearSort: () => void;
  toggleSort: (key: keyof T | string) => void;
  isSorted: boolean;
  sortDirection: SortDirection | null;
  sortKey: keyof T | string | null;
}

export interface MultiSortReturn<T> {
  sortedData: T[];
  sortConfigs: MultiSortConfig<T>['sorts'];
  addSort: (key: keyof T | string, direction: SortDirection, priority?: number) => void;
  removeSort: (key: keyof T | string) => void;
  clearSorts: () => void;
  updateSort: (key: keyof T | string, direction: SortDirection) => void;
}

// Utility function to get nested property value
const getNestedValue = <T>(obj: T, path: keyof T | string): unknown => {
  if (typeof path !== 'string') {
    return obj[path];
  }
  
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' && key in (current as Record<string, unknown>)
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj);
};

// Default comparison function
const defaultCompare = <T>(a: T, b: T, key: keyof T | string, direction: SortDirection): number => {
  const aVal = getNestedValue(a, key);
  const bVal = getNestedValue(b, key);
  
  // Handle null/undefined values
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return direction === 'asc' ? -1 : 1;
  if (bVal == null) return direction === 'asc' ? 1 : -1;
  
  // Handle different types
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    const result = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
    return direction === 'asc' ? result : -result;
  }
  
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    const result = aVal - bVal;
    return direction === 'asc' ? result : -result;
  }
  
  if (aVal instanceof Date && bVal instanceof Date) {
    const result = aVal.getTime() - bVal.getTime();
    return direction === 'asc' ? result : -result;
  }
  
  // Fallback to string comparison
  const aStr = String(aVal);
  const bStr = String(bVal);
  const result = aStr.localeCompare(bStr);
  return direction === 'asc' ? result : -result;
};

// Sorting algorithms
const quickSort = <T>(
  arr: T[],
  compareFn: (a: T, b: T) => number,
  left = 0,
  right = arr.length - 1
): T[] => {
  if (left < right) {
    const pivotIndex = partition(arr, compareFn, left, right);
    quickSort(arr, compareFn, left, pivotIndex - 1);
    quickSort(arr, compareFn, pivotIndex + 1, right);
  }
  return arr;
};

const partition = <T>(
  arr: T[],
  compareFn: (a: T, b: T) => number,
  left: number,
  right: number
): number => {
  const pivot = arr[right];
  let i = left - 1;
  
  for (let j = left; j < right; j++) {
    if (compareFn(arr[j], pivot) <= 0) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
};

const mergeSort = <T>(arr: T[], compareFn: (a: T, b: T) => number): T[] => {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);
  
  return merge(left, right, compareFn);
};

const merge = <T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] => {
  const result: T[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
};

const heapSort = <T>(arr: T[], compareFn: (a: T, b: T) => number): T[] => {
  const sorted = [...arr];
  const n = sorted.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(sorted, n, i, compareFn);
  }
  
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [sorted[0], sorted[i]] = [sorted[i], sorted[0]];
    heapify(sorted, i, 0, compareFn);
  }
  
  return sorted;
};

const heapify = <T>(
  arr: T[],
  n: number,
  i: number,
  compareFn: (a: T, b: T) => number
): void => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && compareFn(arr[left], arr[largest]) > 0) {
    largest = left;
  }
  
  if (right < n && compareFn(arr[right], arr[largest]) > 0) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest, compareFn);
  }
};

const applySortAlgorithm = <T>(
  data: T[],
  compareFn: (a: T, b: T) => number,
  algorithm: SortAlgorithm = 'native'
): T[] => {
  const dataCopy = [...data];
  
  switch (algorithm) {
    case 'quicksort':
      return quickSort(dataCopy, compareFn);
    case 'mergesort':
      return mergeSort(dataCopy, compareFn);
    case 'heapsort':
      return heapSort(dataCopy, compareFn);
    case 'native':
    default:
      return dataCopy.sort(compareFn);
  }
};

export const useSort = <T>(
  data: T[],
  initialConfig?: Partial<SortConfig<T>>
): SortReturn<T> => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(() => {
    if (initialConfig) {
      return {
        direction: 'asc',
        algorithm: 'native',
        ...initialConfig,
      } as SortConfig<T>;
    }
    return null;
  });

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    const { key, direction, algorithm, customCompare } = sortConfig;
    
    const compareFn = customCompare || ((a: T, b: T) => {
      if (key) {
        return defaultCompare(a, b, key, direction);
      }
      return 0;
    });
    
    return applySortAlgorithm(data, compareFn, algorithm);
  }, [data, sortConfig]);

  const sortBy = useCallback(
    (
      key: keyof T | string,
      direction: SortDirection = 'asc',
      customCompare?: (a: T, b: T) => number
    ) => {
      setSortConfig({
        key,
        direction,
        algorithm: 'native',
        customCompare,
      });
    },
    []
  );

  const sortByCustom = useCallback((compareFn: (a: T, b: T) => number) => {
    setSortConfig({
      direction: 'asc',
      algorithm: 'native',
      customCompare: compareFn,
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  const toggleSort = useCallback((key: keyof T | string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return {
          key,
          direction: 'asc',
          algorithm: 'native',
        };
      }
      
      if (prev.direction === 'asc') {
        return { ...prev, direction: 'desc' };
      }
      
      return null; // Clear sort on third click
    });
  }, []);

  return {
    sortedData,
    sortConfig,
    sortBy,
    sortByCustom,
    clearSort,
    toggleSort,
    isSorted: sortConfig !== null,
    sortDirection: sortConfig?.direction || null,
    sortKey: sortConfig?.key || null,
  };
};

// Multi-column sorting
export const useMultiSort = <T>(data: T[]): MultiSortReturn<T> => {
  const [sortConfigs, setSortConfigs] = useState<MultiSortConfig<T>['sorts']>([]);

  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) return data;
    
    const sortedConfigs = [...sortConfigs].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    return [...data].sort((a, b) => {
      for (const config of sortedConfigs) {
        const result = defaultCompare(a, b, config.key, config.direction);
        if (result !== 0) return result;
      }
      return 0;
    });
  }, [data, sortConfigs]);

  const addSort = useCallback(
    (key: keyof T | string, direction: SortDirection, priority = 0) => {
      setSortConfigs(prev => {
        const existing = prev.find(config => config.key === key);
        if (existing) {
          return prev.map(config =>
            config.key === key
              ? { ...config, direction, priority }
              : config
          );
        }
        return [...prev, { key, direction, priority }];
      });
    },
    []
  );

  const removeSort = useCallback((key: keyof T | string) => {
    setSortConfigs(prev => prev.filter(config => config.key !== key));
  }, []);

  const clearSorts = useCallback(() => {
    setSortConfigs([]);
  }, []);

  const updateSort = useCallback(
    (key: keyof T | string, direction: SortDirection) => {
      setSortConfigs(prev =>
        prev.map(config =>
          config.key === key ? { ...config, direction } : config
        )
      );
    },
    []
  );

  return {
    sortedData,
    sortConfigs,
    addSort,
    removeSort,
    clearSorts,
    updateSort,
  };
};

export default useSort;
