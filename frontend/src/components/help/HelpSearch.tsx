'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  BookmarkIcon,
  StarIcon,
  EyeIcon,
  ArrowRightIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface SearchResult {
  id: string;
  type: 'article' | 'faq' | 'guide' | 'video' | 'category';
  title: string;
  excerpt: string;
  content?: string;
  url: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  relevanceScore: number;
  matchType: 'title' | 'content' | 'tag' | 'category' | 'exact';
  highlights: string[];
  stats: {
    views: number;
    rating: number;
    bookmarks: number;
  };
  lastUpdated: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion' | 'autocomplete';
  category?: string;
  count?: number;
}

export interface SearchFilter {
  types: string[];
  categories: string[];
  difficulty: string[];
  dateRange: {
    from?: string;
    to?: string;
  };
  rating: {
    min?: number;
  };
}

export interface HelpSearchProps {
  onSearch?: (query: string, filters?: SearchFilter) => void;
  onResultClick?: (result: SearchResult) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  showRecentSearches?: boolean;
  showPopularQueries?: boolean;
  showSuggestions?: boolean;
  showFilters?: boolean;
  showQuickActions?: boolean;
  enableVoiceSearch?: boolean;
  enableAutoComplete?: boolean;
  maxResults?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'prominent' | 'minimal';
  initialQuery?: string;
  results?: SearchResult[];
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  error?: string;
  noResultsMessage?: string;
  enableAnimations?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  hover: {
    x: 4,
    transition: { duration: 0.15 }
  }
};

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.2,
      ease: [0.04, 0.62, 0.23, 0.98] as const
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
} as const;

// Default data
const defaultSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'How to place an order', type: 'popular', category: 'Orders', count: 245 },
  { id: '2', text: 'Shipping information', type: 'popular', category: 'Shipping', count: 189 },
  { id: '3', text: 'Return policy', type: 'popular', category: 'Returns', count: 156 },
  { id: '4', text: 'Payment methods', type: 'popular', category: 'Billing', count: 134 },
  { id: '5', text: 'Account settings', type: 'recent', category: 'Account' },
  { id: '6', text: 'Size guide', type: 'recent', category: 'Products' },
  { id: '7', text: 'Contact support', type: 'suggestion', category: 'Support' },
  { id: '8', text: 'Track my order', type: 'suggestion', category: 'Orders' }
];

// Quick actions for help
const quickActions = [
  { icon: QuestionMarkCircleIcon, label: 'FAQ', action: 'faq' },
  { icon: ChatBubbleLeftRightIcon, label: 'Live Chat', action: 'chat' },
  { icon: DocumentTextIcon, label: 'Guides', action: 'guides' },
  { icon: InformationCircleIcon, label: 'Contact', action: 'contact' }
];

