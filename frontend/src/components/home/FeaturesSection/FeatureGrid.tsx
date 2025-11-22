/**
 * FeatureGrid Component
 * 
 * Grid layout component for displaying multiple features in a responsive
 * grid with animations, filtering, and interactive elements.
 * 
 * Features:
 * - Responsive grid layout (2/3/4 columns)
 * - Staggered animations
 * - Category filtering
 * - Load more functionality
 * - Hover effects
 * - Section header
 * - Loading states
 * - Empty states
 * - Masonry layout option
 * - Reordering support
 * 
 * @component
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { FeatureCard, type FeatureCardProps, type FeatureIconType } from './FeatureCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Feature extends Omit<FeatureCardProps, 'loading'> {
  /** Feature ID */
  id: string;
  /** Category for filtering */
  category?: string;
  /** Priority for ordering */
  priority?: number;
}

export interface FeatureGridProps {
  /** Features to display */
  features: Feature[];
  /** Grid columns configuration */
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Enable category filtering */
  enableFiltering?: boolean;
  /** Available categories */
  categories?: Array<{ id: string; name: string; icon?: FeatureIconType }>;
  /** Items per page (for load more) */
  itemsPerPage?: number;
  /** Enable load more */
  enableLoadMore?: boolean;
  /** Default layout */
  defaultLayout?: 'grid' | 'masonry';
  /** Enable layout toggle */
  enableLayoutToggle?: boolean;
  /** Animation delay between items */
  staggerDelay?: number;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On feature click callback */
  onFeatureClick?: (feature: Feature) => void;
  /** On category change callback */
  onCategoryChange?: (categoryId: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

const DEFAULT_ITEMS_PER_PAGE = 6;

// ============================================================================
// COMPONENT
// ============================================================================

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  columns = DEFAULT_COLUMNS,
  title,
  subtitle,
  enableFiltering = true,
  categories = [],
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  enableLoadMore = true,
  defaultLayout = 'grid',
  enableLayoutToggle = false,
  staggerDelay = 0.1,
  loading = false,
  className,
  onFeatureClick,
  onCategoryChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [layout, setLayout] = useState<'grid' | 'masonry'>(defaultLayout);
  const [displayCount, setDisplayCount] = useState(itemsPerPage);

  // ============================================================================
  // FILTERED FEATURES
  // ============================================================================

  const filteredFeatures = useMemo(() => {
    let result = [...features];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((feature) => feature.category === selectedCategory);
    }

    // Sort by priority
    result.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    console.log('Filtered features:', result.length);
    return result;
  }, [features, selectedCategory]);

  // ============================================================================
  // DISPLAYED FEATURES
  // ============================================================================

  const displayedFeatures = useMemo(() => {
    return filteredFeatures.slice(0, displayCount);
  }, [filteredFeatures, displayCount]);

  const hasMore = filteredFeatures.length > displayCount;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      setDisplayCount(itemsPerPage); // Reset display count
      onCategoryChange?.(categoryId);
      console.log('Category changed:', categoryId);
    },
    [itemsPerPage, onCategoryChange]
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + itemsPerPage);
    console.log('Loading more features...');
  }, [itemsPerPage]);

  const handleReset = useCallback(() => {
    setSelectedCategory('all');
    setDisplayCount(itemsPerPage);
    console.log('Grid reset');
  }, [itemsPerPage]);

  const handleLayoutToggle = useCallback(() => {
    setLayout((prev) => (prev === 'grid' ? 'masonry' : 'grid'));
    console.log('Layout toggled:', layout === 'grid' ? 'masonry' : 'grid');
  }, [layout]);

  const handleFeatureClick = useCallback(
    (feature: Feature) => {
      onFeatureClick?.(feature);
      console.log('Feature clicked:', feature.title);
    },
    [onFeatureClick]
  );

  // ============================================================================
  // GRID CLASSES
  // ============================================================================

  const gridClasses = cn(
    'grid gap-6',
    layout === 'grid' && [
      columns.mobile === 1 && 'grid-cols-1',
      columns.tablet === 2 && 'md:grid-cols-2',
      columns.desktop === 3 && 'lg:grid-cols-3',
      columns.wide === 4 && 'xl:grid-cols-4',
    ],
    layout === 'masonry' && 'masonry-grid'
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <section className={cn('w-full', className)}>
        {title && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={gridClasses}>
          {[...Array(itemsPerPage)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (filteredFeatures.length === 0) {
    return (
      <section className={cn('w-full', className)}>
        {title && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FunnelIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No features found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try selecting a different category
          </p>
          <Button onClick={handleReset}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reset filters
          </Button>
        </div>
      </section>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-8">
        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filters */}
          {enableFiltering && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange('all')}
              >
                All Features
                <Badge variant="secondary" className="ml-2">
                  {features.length}
                </Badge>
              </Button>
              {categories.map((category) => {
                const count = features.filter((f) => f.category === category.id).length;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Layout Toggle */}
          {enableLayoutToggle && (
            <div className="flex items-center gap-2">
              <Button
                variant={layout === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={handleLayoutToggle}
                aria-label="Grid layout"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'masonry' ? 'default' : 'outline'}
                size="sm"
                onClick={handleLayoutToggle}
                aria-label="Masonry layout"
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className={gridClasses}>
        <AnimatePresence mode="wait">
          {displayedFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * staggerDelay }}
              layout={layout === 'masonry'}
            >
              <FeatureCard
                {...feature}
                onClick={() => handleFeatureClick(feature)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {enableLoadMore && hasMore && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            className="min-w-[200px]"
          >
            Load More Features
            <Badge variant="secondary" className="ml-2">
              +{Math.min(itemsPerPage, filteredFeatures.length - displayCount)}
            </Badge>
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Showing {displayCount} of {filteredFeatures.length} features
          </p>
        </div>
      )}

      {/* All Loaded Message */}
      {!hasMore && displayedFeatures.length > itemsPerPage && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All {filteredFeatures.length} features displayed
          </p>
        </div>
      )}
    </section>
  );
};

export default FeatureGrid;
