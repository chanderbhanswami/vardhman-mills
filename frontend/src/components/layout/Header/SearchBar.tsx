'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'search';
  count?: number;
  image?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for fabrics, yarns, and more...',
  className = '',
  onClose,
  autoFocus = false,
  showSuggestions = true,
  maxSuggestions = 8,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock suggestions data
  const trendingSearches = [
    'Premium Cotton',
    'Sustainable Fabrics',
    'Denim Collection',
    'Silk Scarves',
  ];

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate API call for suggestions
    if (query.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        // Mock suggestions data
        const mockSuggestions: SearchSuggestion[] = [
          { id: '1', text: 'Cotton Fabric', type: 'category', count: 156 },
          { id: '2', text: 'Polyester Yarn', type: 'product', count: 89 },
          { id: '3', text: 'Silk Blends', type: 'category', count: 34 },
          { id: '4', text: 'Home Textiles', type: 'category', count: 267 },
          { id: '5', text: 'Premium Fabrics', type: 'search', count: 45 },
          { id: '6', text: 'Vardhman Brand', type: 'brand', count: 123 },
        ];

        const filtered = mockSuggestions.filter(suggestion =>
          suggestion.text.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, maxSuggestions));
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query, maxSuggestions]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));

      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '🏷️';
      case 'category':
        return '📂';
      case 'brand':
        return '🏢';
      default:
        return '🔍';
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && showSuggestions && (
          <motion.div
            variants={suggestionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                />
                <p className="mt-2">Searching...</p>
              </div>
            ) : (
              <>
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Suggestions
                    </p>
                    {suggestions.map((suggestion) => (
                      <motion.button
                        key={suggestion.id}
                        variants={itemVariants}
                        onClick={() => handleSearch(suggestion.text)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {suggestion.text}
                          </p>
                          {suggestion.count && (
                            <p className="text-xs text-gray-500">
                              {suggestion.count} results
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {query === '' && recentSearches.length > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Recent
                    </p>
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        variants={itemVariants}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors group"
                      >
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1">
                          {search}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRecent = recentSearches.filter((_, i) => i !== index);
                            setRecentSearches(newRecent);
                            localStorage.setItem('recentSearches', JSON.stringify(newRecent));
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              const newRecent = recentSearches.filter((_, i) => i !== index);
                              setRecentSearches(newRecent);
                              localStorage.setItem('recentSearches', JSON.stringify(newRecent));
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                          aria-label="Remove from recent searches"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Trending Searches */}
                {query === '' && (
                  <div className="p-2 border-t border-gray-200">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                      <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                      Trending
                    </p>
                    {trendingSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        variants={itemVariants}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-700">
                          {search}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {query !== '' && suggestions.length === 0 && !isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    <p>No suggestions found for &ldquo;{query}&rdquo;</p>
                    <button
                      onClick={() => handleSearch(query)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Search anyway
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;