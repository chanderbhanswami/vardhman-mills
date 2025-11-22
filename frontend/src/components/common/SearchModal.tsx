/**
 * SearchModal Component
 * 
 * Global search modal with filtering and recent searches
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  recentSearches?: string[];
  onClearRecent?: () => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent';
  url?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  recentSearches = [],
  onClearRecent,
  placeholder = 'Search products, categories, brands...',
  className,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    onSearch?.(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  }, [onSearch, router, onClose]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      handleSearch(suggestion.text);
    }
  }, [router, handleSearch]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && query.trim()) {
        handleSearch(query);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, onClose, handleSearch]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Mock suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mock suggestions
      const mockSuggestions: SearchSuggestion[] = [
        { id: '1', text: `${query} products`, type: 'product', url: `/search?q=${query}` },
        { id: '2', text: `${query} in Electronics`, type: 'category', url: `/category/electronics?q=${query}` },
        { id: '3', text: `${query} brands`, type: 'brand', url: `/brands?q=${query}` },
      ];
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            className
          )}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto mt-20 max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  autoComplete="off"
                  data-input-type={Input.displayName || 'input'}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="Clear search"
                    aria-label="Clear search query"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {/* Suggestions */}
                {query && suggestions.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Suggestions
                    </p>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
                      >
                        <SparklesIcon className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-gray-900 dark:text-gray-100">
                          {suggestion.text}
                        </span>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Recent Searches
                      </p>
                      {onClearRecent && (
                        <button
                          onClick={onClearRecent}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
                      >
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-gray-900 dark:text-gray-100">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!query && recentSearches.length === 0 && (
                  <div className="p-8 text-center">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Start typing to search
                    </p>
                  </div>
                )}

                {/* No Results */}
                {query && !isLoading && suggestions.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No suggestions found for &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-1">
                    <span>Press Enter to search</span>
                    <span>•</span>
                    <span>ESC to close</span>
                  </div>
                  {query && (
                    <Button
                      onClick={() => handleSearch(query)}
                      size="sm"
                      variant="default"
                      className="hidden sm:flex"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                      Search
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;