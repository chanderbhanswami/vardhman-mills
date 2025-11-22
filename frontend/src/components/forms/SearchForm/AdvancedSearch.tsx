'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ClockIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  BoltIcon,
  EyeIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Advanced search types and interfaces
export type SearchScope = 'all' | 'title' | 'content' | 'tags' | 'author' | 'metadata';

export type SearchOperator = 'AND' | 'OR' | 'NOT';

export type SearchSortBy = 
  | 'relevance' 
  | 'date' 
  | 'alphabetical' 
  | 'popularity' 
  | 'score' 
  | 'views'
  | 'modified'
  | 'created';

export type SearchResultType = 'all' | 'documents' | 'images' | 'videos' | 'audio' | 'archives';

export type SearchFilter = {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
  options?: { label: string; value: string | number; count?: number }[];
  value?: unknown;
  operator?: SearchOperator;
};

export type SearchQuery = {
  query: string;
  scope: SearchScope;
  filters: SearchFilter[];
  sortBy: SearchSortBy;
  sortOrder: 'asc' | 'desc';
  resultType: SearchResultType;
  operator: SearchOperator;
  fuzzy?: boolean;
  exactPhrase?: boolean;
  caseSensitive?: boolean;
  includeArchived?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
};

export type SearchSuggestion = {
  text: string;
  type: 'query' | 'filter' | 'scope' | 'recent';
  icon?: React.ReactNode;
  count?: number;
  description?: string;
};

export type SearchHistory = {
  id: string;
  query: string;
  timestamp: Date;
  resultCount?: number;
  filters?: SearchFilter[];
};

