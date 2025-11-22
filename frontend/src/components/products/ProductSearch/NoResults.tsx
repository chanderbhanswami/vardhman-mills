'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, TrendingUp, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface NoResultsProps {
  query: string;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  suggestions?: string[];
  hasFilters?: boolean;
  className?: string;
}

export const NoResults: React.FC<NoResultsProps> = ({
  query,
  onClearSearch,
  onClearFilters,
  suggestions = [],
  hasFilters = false,
  className,
}) => {
  const defaultSuggestions = [
    'Check your spelling',
    'Try more general keywords',
    'Try different keywords',
    'Remove some filters',
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6"
      >
        <SearchX className="w-12 h-12 text-gray-400" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
      >
        No Results Found
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-2 max-w-md"
      >
        {query ? (
          <>
            We couldn&apos;t find any products matching{' '}
            <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
          </>
        ) : (
          'No products match your current filters'
        )}
      </motion.p>

      {hasFilters && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-gray-500 mb-8"
        >
          Try adjusting or clearing your filters to see more results
        </motion.p>
      )}

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Suggestions</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          {displaySuggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 block" aria-hidden="true" />
              {suggestion}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {onClearSearch && query && (
          <Button
            variant="outline"
            size="lg"
            onClick={onClearSearch}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Search
          </Button>
        )}

        {onClearFilters && hasFilters && (
          <Button
            variant="outline"
            size="lg"
            onClick={onClearFilters}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Filters
          </Button>
        )}

        {!query && !hasFilters && (
          <Button
            variant="default"
            size="lg"
            onClick={onClearSearch}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Browse Popular Products
          </Button>
        )}
      </motion.div>

      {/* Popular Searches */}
      {!query && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 w-full max-w-2xl"
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Popular Searches</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Cotton Fabric',
              'Silk Sarees',
              'Designer Suits',
              'Wedding Collection',
              'Party Wear',
              'Casual Wear',
            ].map((term) => (
              <button
                key={term}
                onClick={() => onClearSearch?.()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NoResults;