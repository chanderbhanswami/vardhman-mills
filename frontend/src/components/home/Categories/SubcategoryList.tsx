/**
 * SubcategoryList Component
 * 
 * Displays a comprehensive list of subcategories for a parent category
 * with filtering, sorting, and interactive features.
 * 
 * Features:
 * - Grid/List view toggle
 * - Search functionality
 * - Sort options
 * - Product count display
 * - Quick links
 * - Icon badges
 * - Loading states
 * - Empty state
 * - Responsive design
 * - Animations
 * - Analytics tracking
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowsUpDownIcon,
  TagIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';
import type { Category } from './CategoryGrid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  icon?: React.ComponentType<{ className?: string }>;
  isPopular?: boolean;
  color?: string;
}

export type SortOption = 'name' | 'popular' | 'count';
export type ViewMode = 'grid' | 'list';

export interface SubcategoryListProps {
  /** Parent category slug */
  categorySlug?: string;
  /** Subcategories to display */
  subcategories?: Subcategory[] | Category[];
  /** Categories (alias for subcategories) */
  categories?: Subcategory[] | Category[];
  /** Layout mode */
  layout?: string;
  /** Show product count */
  showProductCount?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable view toggle */
  enableViewToggle?: boolean;
  /** Default view mode */
  defaultView?: ViewMode;
  /** Additional CSS classes */
  className?: string;
  /** On subcategory click */
  onSubcategoryClick?: (subcategory: Subcategory | Category) => void;
  /** On category click (alias) */
  onCategoryClick?: (subcategory: Subcategory | Category) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'count', label: 'Product Count' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const SubcategoryList: React.FC<SubcategoryListProps> = ({
  categorySlug,
  subcategories: propSubcategories,
  categories: propCategories,
  layout, // eslint-disable-line @typescript-eslint/no-unused-vars
  showProductCount, // eslint-disable-line @typescript-eslint/no-unused-vars
  showBadges, // eslint-disable-line @typescript-eslint/no-unused-vars
  showSearch = true,
  enableSorting = true,
  enableViewToggle = true,
  defaultView = 'grid',
  className,
  onSubcategoryClick,
  onCategoryClick,
}) => {
  // Use categories or subcategories, whichever is provided
  const subcategories = useMemo(() => propCategories || propSubcategories || [], [propCategories, propSubcategories]);
  const handleClick = useMemo(() => onCategoryClick || onSubcategoryClick, [onCategoryClick, onSubcategoryClick]);
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ============================================================================
  // FILTERED & SORTED
  // ============================================================================

  const filteredAndSorted = useMemo(() => {
    let filtered = [...subcategories];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        case 'count':
          return b.productCount - a.productCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [subcategories, searchQuery, sortOption]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log('Search query:', e.target.value);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
    setShowSortMenu(false);
    console.log('Sort option changed:', option);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    console.log('View mode changed:', mode);
  }, []);

  const handleSubcategoryClick = useCallback(
    (subcategory: Subcategory | Category) => {
      // Use the memoized click handler which prioritizes onCategoryClick
      if (handleClick) {
        handleClick(subcategory as Subcategory);
      }
      onSubcategoryClick?.(subcategory as Subcategory);
      console.log('Subcategory clicked:', subcategory.name);
    },
    [handleClick, onSubcategoryClick]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderControls = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      {showSearch && (
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search subcategories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        {enableViewToggle && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Tooltip content="Grid view">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="List view">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => handleViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Sort */}
        {enableSorting && (
          <div className="relative">
            <Tooltip content="Sort subcategories">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="gap-2"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
                {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
              </Button>
            </Tooltip>

            {/* Sort Menu */}
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors duration-150',
                      'hover:bg-gray-50',
                      sortOption === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {filteredAndSorted.map((subcategory, index) => {
          const SubIcon = subcategory.icon || TagIcon;
          return (
            <motion.div
              key={subcategory.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/categories/${categorySlug}/${subcategory.slug}`}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                <Card className="group hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={cn(
                          'rounded-lg p-3 transition-transform group-hover:scale-110',
                          !subcategory.color && 'bg-gray-100'
                        )}
                        {...(subcategory.color && {
                          style: { backgroundColor: `${subcategory.color}20` },
                        })}
                      >
                        <SubIcon
                          className={cn('w-6 h-6', !subcategory.color && 'text-gray-500')}
                          {...(subcategory.color && {
                            style: { color: subcategory.color },
                          })}
                        />
                      </div>
                      {('isPopular' in subcategory && subcategory.isPopular) ? (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      ) : null}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {subcategory.name}
                    </h3>

                    {subcategory.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {subcategory.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {subcategory.productCount.toLocaleString()} products
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredAndSorted.map((subcategory, index) => {
          const SubIcon = subcategory.icon || TagIcon;
          return (
            <motion.div
              key={subcategory.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                href={`/categories/${categorySlug}/${subcategory.slug}`}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                <Card className="group hover:shadow-md hover:border-primary transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'rounded-lg p-3 flex-shrink-0 transition-transform group-hover:scale-110',
                          !subcategory.color && 'bg-gray-100'
                        )}
                        {...(subcategory.color && {
                          style: { backgroundColor: `${subcategory.color}20` },
                        })}
                      >
                        <SubIcon
                          className={cn('w-5 h-5', !subcategory.color && 'text-gray-500')}
                          {...(subcategory.color && {
                            style: { color: subcategory.color },
                          })}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {subcategory.name}
                          </h3>
                          {('isPopular' in subcategory && subcategory.isPopular) ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              Popular
                            </Badge>
                          ) : null}
                        </div>
                        {subcategory.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {subcategory.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-600">
                          {subcategory.productCount.toLocaleString()}
                        </span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <TagIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No subcategories found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchQuery
          ? `No results for "${searchQuery}". Try adjusting your search.`
          : 'No subcategories available in this category.'}
      </p>
      {searchQuery && (
        <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
      )}
    </motion.div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('py-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subcategories
        </h2>
        <p className="text-gray-600">
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'subcategory' : 'subcategories'} available
        </p>
      </div>

      {/* Controls */}
      {renderControls()}

      {/* Content */}
      {filteredAndSorted.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}
    </div>
  );
};

export default SubcategoryList;
