'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order.types';

interface OrderSearchProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: Order[];
  recentSearches?: string[];
  onSuggestionClick?: (orderId: string) => void;
  onRecentSearchClick?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  maxRecentSearches?: number;
  className?: string;
}

export const OrderSearch: React.FC<OrderSearchProps> = ({
  onSearch,
  onClear,
  suggestions = [],
  recentSearches = [],
  onSuggestionClick,
  onRecentSearchClick,
  placeholder = 'Search orders by number, customer name, or email...',
  debounceMs = 300,
  showSuggestions = true,
  showRecentSearches = true,
  maxRecentSearches = 5,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [localRecentSearches, setLocalRecentSearches] = useState<string[]>(recentSearches);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('order-recent-searches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalRecentSearches(parsed.slice(0, maxRecentSearches));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, [maxRecentSearches]);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLocalRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, maxRecentSearches);
      localStorage.setItem('order-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, [maxRecentSearches]);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        onSearch(query.trim());
        saveRecentSearch(query.trim());
      }, debounceMs);
    } else {
      onSearch('');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, onSearch, saveRecentSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    onClear?.();
  }, [onClear]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((orderId: string) => {
    onSuggestionClick?.(orderId);
    setIsFocused(false);
  }, [onSuggestionClick]);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    onRecentSearchClick?.(searchQuery);
    setIsFocused(false);
  }, [onRecentSearchClick]);

  // Handle remove recent search
  const handleRemoveRecentSearch = useCallback((searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchQuery);
      localStorage.setItem('order-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recent searches
  const handleClearAllRecentSearches = useCallback(() => {
    setLocalRecentSearches([]);
    localStorage.removeItem('order-recent-searches');
  }, []);

  // Format order number
  const formatOrderNumber = (orderNumber: string) => {
    if (orderNumber.length <= 10) return orderNumber;
    return `${orderNumber.slice(0, 10)}...`;
  };

  // Format date helper
  const formatDate = (date: Date | string, format: 'short' | 'medium' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'short') {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Show dropdown
  const showDropdown = isFocused && (
    (showSuggestions && query.trim() && suggestions.length > 0) ||
    (showRecentSearches && !query.trim() && localRecentSearches.length > 0)
  );

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="max-h-96 overflow-y-auto shadow-lg">
              {/* Suggestions */}
              {showSuggestions && query.trim() && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                    Matching Orders
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleSuggestionClick(order.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              #{formatOrderNumber(order.orderNumber)}
                            </span>
                            <Badge
                              variant={
                                order.status === 'delivered' ? 'success' :
                                order.status === 'cancelled' ? 'destructive' :
                                order.status === 'processing' ? 'warning' :
                                'secondary'
                              }
                              size="sm"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatDate(order.createdAt, 'short')}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-gray-700">
                              {order.total.formatted}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {showRecentSearches && !query.trim() && localRecentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <ClockIcon className="h-4 w-4" />
                      Recent Searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllRecentSearches}
                      className="text-xs h-auto py-1"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {localRecentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <button
                          onClick={() => handleRecentSearchClick(search)}
                          className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                        >
                          {search}
                        </button>
                        <button
                          onClick={(e) => handleRemoveRecentSearch(search, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                          aria-label="Remove search"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {showSuggestions && query.trim() && suggestions.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-600">
                    No orders found matching &quot;{query}&quot;
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
