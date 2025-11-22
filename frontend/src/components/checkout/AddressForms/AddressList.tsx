'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { AddressCard } from './AddressCard';
import type { UserAddress, AddressType } from '@/types/address.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddressListProps {
  /**
   * Array of addresses to display
   */
  addresses: UserAddress[];

  /**
   * Selected address ID
   */
  selectedAddressId?: string;

  /**
   * Enable address selection
   */
  selectable?: boolean;

  /**
   * Show action buttons on cards
   */
  showActions?: boolean;

  /**
   * Show search bar
   */
  showSearch?: boolean;

  /**
   * Show filters
   */
  showFilters?: boolean;

  /**
   * Show add new button
   */
  showAddButton?: boolean;

  /**
   * Callback when address is selected
   */
  onSelectAddress?: (addressId: string) => void;

  /**
   * Callback when edit is clicked
   */
  onEditAddress?: (address: UserAddress) => void;

  /**
   * Callback when delete is clicked
   */
  onDeleteAddress?: (addressId: string) => void;

  /**
   * Callback when set as default is clicked
   */
  onSetDefaultAddress?: (addressId: string) => void;

  /**
   * Callback when add new is clicked
   */
  onAddNew?: () => void;

  /**
   * Callback when refresh is clicked
   */
  onRefresh?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Compact mode
   */
  compact?: boolean;

  /**
   * Grid columns
   */
  columns?: 1 | 2 | 3;

  /**
   * Additional CSS classes
   */
  className?: string;
}

type FilterType = 'all' | AddressType;
type SortBy = 'default' | 'recent' | 'alphabetical' | 'type';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filter addresses by search query
 */
const filterBySearch = (addresses: UserAddress[], query: string): UserAddress[] => {
  if (!query.trim()) return addresses;

  const lowerQuery = query.toLowerCase();

  return addresses.filter((address) => {
    const searchableText = [
      address.firstName,
      address.lastName,
      address.company,
      address.label,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
      address.phone,
      address.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(lowerQuery);
  });
};

/**
 * Filter addresses by type
 */
const filterByType = (addresses: UserAddress[], type: FilterType): UserAddress[] => {
  if (type === 'all') return addresses;
  return addresses.filter((address) => address.type === type);
};

/**
 * Sort addresses
 */
const sortAddresses = (addresses: UserAddress[], sortBy: SortBy): UserAddress[] => {
  const sorted = [...addresses];

  switch (sortBy) {
    case 'default':
      return sorted.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });

    case 'recent':
      return sorted.sort((a, b) => {
        const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return bTime - aTime;
      });

    case 'alphabetical':
      return sorted.sort((a, b) => {
        const aName = `${a.firstName} ${a.lastName}`;
        const bName = `${b.firstName} ${b.lastName}`;
        return aName.localeCompare(bName);
      });

    case 'type':
      return sorted.sort((a, b) => a.type.localeCompare(b.type));

    default:
      return sorted;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AddressList Component
 * 
 * Display and manage a list of user addresses.
 * Features:
 * - Grid or list layout
 * - Search functionality
 * - Filter by address type
 * - Sort by various criteria
 * - Add new address button
 * - Refresh button
 * - Empty state
 * - Loading skeleton
 * - Responsive design
 * - Address selection
 * - Card actions (edit, delete, set default)
 * 
 * @example
 * ```tsx
 * <AddressList
 *   addresses={userAddresses}
 *   selectedAddressId={selectedId}
 *   selectable={true}
 *   showActions={true}
 *   showSearch={true}
 *   showFilters={true}
 *   onSelectAddress={handleSelect}
 *   onEditAddress={handleEdit}
 *   onDeleteAddress={handleDelete}
 *   onAddNew={handleAddNew}
 * />
 * ```
 */
export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedAddressId,
  selectable = false,
  showActions = false,
  showSearch = true,
  showFilters = true,
  showAddButton = true,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onAddNew,
  onRefresh,
  isLoading = false,
  emptyMessage = 'No addresses found',
  compact = false,
  columns = 2,
  className,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filtered and sorted addresses
  const processedAddresses = useMemo(() => {
    let result = addresses;

    // Apply search filter
    if (showSearch && searchQuery) {
      result = filterBySearch(result, searchQuery);
    }

    // Apply type filter
    if (showFilters && filterType !== 'all') {
      result = filterByType(result, filterType);
    }

    // Apply sorting
    result = sortAddresses(result, sortBy);

    return result;
  }, [addresses, searchQuery, filterType, sortBy, showSearch, showFilters]);

  // Get filter type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: addresses.length,
    };

    addresses.forEach((address) => {
      counts[address.type] = (counts[address.type] || 0) + 1;
    });

    return counts;
  }, [addresses]);

  // Get grid columns class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        {showSearch && (
          <div className="flex-1 w-full sm:max-w-md relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search addresses..."
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          {showFilters && (
            <Button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              variant={showFiltersPanel ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {filterType !== 'all' && (
                <Badge variant="default" className="ml-1">
                  1
                </Badge>
              )}
            </Button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <ArrowPathIcon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}

          {/* Add New Button */}
          {showAddButton && onAddNew && (
            <Button
              onClick={onAddNew}
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && showFiltersPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-4 space-y-4">
              {/* Filter by Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      filterType === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    All ({typeCounts.all || 0})
                  </button>
                  {(['home', 'office', 'apartment', 'business', 'other'] as AddressType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        filterType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({typeCounts[type] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sort-by-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Sort addresses by"
                >
                  <option value="default">Default First</option>
                  <option value="recent">Recently Used</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="type">Type</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(filterType !== 'all' || sortBy !== 'default') && (
                <Button
                  onClick={() => {
                    setFilterType('all');
                    setSortBy('default');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {(searchQuery || filterType !== 'all') && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {processedAddresses.length} of {addresses.length} addresses
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={cn('grid gap-4', gridColsClass)}>
          {[...Array(columns * 2)].map((_, index) => (
            <Card key={index} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Address Cards */}
      {!isLoading && processedAddresses.length > 0 && (
        <div className={cn('grid gap-4', gridColsClass)}>
          <AnimatePresence mode="popLayout">
            {processedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id}
                selectable={selectable}
                showActions={showActions}
                onSelect={onSelectAddress}
                onEdit={onEditAddress}
                onDelete={onDeleteAddress}
                onSetDefault={onSetDefaultAddress}
                compact={compact}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && processedAddresses.length === 0 && (
        <Card className="p-8 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery ? 'No addresses found' : emptyMessage}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first address'}
              </p>
            </div>
            {showAddButton && onAddNew && !searchQuery && (
              <Button onClick={onAddNew} className="flex items-center gap-2 mx-auto">
                <PlusIcon className="h-4 w-4" />
                Add New Address
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AddressList;