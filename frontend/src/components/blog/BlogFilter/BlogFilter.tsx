/**
 * BlogFilter Component - Vardhman Mills Frontend
 * 
 * Comprehensive filtering system for blog posts with
 * categories, tags, date ranges, authors, and search.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  X,
  ChevronDown,
  SlidersHorizontal,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Hash
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { Slider } from '@/components/ui/Slider';
import Image from 'next/image';

// Types
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  color?: string;
}

export interface AuthorOption {
  id: string;
  name: string;
  avatar?: string;
  postCount?: number;
  isVerified?: boolean;
}

export interface BlogFilterState {
  search: string;
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  readingTime: {
    min: number;
    max: number;
  };
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending' | 'alphabetical';
  status: 'all' | 'published' | 'featured' | 'draft';
  minViews?: number;
  minLikes?: number;
}

export interface BlogFilterProps {
  /** Current filter state */
  filters: BlogFilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: BlogFilterState) => void;
  /** Available categories */
  categories?: FilterOption[];
  /** Available tags */
  tags?: FilterOption[];
  /** Available authors */
  authors?: AuthorOption[];
  /** Show search input */
  showSearch?: boolean;
  /** Show category filter */
  showCategories?: boolean;
  /** Show tag filter */
  showTags?: boolean;
  /** Show author filter */
  showAuthors?: boolean;
  /** Show date range filter */
  showDateRange?: boolean;
  /** Show reading time filter */
  showReadingTime?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Show status filter */
  showStatus?: boolean;
  /** Show advanced filters */
  showAdvanced?: boolean;
  /** Filter layout */
  layout?: 'horizontal' | 'vertical' | 'compact' | 'sidebar';
  /** Loading state */
  loading?: boolean;
  /** Total results count */
  totalResults?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when filters are reset */
  onReset?: () => void;
  /** Callback when a preset is applied */
  onPresetApply?: (preset: string) => void;
}

/**
 * BlogFilter Component
 * 
 * Advanced filtering system with multiple filter types,
 * search, sorting, and preset configurations.
 */
