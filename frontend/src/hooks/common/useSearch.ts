import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchOptions<T> {
  keys?: (keyof T)[];
  threshold?: number;
  caseSensitive?: boolean;
  includeScore?: boolean;
  includeMatches?: boolean;
  findAllMatches?: boolean;
  minMatchCharLength?: number;
  location?: number;
  distance?: number;
  useExtendedSearch?: boolean;
  ignoreLocation?: boolean;
  ignoreFieldNorm?: boolean;
  debounceMs?: number;
  searchOnEmpty?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: SearchMatch[];
  refIndex: number;
}

export interface SearchMatch {
  indices: [number, number][];
  value: string;
  key?: string;
}

export interface SearchHookReturn<T> {
  query: string;
  results: SearchResult<T>[];
  filteredResults: T[];
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isSearching: boolean;
  hasQuery: boolean;
  resultCount: number;
  addFilter: (filter: SearchFilter<T>) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  sortBy: (sortFn: (a: T, b: T) => number) => void;
  resetSort: () => void;
}

export interface SearchFilter<T> {
  id: string;
  predicate: (item: T) => boolean;
  enabled?: boolean;
}

// Simple fuzzy search implementation
const fuzzySearch = <T>(
  items: T[],
  query: string,
  options: SearchOptions<T>
): SearchResult<T>[] => {
  if (!query && !options.searchOnEmpty) {
    return items.map((item, index) => ({ item, refIndex: index }));
  }

  const {
    keys = [],
    threshold = 0.6,
    caseSensitive = false,
    includeScore = false,
    minMatchCharLength = 1,
  } = options;

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const results: SearchResult<T>[] = [];

  if (searchQuery.length < minMatchCharLength) {
    return items.map((item, index) => ({ item, refIndex: index }));
  }

  items.forEach((item, index) => {
    let bestScore = 1; // 1 is worst score, 0 is best
    let hasMatch = false;

    // If no keys specified, convert item to string and search
    if (keys.length === 0) {
      const itemString = caseSensitive 
        ? String(item) 
        : String(item).toLowerCase();
      
      const score = calculateFuzzyScore(itemString, searchQuery);
      if (score <= threshold) {
        bestScore = score;
        hasMatch = true;
      }
    } else {
      // Search through specified keys
      for (const key of keys) {
        const value = item[key];
        if (value == null) continue;

        const valueString = caseSensitive 
          ? String(value) 
          : String(value).toLowerCase();

        const score = calculateFuzzyScore(valueString, searchQuery);
        if (score <= threshold) {
          bestScore = Math.min(bestScore, score);
          hasMatch = true;
        }
      }
    }

    if (hasMatch) {
      const result: SearchResult<T> = {
        item,
        refIndex: index,
      };

      if (includeScore) {
        result.score = bestScore;
      }

      results.push(result);
    }
  });

  // Sort by score if includeScore is true
  if (includeScore) {
    results.sort((a, b) => (a.score || 0) - (b.score || 0));
  }

  return results;
};

const calculateFuzzyScore = (text: string, pattern: string): number => {
  if (pattern === '') return 1;
  if (text === pattern) return 0;
  
  // Simple fuzzy matching algorithm
  let textIndex = 0;
  let patternIndex = 0;
  let matchCount = 0;
  
  while (textIndex < text.length && patternIndex < pattern.length) {
    if (text[textIndex] === pattern[patternIndex]) {
      matchCount++;
      patternIndex++;
    }
    textIndex++;
  }
  
  if (patternIndex !== pattern.length) {
    return 1; // Not all pattern characters were matched
  }
  
  // Calculate score based on match ratio and character distance
  const matchRatio = matchCount / pattern.length;
  const lengthRatio = pattern.length / text.length;
  
  return 1 - (matchRatio * lengthRatio);
};

export const useSearch = <T>(
  data: T[],
  options: SearchOptions<T> = {}
): SearchHookReturn<T> => {
  const { debounceMs = 300 } = options;
  
  const [query, setQueryState] = useState('');
  const [filters, setFilters] = useState<SearchFilter<T>[]>([]);
  const [sortFunction, setSortFunction] = useState<((a: T, b: T) => number) | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Perform search
  const searchResults = useMemo(() => {
    return fuzzySearch(data, debouncedQuery, options);
  }, [data, debouncedQuery, options]);

  // Apply filters
  const filteredResults = useMemo(() => {
    let results = searchResults.map(result => result.item);

    // Apply active filters
    const activeFilters = filters.filter(filter => filter.enabled !== false);
    for (const filter of activeFilters) {
      results = results.filter(filter.predicate);
    }

    // Apply sorting
    if (sortFunction) {
      results = [...results].sort(sortFunction);
    }

    return results;
  }, [searchResults, filters, sortFunction]);

  // Search state
  const isSearching = query !== debouncedQuery;
  const hasQuery = debouncedQuery.length > 0;
  const resultCount = filteredResults.length;

  // Query management
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  // Filter management
  const addFilter = useCallback((filter: SearchFilter<T>) => {
    setFilters(prev => {
      const existing = prev.find(f => f.id === filter.id);
      if (existing) {
        return prev.map(f => f.id === filter.id ? filter : f);
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Sort management
  const sortBy = useCallback((sortFn: (a: T, b: T) => number) => {
    setSortFunction(() => sortFn);
  }, []);

  const resetSort = useCallback(() => {
    setSortFunction(null);
  }, []);

  return {
    query,
    results: searchResults,
    filteredResults,
    setQuery,
    clearQuery,
    isSearching,
    hasQuery,
    resultCount,
    addFilter,
    removeFilter,
    clearFilters,
    sortBy,
    resetSort,
  };
};

// Specialized hooks for common use cases
export const useStringSearch = (
  strings: string[],
  options: Omit<SearchOptions<string>, 'keys'> = {}
) => {
  return useSearch(strings, options);
};

export const useObjectSearch = <T extends Record<string, unknown>>(
  objects: T[],
  searchKeys: (keyof T)[],
  options: Omit<SearchOptions<T>, 'keys'> = {}
) => {
  return useSearch(objects, { ...options, keys: searchKeys });
};

// Advanced search with custom scoring
export const useAdvancedSearch = <T>(
  data: T[],
  searchFunction: (items: T[], query: string) => SearchResult<T>[],
  options: Pick<SearchOptions<T>, 'debounceMs' | 'searchOnEmpty'> = {}
) => {
  const { debounceMs = 300 } = options;
  const [query, setQueryState] = useState('');
  
  const debouncedQuery = useDebounce(query, debounceMs);
  
  const results = useMemo(() => {
    return searchFunction(data, debouncedQuery);
  }, [data, debouncedQuery, searchFunction]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  return {
    query,
    results,
    filteredResults: results.map(r => r.item),
    setQuery,
    clearQuery,
    isSearching: query !== debouncedQuery,
    hasQuery: debouncedQuery.length > 0,
    resultCount: results.length,
  };
};

export default useSearch;
