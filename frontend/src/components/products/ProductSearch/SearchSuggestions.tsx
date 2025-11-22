'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Tag,
  Package,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'keyword';
  id: string;
  label: string;
  description?: string;
  image?: string;
  metadata?: {
    price?: number;
    rating?: number;
    inStock?: boolean;
  };
}

export interface SearchSuggestionsProps {
  query: string;
  suggestions: SearchSuggestion[];
  isLoading?: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  onSearch?: (query: string) => void;
  className?: string;
  maxSuggestions?: number;
  groupByType?: boolean;
  showImages?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  suggestions,
  isLoading = false,
  onSelect,
  onSearch,
  className,
  maxSuggestions = 10,
  groupByType = true,
  showImages = true,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayedSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < displayedSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (displayedSuggestions[selectedIndex]) {
            onSelect(displayedSuggestions[selectedIndex]);
          } else if (query && onSearch) {
            onSearch(query);
          }
          break;
        case 'Escape':
          // Parent component should handle this
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedSuggestions, selectedIndex, onSelect, query, onSearch]);

  // Get icon for suggestion type
  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return Package;
      case 'category':
        return Tag;
      case 'brand':
        return TrendingUp;
      case 'keyword':
        return Search;
      default:
        return Search;
    }
  };

  // Group suggestions by type
  const groupedSuggestions = React.useMemo(() => {
    if (!groupByType) return { all: displayedSuggestions };

    return displayedSuggestions.reduce((acc, suggestion) => {
      const type = suggestion.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(suggestion);
      return acc;
    }, {} as Record<string, SearchSuggestion[]>);
  }, [displayedSuggestions, groupByType]);

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="font-semibold text-gray-900">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const typeLabels: Record<string, string> = {
    product: 'Products',
    category: 'Categories',
    brand: 'Brands',
    keyword: 'Suggested Searches',
  };

  if (!query.trim() && suggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50',
          className
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : displayedSuggestions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No suggestions found for &quot;{query}&quot;
          </div>
        ) : groupByType ? (
          <div className="py-2">
            {Object.entries(groupedSuggestions).map(([type, items], groupIndex) => {
              const Icon = getTypeIcon(type as SearchSuggestion['type']);
              
              return (
                <div key={type}>
                  {/* Group Header */}
                  <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{typeLabels[type] || type}</span>
                    <span className="text-gray-400">({items.length})</span>
                  </div>

                  {/* Group Items */}
                  {items.map((suggestion, index) => {
                    const globalIndex =
                      Object.entries(groupedSuggestions)
                        .slice(0, groupIndex)
                        .reduce((acc, [, items]) => acc + items.length, 0) + index;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <SuggestionItem
                        key={suggestion.id}
                        suggestion={suggestion}
                        isSelected={isSelected}
                        onClick={() => onSelect(suggestion)}
                        highlightMatch={highlightMatch}
                        showImage={showImages}
                      />
                    );
                  })}

                  {/* Divider */}
                  {groupIndex < Object.keys(groupedSuggestions).length - 1 && (
                    <div className="my-2 border-t border-gray-100" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-1">
            {displayedSuggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={index === selectedIndex}
                onClick={() => onSelect(suggestion)}
                highlightMatch={highlightMatch}
                showImage={showImages}
              />
            ))}
          </div>
        )}

        {/* Search All Footer */}
        {query && onSearch && (
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => onSearch(query)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Search for &quot;{query}&quot;
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Suggestion Item Component
interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isSelected: boolean;
  onClick: () => void;
  highlightMatch: (text: string) => React.ReactNode;
  showImage: boolean;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  isSelected,
  onClick,
  highlightMatch,
  showImage,
}) => {
  const Icon = getTypeIconForItem(suggestion.type);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
        isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
      )}
    >
      {/* Image or Icon */}
      {showImage && suggestion.image ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={suggestion.image}
            alt={suggestion.label}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-700">{highlightMatch(suggestion.label)}</div>
        {suggestion.description && (
          <div className="text-xs text-gray-500 truncate">{suggestion.description}</div>
        )}
      </div>

      {/* Metadata */}
      {suggestion.metadata && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {suggestion.metadata.price !== undefined && (
            <span className="font-medium">₹{suggestion.metadata.price.toLocaleString()}</span>
          )}
          {suggestion.metadata.rating !== undefined && (
            <span>⭐ {suggestion.metadata.rating.toFixed(1)}</span>
          )}
          {suggestion.metadata.inStock === false && (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>
      )}
    </button>
  );
};

// Helper function
function getTypeIconForItem(type: SearchSuggestion['type']) {
  switch (type) {
    case 'product':
      return Package;
    case 'category':
      return Tag;
    case 'brand':
      return TrendingUp;
    case 'keyword':
      return Search;
    default:
      return Search;
  }
}

export default SearchSuggestions;