// Utility functions
const highlightText = (text: string, highlights: string[]) => {
  if (!highlights.length) return text;
  
  let highlightedText = text;
  highlights.forEach(highlight => {
    const regex = new RegExp(`(${highlight})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
  });
  
  return highlightedText;
};

const getResultIcon = (type: string) => {
  const icons = {
    article: DocumentTextIcon,
    faq: QuestionMarkCircleIcon,
    guide: BookmarkIcon,
    video: SparklesIcon,
    category: FunnelIcon
  };
  return icons[type as keyof typeof icons] || DocumentTextIcon;
};

const getMatchTypeLabel = (matchType: string) => {
  const labels = {
    title: 'Title match',
    content: 'Content match',
    tag: 'Tag match',
    category: 'Category match',
    exact: 'Exact match'
  };
  return labels[matchType as keyof typeof labels] || 'Match';
};

// Main Component
const HelpSearch: React.FC<HelpSearchProps> = ({
  onSearch,
  onResultClick,
  onSuggestionClick,
  placeholder = "Search for help articles, guides, and FAQs...",
  showRecentSearches = true,
  showPopularQueries = true,
  showSuggestions = true,
  showFilters = false,
  showQuickActions = true,
  enableVoiceSearch = false,
  enableAutoComplete = true,
  maxResults = 10,
  className,
  size = 'md',
  variant = 'default',
  initialQuery = '',
  results = [],
  suggestions = defaultSuggestions,
  isLoading = false,
  error,
  noResultsMessage = "No results found. Try different keywords or check your spelling.",
  enableAnimations = true
}) => {
  // Track voice search capability
  const hasVoiceSupport = enableVoiceSearch && 'webkitSpeechRecognition' in window;
  
  // Console log for debugging (can be removed in production)
  if (hasVoiceSupport) {
    console.log('Voice search is available');
  }
  
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    types: [],
    categories: [],
    difficulty: [],
    dateRange: {},
    rating: {}
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'How to place order',
    'Shipping policy',
    'Return process'
  ]);

  // Show popular queries feature
  const showPopularQueriesSection = showPopularQueries && suggestions.filter(s => s.type === 'popular').length > 0;

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery, filters);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)];
        return updated.slice(0, 5);
      });
      
      setIsOpen(false);
    }
  }, [onSearch, filters]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (enableAutoComplete && value.trim()) {
      setIsOpen(true);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    onSuggestionClick?.(suggestion);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
  };

  // Handle quick action
  const handleQuickAction = (action: string) => {
    const actions: Record<string, string> = {
      faq: 'frequently asked questions',
      chat: 'contact support',
      guides: 'help guides',
      contact: 'contact information'
    };
    
    if (actions[action]) {
      setQuery(actions[action]);
      handleSearch(actions[action]);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return suggestions;
    
    return suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
  }, [suggestions, query]);

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    prominent: 'border-2 border-blue-500 focus:border-blue-600 focus:ring-blue-600 shadow-lg',
    minimal: 'border-transparent bg-gray-100 focus:bg-white focus:border-gray-300'
  };

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MagnifyingGlassIconSolid className="h-5 w-5 text-gray-400" />
            </motion.div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-20',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 h-6 w-6"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="p-1 h-6 w-6"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            type="button"
            onClick={() => handleSearch(query)}
            size="sm"
            className="h-8"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={enableAnimations ? dropdownVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            <div className="overflow-y-auto max-h-96">
              {/* Quick Actions */}
              {showQuickActions && !query && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.action}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAction(action.action)}
                          className="justify-start h-auto p-3"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {results.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 px-2 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    Results ({results.length})
                  </h3>
                  <motion.div
                    variants={enableAnimations ? containerVariants : undefined}
                    initial="hidden"
                    animate="visible"
                  >
                    {results.slice(0, maxResults).map((result) => {
                      const Icon = getResultIcon(result.type);
                      return (
                        <motion.div
                          key={result.id}
                          variants={enableAnimations ? itemVariants : undefined}
                          whileHover={enableAnimations ? "hover" : undefined}
                          onClick={() => handleResultClick(result)}
                          className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 
                                  className="text-sm font-medium text-gray-900 line-clamp-1"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightText(result.title, result.highlights) 
                                  }}
                                />
                                <div className="flex items-center gap-1 ml-2">
                                  <StarIcon className="h-3 w-3 text-yellow-400" />
                                  <span className="text-xs text-gray-500">
                                    {result.stats.rating.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              <p 
                                className="text-xs text-gray-600 line-clamp-2 mb-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightText(result.excerpt, result.highlights) 
                                }}
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs"
                                  >
                                    {result.category.name}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {getMatchTypeLabel(result.matchType)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {result.estimatedTime && (
                                    <span>{result.estimatedTime} min</span>
                                  )}
                                  <EyeIcon className="h-3 w-3" />
                                  <span>{result.stats.views}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}

              {/* No Results */}
              {query && results.length === 0 && !isLoading && (
                <div className="p-6 text-center">
                  <DocumentTextIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">{noResultsMessage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery('')}
                  >
                    Clear search
                  </Button>
                </div>
              )}

              {/* Popular Queries Section */}
              {showPopularQueriesSection && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.filter(s => s.type === 'popular').slice(0, 4).map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && (!query || filteredSuggestions.length > 0) && (
                <div className="border-t border-gray-100">
                  {/* Recent Searches */}
                  {showRecentSearches && !query && recentSearches.length > 0 && (
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        Recent Searches
                      </h3>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular/Filtered Suggestions */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4" />
                      {query ? 'Suggestions' : 'Popular Searches'}
                    </h3>
                    <div className="space-y-1">
                      {(query ? filteredSuggestions : suggestions).slice(0, 5).map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center justify-between px-2 py-1 text-sm hover:bg-gray-50 rounded transition-colors group"
                        >
                          <span className="text-gray-700 group-hover:text-gray-900">
                            {suggestion.text}
                          </span>
                          <div className="flex items-center gap-2">
                            {suggestion.count && (
                              <span className="text-xs text-gray-500">
                                {suggestion.count}
                              </span>
                            )}
                            <ArrowRightIcon className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Search Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFiltersPanel(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Content Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="space-y-2">
                    {['article', 'faq', 'guide', 'video'].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.types, type]
                              : filters.types.filter(t => t !== type);
                            setFilters({ ...filters, types: newTypes });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced'].map((diff) => (
                      <label key={diff} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.difficulty.includes(diff)}
                          onChange={(e) => {
                            const newDifficulty = e.target.checked
                              ? [...filters.difficulty, diff]
                              : filters.difficulty.filter(d => d !== diff);
                            setFilters({ ...filters, difficulty: newDifficulty });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{diff}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4, 4.5, 5].map((rating) => (
                      <label key={rating} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating.min === rating}
                          onChange={() => {
                            setFilters({ ...filters, rating: { min: rating } });
                          }}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{rating}+ stars</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    types: [],
                    categories: [],
                    difficulty: [],
                    dateRange: {},
                    rating: {}
                  })}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleSearch(query);
                    setShowFiltersPanel(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpSearch;