export type SavedSearch = {
  id: string;
  name: string;
  description?: string;
  query: SearchQuery;
  isPublic?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export interface AdvancedSearchProps {
  onSearch?: (query: SearchQuery) => void;
  onSuggestionSearch?: (suggestion: SearchSuggestion) => void;
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onLoadSearch?: (search: SavedSearch) => void;
  suggestions?: SearchSuggestion[];
  history?: SearchHistory[];
  savedSearches?: SavedSearch[];
  availableFilters?: SearchFilter[];
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  showSavedSearches?: boolean;
  showAdvancedOptions?: boolean;
  showResultTypes?: boolean;
  showSortOptions?: boolean;
  showShareSearch?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
  maxHistory?: number;
  theme?: 'default' | 'compact' | 'full';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// Search scopes
const searchScopes: { value: SearchScope; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'all', label: 'All fields', icon: <GlobeAltIcon className="w-4 h-4" />, description: 'Search in all available fields' },
  { value: 'title', label: 'Title only', icon: <DocumentTextIcon className="w-4 h-4" />, description: 'Search only in titles' },
  { value: 'content', label: 'Content', icon: <DocumentTextIcon className="w-4 h-4" />, description: 'Search in content body' },
  { value: 'tags', label: 'Tags', icon: <TagIcon className="w-4 h-4" />, description: 'Search in tags and categories' },
  { value: 'author', label: 'Author', icon: <UserIcon className="w-4 h-4" />, description: 'Search by author name' },
  { value: 'metadata', label: 'Metadata', icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />, description: 'Search in metadata fields' }
];

const sortOptions: { value: SearchSortBy; label: string; description: string }[] = [
  { value: 'relevance', label: 'Relevance', description: 'Sort by search relevance score' },
  { value: 'date', label: 'Date', description: 'Sort by publication date' },
  { value: 'alphabetical', label: 'Alphabetical', description: 'Sort alphabetically by title' },
  { value: 'popularity', label: 'Popularity', description: 'Sort by popularity metrics' },
  { value: 'views', label: 'Views', description: 'Sort by view count' },
  { value: 'modified', label: 'Last Modified', description: 'Sort by last modification date' },
  { value: 'created', label: 'Created', description: 'Sort by creation date' }
];

const resultTypes: { value: SearchResultType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All types', icon: <GlobeAltIcon className="w-4 h-4" /> },
  { value: 'documents', label: 'Documents', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { value: 'images', label: 'Images', icon: <EyeIcon className="w-4 h-4" /> },
  { value: 'videos', label: 'Videos', icon: <EyeIcon className="w-4 h-4" /> },
  { value: 'audio', label: 'Audio', icon: <EyeIcon className="w-4 h-4" /> },
  { value: 'archives', label: 'Archives', icon: <DocumentTextIcon className="w-4 h-4" /> }
];

// Main AdvancedSearch component
const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSuggestionSearch,
  onSaveSearch,
  onLoadSearch,
  suggestions = [],
  history = [],
  savedSearches = [],
  placeholder = 'Search...',
  className,
  showFilters = true,
  showHistory = true,
  showSuggestions = true,
  showSavedSearches = true,
  showAdvancedOptions = true,
  showResultTypes = true,
  showSortOptions = true,
  showShareSearch = false,
  autoFocus = false,
  debounceMs = 300,
  maxSuggestions = 5,
  maxHistory = 10,
  theme = 'default',
  size = 'md',
  children
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'history' | 'saved'>('suggestions');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  // Search configuration state
  const [searchConfig, setSearchConfig] = useState<SearchQuery>({
    query: '',
    scope: 'all',
    filters: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
    resultType: 'all',
    operator: 'AND',
    fuzzy: false,
    exactPhrase: false,
    caseSensitive: false,
    includeArchived: false
  });

  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Update search config when query changes
  useEffect(() => {
    setSearchConfig(prev => ({ ...prev, query }));
  }, [query]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: SearchQuery) => {
      onSearch?.(searchQuery);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle search
  const handleSearch = useCallback((searchQuery?: SearchQuery) => {
    const finalQuery = searchQuery || searchConfig;
    if (finalQuery.query.trim()) {
      debouncedSearch(finalQuery);
    }
  }, [searchConfig, debouncedSearch]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setShowDropdown(value.length > 0 && (showSuggestions || showHistory || showSavedSearches));
  }, [showSuggestions, showHistory, showSavedSearches]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowDropdown(false);
    onSuggestionSearch?.(suggestion);
    
    const newSearchConfig = { ...searchConfig, query: suggestion.text };
    handleSearch(newSearchConfig);
  }, [searchConfig, handleSearch, onSuggestionSearch]);

  // Handle saved search load
  const handleLoadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery(savedSearch.query.query);
    setSearchConfig(savedSearch.query);
    setShowDropdown(false);
    onLoadSearch?.(savedSearch);
    handleSearch(savedSearch.query);
  }, [handleSearch, onLoadSearch]);

  // Handle save search
  const handleSaveSearch = useCallback(() => {
    if (!searchName.trim()) return;

    const savedSearch: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'> = {
      name: searchName,
      description: searchDescription || undefined,
      query: searchConfig,
      tags: []
    };

    onSaveSearch?.(savedSearch);
    setShowSaveDialog(false);
    setSearchName('');
    setSearchDescription('');
  }, [searchName, searchDescription, searchConfig, onSaveSearch]);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!query) return suggestions.slice(0, maxSuggestions);
    return suggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, maxSuggestions);
  }, [suggestions, query, maxSuggestions]);

  // Filter history based on query
  const filteredHistory = useMemo(() => {
    if (!query) return history.slice(0, maxHistory);
    return history
      .filter(item => 
        item.query.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, maxHistory);
  }, [history, query, maxHistory]);

  // Filter saved searches based on query
  const filteredSavedSearches = useMemo(() => {
    if (!query) return savedSearches;
    return savedSearches.filter(saved => 
      saved.name.toLowerCase().includes(query.toLowerCase()) ||
      saved.query.query.toLowerCase().includes(query.toLowerCase())
    );
  }, [savedSearches, query]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-2',
    md: 'text-base py-3',
    lg: 'text-lg py-4'
  };

  // Theme classes
  const themeClasses = {
    default: 'shadow-sm',
    compact: 'shadow-none border-0',
    full: 'shadow-lg'
  };

  return (
    <div className={clsx('advanced-search relative', className)}>
      {/* Main search input */}
      <div className={clsx(
        'relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-all',
        themeClasses[theme],
        {
          'ring-2 ring-blue-500 border-blue-500': isExpanded,
          'hover:border-gray-400 dark:hover:border-gray-500': !isExpanded
        }
      )}>
        <div className="flex items-center">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                setIsExpanded(true);
                setShowDropdown(query.length > 0 && (showSuggestions || showHistory || showSavedSearches));
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsExpanded(false);
                  setShowDropdown(false);
                }, 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  setShowDropdown(false);
                } else if (e.key === 'Escape') {
                  setShowDropdown(false);
                  searchInputRef.current?.blur();
                }
              }}
              placeholder={placeholder}
              className={clsx(
                'w-full px-4 pr-12 border-0 bg-transparent focus:ring-0 focus:outline-none',
                sizeClasses[size]
              )}
            />
            
            {/* Search icon */}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced options toggle */}
          {showAdvancedOptions && (
            <div className="flex items-center space-x-2 px-3 border-l border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  {
                    'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400': showAdvanced,
                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300': !showAdvanced
                  }
                )}
                title="Advanced search options"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </button>

              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                  title="Search filters"
                >
                  <FunnelIcon className="w-4 h-4" />
                </button>
              )}

              {showSavedSearches && (
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                  title="Save search"
                >
                  <BookmarkIcon className="w-4 h-4" />
                </button>
              )}

              {showShareSearch && (
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                  title="Share search"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dropdown with suggestions, history, and saved searches */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('suggestions')}
                    className={clsx(
                      'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      {
                        'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'suggestions',
                        'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'suggestions'
                      }
                    )}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SparklesIcon className="w-4 h-4" />
                      <span>Suggestions</span>
                    </div>
                  </button>
                )}

                {showHistory && filteredHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                      'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      {
                        'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'history',
                        'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'history'
                      }
                    )}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>History</span>
                    </div>
                  </button>
                )}

                {showSavedSearches && filteredSavedSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('saved')}
                    className={clsx(
                      'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                      {
                        'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'saved',
                        'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300': activeTab !== 'saved'
                      }
                    )}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <BookmarkIcon className="w-4 h-4" />
                      <span>Saved</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Tab content */}
              <div className="max-h-80 overflow-y-auto">
                {/* Suggestions */}
                {activeTab === 'suggestions' && (
                  <div className="py-2">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {suggestion.icon || <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {suggestion.text}
                            </div>
                            {suggestion.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {suggestion.count !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.count} results
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                  <div className="py-2">
                    {filteredHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleInputChange(item.query)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.query}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {item.resultCount !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.resultCount} results
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Saved searches */}
                {activeTab === 'saved' && (
                  <div className="py-2">
                    {filteredSavedSearches.map((saved) => (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => handleLoadSavedSearch(saved)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <BookmarkIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {saved.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {saved.description || saved.query.query}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced search options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search in
                </label>
                <select
                  value={searchConfig.scope}
                  onChange={(e) => setSearchConfig(prev => ({ ...prev, scope: e.target.value as SearchScope }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search scope"
                >
                  {searchScopes.map((scope) => (
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Result type */}
              {showResultTypes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Result type
                  </label>
                  <select
                    value={searchConfig.resultType}
                    onChange={(e) => setSearchConfig(prev => ({ ...prev, resultType: e.target.value as SearchResultType }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Result type"
                  >
                    {resultTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort options */}
              {showSortOptions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort by
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={searchConfig.sortBy}
                      onChange={(e) => setSearchConfig(prev => ({ ...prev, sortBy: e.target.value as SearchSortBy }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Sort by"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSearchConfig(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                      }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title={`Sort ${searchConfig.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                    >
                      {searchConfig.sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Search options */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search options
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchConfig.fuzzy}
                      onChange={(e) => setSearchConfig(prev => ({ ...prev, fuzzy: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Fuzzy search</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchConfig.exactPhrase}
                      onChange={(e) => setSearchConfig(prev => ({ ...prev, exactPhrase: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Exact phrase</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchConfig.caseSensitive}
                      onChange={(e) => setSearchConfig(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchConfig.includeArchived}
                      onChange={(e) => setSearchConfig(prev => ({ ...prev, includeArchived: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include archived</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleSearch()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <BoltIcon className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save search dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Save Search
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Name *
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Enter search name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Query:</strong> {searchConfig.query || 'No query entered'}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Save Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};

export default AdvancedSearch;