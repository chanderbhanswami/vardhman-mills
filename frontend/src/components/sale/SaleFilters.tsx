'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import type { SaleType, SaleCategory, SaleStatus } from '@/types/sale.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SaleFiltersProps {
  /**
   * Currently applied filters
   */
  appliedFilters: SaleFilterValues;

  /**
   * Callback when filters change
   */
  onFilterChange: (filters: SaleFilterValues) => void;

  /**
   * Callback to clear all filters
   */
  onClearAll?: () => void;

  /**
   * Display variant
   * - sidebar: Vertical sidebar layout
   * - horizontal: Horizontal filter bar
   * - modal: Full-screen modal layout
   * - compact: Compact inline layout
   */
  variant?: 'sidebar' | 'horizontal' | 'modal' | 'compact';

  /**
   * Show filter sections
   */
  showSaleTypes?: boolean;
  showCategories?: boolean;
  showStatus?: boolean;
  showDiscount?: boolean;
  showDateRange?: boolean;
  showFeatured?: boolean;

  /**
   * Available filter options (if limited)
   */
  availableSaleTypes?: SaleType[];
  availableCategories?: SaleCategory[];
  availableStatuses?: SaleStatus[];

  /**
   * Results count
   */
  resultsCount?: number;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sale filter values
 */
export interface SaleFilterValues {
  saleTypes: SaleType[];
  categories: SaleCategory[];
  statuses: SaleStatus[];
  discountRange: [number, number];
  featured: boolean | null;
  dateRange: {
    start?: Date;
    end?: Date;
  };
}

/**
 * Filter section state
 */
interface FilterSectionState {
  [key: string]: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SALE_TYPES: SaleType[] = [
  'flash_sale',
  'seasonal_sale',
  'clearance_sale',
  'festival_sale',
  'mega_sale',
  'weekend_sale',
  'daily_deals',
  'member_sale',
];

const DEFAULT_CATEGORIES: SaleCategory[] = [
  'furniture',
  'home_decor',
  'textiles',
  'kitchenware',
  'bedroom',
  'living_room',
  'dining_room',
  'bathroom',
];

const DEFAULT_STATUSES: SaleStatus[] = [
  'active',
  'scheduled',
  'ended',
];

const SALE_TYPE_LABELS: Record<SaleType, string> = {
  flash_sale: 'Flash Sale',
  seasonal_sale: 'Seasonal Sale',
  clearance_sale: 'Clearance',
  end_of_season: 'End of Season',
  festival_sale: 'Festival Sale',
  mega_sale: 'Mega Sale',
  weekend_sale: 'Weekend Sale',
  daily_deals: 'Daily Deals',
  member_sale: 'Members Only',
  brand_sale: 'Brand Sale',
  category_sale: 'Category Sale',
  new_arrival_sale: 'New Arrivals',
  bundle_sale: 'Bundle Sale',
  buy_one_get_one: 'BOGO',
  pre_order_sale: 'Pre-Order',
  warehouse_sale: 'Warehouse Sale',
  liquidation_sale: 'Final Sale',
};

const CATEGORY_LABELS: Record<SaleCategory, string> = {
  furniture: 'Furniture',
  home_decor: 'Home Decor',
  textiles: 'Textiles',
  kitchenware: 'Kitchenware',
  bedroom: 'Bedroom',
  living_room: 'Living Room',
  dining_room: 'Dining Room',
  bathroom: 'Bathroom',
  outdoor: 'Outdoor',
  office: 'Office',
  kids_room: "Kids' Room",
  storage: 'Storage',
  lighting: 'Lighting',
  flooring: 'Flooring',
  wall_art: 'Wall Art',
  seasonal: 'Seasonal',
  wellness: 'Wellness',
  all_categories: 'All Categories',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Filter Section Component
 */
interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SaleFilters Component
 * 
 * Comprehensive filtering component for sales with multiple variants.
 * Features:
 * - Multiple filter types (type, category, status, discount, date)
 * - 4 display variants (sidebar, horizontal, modal, compact)
 * - Collapsible filter sections
 * - Applied filters display
 * - Clear all functionality
 * - Results count display
 * - Animated transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <SaleFilters
 *   appliedFilters={filters}
 *   onFilterChange={(newFilters) => handleFilterChange(newFilters)}
 *   variant="sidebar"
 *   resultsCount={128}
 * />
 * ```
 */
export const SaleFilters: React.FC<SaleFiltersProps> = ({
  appliedFilters,
  onFilterChange,
  onClearAll,
  variant = 'sidebar',
  showSaleTypes = true,
  showCategories = true,
  showStatus = true,
  showDiscount = true,
  showFeatured = true,
  availableSaleTypes = DEFAULT_SALE_TYPES,
  availableCategories = DEFAULT_CATEGORIES,
  availableStatuses = DEFAULT_STATUSES,
  resultsCount,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState<FilterSectionState>({
    saleTypes: true,
    categories: true,
    status: true,
    discount: true,
    featured: true,
  });

  // Toggle filter section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle sale type filter change
  const handleSaleTypeChange = (type: SaleType, checked: boolean) => {
    const newTypes = checked
      ? [...appliedFilters.saleTypes, type]
      : appliedFilters.saleTypes.filter((t) => t !== type);

    onFilterChange({
      ...appliedFilters,
      saleTypes: newTypes,
    });
  };

  // Handle category filter change
  const handleCategoryChange = (category: SaleCategory, checked: boolean) => {
    const newCategories = checked
      ? [...appliedFilters.categories, category]
      : appliedFilters.categories.filter((c) => c !== category);

    onFilterChange({
      ...appliedFilters,
      categories: newCategories,
    });
  };

  // Handle status filter change
  const handleStatusChange = (status: SaleStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...appliedFilters.statuses, status]
      : appliedFilters.statuses.filter((s) => s !== status);

    onFilterChange({
      ...appliedFilters,
      statuses: newStatuses,
    });
  };

  // Handle discount range change
  const handleDiscountRangeChange = (values: number[]) => {
    onFilterChange({
      ...appliedFilters,
      discountRange: [values[0], values[1]],
    });
  };

  // Handle featured toggle
  const handleFeaturedChange = (value: 'all' | 'featured' | 'regular') => {
    let featured: boolean | null = null;
    if (value === 'featured') featured = true;
    if (value === 'regular') featured = false;

    onFilterChange({
      ...appliedFilters,
      featured,
    });
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += appliedFilters.saleTypes.length;
    count += appliedFilters.categories.length;
    count += appliedFilters.statuses.length;
    if (appliedFilters.featured !== null) count += 1;
    if (
      appliedFilters.discountRange[0] !== 0 ||
      appliedFilters.discountRange[1] !== 100
    )
      count += 1;
    return count;
  }, [appliedFilters]);

  // Remove individual filter
  const removeFilter = (
    filterType: 'saleType' | 'category' | 'status' | 'featured',
    value?: string
  ) => {
    if (filterType === 'saleType' && value) {
      onFilterChange({
        ...appliedFilters,
        saleTypes: appliedFilters.saleTypes.filter((t) => t !== value),
      });
    } else if (filterType === 'category' && value) {
      onFilterChange({
        ...appliedFilters,
        categories: appliedFilters.categories.filter((c) => c !== value),
      });
    } else if (filterType === 'status' && value) {
      onFilterChange({
        ...appliedFilters,
        statuses: appliedFilters.statuses.filter((s) => s !== value),
      });
    } else if (filterType === 'featured') {
      onFilterChange({
        ...appliedFilters,
        featured: null,
      });
    }
  };

  // Render filter content
  const renderFilterContent = () => (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="default">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Sale Types Filter */}
      {showSaleTypes && (
        <FilterSection
          title="Sale Type"
          expanded={expandedSections.saleTypes}
          onToggle={() => toggleSection('saleTypes')}
        >
          <div className="space-y-2">
            {availableSaleTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appliedFilters.saleTypes.includes(type)}
                  onChange={(e) => handleSaleTypeChange(type, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {SALE_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Categories Filter */}
      {showCategories && (
        <FilterSection
          title="Category"
          expanded={expandedSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appliedFilters.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Status Filter */}
      {showStatus && (
        <FilterSection
          title="Status"
          expanded={expandedSections.status}
          onToggle={() => toggleSection('status')}
        >
          <div className="space-y-2">
            {availableStatuses.map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appliedFilters.statuses.includes(status)}
                  onChange={(e) => handleStatusChange(status, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Discount Range Filter */}
      {showDiscount && (
        <FilterSection
          title="Discount Range"
          expanded={expandedSections.discount}
          onToggle={() => toggleSection('discount')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Min: {appliedFilters.discountRange[0]}%</span>
              <span className="text-gray-600">Max: {appliedFilters.discountRange[1]}%</span>
            </div>
            <Slider
              value={appliedFilters.discountRange}
              onValueChange={handleDiscountRangeChange}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </FilterSection>
      )}

      {/* Featured Filter */}
      {showFeatured && (
        <FilterSection
          title="Featured"
          expanded={expandedSections.featured}
          onToggle={() => toggleSection('featured')}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="featured"
                checked={appliedFilters.featured === null}
                onChange={() => handleFeaturedChange('all')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">All Sales</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="featured"
                checked={appliedFilters.featured === true}
                onChange={() => handleFeaturedChange('featured')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Featured Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="featured"
                checked={appliedFilters.featured === false}
                onChange={() => handleFeaturedChange('regular')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Regular Only</span>
            </label>
          </div>
        </FilterSection>
      )}

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="p-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{resultsCount}</span> sale
            {resultsCount !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );

  // Render applied filters badges
  const renderAppliedFilters = () => {
    if (activeFilterCount === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Applied:</span>
        {appliedFilters.saleTypes.map((type) => (
          <Badge
            key={type}
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300"
            onClick={() => removeFilter('saleType', type)}
          >
            {SALE_TYPE_LABELS[type]}
            <XMarkIcon className="h-3 w-3" />
          </Badge>
        ))}
        {appliedFilters.categories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300"
            onClick={() => removeFilter('category', category)}
          >
            {CATEGORY_LABELS[category]}
            <XMarkIcon className="h-3 w-3" />
          </Badge>
        ))}
        {appliedFilters.statuses.map((status) => (
          <Badge
            key={status}
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300"
            onClick={() => removeFilter('status', status)}
          >
            {status}
            <XMarkIcon className="h-3 w-3" />
          </Badge>
        ))}
        {appliedFilters.featured !== null && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-300"
            onClick={() => removeFilter('featured')}
          >
            {appliedFilters.featured ? 'Featured' : 'Regular'}
            <XMarkIcon className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  };

  // Render based on variant
  switch (variant) {
    case 'compact':
      return (
        <div className={cn('space-y-4', className)}>
          <Button
            variant="outline"
            leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
            className="w-full"
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
          {renderAppliedFilters()}
        </div>
      );

    case 'horizontal':
      return (
        <Card className={className}>
          <CardContent className="p-0">
            {renderAppliedFilters()}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
              {/* Quick filters can be added here */}
              <div className="text-center text-sm text-gray-500">
                Use sidebar for detailed filters
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'sidebar':
    default:
      return (
        <Card className={cn('overflow-hidden', className)}>
          <CardContent className="p-0">
            {renderAppliedFilters()}
            {renderFilterContent()}
          </CardContent>
        </Card>
      );
  }
};

export default SaleFilters;
