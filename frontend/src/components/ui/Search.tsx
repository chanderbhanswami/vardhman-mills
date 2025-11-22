'use client';

import React, { useState, useRef, useEffect, useCallback, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import NextImage from 'next/image';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,

} from '@heroicons/react/24/outline';

// Search variants
const searchVariants = cva(
  'relative flex items-center w-full',
  {
    variants: {
      variant: {
        default: 'border border-input bg-background',
        filled: 'border-0 bg-muted',
        ghost: 'border-0 bg-transparent hover:bg-muted/50',
        underline: 'border-0 border-b-2 border-input bg-transparent',
      },
      size: {
        sm: 'h-8 text-xs',
        default: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'md',
    },
  }
);

// Types
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  url?: string;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'results'>,
    VariantProps<typeof searchVariants> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  results?: SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
  showResults?: boolean;
  debounceMs?: number;
  maxResults?: number;
  placeholder?: string;
  clearable?: boolean;
  iconPosition?: 'left' | 'right';
  showIcon?: boolean;
  resultRenderer?: (result: SearchResult, index: number) => React.ReactNode;
  noResultsMessage?: string;
  loadingMessage?: string;
}

export interface SearchFiltersProps {
  filters: Array<{
    id: string;
    label: string;
    value: string;
    active?: boolean;
  }>;
  onFilterChange?: (filterId: string, active: boolean) => void;
  onClearFilters?: () => void;
}

export interface AdvancedSearchProps {
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: Array<{ label: string; value: string }>;
    placeholder?: string;
  }>;
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
  onSearch: (values: Record<string, string>) => void;
  className?: string;
}

// Context
interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

// const useSearchContext = () => {
//   const context = useContext(SearchContext);
//   if (!context) {
//     throw new Error('Search components must be used within SearchProvider');
//   }
//   return context;
// };

