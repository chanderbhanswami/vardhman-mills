'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, Clock, User, TrendingUp, History, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Types
export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  categories: string[];
  tags: string[];
  imageUrl?: string;
  score: number; // Search relevance score
  highlights?: {
    title?: string;
    excerpt?: string;
    content?: string;
  };
}

export interface SearchFilters {
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  sortBy: 'relevance' | 'date' | 'popularity' | 'readTime';
  contentType: 'all' | 'article' | 'tutorial' | 'news' | 'review';
  readTime: 'all' | 'quick' | 'medium' | 'long'; // <5min, 5-15min, >15min
}

export interface BlogSearchProps {
  placeholder?: string;
  variant?: 'default' | 'compact' | 'expanded' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showFilters?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
  maxResults?: number;
  className?: string;
  onSearch?: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  onResultClick?: (result: SearchResult) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  debounceMs?: number;
  enableAutocomplete?: boolean;
  enableHighlighting?: boolean;
  recentSearches?: string[];
  trendingQueries?: string[];
  searchSuggestions?: string[];
  categories?: Array<{ id: string; name: string; count: number }>;
  tags?: Array<{ id: string; name: string; count: number }>;
  authors?: Array<{ id: string; name: string; avatar?: string; postCount: number }>;
}

// Search suggestions data
const defaultSuggestions = [
  'React hooks tutorial',
  'JavaScript best practices',
  'CSS Grid layouts',
  'Node.js authentication',
  'TypeScript guide',
  'Performance optimization',
  'API design patterns',
  'Database migrations'
];

const defaultTrending = [
  'Next.js 14',
  'AI integration',
  'Tailwind CSS',
  'GraphQL vs REST',
  'Docker containers'
];