export const BlogFilter: React.FC<BlogFilterProps> = ({
  filters,
  onFiltersChange,
  categories = [],
  tags = [],
  authors = [],
  showSearch = true,
  showCategories = true,
  showTags = true,
  showAuthors = true,
  showDateRange = true,
  showReadingTime = true,
  showSort = true,
  showStatus = true,
  showAdvanced = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  layout = 'horizontal',
  loading = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  totalResults,
  className = '',
  onReset,
  onPresetApply
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Update filters
   */
  const updateFilters = (updates: Partial<BlogFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  /**
   * Add filter value
   */
  const addFilter = (type: keyof BlogFilterState, value: string) => {
    const current = filters[type] as string[];
    if (!current.includes(value)) {
      updateFilters({ [type]: [...current, value] });
    }
  };

  /**
   * Remove filter value
   */
  const removeFilter = (type: keyof BlogFilterState, value: string) => {
    const current = filters[type] as string[];
    updateFilters({ [type]: current.filter(item => item !== value) });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    const resetFilters: BlogFilterState = {
      search: '',
      categories: [],
      tags: [],
      authors: [],
      dateRange: {},
      readingTime: { min: 0, max: 30 },
      sortBy: 'newest',
      status: 'all'
    };
    onFiltersChange(resetFilters);
    onReset?.();
  };

  /**
   * Get active filter count
   */
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.authors.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.readingTime.min > 0 || filters.readingTime.max < 30) count++;
    if (filters.status !== 'all') count++;
    return count;
  };

  /**
   * Render search input
   */
  const renderSearch = () => {
    if (!showSearch) return null;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search blog posts..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>
    );
  };

  /**
   * Render category filter
   */
  const renderCategories = () => {
    if (!showCategories || categories.length === 0) return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Hash className="w-4 h-4 mr-1" />
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={filters.categories.includes(category.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (filters.categories.includes(category.value)) {
                  removeFilter('categories', category.value);
                } else {
                  addFilter('categories', category.value);
                }
              }}
              className="text-xs"
            >
              {category.label}
              {category.count && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render tag filter
   */
  const renderTags = () => {
    if (!showTags || tags.length === 0) return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Tag className="w-4 h-4 mr-1" />
          Tags
        </label>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={filters.tags.includes(tag.value) ? 'default' : 'outline'}
              className={`cursor-pointer text-xs ${
                filters.tags.includes(tag.value) ? 'bg-blue-100 text-blue-800' : ''
              }`}
              onClick={() => {
                if (filters.tags.includes(tag.value)) {
                  removeFilter('tags', tag.value);
                } else {
                  addFilter('tags', tag.value);
                }
              }}
            >
              {tag.label}
              {tag.count && ` (${tag.count})`}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render author filter
   */
  const renderAuthors = () => {
    if (!showAuthors || authors.length === 0) return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="w-4 h-4 mr-1" />
          Authors
        </label>
        <div className="space-y-1">
          {authors.map((author) => (
            <div key={author.id} className="flex items-center space-x-2">
              <Checkbox
                checked={filters.authors.includes(author.id)}
                onChange={(checked) => {
                  if (checked) {
                    addFilter('authors', author.id);
                  } else {
                    removeFilter('authors', author.id);
                  }
                }}
              />
              <div className="flex items-center space-x-2 flex-1">
                {author.avatar && (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm">{author.name}</span>
                {author.postCount && (
                  <Badge variant="secondary" className="text-xs">
                    {author.postCount}
                  </Badge>
                )}
                {author.isVerified && (
                  <Star className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render date range filter
   */
  const renderDateRange = () => {
    if (!showDateRange) return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            placeholder="Start date"
            value={filters.dateRange.start}
            onChange={(date) => updateFilters({
              dateRange: { ...filters.dateRange, start: date }
            })}
          />
          <DatePicker
            placeholder="End date"
            value={filters.dateRange.end}
            onChange={(date) => updateFilters({
              dateRange: { ...filters.dateRange, end: date }
            })}
          />
        </div>
      </div>
    );
  };

  /**
   * Render reading time filter
   */
  const renderReadingTime = () => {
    if (!showReadingTime) return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Reading Time ({filters.readingTime.min}-{filters.readingTime.max} min)
        </label>
        <Slider
          value={[filters.readingTime.min, filters.readingTime.max]}
          onValueChange={(value: number[]) => {
            const [min, max] = value;
            updateFilters({
              readingTime: { min, max }
            });
          }}
          min={0}
          max={30}
          step={1}
          className="w-full"
        />
      </div>
    );
  };

  /**
   * Render sort options
   */
  const renderSort = () => {
    if (!showSort) return null;

    const sortOptions = [
      { value: 'newest', label: 'Newest First', icon: Clock },
      { value: 'oldest', label: 'Oldest First', icon: Clock },
      { value: 'popular', label: 'Most Popular', icon: Star },
      { value: 'trending', label: 'Trending', icon: TrendingUp },
      { value: 'alphabetical', label: 'A-Z', icon: BookOpen }
    ];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value as BlogFilterState['sortBy'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Sort blog posts by"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /**
   * Render status filter
   */
  const renderStatus = () => {
    if (!showStatus) return null;

    const statusOptions = [
      { value: 'all', label: 'All Posts' },
      { value: 'published', label: 'Published' },
      { value: 'featured', label: 'Featured' },
      { value: 'draft', label: 'Drafts' }
    ];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <div className="flex space-x-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.status === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ status: option.value as BlogFilterState['status'] })}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render active filters
   */
  const renderActiveFilters = () => {
    const activeFilters: React.ReactNode[] = [];

    // Search
    if (filters.search) {
      activeFilters.push(
        <Badge key="search" variant="secondary" className="text-xs">
          Search: {filters.search}
          <X
            className="w-3 h-3 ml-1 cursor-pointer"
            onClick={() => updateFilters({ search: '' })}
          />
        </Badge>
      );
    }

    // Categories
    filters.categories.forEach((categoryValue) => {
      const category = categories.find(c => c.value === categoryValue);
      if (category) {
        activeFilters.push(
          <Badge key={`category-${categoryValue}`} variant="secondary" className="text-xs">
            {category.label}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter('categories', categoryValue)}
            />
          </Badge>
        );
      }
    });

    // Tags
    filters.tags.forEach((tagValue) => {
      const tag = tags.find(t => t.value === tagValue);
      if (tag) {
        activeFilters.push(
          <Badge key={`tag-${tagValue}`} variant="outline" className="text-xs">
            #{tag.label}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter('tags', tagValue)}
            />
          </Badge>
        );
      }
    });

    // Authors
    filters.authors.forEach((authorId) => {
      const author = authors.find(a => a.id === authorId);
      if (author) {
        activeFilters.push(
          <Badge key={`author-${authorId}`} variant="info" className="text-xs">
            By {author.name}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter('authors', authorId)}
            />
          </Badge>
        );
      }
    });

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-500">Active filters:</span>
        {activeFilters}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Clear all
        </Button>
      </div>
    );
  };

  /**
   * Render filter presets
   */
  const renderPresets = () => {
    const presets = [
      { id: 'recent', label: 'Recent Posts', icon: Clock },
      { id: 'popular', label: 'Popular', icon: Star },
      { id: 'trending', label: 'Trending', icon: TrendingUp },
      { id: 'featured', label: 'Featured', icon: BookOpen }
    ];

    return (
      <div className="flex space-x-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onPresetApply?.(preset.id)}
            className="text-xs"
          >
            <preset.icon className="w-3 h-3 mr-1" />
            {preset.label}
          </Button>
        ))}
      </div>
    );
  };

  const activeFilterCount = getActiveFilterCount();

  if (layout === 'compact') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            
            {totalResults !== undefined && (
              <span className="text-sm text-gray-500">
                {totalResults} results
              </span>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {renderSearch()}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderCategories()}
                  {renderTags()}
                  {renderAuthors()}
                  {renderDateRange()}
                  {renderReadingTime()}
                  <div className="space-y-2">
                    {renderSort()}
                    {renderStatus()}
                  </div>
                </div>
                {renderActiveFilters()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    );
  }

  if (layout === 'sidebar') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        {renderPresets()}
        
        <div className="space-y-6">
          {renderSearch()}
          {renderCategories()}
          {renderTags()}
          {renderAuthors()}
          {renderDateRange()}
          {renderReadingTime()}
          {renderSort()}
          {renderStatus()}
        </div>

        {renderActiveFilters()}
      </div>
    );
  }

  // Default horizontal layout
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          
          {totalResults !== undefined && (
            <span className="text-sm text-gray-500">
              {totalResults} results
            </span>
          )}
        </div>

        {/* Presets */}
        {renderPresets()}

        {/* Main Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            {renderSearch()}
          </div>
          <div>
            {renderSort()}
          </div>
          <div>
            {renderStatus()}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderCategories()}
          {renderTags()}
          {renderAuthors()}
          <div className="space-y-4">
            {renderDateRange()}
            {renderReadingTime()}
          </div>
        </div>

        {/* Active Filters */}
        {renderActiveFilters()}
      </div>
    </Card>
  );
};

export default BlogFilter;
