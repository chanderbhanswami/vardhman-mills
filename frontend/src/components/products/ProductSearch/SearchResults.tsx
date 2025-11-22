'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Product } from '@/types/product.types';
import { ProductGrid, GridLayout } from '../ProductGrid';
import { NoResults } from './NoResults';
import { cn } from '@/lib/utils';

export interface SearchResultsProps {
  products: Product[];
  query: string;
  isLoading?: boolean;
  layout?: GridLayout;
  onLayoutChange?: (layout: GridLayout) => void;
  highlightQuery?: boolean;
  hasFilters?: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  className?: string;
  emptyStateProps?: Partial<React.ComponentProps<typeof NoResults>>;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  query,
  isLoading = false,
  layout = 'grid',
  onLayoutChange,
  highlightQuery = true,
  hasFilters = false,
  onClearSearch,
  onClearFilters,
  className,
  emptyStateProps,
}) => {
  // Filter products based on query if provided
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.shortDescription,
        product.brand?.name,
        product.category?.name,
        product.sku,
        ...(product.tags || []),
        ...(product.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchTerms.some((term) => searchableText.includes(term));
    });
  }, [products, query]);

  // Highlight matching text
  const highlightText = (text: string): React.ReactNode => {
    if (!highlightQuery || !query.trim()) return text;

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    let result: React.ReactNode[] = [text];

    searchTerms.forEach((term) => {
      result = result.flatMap((part) => {
        if (typeof part !== 'string') return part;

        const regex = new RegExp(`(${term})`, 'gi');
        const parts = part.split(regex);

        return parts.map((p, i) =>
          regex.test(p) ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
              {p}
            </mark>
          ) : (
            p
          )
        );
      });
    });

    return result;
  };

  // Show empty state if no results
  if (!isLoading && filteredProducts.length === 0) {
    return (
      <NoResults
        query={query}
        onClearSearch={onClearSearch}
        onClearFilters={onClearFilters}
        hasFilters={hasFilters}
        className={className}
        {...emptyStateProps}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results
                {!isLoading && (
                  <span className="ml-2 text-gray-500 font-normal">
                    ({filteredProducts.length})
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600">
                Showing results for{' '}
                <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
              </p>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filters applied</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        layout={layout}
        onLayoutChange={onLayoutChange}
        isLoading={isLoading}
        showLayoutSwitcher
        columns={layout === 'grid' ? 4 : undefined}
        gap="md"
      />
      
      {/* Use highlightText for potential future feature */}
      {highlightQuery && query && (
        <div className="sr-only" aria-hidden="true">
          {filteredProducts.map((p) => highlightText(p.name))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;