export const BlogSearch: React.FC<BlogSearchProps> = ({
  placeholder = 'Search articles...',
  variant = 'default',
  size = 'md',
  showFilters = true,
  showSuggestions = true,
  showHistory = true,
  showTrending = true,
  maxResults = 10,
  className,
  onSearch,
  onResultClick,
  onFilterChange,
  debounceMs = 300,
  enableHighlighting = true,
  recentSearches = [],
  trendingQueries = defaultTrending,
  searchSuggestions = defaultSuggestions,
  categories = [],
  tags = []
}) => {
  // State
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(recentSearches);
  
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    tags: [],
    authors: [],
    dateRange: 'all',
    sortBy: 'relevance',
    contentType: 'all',
    readTime: 'all'
  });

  // Debounced search
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !onSearch) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const searchResults = await onSearch(searchQuery, filters);
        setResults(searchResults.slice(0, maxResults));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch, filters, maxResults]
  );

  // Debounce hook
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch, debounceMs]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
    
    if (query.trim()) {
      debouncedSearch(query);
    }
  }, [filters, onFilterChange, query, debouncedSearch]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      setQuery(searchQuery);
      
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
    }
  }, [searchHistory]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, []);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  // Render search input
  const renderSearchInput = () => (
    <div className="relative">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            'pl-10 pr-20',
            sizeClasses[size],
            className
          )}
          onFocus={() => {
            if (query.trim()) {
              setShowResults(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(query);
            }
            if (e.key === 'Escape') {
              setShowResults(false);
            }
          }}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={cn(
                'h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800',
                showFiltersPanel && 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Search results dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* Results header */}
            {(query.trim() || results.length > 0) && (
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {isSearching ? 'Searching...' : 
                     results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 
                     query.trim() ? 'No results found' : 'Start typing to search'}
                  </span>
                  {results.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResults(false)}
                      className="h-6 px-2 text-xs"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="max-h-80 overflow-y-auto">
              {/* Search results */}
              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                      onClick={() => {
                        onResultClick?.(result);
                        setShowResults(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {result.imageUrl && (
                          <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden relative">
                            <Image 
                              src={result.imageUrl} 
                              alt={result.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {enableHighlighting && result.highlights?.title ? (
                              <span dangerouslySetInnerHTML={{ __html: result.highlights.title }} />
                            ) : (
                              result.title
                            )}
                          </h4>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {enableHighlighting && result.highlights?.excerpt ? (
                              <span dangerouslySetInnerHTML={{ __html: result.highlights.excerpt }} />
                            ) : (
                              result.excerpt
                            )}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {result.author.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {result.readTime}m read
                            </span>
                            {result.categories.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {result.categories[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Suggestions and history */}
              {!query.trim() && (showSuggestions || showHistory || showTrending) && (
                <div className="py-2">
                  {/* Recent searches */}
                  {showHistory && searchHistory.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        <History size={12} />
                        Recent Searches
                      </div>
                      <div className="space-y-1">
                        {searchHistory.slice(0, 5).map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Trending queries */}
                  {showTrending && trendingQueries.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        <TrendingUp size={12} />
                        Trending
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trendingQueries.slice(0, 8).map((trend, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
                            onClick={() => handleSearch(trend)}
                          >
                            {trend}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Search suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        <Search size={12} />
                        Popular Topics
                      </div>
                      <div className="space-y-1">
                        {searchSuggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(suggestion)}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render filters panel
  const renderFiltersPanel = () => (
    <AnimatePresence>
      {showFiltersPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort by"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
                <option value="readTime">Read Time</option>
              </select>
            </div>
            
            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as SearchFilters['dateRange'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Date range"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            
            {/* Content type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange({ contentType: e.target.value as SearchFilters['contentType'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Content type"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="tutorial">Tutorials</option>
                <option value="news">News</option>
                <option value="review">Reviews</option>
              </select>
            </div>
            
            {/* Read time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Read Time
              </label>
              <select
                value={filters.readTime}
                onChange={(e) => handleFilterChange({ readTime: e.target.value as SearchFilters['readTime'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Read time"
              >
                <option value="all">Any Length</option>
                <option value="quick">Quick (&lt; 5 min)</option>
                <option value="medium">Medium (5-15 min)</option>
                <option value="long">Long (&gt; 15 min)</option>
              </select>
            </div>
          </div>
          
          {/* Categories and tags */}
          {(categories.length > 0 || tags.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.categories.includes(category.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newCategories = checked
                                ? [...filters.categories, category.id]
                                : filters.categories.filter(c => c !== category.id);
                              handleFilterChange({ categories: newCategories });
                            }}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center justify-between flex-1"
                          >
                            {category.name}
                            <span className="text-xs text-gray-500">({category.count})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={filters.tags.includes(tag.id) ? "default" : "secondary"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const newTags = filters.tags.includes(tag.id)
                              ? filters.tags.filter(t => t !== tag.id)
                              : [...filters.tags, tag.id];
                            handleFilterChange({ tags: newTags });
                          }}
                        >
                          {tag.name} ({tag.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Clear filters */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const clearedFilters: SearchFilters = {
                  categories: [],
                  tags: [],
                  authors: [],
                  dateRange: 'all',
                  sortBy: 'relevance',
                  contentType: 'all',
                  readTime: 'all'
                };
                setFilters(clearedFilters);
                onFilterChange?.(clearedFilters);
              }}
              className="w-full md:w-auto"
            >
              Clear All Filters
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return (
        <div className={cn('relative', className)}>
          {renderSearchInput()}
        </div>
      );

    case 'expanded':
      return (
        <Card className={cn('w-full', className)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Search Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderSearchInput()}
            {renderFiltersPanel()}
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className={cn('relative space-y-4', className)}>
          {renderSearchInput()}
          {renderFiltersPanel()}
        </div>
      );
  }
};

// Utility components
export const QuickSearch: React.FC<{ onSearch: (query: string) => void; className?: string }> = ({ 
  onSearch, 
  className 
}) => (
  <BlogSearch
    variant="compact"
    size="sm"
    showFilters={false}
    showSuggestions={false}
    showHistory={false}
    onSearch={async (query) => {
      onSearch(query);
      return [];
    }}
    className={className}
  />
);

export const AdvancedSearch: React.FC<BlogSearchProps> = (props) => (
  <BlogSearch
    {...props}
    variant="expanded"
    showFilters={true}
    showSuggestions={true}
    showHistory={true}
    showTrending={true}
  />
);

export default BlogSearch;
