'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'product_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount?: number;
}

export interface SearchHistoryProps {
  onSelect: (query: string) => void;
  currentQuery?: string;
  className?: string;
  maxItems?: number;
  showTimestamp?: boolean;
  showResultCount?: boolean;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelect,
  currentQuery = '',
  className,
  maxItems = MAX_HISTORY_ITEMS,
  showTimestamp = false,
  showResultCount = false,
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SearchHistoryItem[];
          setHistory(parsed.slice(0, maxItems));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, [maxItems]);

  // Save search query to history
  const addToHistory = React.useCallback((query: string, resultCount?: number) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      resultCount,
    };

    setHistory((prev) => {
      // Remove duplicates and add new item at the start
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, maxItems);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save search history:', error);
        }
      }

      return updated;
    });
  }, [maxItems]);

  // Remove specific item from history
  const removeItem = (query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.query !== query);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to update search history:', error);
        }
      }

      return updated;
    });
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear search history:', error);
      }
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Expose addToHistory for parent components
  useEffect(() => {
    (window as unknown as { addToSearchHistory?: typeof addToHistory }).addToSearchHistory = addToHistory;
    return () => {
      delete (window as unknown as { addToSearchHistory?: typeof addToHistory }).addToSearchHistory;
    };
  }, [addToHistory]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Clock className="w-4 h-4" />
          <span>Recent Searches</span>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* History List */}
      <AnimatePresence mode="popLayout">
        <div className="py-1">
          {history.map((item, index) => (
            <motion.div
              key={`${item.query}-${item.timestamp}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                'group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors',
                currentQuery.toLowerCase() === item.query.toLowerCase() && 'bg-gray-50'
              )}
            >
              {/* Icon */}
              <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />

              {/* Query */}
              <button
                onClick={() => onSelect(item.query)}
                className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 truncate"
              >
                {item.query}
              </button>

              {/* Metadata */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {showResultCount && item.resultCount !== undefined && (
                  <span className="text-xs text-gray-500">
                    {item.resultCount} {item.resultCount === 1 ? 'result' : 'results'}
                  </span>
                )}

                {showTimestamp && (
                  <span className="text-xs text-gray-400">{formatTimestamp(item.timestamp)}</span>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.query);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${item.query} from history`}
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

// Helper function to add search to history (can be called from other components)
export const addSearchToHistory = (query: string, resultCount?: number) => {
  if (typeof window !== 'undefined') {
    const addFunc = (window as unknown as { addToSearchHistory?: (q: string, rc?: number) => void }).addToSearchHistory;
    if (addFunc) {
      addFunc(query, resultCount);
    } else {
      // Fallback: directly save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const history = stored ? JSON.parse(stored) : [];
        const newItem: SearchHistoryItem = {
          query: query.trim(),
          timestamp: Date.now(),
          resultCount,
        };
        const filtered = history.filter(
          (item: SearchHistoryItem) => item.query.toLowerCase() !== query.toLowerCase()
        );
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to add search to history:', error);
      }
    }
  }
};

export default SearchHistory;