// Search Provider
export const SearchProvider: React.FC<{
  children: React.ReactNode;
  onSearch?: (query: string) => Promise<SearchResult[]>;
}> = ({ children, onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!onSearch || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const contextValue: SearchContextType = {
    query,
    setQuery,
    results,
    setResults,
    loading,
    setLoading,
    showResults,
    setShowResults,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Main Search component
export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({
    className,
    variant,
    size,
    rounded,
    onSearch,
    onClear,
    loading = false,
    results = [],
    onResultSelect,
    showResults: externalShowResults,
    debounceMs = 300,
    maxResults = 10,
    clearable = true,
    iconPosition = 'left',
    showIcon = true,
    resultRenderer,
    noResultsMessage = 'No results found',
    loadingMessage = 'Searching...',
    value: externalValue,
    onChange,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const [internalShowResults, setInternalShowResults] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const value = externalValue !== undefined ? externalValue : internalValue;
    const showResults = externalShowResults !== undefined ? externalShowResults : internalShowResults;

    // Handle input change with debouncing
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (externalValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);

      // Debounced search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    }, [externalValue, onChange, onSearch, debounceMs]);

    // Handle clear
    const handleClear = useCallback(() => {
      if (externalValue === undefined) {
        setInternalValue('');
      }
      setInternalShowResults(false);
      onClear?.();
      
      // Create synthetic event for onChange
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    }, [externalValue, onChange, onClear]);

    // Handle focus
    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (results.length > 0) {
        setInternalShowResults(true);
      }
      onFocus?.(e);
    }, [results.length, onFocus]);

    // Handle blur with delay to allow result selection
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        setInternalShowResults(false);
      }, 200);
      onBlur?.(e);
    }, [onBlur]);

    // Handle result selection
    const handleResultSelect = useCallback((result: SearchResult) => {
      if (externalValue === undefined) {
        setInternalValue(result.title);
      }
      setInternalShowResults(false);
      onResultSelect?.(result);
    }, [externalValue, onResultSelect]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setInternalShowResults(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayResults = results.slice(0, maxResults);

    return (
      <div ref={containerRef} className="relative w-full">
        <div className={cn(searchVariants({ variant, size, rounded }), className)}>
          {/* Left Icon */}
          {showIcon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'flex-1 bg-transparent outline-none',
              showIcon && iconPosition === 'left' && 'pl-10',
              showIcon && iconPosition === 'right' && 'pr-10',
              clearable && value && 'pr-8'
            )}
            {...props}
          />

          {/* Clear Button */}
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-sm"
              tabIndex={-1}
              aria-label="Clear search"
            >
              <XMarkIcon className="h-3 w-3 text-muted-foreground" />
            </button>
          )}

          {/* Right Icon */}
          {showIcon && iconPosition === 'right' && !clearable && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : (
                <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* Results Dropdown */}
        <AnimatePresence>
          {showResults && (displayResults.length > 0 || loading) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-96 overflow-y-auto"
            >
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                  <span className="text-sm text-muted-foreground">{loadingMessage}</span>
                </div>
              )}

              {!loading && displayResults.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {noResultsMessage}
                </div>
              )}

              {!loading && displayResults.map((result, index) => (
                <div key={result.id}>
                  {resultRenderer ? (
                    <div onClick={() => handleResultSelect(result)}>
                      {resultRenderer(result, index)}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-4 py-2 hover:bg-accent border-b border-border last:border-b-0 focus:outline-none focus:bg-accent"
                    >
                      <div className="flex items-center space-x-3">
                        {result.image && (
                          <NextImage
                            src={result.image}
                            alt={result.title}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{result.title}</div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {result.description}
                            </div>
                          )}
                          {result.category && (
                            <div className="text-xs text-primary mt-1">{result.category}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Search.displayName = 'Search';

// Search Filters
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const activeCount = filters.filter(f => f.active).length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <FunnelIcon className="h-4 w-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-xs">
            {activeCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange?.(filter.id, !filter.active)}
            className={cn(
              'px-2 py-1 rounded-full text-xs border transition-colors',
              filter.active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-input hover:bg-accent'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

// Advanced Search
export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  fields,
  values,
  onValuesChange,
  onSearch,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldChange = (fieldId: string, value: string) => {
    onValuesChange({ ...values, [fieldId]: value });
  };

  const handleSearch = () => {
    onSearch(values);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<string, string>);
    onValuesChange(clearedValues);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-md hover:bg-accent"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Advanced Search
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg p-4 min-w-96"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Search</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close advanced search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium">{field.label}</label>
                    
                    {field.type === 'select' && field.options ? (
                      <select
                        value={values[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        aria-label={field.label}
                      >
                        <option value="">Select...</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={values[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear all fields
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Global Search (with overlay)
interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  recentSearches?: string[];
  onRecentSearchSelect?: (query: string) => void;
  popularSearches?: string[];
  categories?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  onResultSelect,
  placeholder = 'Search anything...',
  recentSearches = [],
  onRecentSearchSelect,
  popularSearches = [],
  categories = [],
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 bg-transparent outline-none text-lg"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-sm"
              aria-label="Close search modal"
            >
              <XMarkIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mr-3" />
              <span className="text-muted-foreground">Searching...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">Search Results</div>
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    onResultSelect?.(result);
                    onClose();
                  }}
                  className="w-full text-left p-2 hover:bg-accent rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    {result.image && (
                      <NextImage
                        src={result.image}
                        alt={result.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Recent Searches</div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setQuery(search);
                          onRecentSearchSelect?.(search);
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent rounded-md text-sm"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Popular Searches</div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setQuery(search)}
                        className="px-2 py-1 text-sm bg-muted text-muted-foreground hover:bg-accent rounded-md"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Browse Categories</div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-md text-sm text-left"
                      >
                        {category.icon}
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Search (compact version)
interface QuickSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  onSearch,
  placeholder = 'Quick search...',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
      setIsExpanded(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery('');
  };

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.form
            initial={{ width: 40 }}
            animate={{ width: 240 }}
            exit={{ width: 40 }}
            onSubmit={handleSubmit}
            className="flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={handleCollapse}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-input rounded-md text-sm outline-none"
            />
          </motion.form>
        ) : (
          <button
            type="button"
            onClick={handleExpand}
            className="p-2 hover:bg-accent rounded-md"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
